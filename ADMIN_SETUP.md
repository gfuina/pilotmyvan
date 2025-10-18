# Configuration Administration - PilotMyVan

## Vue d'ensemble

Le système d'administration permet à certains utilisateurs autorisés d'accéder à une interface d'administration pour visualiser les statistiques, les utilisateurs et les véhicules de la plateforme.

---

## Configuration

### 1. Définir les emails administrateurs

Dans le fichier `/lib/admin.ts`, modifiez le tableau `ADMIN_EMAILS` :

```typescript
const ADMIN_EMAILS = [
  "votre-email@example.com",
  "autre-admin@example.com",
];
```

**Alternative avec variable d'environnement :**

Ajoutez dans `.env.local` :
```env
ADMIN_EMAILS=email1@example.com,email2@example.com,email3@example.com
```

Et modifiez dans `lib/admin.ts` :
```typescript
const ADMIN_EMAILS = process.env.ADMIN_EMAILS?.split(',') || [];
```

### 2. Créer un compte admin

1. Ajoutez votre email dans `ADMIN_EMAILS`
2. Créez un compte avec cet email sur `/signup`
3. Le champ `isAdmin` sera automatiquement mis à `true`
4. Vous aurez accès à `/administration`

---

## Architecture

### Modèle User

Ajout du champ `isAdmin` :

```typescript
{
  name: string;
  email: string;
  password?: string;
  emailVerified?: Date | null;
  image?: string | null;
  isAdmin: boolean;           // Nouveau champ
  createdAt: Date;
  updatedAt: Date;
}
```

### Helpers d'administration

**`lib/admin.ts`** contient :

- `isAdminEmail(email)` - Vérifie si un email est dans la liste
- `isUserAdmin(userId)` - Vérifie si un user est admin (async)
- `syncAdminStatus(userId, email)` - Synchronise le statut admin

### Session NextAuth

Le statut admin est inclus dans la session :

```typescript
session.user.isAdmin = true/false
```

---

## Routes et protection

### Page d'administration

**Route :** `/administration`

**Protection :**
1. Vérifie l'authentification
2. Vérifie `session.user.isAdmin`
3. Redirige vers `/dashboard` si non admin

### API Routes admin

**`/api/admin/users`**
- GET : Liste tous les utilisateurs
- Protection : Admin uniquement

**`/api/admin/vehicles`**
- GET : Liste tous les véhicules avec infos utilisateur
- Protection : Admin uniquement

---

## Interface d'administration

### Onglets disponibles

#### 📊 Statistiques
- Total utilisateurs
- Total véhicules
- Nombre d'administrateurs
- Utilisateurs actifs (avec véhicules)

#### 👥 Utilisateurs
Tableau avec :
- Nom
- Email
- Statut (Admin, Vérifié/Non vérifié)
- Date d'inscription

#### 🚐 Véhicules
Tableau avec :
- Nom du véhicule
- Type
- Marque/Modèle
- Propriétaire (nom + email)
- Lien vers la page de détail

### Design

- Header orange/noir pour distinguer l'interface admin
- Badge "ADMIN" visible
- Boutons pour revenir au dashboard ou se déconnecter
- Tables responsive avec hover effects

---

## Accès à l'administration

### Dans le Header

Pour les utilisateurs admin, un bouton "Admin" apparaît automatiquement :
- **Desktop** : Bouton orange "Admin" dans la navigation
- **Mobile** : Lien "Administration" dans le menu

### Sécurité

1. **Double vérification** :
   - Check à la création du compte (signup)
   - Check dans la session (JWT)
   - Check à chaque requête API admin

2. **Middleware** :
   - La page vérifie `session.user.isAdmin`
   - Les API routes vérifient également

3. **Pas d'exposition publique** :
   - Le lien n'apparaît que si `session.user.isAdmin === true`
   - Pas de route publique vers `/administration`

---

## Workflow

### 1. Nouvel utilisateur admin

```
1. Email ajouté dans ADMIN_EMAILS
2. User s'inscrit → isAdmin = true automatiquement
3. User se connecte → session.user.isAdmin = true
4. Bouton "Admin" visible dans le header
5. Accès à /administration accordé
```

### 2. Utilisateur existant devient admin

```
1. Email ajouté dans ADMIN_EMAILS
2. À la prochaine connexion : isAdmin mis à jour automatiquement
3. Accès admin accordé
```

### 3. Retrait des droits admin

```
1. Email retiré de ADMIN_EMAILS
2. Utiliser syncAdminStatus() pour mettre à jour en DB
3. À la prochaine connexion : plus d'accès admin
```

---

## Commandes utiles

### Vérifier les admins actuels

Dans MongoDB :
```javascript
db.users.find({ isAdmin: true })
```

### Promouvoir un utilisateur en admin manuellement

Dans MongoDB :
```javascript
db.users.updateOne(
  { email: "user@example.com" },
  { $set: { isAdmin: true } }
)
```

### Révoquer les droits admin

Dans MongoDB :
```javascript
db.users.updateOne(
  { email: "user@example.com" },
  { $set: { isAdmin: false } }
)
```

---

## Sécurité et bonnes pratiques

### ✅ Recommandations

1. **N'ajoutez que des emails de confiance** dans `ADMIN_EMAILS`
2. **Utilisez une variable d'environnement** pour les emails admin en production
3. **Auditez régulièrement** les comptes admin via la page d'administration
4. **Limitez le nombre d'admins** au strict nécessaire
5. **Utilisez des emails professionnels** pour les comptes admin

### ⚠️ À ne pas faire

1. Ne commitez pas d'emails admin dans le code
2. Ne partagez pas les identifiants admin
3. Ne donnez pas l'accès admin par défaut
4. Ne stockez pas `ADMIN_EMAILS` en clair dans le repo public

---

## Extension future

Vous pouvez facilement étendre le système admin pour :

- **Gestion des utilisateurs** : Bloquer/débloquer, supprimer
- **Gestion des véhicules** : Modérer, supprimer
- **Logs d'activité** : Voir qui fait quoi
- **Statistiques avancées** : Graphiques, tendances
- **Configuration globale** : Paramètres de l'application
- **Permissions granulaires** : Super admin, modérateur, etc.

---

## Test

Pour tester l'accès admin :

1. Ajoutez votre email dans `ADMIN_EMAILS`
2. Créez un compte ou reconnectez-vous
3. Le bouton "Admin" apparaît dans le header
4. Cliquez pour accéder à `/administration`
5. Explorez les 3 onglets : Stats, Utilisateurs, Véhicules

**Note :** Si vous êtes déjà connecté, déconnectez-vous et reconnectez-vous pour que le statut admin soit synchronisé.

