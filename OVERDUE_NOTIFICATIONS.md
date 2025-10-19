# 🚨 Système de Notifications de Retard Intelligent

## Vue d'ensemble

Système d'escalade automatique pour les maintenances en retard avec 3 niveaux d'urgence.

## 🎯 Fonctionnement

### Escalade Progressive

```
┌─────────────────────────────────────────────────────────────┐
│  Échéance     1-6j retard    7-29j retard    30+ jours      │
│     │            │               │               │           │
│     ▼            ▼               ▼               ▼           │
│   📅 OK     ⚠️  WARNING     🔥 URGENT      🚨 CRITICAL      │
│             J1 + J3        Tous les 7j    Tous les 7j       │
└─────────────────────────────────────────────────────────────┘
```

### ⚠️ Niveau WARNING (1-6 jours)
- **Fréquence** : Jour 1 et jour 3
- **Ton** : Rappel amical
- **Sujet** : `⚠️ Rappel : [Maintenance] en retard (Xj) - [Véhicule]`
- **Design** : Badge jaune, ton neutre

### 🔥 Niveau URGENT (7-29 jours)
- **Fréquence** : Tous les 7 jours
- **Ton** : Action fortement recommandée
- **Sujet** : `🔥 Urgent : [Maintenance] en retard (Xj) - [Véhicule]`
- **Design** : Badge orange, risques mentionnés

### 🚨 Niveau CRITICAL (30+ jours)
- **Fréquence** : Tous les 7 jours
- **Ton** : Alerte critique
- **Sujet** : `🚨 CRITIQUE : [Maintenance] en retard (Xj) - [Véhicule]`
- **Design** : Badge rouge, liste des risques
- **Contenu** :
  - Avertissement garantie
  - Risques sécurité
  - Coûts supplémentaires

## 📧 Exemple d'Email

### Email WARNING (1-3j de retard)
```
┌─────────────────────────────────────────┐
│ ⚠️ Attention                             │
│ PilotMyVan                              │
├─────────────────────────────────────────┤
│ EN RETARD DE 1 JOUR                     │
├─────────────────────────────────────────┤
│                                         │
│ Votre entretien est en retard          │
│                                         │
│ Bonjour Guillaume,                     │
│                                         │
│ L'entretien suivant est en retard.    │
│ Il est important de le réaliser       │
│ rapidement...                          │
│                                         │
│ ┌─────────────────────────────────┐   │
│ │ ⚠️ Vidange moteur                │   │
│ │ Véhicule : Mon Van                │   │
│ │                                   │   │
│ │ 📅 Date prévue : 15 oct 2025     │   │
│ │ ⏰ En retard depuis : 1 jour     │   │
│ └─────────────────────────────────┘   │
│                                         │
│ [Planifier cet entretien]              │
│ [Marquer comme fait]                   │
└─────────────────────────────────────────┘
```

### Email CRITICAL (30+ jours de retard)
```
┌─────────────────────────────────────────┐
│ 🚨                                       │
│ 🚨 Alerte critique                       │
│ PilotMyVan                              │
├─────────────────────────────────────────┤
│ EN RETARD DE 35 JOURS                   │
│ Dépassement : 3,500 km                  │
├─────────────────────────────────────────┤
│                                         │
│ ⚠️ ATTENTION : Cet entretien est très   │
│ en retard ! Le non-respect peut         │
│ entraîner des pannes graves...          │
│                                         │
│ ┌─────────────────────────────────┐   │
│ │ 🚨 Vidange moteur                │   │
│ │ Véhicule : Mon Van                │   │
│ │                                   │   │
│ │ ⏰ En retard : 35 jours          │   │
│ │ 🛣️ Dépassement : 3,500 km        │   │
│ └─────────────────────────────────┘   │
│                                         │
│ ⚠️ Risques potentiels :                 │
│ • Risque de panne importante           │
│ • Usure prématurée composants          │
│ • Coûts réparation plus élevés         │
│ • Compromission sécurité               │
│ • Perte potentielle de garantie        │
│                                         │
│ [⚠️ Régler maintenant]                  │
│ [Marquer comme fait]                   │
└─────────────────────────────────────────┘
```

## 🔧 Configuration

### Horaire du Cron
```json
{
  "path": "/api/cron/send-overdue-notifications",
  "schedule": "0 9 * * *"  // 9h UTC tous les jours
}
```

### Personnaliser la fréquence

Modifier dans `app/api/cron/send-overdue-notifications/route.ts` :

```typescript
// WARNING : Actuellement J1 + J3
shouldSendToday = daysOverdue === 1 || daysOverdue === 3;

// Modifier pour envoyer tous les jours :
shouldSendToday = true;

// Modifier pour J1, J3, J5 :
shouldSendToday = daysOverdue % 2 === 1 && daysOverdue <= 5;
```

```typescript
// URGENT : Actuellement tous les 7j
shouldSendToday = daysOverdue % 7 === 0;

// Modifier pour tous les 3j :
shouldSendToday = daysOverdue % 3 === 0;
```

## 📊 Monitoring

### Response JSON
```json
{
  "results": {
    "totalOverdueMaintenances": 8,
    "totalNotifications": 5,
    "breakdown": {
      "warning": 2,
      "urgent": 2,
      "critical": 1
    }
  }
}
```

### Dashboard Vercel
Voir les logs en temps réel :
1. Projet > Logs
2. Filtrer : `/api/cron/send-overdue-notifications`

## 🧪 Tests

```bash
# Test uniquement les retards
npm run test:notifications overdue

# Test tout
npm run test:notifications both
```

## 💡 Cas d'usage

### Scenario 1 : Vidange oubliée
```
Jour -1  : ✅ Email préventif (si configuré)
Jour 0   : 📅 Échéance
Jour +1  : ⚠️ Email WARNING "En retard de 1j"
Jour +3  : ⚠️ Email WARNING "En retard de 3j"
Jour +7  : 🔥 Email URGENT "En retard de 7j"
Jour +14 : 🔥 Email URGENT "En retard de 14j"
Jour +30 : 🚨 Email CRITICAL "En retard de 30j"
Jour +37 : 🚨 Email CRITICAL "En retard de 37j"
```

### Scenario 2 : Maintenance marquée comme faite
```
Jour +3  : ⚠️ Email WARNING envoyé
         → Utilisateur marque comme fait
         → Plus d'emails de retard 🎉
```

## 🎨 Personnaliser les templates

Éditer `lib/emailTemplates.ts` :

```typescript
// Modifier les messages
const urgencyMessages = {
  warning: {
    title: "Votre message custom",
    intro: "Texte personnalisé...",
  },
  // ...
};

// Modifier les couleurs
const URGENCY_CONFIG = {
  critical: {
    bg: "#CUSTOM_COLOR",
    // ...
  },
};
```

## 🚀 Prochaines améliorations

- [ ] Notifications SMS pour niveau CRITICAL
- [ ] Calcul du coût estimé du retard
- [ ] Suggestion d'ateliers à proximité
- [ ] Historique des retards dans le dashboard
- [ ] Badge "Entretien en retard" dans l'app
- [ ] Snooze pour 7 jours (ex: pièce en commande)

## 📝 Notes importantes

1. **Anti-spam** : Pas d'email quotidien, sauf configuration manuelle
2. **Historique** : Toutes les notifications sont loggées dans MongoDB
3. **Performance** : Index optimisé pour requêtes rapides
4. **Sécurité** : Route protégée par `CRON_SECRET`
5. **Kilométrage** : Le retard en km est aussi pris en compte si disponible

## 🆘 Support

En cas de problème :
1. Vérifier les logs Vercel
2. Consulter `notificationhistories` dans MongoDB
3. Tester manuellement avec `curl` + `CRON_SECRET`
4. Vérifier que les maintenances ont bien `nextDueDate` défini

