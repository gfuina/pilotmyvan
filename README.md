# PilotMyVan 🚐

Application de gestion d'entretien pour vans et fourgons aménagés !

## Stack Technique

- **Next.js 15** (App Router)
- **React 19**
- **TypeScript**
- **Tailwind CSS v4**
- **Framer Motion** - Animations
- **Lottie React** - Icônes animées
- **@mantine/hooks** - Hooks utilitaires

## Palette de couleurs

- **Noir:** `#0a0a0a` (primary)
- **Gris foncé:** `#1a1a1a`
- **Orange:** `#ff6b35` (secondary/accent)
- **Orange clair:** `#ff8c61`
- **Orange foncé:** `#e85a2a`

## Installation

```bash
npm install
```

## Développement

```bash
npm run dev
```

Ouvrir [http://localhost:3000](http://localhost:3000)

## Images nécessaires

Voir le fichier `IMAGES_NEEDED.md` pour la liste des images à créer/ajouter.

## Structure du projet

```
app/
├── page.tsx              # Landing page
├── layout.tsx            # Layout global
└── globals.css           # Styles globaux

components/
├── layout/
│   ├── Header.tsx        # Navigation
│   └── Footer.tsx        # Footer
└── home/
    ├── HeroSection.tsx       # Section hero
    ├── FeaturesSection.tsx   # Fonctionnalités
    ├── PricingSection.tsx    # Tarifs
    └── CTASection.tsx        # Call to action

hooks/
└── useIsMobile.ts        # Hook responsive

lib/
└── animations.ts         # Config animations Framer Motion
```

## Prochaines étapes

- [ ] Pages login/signup
- [ ] Dashboard utilisateur
- [ ] Système de rappels
- [ ] Gestion des véhicules
- [ ] Gestion des équipements
- [ ] Base de données (MongoDB)
- [ ] Authentification (NextAuth)
- [ ] Notifications
