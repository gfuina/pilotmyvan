# Chatbot IA - Documentation

## 📖 Vue d'ensemble

Le chatbot IA permet aux utilisateurs de poser des questions sur leurs équipements en se basant **uniquement** sur les manuels disponibles. Le système utilise une approche RAG (Retrieval-Augmented Generation) pour garantir des réponses précises et factuelles.

## 🏗️ Architecture

### 1. **Stockage des données**
- **Modèle** : `ManualChunk`
- **Base de données** : MongoDB
- Les manuels PDF sont découpés en chunks de ~1000 caractères
- Chaque chunk est converti en embedding via OpenAI (`text-embedding-3-small`)
- Les embeddings sont stockés avec le texte pour la recherche sémantique

### 2. **Technologies**
- **OpenAI API** : 
  - `text-embedding-3-small` pour les embeddings
  - `gpt-4-turbo-preview` pour la génération de réponses
- **pdf-parse** : Extraction de texte des PDFs
- **Recherche sémantique** : Similarité cosine pour trouver les chunks pertinents

### 3. **Flux de données**

```
1. Admin indexe les manuels
   ↓
2. PDF → Extraction texte → Chunks → Embeddings → MongoDB
   ↓
3. Utilisateur pose une question
   ↓
4. Question → Embedding → Recherche similarité → Top 5 chunks
   ↓
5. Chunks + Question → GPT-4 → Réponse basée sur le contexte
```

## 🚀 Utilisation

### Pour les Administrateurs

#### 1. Indexer les manuels d'un équipement
1. Aller dans l'**interface admin** (`/administration`)
2. Ouvrir la liste des **équipements**
3. Développer un équipement qui a des manuels
4. Cliquer sur le bouton **"🤖 Indexer"**
5. Confirmer l'indexation
6. Attendre la fin du processus (peut prendre 1-2 minutes selon le nombre de manuels)

**Note** : L'indexation est nécessaire uniquement :
- À la première fois qu'un manuel est ajouté
- Quand un manuel est modifié/remplacé
- Les manuels sont automatiquement ré-indexés à chaque fois

#### 2. API Admin - Indexation manuelle

```bash
POST /api/equipment/[equipmentId]/index-manuals
Authorization: Admin only
```

**Réponse** :
```json
{
  "success": true,
  "message": "3/3 manuels indexés",
  "totalChunks": 47
}
```

### Pour les Utilisateurs

#### 1. Accéder au chatbot
1. Aller sur la page d'un **véhicule**
2. Dans la liste des **équipements**, trouver un équipement avec des manuels (badge vert 📄)
3. Cliquer sur le bouton **"IA"** (vert)
4. Le chatbot s'ouvre en modal

#### 2. Poser des questions
- Posez des questions précises sur l'équipement
- Exemples :
  - "Comment installer le chauffage ?"
  - "Quelle est la consommation électrique ?"
  - "Comment faire l'entretien ?"
  - "Quelles sont les dimensions ?"

#### 3. Recevoir des réponses
- Le chatbot répond **uniquement** en se basant sur les manuels
- Les sources sont indiquées avec un score de pertinence
- Si l'information n'est pas dans les manuels, le chatbot le dira clairement

## 📁 Structure des fichiers

```
models/
  └─ ManualChunk.ts          # Modèle MongoDB pour les chunks

lib/
  └─ manualIndexing.ts       # Service d'indexation et de recherche

app/api/equipment/[id]/
  ├─ index-manuals/
  │  └─ route.ts             # API pour indexer les manuels (Admin)
  └─ chat/
     └─ route.ts             # API pour le chat (Users)

components/dashboard/
  ├─ EquipmentChatbot.tsx    # Composant UI du chatbot
  └─ VehicleEquipmentList.tsx # Liste des équipements + bouton IA

components/admin/
  └─ EquipmentList.tsx       # Liste admin + bouton d'indexation
```

## ⚙️ Configuration

### Variables d'environnement requises

```env
OPENAI_API_KEY=sk-...
```

### Dépendances

Déjà installées dans `package.json` :
- `openai@^6.5.0`
- `pdf-parse@^2.4.3`

## 🔧 Paramètres de configuration

### Dans `lib/manualIndexing.ts`

```typescript
const CHUNK_SIZE = 1000;        // Taille des chunks en caractères
const CHUNK_OVERLAP = 200;      // Overlap entre chunks
const TOP_K_RESULTS = 5;        // Nombre de chunks retournés
```

### Modèle GPT

```typescript
model: "gpt-4-turbo-preview"
temperature: 0.1               // Très bas pour limiter la créativité
max_tokens: 500                // Réponses concises
```

## 🔒 Sécurité & Permissions

### API Endpoints

| Endpoint | Permission | Description |
|----------|-----------|-------------|
| `POST /api/equipment/[id]/index-manuals` | **Admin only** | Indexer les manuels |
| `POST /api/equipment/[id]/chat` | **User authenticated** | Poser une question |

### Validation

- ✅ Vérifie que l'équipement existe
- ✅ Vérifie que l'équipement a des manuels
- ✅ Vérifie que les manuels sont indexés avant de répondre
- ✅ Limite les réponses au contexte fourni (température basse)

## 💡 Bonnes pratiques

### Pour les admins
1. **Indexer dès l'ajout** : Indexez immédiatement après avoir ajouté des manuels
2. **Qualité des PDFs** : Utilisez des PDFs avec du texte sélectionnable (pas des images scannées)
3. **Taille des manuels** : Les gros manuels (>100 pages) peuvent prendre 2-3 minutes

### Pour les utilisateurs
1. **Questions précises** : Plus la question est précise, meilleure sera la réponse
2. **Un sujet à la fois** : Évitez les questions multiples dans un seul message
3. **Contexte** : Les réponses sont limitées aux informations des manuels

## 🐛 Troubleshooting

### "Les manuels n'ont pas encore été indexés"
→ L'admin doit indexer les manuels via le bouton dans l'interface admin

### "Je n'ai pas trouvé d'information pertinente"
→ L'information n'est probablement pas dans les manuels, ou la question est trop vague

### L'indexation échoue
→ Vérifier :
- Que `OPENAI_API_KEY` est bien définie
- Que les URLs des PDFs sont accessibles
- Que les PDFs contiennent du texte extractible

### Timeout lors de l'indexation
→ Pour les gros manuels, l'indexation peut prendre du temps. Considérer :
- Augmenter les timeouts Vercel (Pro plan)
- Découper les très gros manuels

## 📊 Coûts estimés

### OpenAI API
- **Embeddings** (`text-embedding-3-small`) : ~$0.00002 / 1K tokens
  - Manuel de 50 pages ≈ 25,000 tokens ≈ $0.0005
- **Génération** (`gpt-4-turbo-preview`) : ~$0.01 / 1K tokens input + $0.03 / 1K tokens output
  - Question moyenne ≈ $0.002-0.005

**Coût par équipement** : ~$0.001-0.01 pour l'indexation initiale + ~$0.003 par question

## 🚀 Évolutions futures possibles

1. **MongoDB Atlas Vector Search** : Utiliser l'index vectoriel natif de MongoDB
2. **Cache des réponses** : Stocker les réponses fréquentes
3. **Multi-langues** : Détecter la langue de la question
4. **Historique de conversation** : Sauvegarder les chats
5. **Feedback utilisateur** : Permettre de noter les réponses
6. **Re-ranking** : Utiliser un modèle de re-ranking pour améliorer la pertinence

## 📝 Notes importantes

- Les réponses sont **strictement basées sur les manuels** (température GPT à 0.1)
- Le système **ne retient pas** l'historique des conversations (chaque question est indépendante)
- Les manuels doivent être **ré-indexés** si modifiés
- Seuls les équipements avec des manuels peuvent utiliser le chatbot

