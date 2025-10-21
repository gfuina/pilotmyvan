# Test PWA en local

## Pour tester la PWA sur ton téléphone

1. Build et lance en mode production:
```bash
npm run build
npm start
```

2. Trouve ton IP locale:
```bash
ifconfig | grep "inet " | grep -v 127.0.0.1
```

3. Sur ton téléphone, va sur: `http://[TON_IP]:3000`

4. Le bandeau d'installation devrait apparaître automatiquement

## Réinitialiser le bandeau

Si tu as fermé le bandeau et veux le revoir:

Dans la console du navigateur:
```javascript
localStorage.removeItem('pwa-banner-dismissed');
```

Puis rafraîchis la page.

## Test iOS

- Ouvre Safari (pas Chrome)
- Va sur l'app
- Le bandeau te dira exactement comment faire
- Ou manuellement: Partager > Sur l'écran d'accueil

## Test Android

- Ouvre Chrome
- Va sur l'app
- Clique sur "Installer l'application" dans le bandeau
- Ou manuellement: Menu (⋮) > Installer l'application

