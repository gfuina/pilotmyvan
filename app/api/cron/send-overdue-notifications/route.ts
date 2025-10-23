import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import User from "@/models/User";
import Vehicle from "@/models/Vehicle";
import VehicleMaintenanceSchedule from "@/models/VehicleMaintenanceSchedule";
import NotificationHistory from "@/models/NotificationHistory";
import VehicleEquipment from "@/models/VehicleEquipment";
import Equipment from "@/models/Equipment";
import Maintenance from "@/models/Maintenance";
import { sendEmail } from "@/lib/email";
import { generateOverdueMaintenanceEmail } from "@/lib/emailTemplates";
import {
  sendPushNotificationToMultiple,
  generateOverdueMaintenancePushPayload,
} from "@/lib/pushNotifications";

export async function GET(request: NextRequest) {
  try {
    // Vérification CRON_SECRET (sécurité Vercel Cron)
    const authHeader = request.headers.get("authorization");
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    // Forcer l'enregistrement des modèles Mongoose (nécessaire pour .populate() en serverless)
    [VehicleEquipment, Equipment, Maintenance].forEach(m => m.modelName);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const results = {
      totalUsers: 0,
      totalOverdueMaintenances: 0,
      totalNotifications: 0,
      successfulEmails: 0,
      failedEmails: 0,
      successfulPush: 0,
      failedPush: 0,
      breakdown: {
        warning: 0,   // 1-6 jours de retard
        urgent: 0,    // 7-29 jours de retard
        critical: 0,  // 30+ jours de retard
      },
      errors: [] as string[],
    };

    // Récupérer tous les utilisateurs avec email vérifié
    const users = await User.find({ emailVerified: { $ne: null } });
    results.totalUsers = users.length;

    for (const user of users) {
      try {
        // Récupérer les véhicules de l'utilisateur
        const vehicles = await Vehicle.find({ userId: user._id });

        for (const vehicle of vehicles) {
          // Récupérer toutes les maintenances planifiées (date OU kilomètres en retard)
          const maintenanceSchedules = await VehicleMaintenanceSchedule.find({
            vehicleId: vehicle._id,
            $or: [
              { nextDueDate: { $lt: today } }, // Date dépassée
              { nextDueKilometers: { $lt: vehicle.currentMileage } }, // Kilomètres dépassés
            ],
          })
            .populate("vehicleEquipmentId")
            .populate("maintenanceId")
            .lean();

          results.totalOverdueMaintenances += maintenanceSchedules.length;

          for (const schedule of maintenanceSchedules) {
            // Vérifier qu'on a au moins une échéance dépassée
            const maintenance: any = schedule.isCustom
              ? schedule.customData
              : schedule.maintenanceId;
            
            if (!maintenance) continue;

            const hasTimeRecurrence = !!maintenance.recurrence?.time;
            const hasKmRecurrence = !!maintenance.recurrence?.kilometers;

            // Calculer les jours de retard (seulement si récurrence temporelle)
            let daysOverdue = 0;
            if (hasTimeRecurrence && schedule.nextDueDate) {
              const nextDueDate = new Date(schedule.nextDueDate);
              nextDueDate.setHours(0, 0, 0, 0);
              daysOverdue = Math.ceil(
                (today.getTime() - nextDueDate.getTime()) / (1000 * 60 * 60 * 24)
              );
              if (daysOverdue < 1) daysOverdue = 0;
            }

            // Calculer le kilométrage de dépassement (seulement si récurrence kilométrique)
            let kmOverdue = 0;
            if (hasKmRecurrence && schedule.nextDueKilometers && vehicle.currentMileage) {
              const diff = vehicle.currentMileage - schedule.nextDueKilometers;
              if (diff > 0) {
                kmOverdue = diff;
              }
            }

            // Ignorer si aucun dépassement réel
            if (daysOverdue === 0 && kmOverdue === 0) continue;

            // Déterminer le niveau d'urgence et quand envoyer
            let urgencyLevel: "warning" | "urgent" | "critical";
            let shouldSendToday = false;

            // Critères d'urgence basés sur le pire entre jours et km
            if (daysOverdue >= 30 || kmOverdue >= 10000) {
              // CRITIQUE : 30+ jours OU 10 000+ km
              urgencyLevel = "critical";
              // Envoyer tous les 7 jours OU tous les 1000 km
              shouldSendToday = (hasTimeRecurrence && daysOverdue % 7 === 0) || 
                                (hasKmRecurrence && kmOverdue % 1000 < 50); // Approximation pour détecter paliers
              results.breakdown.critical++;
            } else if (daysOverdue >= 7 || kmOverdue >= 2000) {
              // URGENT : 7-29 jours OU 2000-9999 km
              urgencyLevel = "urgent";
              // Envoyer tous les 7 jours OU tous les 1000 km
              shouldSendToday = (hasTimeRecurrence && daysOverdue % 7 === 0) || 
                                (hasKmRecurrence && kmOverdue % 1000 < 50);
              results.breakdown.urgent++;
            } else {
              // WARNING : 1-6 jours OU 1-1999 km
              urgencyLevel = "warning";
              // Envoyer le jour 1 et jour 3 OU tous les 500 km
              shouldSendToday = (hasTimeRecurrence && (daysOverdue === 1 || daysOverdue === 3)) ||
                                (hasKmRecurrence && kmOverdue % 500 < 50);
              results.breakdown.warning++;
            }

            if (!shouldSendToday) continue;

            // Vérifier si on n'a pas déjà envoyé une notification aujourd'hui
            const existingNotification = await NotificationHistory.findOne({
              userId: user._id,
              maintenanceScheduleId: schedule._id,
              notificationDate: today,
              daysBefore: hasTimeRecurrence ? -daysOverdue : -(kmOverdue / 1000), // Négatif pour indiquer un retard (km divisé par 1000 pour normaliser)
            });

            if (existingNotification) {
              console.log(
                `Notification de retard déjà envoyée aujourd'hui pour ${user.email} - ${schedule._id}`
              );
              continue;
            }

            // Préparer les données de l'email (maintenance déjà récupéré plus haut)

            const vehicleEquipment: any = schedule.vehicleEquipmentId;
            const equipmentName = vehicleEquipment?.isCustom
              ? vehicleEquipment.customData?.name
              : vehicleEquipment?.equipmentId?.name;

            const emailData: any = {
              userName: user.name,
              vehicleName: vehicle.name,
              maintenanceName: maintenance.name,
              currentMileage: vehicle.currentMileage,
              priority: maintenance.priority || "optional",
              instructions: maintenance.instructions,
              description: maintenance.description,
              estimatedDuration: maintenance.estimatedDuration,
              difficulty: maintenance.difficulty,
              equipmentName,
              vehicleId: vehicle._id.toString(),
              maintenanceScheduleId: schedule._id.toString(),
              urgencyLevel,
            };

            // Ajouter conditionnellement les propriétés de récurrence
            if (hasTimeRecurrence && daysOverdue > 0) {
              emailData.daysUntilDue = -daysOverdue;
              emailData.daysOverdue = daysOverdue;
              emailData.nextDueDate = schedule.nextDueDate?.toISOString();
            }
            if (hasKmRecurrence && kmOverdue > 0) {
              emailData.kmOverdue = kmOverdue;
              emailData.nextDueKilometers = schedule.nextDueKilometers;
            }

            // Créer l'entrée dans l'historique
            const notificationHistory = new NotificationHistory({
              userId: user._id,
              maintenanceScheduleId: schedule._id,
              vehicleId: vehicle._id,
              notificationDate: today,
              daysBefore: hasTimeRecurrence ? -daysOverdue : -(kmOverdue / 1000), // Négatif pour indiquer un retard
              emailSent: false,
            });

            try {
              // Générer et envoyer l'email
              const emailHtml = generateOverdueMaintenanceEmail(emailData);
              
              const subjectPrefixes = {
                warning: "⚠️ Rappel",
                urgent: "🔥 Urgent",
                critical: "🚨 CRITIQUE",
              };

              // Construire le texte de retard selon le type de récurrence
              let overdueText = "";
              if (hasTimeRecurrence && hasKmRecurrence) {
                overdueText = `${daysOverdue}j / ${kmOverdue.toLocaleString()}km`;
              } else if (hasTimeRecurrence) {
                overdueText = `${daysOverdue}j`;
              } else {
                overdueText = `${kmOverdue.toLocaleString()}km`;
              }

              await sendEmail({
                to: user.email,
                subject: `${subjectPrefixes[urgencyLevel]} : ${maintenance.name} en retard (${overdueText}) - ${vehicle.name}`,
                html: emailHtml,
              });

              // Marquer comme envoyé
              notificationHistory.emailSent = true;
              notificationHistory.emailSentAt = new Date();

              results.successfulEmails++;

              console.log(
                `Email de retard [${urgencyLevel}] envoyé à ${user.email} pour ${maintenance.name} (${overdueText})`
              );
            } catch (emailError: any) {
              // Enregistrer l'erreur
              notificationHistory.error = emailError.message;

              results.failedEmails++;
              results.errors.push(
                `Failed to send overdue email to ${user.email}: ${emailError.message}`
              );

              console.error(
                `Erreur d'envoi d'email de retard à ${user.email}:`,
                emailError
              );
            }

            // Envoyer la notification push si l'utilisateur a des subscriptions
            if (user.pushSubscriptions && user.pushSubscriptions.length > 0) {
              try {
                const pushData: any = {
                  maintenanceName: maintenance.name,
                  vehicleName: vehicle.name,
                  urgencyLevel,
                  vehicleId: vehicle._id.toString(),
                  maintenanceScheduleId: schedule._id.toString(),
                };
                if (hasTimeRecurrence && daysOverdue > 0) {
                  pushData.daysOverdue = daysOverdue;
                }
                if (hasKmRecurrence && kmOverdue > 0) {
                  pushData.kmOverdue = kmOverdue;
                }
                
                const pushPayload = generateOverdueMaintenancePushPayload(pushData);

                const pushResults = await sendPushNotificationToMultiple(
                  user.pushSubscriptions,
                  pushPayload
                );

                results.successfulPush += pushResults.successful;
                results.failedPush += pushResults.failed;

                // Supprimer les subscriptions expirées
                if (pushResults.expired.length > 0) {
                  user.pushSubscriptions = user.pushSubscriptions.filter(
                    (sub: any) => !pushResults.expired.includes(sub.endpoint)
                  );
                  await user.save();
                }

                console.log(
                  `Push notifications overdue envoyées à ${user.email}: ${pushResults.successful} réussies, ${pushResults.failed} échouées`
                );
              } catch (pushError: any) {
                console.error(
                  `Erreur d'envoi de push notification overdue à ${user.email}:`,
                  pushError
                );
              }
            }

            await notificationHistory.save();
            results.totalNotifications++;
          }
        }
      } catch (userError: any) {
        results.errors.push(
          `Error processing user ${user.email}: ${userError.message}`
        );
        console.error(`Erreur pour l'utilisateur ${user.email}:`, userError);
      }
    }

    return NextResponse.json({
      success: true,
      message: "Overdue notifications cron job completed",
      results,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error("Erreur dans le cron job de retard:", error);
    return NextResponse.json(
      {
        success: false,
        error: error.message,
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

