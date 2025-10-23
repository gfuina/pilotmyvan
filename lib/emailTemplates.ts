interface MaintenanceEmailData {
  userName: string;
  vehicleName: string;
  maintenanceName: string;
  daysUntilDue?: number;
  nextDueDate?: string;
  nextDueKilometers?: number;
  currentMileage?: number;
  priority: "critical" | "important" | "recommended" | "optional";
  instructions?: string;
  description?: string;
  estimatedDuration?: number;
  difficulty?: string;
  equipmentName?: string;
  vehicleId: string;
  maintenanceScheduleId: string;
}

interface OverdueMaintenanceEmailData extends MaintenanceEmailData {
  daysOverdue?: number;
  kmOverdue?: number;
  urgencyLevel: "warning" | "urgent" | "critical";
}

const PRIORITY_COLORS = {
  critical: { bg: "#FEE2E2", text: "#991B1B", label: "Critique" },
  important: { bg: "#FED7AA", text: "#9A3412", label: "Important" },
  recommended: { bg: "#FEF3C7", text: "#92400E", label: "Recommandé" },
  optional: { bg: "#F3F4F6", text: "#374151", label: "Optionnel" },
};

const URGENCY_CONFIG = {
  warning: {
    bg: "#FEF3C7",
    text: "#92400E",
    border: "#FDE047",
    title: "⚠️ Attention",
    icon: "⚠️",
  },
  urgent: {
    bg: "#FED7AA",
    text: "#9A3412",
    border: "#FB923C",
    title: "🔥 Urgent",
    icon: "🔥",
  },
  critical: {
    bg: "#FEE2E2",
    text: "#991B1B",
    border: "#F87171",
    title: "🚨 Critique",
    icon: "🚨",
  },
};

export function generateMaintenanceReminderEmail(data: MaintenanceEmailData): string {
  const priorityColor = PRIORITY_COLORS[data.priority];
  const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
  const vehicleUrl = `${baseUrl}/dashboard/vehicles/${data.vehicleId}`;

  return `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Rappel d'entretien - PilotMyVan</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f9fafb;">
  <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color: #f9fafb;">
    <tr>
      <td style="padding: 40px 20px;">
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 24px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #ff6b35 0%, #ff8c61 100%); padding: 32px 24px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: bold;">
                🔧 PilotMyVan
              </h1>
              <p style="margin: 8px 0 0 0; color: rgba(255, 255, 255, 0.9); font-size: 16px;">
                Rappel d'entretien
              </p>
            </td>
          </tr>

          <!-- Alert Banner -->
          <tr>
            <td style="padding: 0;">
              <div style="background-color: ${priorityColor.bg}; padding: 16px 24px; border-left: 4px solid ${priorityColor.text};">
                <p style="margin: 0; color: ${priorityColor.text}; font-weight: 600; font-size: 14px;">
                  ${priorityColor.label.toUpperCase()} • ${data.daysUntilDue === 0 ? "AUJOURD'HUI" : data.daysUntilDue === 1 ? "DEMAIN" : `DANS ${data.daysUntilDue} JOURS`}
                </p>
              </div>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 32px 24px;">
              <h2 style="margin: 0 0 8px 0; color: #0a0a0a; font-size: 18px;">
                Bonjour ${data.userName} 👋
              </h2>
              <p style="margin: 0 0 24px 0; color: #6b7280; font-size: 16px; line-height: 1.6;">
                Un entretien arrive bientôt pour votre véhicule <strong style="color: #0a0a0a;">${data.vehicleName}</strong>.
              </p>

              <!-- Maintenance Card -->
              <div style="background-color: #f9fafb; border-radius: 16px; padding: 20px; margin-bottom: 24px; border: 2px solid #e5e7eb;">
                <h3 style="margin: 0 0 16px 0; color: #0a0a0a; font-size: 20px; font-weight: bold;">
                  ${data.maintenanceName}
                </h3>
                
                ${data.equipmentName ? `
                <p style="margin: 0 0 12px 0; color: #6b7280; font-size: 14px;">
                  <span style="display: inline-block; margin-right: 4px;">⚙️</span>
                  <strong>Équipement :</strong> ${data.equipmentName}
                </p>
                ` : ""}

                ${data.nextDueDate ? `
                <p style="margin: 0 0 12px 0; color: #6b7280; font-size: 14px;">
                  <span style="display: inline-block; margin-right: 4px;">📅</span>
                  <strong>Date prévue :</strong> ${new Date(data.nextDueDate).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}
                </p>
                ` : ""}

                ${data.nextDueKilometers && data.currentMileage ? `
                <p style="margin: 0 0 12px 0; color: #6b7280; font-size: 14px;">
                  <span style="display: inline-block; margin-right: 4px;">🛣️</span>
                  <strong>Kilométrage :</strong> ${data.nextDueKilometers.toLocaleString()} km (il vous reste ${(data.nextDueKilometers - data.currentMileage).toLocaleString()} km)
                </p>
                ` : ""}

                ${data.estimatedDuration ? `
                <p style="margin: 0 0 12px 0; color: #6b7280; font-size: 14px;">
                  <span style="display: inline-block; margin-right: 4px;">⏱️</span>
                  <strong>Durée estimée :</strong> ${data.estimatedDuration} minutes
                </p>
                ` : ""}

                ${data.difficulty ? `
                <p style="margin: 0; color: #6b7280; font-size: 14px;">
                  <span style="display: inline-block; margin-right: 4px;">📊</span>
                  <strong>Difficulté :</strong> ${data.difficulty}
                </p>
                ` : ""}
              </div>

              ${data.description ? `
              <div style="margin-bottom: 24px;">
                <h4 style="margin: 0 0 8px 0; color: #0a0a0a; font-size: 16px; font-weight: 600;">
                  📝 Description
                </h4>
                <p style="margin: 0; color: #6b7280; font-size: 14px; line-height: 1.6;">
                  ${data.description}
                </p>
              </div>
              ` : ""}

              ${data.instructions ? `
              <div style="margin-bottom: 24px; background-color: #eff6ff; border-radius: 12px; padding: 16px; border-left: 4px solid #3b82f6;">
                <h4 style="margin: 0 0 12px 0; color: #1e40af; font-size: 16px; font-weight: 600;">
                  📋 Instructions
                </h4>
                <div style="color: #1e40af; font-size: 14px; line-height: 1.8; white-space: pre-wrap;">
                  ${data.instructions}
                </div>
              </div>
              ` : ""}

              <!-- CTA Buttons -->
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
                <tr>
                  <td style="padding-bottom: 12px;">
                    <a href="${vehicleUrl}" style="display: block; background: linear-gradient(135deg, #ff6b35 0%, #ff8c61 100%); color: #ffffff; text-decoration: none; padding: 14px 24px; border-radius: 12px; font-weight: 600; font-size: 16px; text-align: center; box-shadow: 0 2px 4px rgba(255, 107, 53, 0.3);">
                      Voir mon véhicule
                    </a>
                  </td>
                </tr>
                <tr>
                  <td>
                    <a href="${vehicleUrl}#maintenance-${data.maintenanceScheduleId}" style="display: block; background-color: #f3f4f6; color: #374151; text-decoration: none; padding: 12px 24px; border-radius: 12px; font-weight: 500; font-size: 14px; text-align: center; border: 2px solid #e5e7eb;">
                      Marquer comme fait
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f9fafb; padding: 24px; text-align: center; border-top: 1px solid #e5e7eb;">
              <p style="margin: 0 0 8px 0; color: #6b7280; font-size: 12px;">
                Vous recevez cet email car vous avez activé les notifications d'entretien
              </p>
              <p style="margin: 0; color: #9ca3af; font-size: 12px;">
                <a href="${baseUrl}/dashboard" style="color: #ff6b35; text-decoration: none;">Gérer mes préférences</a>
              </p>
              <p style="margin: 16px 0 0 0; color: #9ca3af; font-size: 12px;">
                © ${new Date().getFullYear()} PilotMyVan - Tous droits réservés
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}

export function generateOverdueMaintenanceEmail(data: OverdueMaintenanceEmailData): string {
  const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
  const vehicleUrl = `${baseUrl}/dashboard/vehicles/${data.vehicleId}`;
  const urgencyConfig = URGENCY_CONFIG[data.urgencyLevel];

  // Message personnalisé selon le niveau d'urgence
  const urgencyMessages = {
    warning: {
      title: "Votre entretien est en retard",
      intro: "L'entretien suivant est en retard. Il est important de le réaliser rapidement pour maintenir votre véhicule en bon état.",
      cta: "Planifier cet entretien",
    },
    urgent: {
      title: "Entretien en retard : action requise",
      intro: "Cet entretien est en retard depuis plusieurs jours. Pour éviter tout risque de panne ou de détérioration, nous vous recommandons fortement de le réaliser dès que possible.",
      cta: "Action urgente requise",
    },
    critical: {
      title: "Alerte critique : entretien très en retard",
      intro: "⚠️ ATTENTION : Cet entretien est très en retard ! Le non-respect de cet entretien peut entraîner des pannes graves, compromettre votre sécurité et annuler certaines garanties.",
      cta: "⚠️ Régler maintenant",
    },
  };

  const message = urgencyMessages[data.urgencyLevel];

  return `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Entretien en retard - PilotMyVan</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f9fafb;">
  <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color: #f9fafb;">
    <tr>
      <td style="padding: 40px 20px;">
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 24px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          
          <!-- Header avec animation -->
          <tr>
            <td style="background: linear-gradient(135deg, #dc2626 0%, #ef4444 100%); padding: 32px 24px; text-align: center; position: relative;">
              ${data.urgencyLevel === "critical" ? `
              <div style="position: absolute; top: 0; left: 0; right: 0; bottom: 0; background: linear-gradient(45deg, transparent 30%, rgba(255,255,255,0.1) 50%, transparent 70%); animation: shimmer 2s infinite;"></div>
              ` : ""}
              <div style="font-size: 48px; margin-bottom: 8px;">${urgencyConfig.icon}</div>
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: bold;">
                ${urgencyConfig.title}
              </h1>
              <p style="margin: 8px 0 0 0; color: rgba(255, 255, 255, 0.9); font-size: 16px;">
                PilotMyVan
              </p>
            </td>
          </tr>

          <!-- Alert Banner -->
          <tr>
            <td style="padding: 0;">
              <div style="background-color: ${urgencyConfig.bg}; padding: 20px 24px; border-left: 6px solid ${urgencyConfig.border};">
                ${data.daysOverdue ? `
                <p style="margin: 0 0 4px 0; color: ${urgencyConfig.text}; font-weight: 700; font-size: 16px; letter-spacing: 0.5px;">
                  EN RETARD DE ${data.daysOverdue} JOUR${data.daysOverdue > 1 ? "S" : ""}
                </p>
                ` : ""}
                ${data.kmOverdue ? `
                <p style="margin: ${data.daysOverdue ? "0" : "0 0 4px 0"}; color: ${urgencyConfig.text}; font-weight: ${data.daysOverdue ? "600" : "700"}; font-size: ${data.daysOverdue ? "14px" : "16px"}; ${!data.daysOverdue ? "letter-spacing: 0.5px;" : ""}">
                  ${data.daysOverdue ? "Dépassement : " : "EN RETARD DE "}${data.kmOverdue.toLocaleString()} km
                </p>
                ` : ""}
              </div>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 32px 24px;">
              <h2 style="margin: 0 0 8px 0; color: #0a0a0a; font-size: 20px; font-weight: bold;">
                ${message.title}
              </h2>
              <p style="margin: 0 0 8px 0; color: #374151; font-size: 14px;">
                Bonjour ${data.userName},
              </p>
              <p style="margin: 0 0 24px 0; color: #6b7280; font-size: 16px; line-height: 1.6;">
                ${message.intro}
              </p>

              <!-- Maintenance Card avec alerte -->
              <div style="background: linear-gradient(to right, ${urgencyConfig.bg}, #ffffff); border-radius: 16px; padding: 24px; margin-bottom: 24px; border: 3px solid ${urgencyConfig.border}; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
                <div style="display: flex; align-items: center; margin-bottom: 16px;">
                  <div style="font-size: 32px; margin-right: 12px;">${urgencyConfig.icon}</div>
                  <div>
                    <h3 style="margin: 0 0 4px 0; color: #0a0a0a; font-size: 20px; font-weight: bold;">
                      ${data.maintenanceName}
                    </h3>
                    <p style="margin: 0; color: ${urgencyConfig.text}; font-size: 13px; font-weight: 600;">
                      Véhicule : ${data.vehicleName}
                    </p>
                  </div>
                </div>
                
                ${data.equipmentName ? `
                <p style="margin: 0 0 12px 0; color: #374151; font-size: 14px;">
                  <span style="display: inline-block; margin-right: 6px;">⚙️</span>
                  <strong>Équipement :</strong> ${data.equipmentName}
                </p>
                ` : ""}

                <div style="background-color: rgba(255,255,255,0.7); border-radius: 12px; padding: 16px; margin-bottom: 12px;">
                  ${data.nextDueDate ? `
                  <p style="margin: 0 0 8px 0; color: #374151; font-size: 14px;">
                    <span style="display: inline-block; margin-right: 6px;">📅</span>
                    <strong>Date prévue :</strong> ${new Date(data.nextDueDate).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })}
                  </p>
                  ` : ""}
                  
                  ${data.daysOverdue ? `
                  <p style="margin: 0 0 8px 0; color: #dc2626; font-size: 15px; font-weight: 600;">
                    <span style="display: inline-block; margin-right: 6px;">⏰</span>
                    En retard depuis : ${data.daysOverdue} jour${data.daysOverdue > 1 ? "s" : ""}
                  </p>
                  ` : ""}

                  ${data.kmOverdue ? `
                  <p style="margin: 0; color: #dc2626; font-size: 15px; font-weight: 600;">
                    <span style="display: inline-block; margin-right: 6px;">🛣️</span>
                    ${data.daysOverdue ? "Dépassement : " : "En retard de "}${data.kmOverdue.toLocaleString()} km
                  </p>
                  ` : ""}
                </div>

                ${data.estimatedDuration ? `
                <p style="margin: 0; color: #6b7280; font-size: 13px;">
                  <span style="display: inline-block; margin-right: 6px;">⏱️</span>
                  Durée estimée : ${data.estimatedDuration} minutes
                </p>
                ` : ""}
              </div>

              ${data.instructions ? `
              <div style="margin-bottom: 24px; background-color: #eff6ff; border-radius: 12px; padding: 18px; border-left: 4px solid #3b82f6;">
                <h4 style="margin: 0 0 12px 0; color: #1e40af; font-size: 16px; font-weight: 600;">
                  📋 Instructions pour réaliser cet entretien
                </h4>
                <div style="color: #1e40af; font-size: 14px; line-height: 1.8; white-space: pre-wrap;">
                  ${data.instructions}
                </div>
              </div>
              ` : ""}

              ${data.urgencyLevel === "critical" ? `
              <div style="background-color: #fee2e2; border-radius: 12px; padding: 18px; margin-bottom: 24px; border: 2px solid #fca5a5;">
                <p style="margin: 0 0 8px 0; color: #991b1b; font-size: 14px; font-weight: 600;">
                  ⚠️ Risques potentiels du non-entretien :
                </p>
                <ul style="margin: 0; padding-left: 20px; color: #991b1b; font-size: 13px; line-height: 1.6;">
                  <li>Risque de panne importante</li>
                  <li>Usure prématurée d'autres composants</li>
                  <li>Coûts de réparation plus élevés</li>
                  <li>Compromission de la sécurité</li>
                  ${data.priority === "critical" ? "<li><strong>Perte potentielle de garantie</strong></li>" : ""}
                </ul>
              </div>
              ` : ""}

              <!-- CTA Buttons -->
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%">
                <tr>
                  <td style="padding-bottom: 12px;">
                    <a href="${vehicleUrl}" style="display: block; background: linear-gradient(135deg, #dc2626 0%, #ef4444 100%); color: #ffffff; text-decoration: none; padding: 16px 24px; border-radius: 12px; font-weight: 700; font-size: 16px; text-align: center; box-shadow: 0 4px 8px rgba(220, 38, 38, 0.4); letter-spacing: 0.3px;">
                      ${message.cta}
                    </a>
                  </td>
                </tr>
                <tr>
                  <td style="padding-bottom: 12px;">
                    <a href="${vehicleUrl}#maintenance-${data.maintenanceScheduleId}" style="display: block; background-color: #f3f4f6; color: #374151; text-decoration: none; padding: 12px 24px; border-radius: 12px; font-weight: 500; font-size: 14px; text-align: center; border: 2px solid #e5e7eb;">
                      Marquer comme fait
                    </a>
                  </td>
                </tr>
                <tr>
                  <td>
                    <p style="margin: 0; text-align: center; color: #9ca3af; font-size: 12px;">
                      Besoin d'aide ? <a href="${baseUrl}/dashboard" style="color: #ff6b35; text-decoration: none;">Contactez le support</a>
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f9fafb; padding: 24px; text-align: center; border-top: 1px solid #e5e7eb;">
              <p style="margin: 0 0 8px 0; color: #6b7280; font-size: 12px;">
                Email de rappel automatique • PilotMyVan
              </p>
              <p style="margin: 0; color: #9ca3af; font-size: 12px;">
                <a href="${baseUrl}/dashboard" style="color: #ff6b35; text-decoration: none;">Gérer mes préférences</a>
              </p>
              <p style="margin: 16px 0 0 0; color: #9ca3af; font-size: 12px;">
                © ${new Date().getFullYear()} PilotMyVan - Tous droits réservés
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}

export function generateMaintenanceSummaryEmail(
  userName: string,
  maintenances: MaintenanceEmailData[],
  vehicleName: string,
  vehicleId: string
): string {
  const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
  const vehicleUrl = `${baseUrl}/dashboard/vehicles/${vehicleId}`;

  return `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Résumé d'entretiens - PilotMyVan</title>
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f9fafb;">
  <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color: #f9fafb;">
    <tr>
      <td style="padding: 40px 20px;">
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 24px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #ff6b35 0%, #ff8c61 100%); padding: 32px 24px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: bold;">
                🔧 PilotMyVan
              </h1>
              <p style="margin: 8px 0 0 0; color: rgba(255, 255, 255, 0.9); font-size: 16px;">
                Résumé de vos entretiens
              </p>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 32px 24px;">
              <h2 style="margin: 0 0 8px 0; color: #0a0a0a; font-size: 18px;">
                Bonjour ${userName} 👋
              </h2>
              <p style="margin: 0 0 24px 0; color: #6b7280; font-size: 16px; line-height: 1.6;">
                Vous avez <strong style="color: #0a0a0a;">${maintenances.length} entretien${maintenances.length > 1 ? "s" : ""}</strong> à venir pour votre <strong style="color: #0a0a0a;">${vehicleName}</strong>.
              </p>

              ${maintenances.map((maintenance, index) => {
                const priorityColor = PRIORITY_COLORS[maintenance.priority];
                return `
                <div style="background-color: #f9fafb; border-radius: 16px; padding: 20px; margin-bottom: ${index < maintenances.length - 1 ? "16px" : "24px"}; border-left: 4px solid ${priorityColor.text};">
                  <div style="display: flex; align-items: center; margin-bottom: 8px;">
                    <span style="display: inline-block; background-color: ${priorityColor.bg}; color: ${priorityColor.text}; padding: 4px 12px; border-radius: 12px; font-size: 11px; font-weight: 600; margin-right: 8px;">
                      ${priorityColor.label.toUpperCase()}
                    </span>
                    <span style="color: #6b7280; font-size: 12px; font-weight: 500;">
                      ${maintenance.daysUntilDue === 0 ? "AUJOURD'HUI" : maintenance.daysUntilDue === 1 ? "DEMAIN" : `${maintenance.daysUntilDue}J`}
                    </span>
                  </div>
                  <h3 style="margin: 0 0 8px 0; color: #0a0a0a; font-size: 16px; font-weight: 600;">
                    ${maintenance.maintenanceName}
                  </h3>
                  ${maintenance.equipmentName ? `
                  <p style="margin: 0; color: #6b7280; font-size: 13px;">
                    ${maintenance.equipmentName}
                  </p>
                  ` : ""}
                </div>
                `;
              }).join("")}

              <!-- CTA Button -->
              <a href="${vehicleUrl}" style="display: block; background: linear-gradient(135deg, #ff6b35 0%, #ff8c61 100%); color: #ffffff; text-decoration: none; padding: 14px 24px; border-radius: 12px; font-weight: 600; font-size: 16px; text-align: center; box-shadow: 0 2px 4px rgba(255, 107, 53, 0.3);">
                Voir tous mes entretiens
              </a>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f9fafb; padding: 24px; text-align: center; border-top: 1px solid #e5e7eb;">
              <p style="margin: 0 0 8px 0; color: #6b7280; font-size: 12px;">
                Vous recevez cet email car vous avez activé les notifications d'entretien
              </p>
              <p style="margin: 0; color: #9ca3af; font-size: 12px;">
                <a href="${baseUrl}/dashboard" style="color: #ff6b35; text-decoration: none;">Gérer mes préférences</a>
              </p>
              <p style="margin: 16px 0 0 0; color: #9ca3af; font-size: 12px;">
                © ${new Date().getFullYear()} PilotMyVan - Tous droits réservés
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}
