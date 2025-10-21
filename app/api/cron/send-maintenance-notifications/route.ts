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
import { generateMaintenanceReminderEmail } from "@/lib/emailTemplates";
import {
  sendPushNotificationToMultiple,
  generateMaintenanceReminderPushPayload,
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
      totalNotifications: 0,
      successfulEmails: 0,
      failedEmails: 0,
      successfulPush: 0,
      failedPush: 0,
      errors: [] as string[],
    };

    // Récupérer tous les utilisateurs avec leurs préférences
    const users = await User.find({ emailVerified: { $ne: null } });
    results.totalUsers = users.length;

    for (const user of users) {
      try {
        // Récupérer les véhicules de l'utilisateur
        const vehicles = await Vehicle.find({ userId: user._id });

        for (const vehicle of vehicles) {
          // Récupérer toutes les maintenances planifiées pour ce véhicule
          const maintenanceSchedules = await VehicleMaintenanceSchedule.find({
            vehicleId: vehicle._id,
          })
            .populate("vehicleEquipmentId")
            .populate("maintenanceId")
            .lean();

          for (const schedule of maintenanceSchedules) {
            // Ignorer si pas de date d'échéance
            if (!schedule.nextDueDate) continue;

            const nextDueDate = new Date(schedule.nextDueDate);
            nextDueDate.setHours(0, 0, 0, 0);

            // Calculer les jours restants
            const daysUntilDue = Math.ceil(
              (nextDueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
            );

            // Vérifier si on doit envoyer une notification selon les préférences
            const shouldNotify = user.notificationPreferences.daysBeforeMaintenance.includes(
              daysUntilDue
            );

            if (shouldNotify) {
              // Vérifier si on n'a pas déjà envoyé une notification aujourd'hui
              const existingNotification = await NotificationHistory.findOne({
                userId: user._id,
                maintenanceScheduleId: schedule._id,
                notificationDate: today,
                daysBefore: daysUntilDue,
              });

              if (existingNotification) {
                console.log(
                  `Notification déjà envoyée aujourd'hui pour ${user.email} - ${schedule._id}`
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
                daysUntilDue,
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
              };

              // Créer l'entrée dans l'historique
              const notificationHistory = new NotificationHistory({
                userId: user._id,
                maintenanceScheduleId: schedule._id,
                vehicleId: vehicle._id,
                notificationDate: today,
                daysBefore: daysUntilDue,
                emailSent: false,
              });

              try {
                // Générer et envoyer l'email
                const emailHtml = generateMaintenanceReminderEmail(emailData);
                
                await sendEmail({
                  to: user.email,
                  subject: `🔧 Rappel : ${maintenance.name} - ${vehicle.name} (${daysUntilDue === 0 ? "aujourd'hui" : daysUntilDue === 1 ? "demain" : `dans ${daysUntilDue} jours`})`,
                  html: emailHtml,
                });

                // Marquer comme envoyé
                notificationHistory.emailSent = true;
                notificationHistory.emailSentAt = new Date();

                results.successfulEmails++;

                console.log(
                  `Email envoyé avec succès à ${user.email} pour ${maintenance.name}`
                );
              } catch (emailError: any) {
                // Enregistrer l'erreur
                notificationHistory.error = emailError.message;

                results.failedEmails++;
                results.errors.push(
                  `Failed to send email to ${user.email}: ${emailError.message}`
                );

                console.error(
                  `Erreur d'envoi d'email à ${user.email}:`,
                  emailError
                );
              }

              // Envoyer la notification push si l'utilisateur a des subscriptions
              if (user.pushSubscriptions && user.pushSubscriptions.length > 0) {
                try {
                  const pushPayload = generateMaintenanceReminderPushPayload({
                    maintenanceName: maintenance.name,
                    vehicleName: vehicle.name,
                    daysUntilDue,
                    vehicleId: vehicle._id.toString(),
                    maintenanceScheduleId: schedule._id.toString(),
                  });

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
                    `Push notifications envoyées à ${user.email}: ${pushResults.successful} réussies, ${pushResults.failed} échouées`
                  );
                } catch (pushError: any) {
                  console.error(
                    `Erreur d'envoi de push notification à ${user.email}:`,
                    pushError
                  );
                }
              }

              await notificationHistory.save();
              results.totalNotifications++;
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
      message: "Cron job completed",
      results,
      timestamp: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error("Erreur dans le cron job:", error);
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

