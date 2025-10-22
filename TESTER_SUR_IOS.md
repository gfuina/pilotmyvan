# 🍎 Tester les notifications push sur iPhone

## ⚠️ IMPORTANT : Safari iOS nécessite HTTPS

iOS Safari **ne supporte PAS les notifications push sur HTTP**, même en local.

## 🚀 Solutions pour tester

### Option 1 : Déployer sur Vercel (RECOMMANDÉ)

C'est la méthode la plus simple :

```bash
# Ajoute les clés VAPID sur Vercel
# Settings > Environment Variables

git add .
git commit -m "feat: PWA + Push notifications"
git push
```

Puis sur ton iPhone : https://pilotmyvan.com

### Option 2 : HTTPS local avec ngrok

Si tu veux tester en local :

```bash
# 1. Installe ngrok (https://ngrok.com/)
brew install ngrok

# 2. Lance ton app en prod
npm run build
npm start

# 3. Dans un autre terminal, expose avec ngrok
ngrok http 3000
```

Tu auras une URL HTTPS type : https://abc123.ngrok.io

Ouvre cette URL sur ton iPhone.

### Option 3 : Certificat auto-signé (Complexe)

Pas recommandé car iOS ne fait pas confiance aux certificats auto-signés sans configuration avancée.

## 🐛 Debugger sur iPhone

### 1. Activer la console Web

Sur Mac :
1. Safari > Préférences > Avancées > Cocher "Afficher le menu Développement"
2. Connecte ton iPhone en USB
3. Safari > Développement > [Ton iPhone] > [PilotMyVan]

Tu verras tous les console.log !

### 2. Que vérifier

Dans la console Safari, cherche :

```
🔍 PWAInstallListener initialisé
🔍 Check standalone mode
```

Tu devrais voir :
- `isStandalone: true` (si installé en PWA)
- `isSupported: true` (si push supporté)
- `isSecureContext: true` (OBLIGATOIRE sur iOS)
- `isIOS: true`

Si `isSecureContext: false` → **C'est le problème !** Utilise HTTPS.

### 3. Logs attendus (si tout va bien)

```
📱 App en mode standalone, demande des notifications...
📱 Demande de permission après délai...
✅ Permission accordée, abonnement...
✅ Subscription enregistrée avec succès sur le serveur
```

## 📱 Workflow de test complet

1. **Build en production**
   ```bash
   npm run build && npm start
   ```

2. **Expose en HTTPS** (ngrok OU Vercel)

3. **Sur iPhone** :
   - Ouvre Safari (PAS Chrome iOS !)
   - Va sur l'URL HTTPS
   - Appui sur "Partager"
   - "Sur l'écran d'accueil"
   - "Ajouter"

4. **Lance la PWA** depuis l'écran d'accueil

5. **Attends 2 secondes** → Popup de permission devrait apparaître

6. **Accepte** → Notification de bienvenue s'affiche

## 🔧 Troubleshooting

### "Pas de popup de permission"

Vérifie dans la console :
- `isSecureContext` DOIT être `true`
- `isSupported` DOIT être `true`
- `isStandalone` DOIT être `true`

### "isSecureContext: false"

→ Tu es en HTTP ! Utilise ngrok ou Vercel.

### "isSupported: false"

→ Vérifie que les clés VAPID sont dans .env (ou Vercel)

### "Erreur lors de l'enregistrement de la subscription"

→ Vérifie la console réseau, il y a sûrement une erreur 500 de l'API

### Reset le "déjà demandé"

Dans la console Safari sur Mac :
```javascript
localStorage.removeItem('push-permission-asked');
```

Puis recharge l'app.

## ✅ Checklist finale

- [ ] App en mode production (`npm run build && npm start`)
- [ ] HTTPS activé (ngrok OU Vercel)
- [ ] Clés VAPID configurées
- [ ] PWA installée sur l'écran d'accueil iPhone
- [ ] Ouverte depuis l'écran d'accueil (pas Safari)
- [ ] Console Web Safari ouverte pour voir les logs
- [ ] Patience : 2 secondes de délai avant la popup

---

**TL;DR** : Sur iPhone, ça ne marchera qu'en HTTPS. Le plus simple = push sur Vercel et teste directement en prod.



