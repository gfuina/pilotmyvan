# Configuration des Notifications Push

## ✅ Ce qui a été mis en place

### Backend
- ✅ Modèle User mis à jour avec `pushSubscriptions`
- ✅ API `/api/user/push-subscription` (GET, POST, DELETE)
- ✅ API `/api/admin/push-notifications` (GET, POST)
- ✅ Bibliothèque `lib/pushNotifications.ts` pour envoyer les notifications
- ✅ Crons mis à jour pour envoyer des push en plus des emails
- ✅ Service Worker avec gestion des notifications push

### Frontend
- ✅ Hook `usePushNotifications` pour gérer les subscriptions
- ✅ `NotificationPreferencesCard` mis à jour avec toggle push
- ✅ Détection automatique PWA/standalone
- ✅ Interface admin `PushNotificationsManager` pour gérer les abonnés et envoyer des notifications en masse

## 🚀 Configuration requise

### 1. Générer les clés VAPID

Les clés VAPID sont nécessaires pour identifier ton serveur auprès des services push (Firebase Cloud Messaging, Apple Push Notification, etc.).

```bash
npm run generate-vapid
```

Ou manuellement :
```bash
npx web-push generate-vapid-keys
```

### 2. Ajouter les variables d'environnement

Ajoute ces variables à ton `.env.local` (et sur Vercel) :

```bash
VAPID_PUBLIC_KEY=votre_clé_publique_générée
VAPID_PRIVATE_KEY=votre_clé_privée_générée
VAPID_EMAIL=contact@pilotmyvan.com
```

⚠️ **IMPORTANT** : Ne committe JAMAIS les clés VAPID dans Git !

### 3. Sur Vercel

Dans les settings de ton projet Vercel, ajoute les 3 variables d'environnement ci-dessus.

## 📱 Comment ça fonctionne

### Pour les utilisateurs

1. L'utilisateur ouvre l'app (en PWA ou navigateur)
2. Dans "Notifications d'entretien", il voit un toggle "Notifications push"
3. En activant le toggle, le navigateur demande la permission
4. Une subscription push est créée et envoyée au serveur
5. L'utilisateur recevra désormais des notifications push en plus des emails

### Pour les admins

1. Onglet "📱 Notifications Push" dans le dashboard admin
2. Voir tous les utilisateurs abonnés avec le nombre d'appareils
3. Envoyer des notifications push en masse ou ciblées
4. Les subscriptions expirées sont automatiquement nettoyées

## 🔔 Notifications automatiques

Les crons envoient maintenant :
- **Emails** : Comme avant, selon les préférences utilisateur
- **Push** : En plus, pour tous les utilisateurs abonnés

### Types de notifications

1. **Maintenance à venir** (8h tous les jours)
   - Envoyé X jours avant selon les préférences
   - Email + Push si abonné

2. **Maintenance en retard** (9h tous les jours)
   - Warning : J+1, J+3
   - Urgent : Tous les 7 jours (J+7, J+14, J+21...)
   - Critique : Tous les 7 jours après J+30
   - Email + Push si abonné

## 🧪 Tester en local

### 1. Build en production

Les notifications push ne fonctionnent qu'en production (HTTPS ou localhost) :

```bash
npm run build
npm start
```

### 2. Tester sur téléphone

Connecte-toi sur `http://[TON_IP]:3000` depuis ton téléphone (même réseau WiFi).

### 3. Installer la PWA

- iOS : Safari > Partager > Sur l'écran d'accueil
- Android : Chrome > Menu > Installer l'application

### 4. Activer les push

Dashboard > Notifications d'entretien > Toggle "Notifications push"

### 5. Envoyer une notification test

Admin > Notifications Push > Envoyer une notification

## 🛠️ Débogage

### Les notifications ne s'affichent pas

1. Vérifier que les clés VAPID sont configurées
2. Vérifier la permission dans le navigateur
3. Ouvrir la console > Application > Service Workers
4. Vérifier que le service worker est actif

### Les subscriptions ne s'enregistrent pas

1. Vérifier que l'app est en HTTPS (ou localhost)
2. Vérifier la console pour les erreurs
3. S'assurer que le service worker est enregistré

### Les notifications expirées

Les subscriptions peuvent expirer si :
- L'utilisateur désinstalle l'app
- Le navigateur révoque la permission
- Le token FCM/APNs expire

Le système nettoie automatiquement les subscriptions expirées.

## 📊 Statistiques admin

Dans l'interface admin, tu peux voir :
- Nombre total d'utilisateurs abonnés
- Nombre total de subscriptions (appareils)
- Détails par utilisateur (nombre d'appareils, dates)
- Succès/échecs d'envoi

## 🔒 Sécurité

- Les routes admin sont protégées par authentification
- Seuls les admins peuvent envoyer des notifications en masse
- Les subscriptions sont liées aux utilisateurs authentifiés
- Les clés VAPID privées ne sont jamais exposées au client

## 📱 Support navigateurs

- ✅ Chrome (Desktop & Mobile)
- ✅ Edge
- ✅ Firefox
- ✅ Safari (iOS 16.4+, macOS avec PWA)
- ❌ Safari iOS sans PWA (limitation Apple)

## 🎯 Prochaines améliorations possibles

- [ ] Personnalisation des sons de notification
- [ ] Catégories de notifications (urgent, info, etc.)
- [ ] Badge count sur l'icône de l'app
- [ ] Actions personnalisées dans les notifications
- [ ] Notifications programmées
- [ ] Analytics des notifications (taux d'ouverture, etc.)

