# Système de Notifications d'Entretien

Ce document explique le fonctionnement du système de notifications automatiques par email pour les entretiens.

## Architecture

### 1. Modèle de données

**NotificationHistory** (`models/NotificationHistory.ts`)
- Historique de toutes les notifications envoyées
- Évite les doublons (une notification par jour maximum)
- Tracking des erreurs d'envoi

**User** (`models/User.ts`)
- Champ `notificationPreferences.daysBeforeMaintenance` : tableau de nombres
- Par défaut : `[1]` (24h avant)
- L'utilisateur peut configurer plusieurs rappels (ex: `[1, 3, 7, 14, 30]`)

### 2. Cron Job Vercel

**Configuration** (`vercel.json`)
```json
{
  "crons": [
    {
      "path": "/api/cron/send-maintenance-notifications",
      "schedule": "0 8 * * *"
    }
  ]
}
```

- S'exécute tous les jours à **8h00 UTC** (9h Paris, 10h Paris en été)
- Appelle automatiquement la route `/api/cron/send-maintenance-notifications`

**Pour modifier l'horaire :**
- `0 8 * * *` = 8h00 tous les jours
- `0 */6 * * *` = toutes les 6 heures
- `*/30 * * * *` = toutes les 30 minutes
- [Cron expression generator](https://crontab.guru/)

### 3. Logique d'envoi

Le cron job (`app/api/cron/send-maintenance-notifications/route.ts`) :

1. Récupère tous les utilisateurs avec email vérifié
2. Pour chaque utilisateur :
   - Récupère ses véhicules
   - Récupère les maintenances planifiées
   - Calcule les jours restants jusqu'à chaque maintenance
3. Si `daysUntilDue` correspond à une préférence de l'utilisateur :
   - Vérifie qu'aucun email n'a été envoyé aujourd'hui (historique)
   - Génère un email personnalisé avec les instructions
   - Envoie l'email
   - Enregistre dans l'historique

### 4. Template d'email

**Fonctionnalités** (`lib/emailTemplates.ts`)
- Design moderne et responsive
- Affichage de la priorité (Critique/Important/Recommandé/Optionnel)
- Informations complètes : date, kilométrage, durée, difficulté
- Instructions détaillées si disponibles
- CTA pour voir le véhicule et marquer comme fait
- Branding PilotMyVan

**Deux types d'emails :**
1. `generateMaintenanceReminderEmail()` - Email individuel pour une maintenance
2. `generateMaintenanceSummaryEmail()` - Email de résumé (plusieurs maintenances)

## Configuration

### Variables d'environnement requises

Ajouter dans `.env.local` et dans Vercel :

```env
# Cron Job Security
CRON_SECRET=your-super-secret-random-string-here

# Email Configuration (déjà configuré)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
EMAIL_FROM=noreply@pilotmyvan.com
EMAIL_FROM_NAME=PilotMyVan

# URL de base (déjà configuré)
NEXTAUTH_URL=https://yourdomain.com
```

### Générer un CRON_SECRET

```bash
# Sur Mac/Linux
openssl rand -base64 32

# Ou avec Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

### Configuration dans Vercel

1. **Variables d'environnement**
   - Aller dans votre projet Vercel
   - Settings > Environment Variables
   - Ajouter `CRON_SECRET` avec une valeur sécurisée

2. **Activer les Crons**
   - Les crons sont automatiquement activés avec le fichier `vercel.json`
   - Visible dans : Project > Settings > Cron Jobs

3. **Monitoring**
   - Logs disponibles dans : Project > Logs
   - Filtrer par `/api/cron/send-maintenance-notifications`

## Sécurité

### Protection de la route cron

La route vérifie un Bearer token :

```typescript
const authHeader = request.headers.get("authorization");
if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}
```

Seul Vercel Cron peut appeler cette route avec le bon token.

### Anti-spam

- Un email maximum par jour et par maintenance
- Index unique dans MongoDB :
  ```typescript
  { userId: 1, maintenanceScheduleId: 1, notificationDate: 1, daysBefore: 1 }
  ```

## Tests

### Test manuel de la route

```bash
# Remplacer YOUR_CRON_SECRET par votre vraie valeur
curl -X GET "http://localhost:3000/api/cron/send-maintenance-notifications" \
  -H "Authorization: Bearer YOUR_CRON_SECRET"
```

### Test en production

```bash
curl -X GET "https://yourdomain.com/api/cron/send-maintenance-notifications" \
  -H "Authorization: Bearer YOUR_CRON_SECRET"
```

### Déclencher manuellement depuis Vercel

1. Aller dans Project > Cron Jobs
2. Cliquer sur votre cron
3. Cliquer sur "Run Now"

## Monitoring et Debugging

### Response du cron

```json
{
  "success": true,
  "message": "Cron job completed",
  "results": {
    "totalUsers": 10,
    "totalNotifications": 15,
    "successfulEmails": 14,
    "failedEmails": 1,
    "errors": ["Failed to send email to user@example.com: SMTP error"]
  },
  "timestamp": "2025-10-19T08:00:00.000Z"
}
```

### Logs MongoDB

Consulter la collection `notificationhistories` :

```javascript
db.notificationhistories.find({
  notificationDate: ISODate("2025-10-19T00:00:00Z")
}).sort({ createdAt: -1 })
```

### Erreurs courantes

1. **"Unauthorized"**
   - Vérifier que `CRON_SECRET` est bien configuré
   - Vérifier le header Authorization

2. **"Email not sent"**
   - Vérifier la configuration SMTP
   - Vérifier que `emailVerified` n'est pas null

3. **"Duplicate key error"**
   - Normal : empêche les doublons
   - L'email a déjà été envoyé aujourd'hui

## Personnalisation

### Modifier l'horaire d'envoi

Dans `vercel.json` :
```json
{
  "crons": [
    {
      "path": "/api/cron/send-maintenance-notifications",
      "schedule": "0 9 * * *"  // 9h00 au lieu de 8h00
    }
  ]
}
```

### Ajouter plusieurs moments d'envoi

```json
{
  "crons": [
    {
      "path": "/api/cron/send-maintenance-notifications",
      "schedule": "0 8 * * *"  // Matin
    },
    {
      "path": "/api/cron/send-maintenance-notifications",
      "schedule": "0 18 * * *"  // Soir
    }
  ]
}
```

### Personnaliser le template d'email

Modifier `lib/emailTemplates.ts` :
- Changer les couleurs
- Ajouter/supprimer des sections
- Modifier le texte
- Ajouter votre logo

## Roadmap / Améliorations futures

- [ ] Notifications SMS (Twilio)
- [ ] Notifications push web
- [ ] Résumé hebdomadaire des maintenances
- [ ] Notifications de rappel si pas marqué comme fait
- [ ] Dashboard d'analytics des notifications
- [ ] A/B testing des templates
- [ ] Préférences par type de maintenance
- [ ] Snooze notifications

## Support

Pour toute question ou problème :
1. Vérifier les logs Vercel
2. Consulter la collection NotificationHistory
3. Tester manuellement la route avec curl
4. Vérifier la configuration email dans `.env.local`

