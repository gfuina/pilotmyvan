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

// Sécurité: vérifier que la requête vient bien de Vercel Cron
export async function GET(request: NextRequest) {
  try {
    // Vérifier l'authentification du cron
    const authHeader = request.headers.get("authorization");
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    await connectDB();

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const results = {
      totalUsers: 0,
      totalOverdueMaintenances: 0,
      totalNotifications: 0,
      successfulEmails: 0,
      failedEmails: 0,
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
          // Récupérer toutes les maintenances planifiées en retard
          const maintenanceSchedules = await VehicleMaintenanceSchedule.find({
            vehicleId: vehicle._id,
            nextDueDate: { $lt: today }, // Date dépassée
          })
            .populate("vehicleEquipmentId")
            .populate("maintenanceId")
            .lean();

          results.totalOverdueMaintenances += maintenanceSchedules.length;

          for (const schedule of maintenanceSchedules) {
            if (!schedule.nextDueDate) continue;

            const nextDueDate = new Date(schedule.nextDueDate);
            nextDueDate.setHours(0, 0, 0, 0);

            // Calculer les jours de retard
            const daysOverdue = Math.ceil(
              (today.getTime() - nextDueDate.getTime()) / (1000 * 60 * 60 * 24)
            );

            if (daysOverdue < 1) continue; // Pas encore en retard

            // Calculer le kilométrage de dépassement
            let kmOverdue = 0;
            if (schedule.nextDueKilometers && vehicle.currentMileage) {
              const diff = vehicle.currentMileage - schedule.nextDueKilometers;
              if (diff > 0) {
                kmOverdue = diff;
              }
            }

            // Déterminer le niveau d'urgence et quand envoyer
            let urgencyLevel: "warning" | "urgent" | "critical";
            let shouldSendToday = false;

            if (daysOverdue >= 30) {
              // CRITIQUE : 30+ jours
              urgencyLevel = "critical";
              // Envoyer tous les 7 jours
              shouldSendToday = daysOverdue % 7 === 0;
              results.breakdown.critical++;
            } else if (daysOverdue >= 7) {
              // URGENT : 7-29 jours
              urgencyLevel = "urgent";
              // Envoyer tous les 7 jours
              shouldSendToday = daysOverdue % 7 === 0;
              results.breakdown.urgent++;
            } else {
              // WARNING : 1-6 jours
              urgencyLevel = "warning";
              // Envoyer le jour 1 et jour 3
              shouldSendToday = daysOverdue === 1 || daysOverdue === 3;
              results.breakdown.warning++;
            }

            if (!shouldSendToday) continue;

            // Vérifier si on n'a pas déjà envoyé une notification aujourd'hui
            const existingNotification = await NotificationHistory.findOne({
              userId: user._id,
              maintenanceScheduleId: schedule._id,
              notificationDate: today,
              daysBefore: -daysOverdue, // Négatif pour indiquer un retard
            });

            if (existingNotification) {
              console.log(
                `Notification de retard déjà envoyée aujourd'hui pour ${user.email} - ${schedule._id}`
              );
              continue;
            }

            // Préparer les données de l'email
            const maintenance: any = schedule.isCustom
              ? schedule.customData
              : schedule.maintenanceId;

            if (!maintenance) continue;

            const vehicleEquipment: any = schedule.vehicleEquipmentId;
            const equipmentName = vehicleEquipment?.isCustom
              ? vehicleEquipment.customData?.name
              : vehicleEquipment?.equipmentId?.name;

            const emailData = {
              userName: user.name,
              vehicleName: vehicle.name,
              maintenanceName: maintenance.name,
              daysUntilDue: -daysOverdue, // Négatif pour cohérence avec l'autre système
              daysOverdue,
              kmOverdue: kmOverdue > 0 ? kmOverdue : undefined,
              nextDueDate: schedule.nextDueDate?.toISOString(),
              nextDueKilometers: schedule.nextDueKilometers,
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

            // Créer l'entrée dans l'historique
            const notificationHistory = new NotificationHistory({
              userId: user._id,
              maintenanceScheduleId: schedule._id,
              vehicleId: vehicle._id,
              notificationDate: today,
              daysBefore: -daysOverdue, // Négatif pour indiquer un retard
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

              await sendEmail({
                to: user.email,
                subject: `${subjectPrefixes[urgencyLevel]} : ${maintenance.name} en retard (${daysOverdue}j) - ${vehicle.name}`,
                html: emailHtml,
              });

              // Marquer comme envoyé
              notificationHistory.emailSent = true;
              notificationHistory.emailSentAt = new Date();
              await notificationHistory.save();

              results.successfulEmails++;
              results.totalNotifications++;

              console.log(
                `Email de retard [${urgencyLevel}] envoyé à ${user.email} pour ${maintenance.name} (${daysOverdue}j)`
              );
            } catch (emailError: any) {
              // Enregistrer l'erreur
              notificationHistory.error = emailError.message;
              await notificationHistory.save();

              results.failedEmails++;
              results.totalNotifications++;
              results.errors.push(
                `Failed to send overdue email to ${user.email}: ${emailError.message}`
              );

              console.error(
                `Erreur d'envoi d'email de retard à ${user.email}:`,
                emailError
              );
            }
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

