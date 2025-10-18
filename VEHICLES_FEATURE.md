# Fonctionnalité Gestion des Véhicules - Documentation

## Vue d'ensemble

Le système de gestion des véhicules permet aux utilisateurs de créer, gérer et suivre leurs véhicules (van, camping-car, fourgon, camion aménagé) avec upload de photos et suivi du kilométrage.

---

## Modèle de données

### Vehicle (MongoDB)

```typescript
{
  userId: ObjectId;              // Référence à l'utilisateur
  name: string;                  // Nom du véhicule (ex: "Mon Sprinter")
  make: string;                  // Marque (ex: "Mercedes")
  model: string;                 // Modèle (ex: "Sprinter 313 CDI")
  year: number;                  // Année
  vehicleType: enum;             // "van" | "camping-car" | "fourgon" | "camion aménagé"
  currentMileage: number;        // Kilométrage actuel
  mileageHistory: Array<{        // Historique des kilométrages
    mileage: number;
    date: Date;
    note?: string;
  }>;
  coverImage?: string;           // URL Vercel Blob
  gallery: string[];             // URLs Vercel Blob (max 10)
  vin?: string;                  // Numéro de série
  licensePlate?: string;         // Plaque d'immatriculation
  purchaseDate?: Date;           // Date d'achat
  notes?: string;                // Notes libres
  createdAt: Date;
  updatedAt: Date;
}
```

**Note importante :** Le premier kilométrage est automatiquement ajouté à l'historique lors de la création du véhicule.

---

## API Routes

### `GET /api/vehicles`
Récupère tous les véhicules de l'utilisateur connecté.

**Response:**
```json
{
  "vehicles": [...]
}
```

### `POST /api/vehicles`
Crée un nouveau véhicule.

**Body:**
```json
{
  "name": "Mon Sprinter",
  "make": "Mercedes",
  "model": "Sprinter 313 CDI",
  "year": 2015,
  "vehicleType": "van",
  "currentMileage": 150000,
  "coverImage": "https://...",
  "gallery": ["https://...", "https://..."],
  "vin": "WDB9063451K123456",
  "licensePlate": "AB-123-CD",
  "purchaseDate": "2020-01-15",
  "notes": "Acheté d'occasion"
}
```

### `GET /api/vehicles/[id]`
Récupère un véhicule spécifique.

### `PATCH /api/vehicles/[id]`
Met à jour un véhicule.

**Body:** Tous les champs sont optionnels. Si `currentMileage` est fourni et différent, il sera ajouté à l'historique.

```json
{
  "currentMileage": 155000,
  "mileageNote": "Mise à jour après révision",
  "name": "Nouveau nom",
  ...
}
```

### `DELETE /api/vehicles/[id]`
Supprime un véhicule et toutes ses images Blob associées.

### `POST /api/upload`
Upload une image vers Vercel Blob.

**Body:** FormData avec un champ `file`

**Validations:**
- Types autorisés : JPG, PNG, WebP
- Taille max : 5MB

**Response:**
```json
{
  "url": "https://..."
}
```

---

## Interface Dashboard

### `/dashboard`
Page principale du dashboard avec :

**Empty State (0 véhicules):**
- Message d'accueil avec call-to-action
- Bouton pour ajouter le premier véhicule

**Liste des véhicules:**
- Grid responsive (1 col mobile, 2 cols tablet, 3 cols desktop)
- Cards avec :
  - Photo de couverture (ou emoji si pas de photo)
  - Badge du type de véhicule
  - Nom, marque/modèle, année
  - Kilométrage actuel
  - Bouton "Gérer" → `/dashboard/vehicles/[id]`
  - Bouton "Supprimer" avec confirmation

### Modal d'ajout de véhicule

Formulaire complet avec :

**Informations obligatoires:**
- Nom du véhicule
- Type de véhicule (select)
- Marque
- Modèle
- Année
- Kilométrage actuel (avec note explicative sur le suivi)

**Informations optionnelles:**
- N° de série (VIN)
- Plaque d'immatriculation
- Date d'achat
- Notes

**Photos:**
- Photo de couverture (1 max)
- Galerie photos (10 max)
- Upload drag & drop
- Prévisualisation avec bouton de suppression

### Composant ImageUpload

Upload d'images avec :
- Drag & drop
- Clic pour sélectionner
- Validation du type de fichier
- Validation de la taille (5MB max)
- Preview de l'image uploadée
- Mode compact pour la galerie
- Indicateur de chargement

---

## Architecture Multi-véhicules

Le système est conçu dès le départ pour supporter plusieurs véhicules par utilisateur :

1. **Modèle Vehicle** : Lié à `userId`
2. **API Routes** : Filtrent automatiquement par `userId`
3. **Interface** : Grid responsive qui s'adapte au nombre de véhicules
4. **Empty state** : Encourage l'ajout du premier véhicule

---

## Stockage des images

### Vercel Blob

**Configuration requise :**
```env
BLOB_READ_WRITE_TOKEN=vercel_blob_...
```

**Structure de stockage :**
```
vehicles/
  {userId}/
    {timestamp}-{filename}
```

**Gestion automatique :**
- Upload via `/api/upload`
- Suppression automatique lors de la suppression d'un véhicule
- URLs publiques générées automatiquement

---

## Suivi du kilométrage

### Philosophie

Le kilométrage est **toujours redemandé** lors des mises à jour pour créer un historique fiable. Cela permet de :

1. Suivre l'évolution réelle du kilométrage
2. Calculer les distances parcourues entre entretiens
3. Anticiper les prochains entretiens basés sur le kilométrage
4. Détecter les incohérences

### Historique automatique

À chaque mise à jour du kilométrage, une entrée est ajoutée à `mileageHistory` :

```typescript
{
  mileage: 155000,
  date: new Date(),
  note: "Mise à jour du kilométrage" // ou note personnalisée
}
```

---

## Design

### Couleurs (DA PilotMyVan)
- **Orange primaire** : `#ff6b35` (orange)
- **Orange clair** : `#ff8c61` (orange-light)
- **Noir** : Textes principaux
- **Gris** : Textes secondaires
- **Blanc** : Fonds principaux

### Composants
- **Border-radius** : `rounded-2xl` (12px) ou `rounded-3xl` (24px)
- **Shadows** : `shadow-lg` pour les cards
- **Transitions** : `duration-300` pour tous les hovers
- **Animations** : Framer Motion pour les entrées/sorties

### Iconographie
- Emojis pour les types de véhicules : 🚐 🚙 🚚 🚛
- Heroicons pour les actions

---

## Points d'attention

### Sécurité
- Toutes les routes API vérifient l'authentification
- Les véhicules sont toujours filtrés par `userId`
- Les images sont uploadées dans des dossiers spécifiques à l'utilisateur

### Performance
- Images optimisées avec Next.js Image
- Lazy loading des composants
- Animations légères avec Framer Motion

### UX
- Confirmations pour les actions destructrices (suppression)
- Messages d'erreur clairs
- Indicateurs de chargement
- Empty states engageants

---

## Prochaines étapes

La page de détail du véhicule (`/dashboard/vehicles/[id]`) est prête structurellement et affichera :

1. ✅ Informations du véhicule
2. 🔜 Mise à jour du kilométrage
3. 🔜 Gestion des équipements
4. 🔜 Historique des entretiens
5. 🔜 Rappels et notifications
6. 🔜 Statistiques et coûts

---

## Tests

Pour tester la fonctionnalité :

1. Se connecter au dashboard
2. Cliquer sur "Ajouter un véhicule"
3. Remplir le formulaire
4. Uploader une photo de couverture (optionnel)
5. Ajouter des photos à la galerie (optionnel)
6. Valider
7. Le véhicule apparaît dans la liste
8. Cliquer sur "Gérer" pour accéder à la page de détail (placeholder)
9. Supprimer le véhicule pour tester la suppression avec confirmation

