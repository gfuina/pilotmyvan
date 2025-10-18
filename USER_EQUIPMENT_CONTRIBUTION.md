# Système de Contribution Utilisateur - Équipements

## Vue d'ensemble

Les utilisateurs peuvent maintenant créer des équipements qui enrichissent la bibliothèque commune. Ce système est transparent pour l'utilisateur et permet à l'admin de modérer le contenu.

## Fonctionnement

### Côté Utilisateur

1. **Création d'un équipement**
   - L'utilisateur va sur son véhicule et clique sur "Ajouter un équipement"
   - Il peut choisir l'onglet "✏️ Créer le mien"
   - Il remplit le formulaire complet (nom, catégorie, description, marques compatibles, photos, manuels, notes)
   - En cliquant sur "Créer et ajouter à mon véhicule", l'équipement est :
     - Créé dans la bibliothèque globale avec `status: "pending"` et `isUserContributed: true`
     - Automatiquement ajouté à son véhicule
   
2. **Visibilité**
   - L'utilisateur voit **tous les équipements approuvés** + **ses propres créations** (peu importe le statut)
   - Il n'est pas au courant du système de validation
   - Il peut utiliser son équipement immédiatement

### Côté Admin

1. **Liste des contributions en attente**
   - Endpoint : `GET /api/admin/equipments/pending`
   - Retourne tous les équipements avec `isUserContributed: true` et `status: "pending"`
   - Affiche le contributeur, toutes les infos saisies, etc.

2. **Approbation d'un équipement**
   - Endpoint : `POST /api/admin/equipments/[id]/approve`
   - L'admin peut modifier les infos avant d'approuver (nom, description, photos, etc.)
   - Une fois approuvé :
     - `status` passe à `"approved"`
     - L'équipement devient visible pour **tous les utilisateurs** dans la bibliothèque
     - Les autres utilisateurs peuvent l'ajouter à leurs véhicules

3. **Rejet d'un équipement**
   - Endpoint : `POST /api/admin/equipments/[id]/reject`
   - Paramètre : `reason` (optionnel, pour usage interne)
   - L'équipement passe en `status: "rejected"`
   - **Important** : Il reste visible et utilisable pour l'utilisateur qui l'a créé
   - Il n'apparaît pas dans la bibliothèque des autres utilisateurs

## Structure de données

### Modèle Equipment

```typescript
{
  // Champs existants
  name: string;
  description?: string;
  categoryId: ObjectId;
  vehicleBrands: ObjectId[];
  equipmentBrands: ObjectId[];
  photos: string[];
  manuals: Array<{title, url, isExternal}>;
  notes?: string;
  
  // Nouveaux champs pour la contribution
  isUserContributed: boolean;          // true si créé par un utilisateur
  contributedBy?: ObjectId;            // ID de l'utilisateur créateur
  status: "pending" | "approved" | "rejected";  // État de validation
  approvedBy?: ObjectId;               // ID de l'admin qui a validé/rejeté
  approvedAt?: Date;                   // Date de validation/rejet
  rejectionReason?: string;            // Raison du rejet (usage interne)
}
```

## API Endpoints

### Utilisateur

- `POST /api/user/equipments` - Créer un équipement et l'ajouter à son véhicule
- `GET /api/equipments` - Liste des équipements (approuvés + ses créations)

### Admin

- `GET /api/admin/equipments/pending` - Liste des équipements en attente
- `POST /api/admin/equipments/[id]/approve` - Approuver un équipement
- `POST /api/admin/equipments/[id]/reject` - Rejeter un équipement
- `PUT /api/admin/equipments/[id]` - Modifier un équipement avant approbation

## Workflow type

1. **Utilisateur** crée "Chauffage Webasto Air Top 2000"
   - Équipement créé avec `status: "pending"`
   - Ajouté automatiquement à son véhicule
   - Il peut l'utiliser normalement

2. **Admin** voit la contribution
   - Vérifie les infos
   - Corrige éventuellement (meilleure description, photos optimisées)
   - Approuve

3. **Tous les utilisateurs** voient maintenant "Chauffage Webasto Air Top 2000" dans la bibliothèque
   - Ils peuvent l'ajouter à leurs véhicules
   - Ils peuvent voir les entretiens recommandés associés

## Avantages

- ✅ **Transparent pour l'utilisateur** : Pas de notion de "validation en attente"
- ✅ **Utilisabilité immédiate** : L'utilisateur peut utiliser son équipement tout de suite
- ✅ **Qualité contrôlée** : L'admin valide avant de rendre public
- ✅ **Crowdsourcing** : La communauté enrichit la base de données
- ✅ **Pas de frustration** : L'utilisateur n'est pas bloqué en attendant la validation

## À implémenter côté admin

### Interface de gestion des contributions

Créer une nouvelle section dans `/app/administration/page.tsx` :

```typescript
// Pseudo-code de l'interface admin
<section className="contributions">
  <h2>Contributions en attente ({pendingCount})</h2>
  
  {pendingEquipments.map(equipment => (
    <Card key={equipment._id}>
      <EquipmentInfo equipment={equipment} />
      <ContributorInfo user={equipment.contributedBy} />
      <Actions>
        <button onClick={() => editEquipment(equipment._id)}>
          Modifier
        </button>
        <button onClick={() => approveEquipment(equipment._id)}>
          ✅ Approuver
        </button>
        <button onClick={() => rejectEquipment(equipment._id)}>
          ❌ Rejeter
        </button>
      </Actions>
    </Card>
  ))}
</section>
```

## TODO

- [ ] Créer l'interface admin pour gérer les contributions
- [ ] Ajouter des notifications pour l'admin quand une nouvelle contribution arrive
- [ ] Implémenter le même système pour les maintenances personnalisées
- [ ] Ajouter des statistiques : nombre de contributions approuvées/rejetées par utilisateur


