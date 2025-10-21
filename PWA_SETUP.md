# Configuration PWA - PilotMyVan

## ✅ Ce qui a été mis en place

### 1. Configuration PWA
- **next-pwa** installé et configuré dans `next.config.ts`
- Service Worker généré automatiquement
- Cache offline pour une utilisation hors connexion
- Manifeste PWA dans `/public/manifest.json`

### 2. Métadonnées PWA
- Manifeste lié dans `app/layout.tsx`
- Configuration Apple Web App
- Icônes pour iOS et Android
- Theme color défini (#FF6B35 - orange brand)

### 3. Bandeau d'installation
- Composant `PWAInstallBanner` créé
- Détection automatique iOS/Android/Desktop
- Instructions spécifiques par plateforme
- Fermable et mémorisé dans localStorage
- Intégré dans le dashboard

## 🚀 Fonctionnalités

### Installation
- **Android/Chrome**: Bouton d'installation natif
- **iOS/Safari**: Instructions pas-à-pas pour ajouter à l'écran d'accueil
- **Desktop**: Menu navigateur "Installer l'application"

### Offline
- Cache intelligent des ressources
- Fonctionnement hors connexion
- Stratégie "Network First" pour les données fraîches

### UX Native
- Lance en plein écran (standalone)
- Icône sur l'écran d'accueil
- Couleur de thème personnalisée
- Splash screen automatique

## 🧪 Test en développement

La PWA est **désactivée en développement** pour faciliter le debug.

Pour tester localement:
```bash
npm run build
npm start
```

Puis visite http://localhost:3000 depuis :
- Un device Android/iOS réel
- Chrome DevTools > Application > Manifest
- Safari sur macOS/iOS

## 📱 Test en production

Sur https://pilotmyvan.com :

### iOS (Safari)
1. Ouvrir dans Safari
2. Appuyer sur le bouton Partager
3. "Sur l'écran d'accueil"
4. "Ajouter"

### Android (Chrome)
1. Ouvrir dans Chrome
2. Appuyer sur le menu (⋮)
3. "Installer l'application"
4. Confirmer

### Desktop (Chrome/Edge)
1. Icône + dans la barre d'adresse
2. "Installer PilotMyVan"
3. L'app s'ouvre dans sa propre fenêtre

## 🎨 Personnalisation

### Icônes
- `/public/icon.png` (192x192) - Icône standard
- `/public/apple-icon.png` (512x512) - Icône iOS

### Couleurs
- Theme color: `#FF6B35` (orange)
- Background: `#ffffff` (blanc)

Modifiable dans `/public/manifest.json`

### Cache
La stratégie de cache peut être ajustée dans `next.config.ts` :
```typescript
runtimeCaching: [
  {
    urlPattern: /^https?.*/,
    handler: "NetworkFirst", // ou "CacheFirst", "StaleWhileRevalidate"
    options: {
      cacheName: "offlineCache",
      expiration: {
        maxEntries: 200,
      },
    },
  },
]
```

## 🔍 Debug

### Vérifier le Service Worker
Chrome DevTools > Application > Service Workers

### Vérifier le Manifest
Chrome DevTools > Application > Manifest

### Vérifier le Cache
Chrome DevTools > Application > Cache Storage

### Simuler offline
Chrome DevTools > Network > Offline

## 📝 Notes importantes

- Le bandeau ne s'affiche que si l'app n'est pas déjà installée
- Le bandeau peut être fermé et ne se réaffichera pas (localStorage)
- Pour réinitialiser : `localStorage.removeItem('pwa-banner-dismissed')`
- Sur iOS, seul Safari supporte les PWA (pas Chrome iOS)

## 🚢 Déploiement

Vercel détecte automatiquement la configuration PWA.

Vérifier après déploiement :
- [ ] Manifest accessible à `/manifest.json`
- [ ] Service Worker actif
- [ ] Icônes chargées correctement
- [ ] Installation possible sur mobile
- [ ] Cache offline fonctionnel

