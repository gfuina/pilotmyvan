# Configuration de l'authentification PilotMyVan

## Variables d'environnement requises

Créez un fichier `.env.local` à la racine du projet avec les variables suivantes :

### MongoDB
```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/pilotmyvan?retryWrites=true&w=majority
```
- Votre connexion MongoDB (déjà configurée)

### NextAuth
```env
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=votre-secret-genere
```

**Pour générer NEXTAUTH_SECRET :**
```bash
openssl rand -base64 32
```

### Resend (Email)
```env
RESEND_API_KEY=re_xxxxxxxxxxxxxxxxxxxxxxxxxx
EMAIL_FROM=PilotMyVan <noreply@pilotmyvan.com>
```
- Vos identifiants Resend (déjà configurés)

---

## Flux d'authentification

### 1. Inscription (`/signup`)
- L'utilisateur remplit le formulaire (nom, email, mot de passe)
- Le mot de passe est hashé avec bcrypt
- Un token de vérification est généré
- Un email de vérification est envoyé via Resend
- L'utilisateur doit vérifier son email avant de pouvoir se connecter

### 2. Vérification email (`/verify-email?token=xxx`)
- L'utilisateur clique sur le lien dans l'email
- Le token est vérifié
- Le champ `emailVerified` est mis à jour dans la base de données
- L'utilisateur peut maintenant se connecter

### 3. Connexion (`/login`)
- L'utilisateur entre son email et mot de passe
- NextAuth vérifie les credentials
- Si l'email n'est pas vérifié, la connexion est refusée
- Une session JWT est créée
- Redirection vers `/dashboard`

### 4. Dashboard (`/dashboard`)
- Route protégée par middleware
- Affiche les informations de l'utilisateur
- Bouton de déconnexion disponible

---

## Modèles de données

### User
```typescript
{
  name: string;
  email: string (unique);
  password: string (hashedavec bcrypt);
  emailVerified: Date | null;
  image: string | null;
  createdAt: Date;
  updatedAt: Date;
}
```

### VerificationToken
```typescript
{
  email: string;
  token: string (unique);
  expires: Date;
  createdAt: Date; // TTL index de 1 heure
}
```

---

## Routes API

- `POST /api/auth/signup` - Créer un compte
- `POST /api/auth/verify-email` - Vérifier l'email
- `GET/POST /api/auth/[...nextauth]` - NextAuth handlers

---

## Middleware de protection

Le middleware protège automatiquement :
- `/dashboard/*` - Accessible uniquement si connecté
- `/login` et `/signup` - Redirige vers `/dashboard` si déjà connecté

---

## Header dynamique

Le header s'adapte selon l'état de connexion :
- **Non connecté** : Boutons "Connexion" et "Essai gratuit"
- **Connecté** : Boutons "Dashboard" et "Déconnexion"

---

## Tester l'authentification

1. **Démarrer le serveur** :
```bash
npm run dev
```

2. **Créer un compte** :
   - Aller sur http://localhost:3000/signup
   - Remplir le formulaire
   - Vérifier votre email

3. **Vérifier l'email** :
   - Cliquer sur le lien dans l'email
   - Être redirigé vers la page de connexion

4. **Se connecter** :
   - Aller sur http://localhost:3000/login
   - Entrer vos identifiants
   - Être redirigé vers le dashboard

5. **Tester la protection** :
   - Essayer d'accéder à `/dashboard` sans être connecté → Redirection vers `/login`
   - Essayer d'accéder à `/login` en étant connecté → Redirection vers `/dashboard`

---

## Dépendances installées

```json
{
  "next-auth": "^5.0.0-beta",
  "mongoose": "^8.x",
  "bcryptjs": "^2.x",
  "@types/bcryptjs": "^2.x",
  "resend": "^3.x",
  "@auth/mongodb-adapter": "^3.x"
}
```

