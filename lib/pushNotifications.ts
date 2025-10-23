import webpush from "web-push";
import { IPushSubscription } from "@/models/User";

// Configuration VAPID
// Pour générer les clés: npx web-push generate-vapid-keys
if (process.env.VAPID_PUBLIC_KEY && process.env.VAPID_PRIVATE_KEY) {
  webpush.setVapidDetails(
    `mailto:${process.env.VAPID_EMAIL || "contact@pilotmyvan.com"}`,
    process.env.VAPID_PUBLIC_KEY,
    process.env.VAPID_PRIVATE_KEY
  );
}

export interface PushNotificationPayload {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  data?: {
    url?: string;
    vehicleId?: string;
    maintenanceScheduleId?: string;
    [key: string]: any;
  };
  actions?: Array<{
    action: string;
    title: string;
  }>;
}

/**
 * Envoie une notification push à une subscription
 */
export async function sendPushNotification(
  subscription: IPushSubscription,
  payload: PushNotificationPayload
): Promise<boolean> {
  try {
    const pushSubscription = {
      endpoint: subscription.endpoint,
      keys: {
        p256dh: subscription.keys.p256dh,
        auth: subscription.keys.auth,
      },
    };

    await webpush.sendNotification(
      pushSubscription,
      JSON.stringify(payload)
    );

    return true;
  } catch (error: any) {
    console.error("Erreur lors de l'envoi de la notification push:", error);
    
    // Si l'endpoint n'est plus valide (410 Gone), on devrait le supprimer
    if (error.statusCode === 410) {
      console.log("Subscription expirée, devrait être supprimée");
      // Le caller devra gérer la suppression
      throw new Error("SUBSCRIPTION_EXPIRED");
    }
    
    return false;
  }
}

/**
 * Envoie une notification push à plusieurs subscriptions
 */
export async function sendPushNotificationToMultiple(
  subscriptions: IPushSubscription[],
  payload: PushNotificationPayload
): Promise<{
  successful: number;
  failed: number;
  expired: string[]; // endpoints expirés à supprimer
}> {
  const results = {
    successful: 0,
    failed: 0,
    expired: [] as string[],
  };

  await Promise.all(
    subscriptions.map(async (subscription) => {
      try {
        await sendPushNotification(subscription, payload);
        results.successful++;
      } catch (error: any) {
        if (error.message === "SUBSCRIPTION_EXPIRED") {
          results.expired.push(subscription.endpoint);
        } else {
          results.failed++;
        }
      }
    })
  );

  return results;
}

/**
 * Génère le payload pour une notification de maintenance à venir
 */
export function generateMaintenanceReminderPushPayload(data: {
  maintenanceName: string;
  vehicleName: string;
  daysUntilDue: number;
  vehicleId: string;
  maintenanceScheduleId: string;
}): PushNotificationPayload {
  const { maintenanceName, vehicleName, daysUntilDue, vehicleId, maintenanceScheduleId } = data;

  let timeText: string;
  if (daysUntilDue === 0) {
    timeText = "aujourd'hui";
  } else if (daysUntilDue === 1) {
    timeText = "demain";
  } else {
    timeText = `dans ${daysUntilDue} jours`;
  }

  return {
    title: `🔧 ${maintenanceName} - ${vehicleName}`,
    body: `Entretien prévu ${timeText}`,
    icon: "/icon.png",
    badge: "/icon.png",
    data: {
      url: `/dashboard/vehicles/${vehicleId}`,
      vehicleId,
      maintenanceScheduleId,
      type: "maintenance_reminder",
    },
    actions: [
      { action: "view", title: "Voir" },
      { action: "dismiss", title: "Ignorer" },
    ],
  };
}

/**
 * Génère le payload pour une notification de maintenance en retard
 */
export function generateOverdueMaintenancePushPayload(data: {
  maintenanceName: string;
  vehicleName: string;
  daysOverdue?: number;
  kmOverdue?: number;
  urgencyLevel: "warning" | "urgent" | "critical";
  vehicleId: string;
  maintenanceScheduleId: string;
}): PushNotificationPayload {
  const { maintenanceName, vehicleName, daysOverdue, kmOverdue, urgencyLevel, vehicleId, maintenanceScheduleId } = data;

  const urgencyIcons = {
    warning: "⚠️",
    urgent: "🔥",
    critical: "🚨",
  };

  const urgencyText = {
    warning: "Rappel",
    urgent: "Urgent",
    critical: "CRITIQUE",
  };

  // Construire le message selon le type de retard
  let bodyText = `${maintenanceName} en retard`;
  if (daysOverdue && kmOverdue) {
    bodyText += ` de ${daysOverdue} jour${daysOverdue > 1 ? "s" : ""} / ${kmOverdue.toLocaleString()} km`;
  } else if (daysOverdue) {
    bodyText += ` de ${daysOverdue} jour${daysOverdue > 1 ? "s" : ""}`;
  } else if (kmOverdue) {
    bodyText += ` de ${kmOverdue.toLocaleString()} km`;
  }

  return {
    title: `${urgencyIcons[urgencyLevel]} ${urgencyText[urgencyLevel]} - ${vehicleName}`,
    body: bodyText,
    icon: "/icon.png",
    badge: "/icon.png",
    data: {
      url: `/dashboard/vehicles/${vehicleId}`,
      vehicleId,
      maintenanceScheduleId,
      type: "maintenance_overdue",
      urgencyLevel,
    },
    actions: [
      { action: "view", title: "Voir" },
      { action: "dismiss", title: "Ignorer" },
    ],
  };
}

