# Système de Notifications d'Entretien

Ce document explique le fonctionnement du système de notifications automatiques par email pour les entretiens.

## Vue d'ensemble

Le système comprend **deux types de notifications** complémentaires :

1. **Notifications préventives** : Avant l'échéance (selon les préférences utilisateur)
2. **Notifications de retard** : Escalade intelligente après l'échéance

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

### 2. Cron Jobs Vercel

**Configuration** (`vercel.json`)
```json
{
  "crons": [
    {
      "path": "/api/cron/send-maintenance-notifications",
      "schedule": "0 8 * * *"
    },
    {
      "path": "/api/cron/send-overdue-notifications",
      "schedule": "0 9 * * *"
    }
  ]
}
```

#### Cron 1: Notifications préventives
- S'exécute à **8h00 UTC** tous les jours
- Route : `/api/cron/send-maintenance-notifications`
- Envoie les notifications AVANT l'échéance selon les préférences utilisateur

#### Cron 2: Notifications de retard
- S'exécute à **9h00 UTC** tous les jours
- Route : `/api/cron/send-overdue-notifications`
- Envoie les notifications APRÈS l'échéance avec escalade intelligente

**Pour modifier l'horaire :**
- `0 8 * * *` = 8h00 tous les jours
- `0 */6 * * *` = toutes les 6 heures
- `*/30 * * * *` = toutes les 30 minutes
- [Cron expression generator](https://crontab.guru/)

### 3. Logique d'envoi

#### A. Notifications préventives (`send-maintenance-notifications`)

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

#### B. Notifications de retard intelligentes (`send-overdue-notifications`)

**Système d'escalade progressive basé sur la gravité du retard :**

##### 1. ⚠️ WARNING (1-6 jours de retard)
- **Quand** : Jour 1 et jour 3
- **Ton** : Rappel amical
- **Design** : Badge jaune
- **Message** : "Votre entretien est en retard"

##### 2. 🔥 URGENT (7-29 jours de retard)
- **Quand** : Tous les 7 jours
- **Ton** : Action fortement recommandée
- **Design** : Badge orange avec emphase
- **Message** : "Entretien en retard : action requise"
- **Détails** : Risques de panne mentionnés

##### 3. 🚨 CRITICAL (30+ jours de retard)
- **Quand** : Tous les 7 jours
- **Ton** : Alerte critique
- **Design** : Badge rouge, animation subtile
- **Message** : "Alerte critique : entretien très en retard"
- **Détails** : Avertissement sur garanties, sécurité, coûts

**Anti-spam intelligent :**
- Pas de spam quotidien
- Fréquence adaptée à la gravité
- Historique pour éviter les doublons

### 4. Templates d'email

**Fonctionnalités** (`lib/emailTemplates.ts`)
- Design moderne et responsive
- Affichage de la priorité (Critique/Important/Recommandé/Optionnel)
- Informations complètes : date, kilométrage, durée, difficulté
- Instructions détaillées si disponibles
- CTA pour voir le véhicule et marquer comme fait
- Branding PilotMyVan

**Trois types d'emails :**

1. **`generateMaintenanceReminderEmail()`** - Email préventif classique
   - Header orangé PilotMyVan
   - Badge de priorité
   - Informations complètes
   - Instructions si disponibles
   - CTA : "Voir mon véhicule" + "Marquer comme fait"

2. **`generateOverdueMaintenanceEmail()`** - Email de retard ⭐ NOUVEAU
   - Header rouge/orange selon l'urgence
   - Badge animé pour niveau critique
   - Affichage du retard en jours et km
   - Ton adapté à l'urgence (amical → critique)
   - Section "Risques potentiels" pour niveau critique
   - CTA urgent : "Action urgente requise" / "⚠️ Régler maintenant"

3. **`generateMaintenanceSummaryEmail()`** - Email de résumé
   - Plusieurs maintenances groupées
   - Vue synthétique

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

### Script de test automatisé

```bash
# Test des notifications préventives uniquement
npm run test:notifications

# Test des notifications de retard uniquement
npm run test:notifications overdue

# Test des deux types
npm run test:notifications both
```

### Test manuel des routes

#### Notifications préventives
```bash
curl -X GET "http://localhost:3000/api/cron/send-maintenance-notifications" \
  -H "Authorization: Bearer YOUR_CRON_SECRET"
```

#### Notifications de retard
```bash
curl -X GET "http://localhost:3000/api/cron/send-overdue-notifications" \
  -H "Authorization: Bearer YOUR_CRON_SECRET"
```

### Test en production

```bash
# Notifications préventives
curl -X GET "https://yourdomain.com/api/cron/send-maintenance-notifications" \
  -H "Authorization: Bearer YOUR_CRON_SECRET"

# Notifications de retard
curl -X GET "https://yourdomain.com/api/cron/send-overdue-notifications" \
  -H "Authorization: Bearer YOUR_CRON_SECRET"
```

### Déclencher manuellement depuis Vercel

1. Aller dans Project > Cron Jobs
2. Cliquer sur le cron désiré
3. Cliquer sur "Run Now"

## Monitoring et Debugging

### Response des crons

#### Notifications préventives
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

#### Notifications de retard ⭐ NOUVEAU
```json
{
  "success": true,
  "message": "Overdue notifications cron job completed",
  "results": {
    "totalUsers": 10,
    "totalOverdueMaintenances": 8,
    "totalNotifications": 5,
    "successfulEmails": 5,
    "failedEmails": 0,
    "breakdown": {
      "warning": 2,   // 1-6 jours
      "urgent": 2,    // 7-29 jours
      "critical": 1   // 30+ jours
    },
    "errors": []
  },
  "timestamp": "2025-10-19T09:00:00.000Z"
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

