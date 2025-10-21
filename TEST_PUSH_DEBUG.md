# 🐛 Debug des notifications push - Guide complet

## Étape 1: Vérifier les variables d'environnement

### En local
```bash
# Vérifie que ton .env.local contient:
VAPID_PUBLIC_KEY=BH_czH6ltL_tHsRa5_AQHGVe1LWFxoCiURAmPQjN8DJwi2HoZfI2dtYK2DYHq2_6ovPhRRbxK_i0V1kW9vs36EA
VAPID_PRIVATE_KEY=tasLKqla_h_R_n-hZRxdAujl3fWnKdRCAgccB93BJxU
VAPID_EMAIL=contact@pilotmyvan.com
```

### Sur Vercel
Ajoute les 3 mêmes variables dans: **Settings → Environment Variables**

## Étape 2: Reset le flag localStorage

Dans ta PWA, ouvre la console (Safari/Chrome DevTools) et tape:

```javascript
// Reset le flag qui empêche de redemander
localStorage.removeItem("push-permission-asked");

// Recharge la page
location.reload();
```

## Étape 3: Vérifier les logs

Après le reload, dans la console tu devrais voir:

```
🔍 PWAInstallListener initialisé
🔍 Check standalone mode
```

Vérifie ces valeurs:
- ✅ `isStandalone: true` (si tu es en PWA)
- ✅ `isSupported: true` (push supporté)
- ✅ `isSecureContext: true` (OBLIGATOIRE sur iOS)
- ✅ `notificationPermission: "default"` (jamais demandé)
- ✅ `isSubscribed: false`

Si `notificationPermission: "denied"` → Tu as refusé, va dans les paramètres du navigateur/système pour réinitialiser les permissions.

## Étape 4: Logs attendus (succès)

Si tout va bien, après 2 secondes tu devrais voir:

```
📱 App en mode standalone, demande des notifications...
📱 Demande de permission après délai...
✅ Permission accordée, abonnement...
Clé VAPID récupérée avec succès
Création d'une nouvelle subscription push...
Subscription créée: https://fcm.googleapis.com/...
✅ Subscription enregistrée avec succès sur le serveur
```

## Étape 5: Alternative manuelle

Si l'auto-prompt ne marche pas, utilise le **toggle manuel** dans:
- Dashboard → "Notifications d'entretien" → Toggle "Notifications push"

## 🚨 Problèmes courants

### ❌ "Les notifications push ne sont pas configurées"
→ Les clés VAPID ne sont pas dans l'env. Redémarre le serveur après les avoir ajoutées.

### ❌ "Notifications bloquées dans les paramètres du navigateur"
→ `Notification.permission === "denied"`
→ Va dans les paramètres système/navigateur pour reset les permissions du site

### ❌ `isSecureContext: false` sur iOS
→ iOS nécessite HTTPS. Utilise Vercel ou ngrok pour tester.

### ❌ La popup ne s'affiche pas
1. Check que `notificationPermission === "default"`
2. Reset le localStorage (voir Étape 2)
3. Vérifie que tu es bien en mode standalone (`isStandalone: true`)

## 📱 Test sur iPhone

### Avec Safari Inspector (Mac required)
1. Safari > Préférences > Avancées > Cocher "Afficher le menu Développement"
2. Connecte ton iPhone en USB
3. Safari > Développement > [Ton iPhone] > [PilotMyVan]
4. Tu verras tous les console.log

### Via Vercel (plus simple)
1. Deploy sur Vercel
2. Ouvre https://pilotmyvan.com sur iPhone
3. Ajoute à l'écran d'accueil
4. Lance la PWA
5. Regarde si la permission est demandée

## 🎯 Vérification finale

Pour vérifier que tout marche:

1. **Check dans MongoDB** que `pushSubscriptions` contient bien un objet avec endpoint/keys
2. **Envoie une notif test** via l'interface admin: `/administration` → Onglet "📱 Notifications Push"
3. Tu devrais recevoir la notif sur ton appareil

## 🔧 Commandes utiles

```bash
# Rebuild en prod local
npm run build
npm start

# Tester avec ngrok (pour iOS)
ngrok http 3000
```

---

## Changements effectués dans le code

1. **PWAInstallListener.tsx**: Amélioration de la logique
   - Détecte si `notificationPermission === "default"` malgré le flag localStorage
   - Reset automatique du flag si permission jamais vraiment accordée
   - Logs plus détaillés

2. **Variables VAPID**: Clés générées et prêtes à utiliser

