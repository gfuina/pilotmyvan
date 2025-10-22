# 🤖 Chatbot IA Global - Documentation

## Vue d'ensemble

Le chatbot IA global est accessible **partout dans le dashboard** via un bouton flottant avec ton robot personnalisé animé.

## ✨ Fonctionnalités

### 1. **Bouton flottant**
- Visible en permanence en bas à droite
- Avatar du robot avec animation au hover
- Accessible depuis n'importe quelle page du dashboard

### 2. **Sélection d'équipement**
- Liste tous les équipements avec manuels indexés
- Recherche rapide par nom ou catégorie
- Affichage du nombre de manuels disponibles
- Photos et informations de chaque équipement

### 3. **Chat intelligent**
- Conversations basées sur les manuels de l'équipement sélectionné
- Possibilité de changer d'équipement en cours de discussion
- Historique des messages par session

### 4. **Robot animé avec émotions**

Le robot change d'expression selon le contexte :

| Émotion | Image | Contexte |
|---------|-------|----------|
| 👋 **Hello** | `say-hello.png` | Message de bienvenue initial |
| ❓ **Question** | `interrogation.png` | En attente de question |
| 📖 **Thinking** | `reading-book.png` | En train de chercher dans les manuels |
| 💬 **Speaking** | `speaking-and-translating.png` | En train de répondre |
| ❌ **Error** | `404-error.png` | Erreur ou information non trouvée |

## 📁 Structure des fichiers

```
components/dashboard/
  └─ GlobalChatbot.tsx              # Composant principal du chatbot global

app/api/user/
  └─ equipments-with-manuals/
     └─ route.ts                    # API pour lister les équipements indexés

public/images/bot/
  ├─ say-hello.png                  # Robot qui salue
  ├─ interrogation.png              # Robot questionne
  ├─ reading-book.png               # Robot lit/réfléchit
  ├─ speaking-and-translating.png   # Robot parle
  └─ 404-error.png                  # Robot erreur
```

## 🎨 Design

### Bouton flottant
- Position: Bas droite (bottom-6, right-6)
- Taille: 64x64px
- Gradient: Bleu (from-blue-500 to-blue-600)
- Animation: Scale 110% au hover
- Shadow: 2xl avec glow bleu au hover

### Modal chatbot
- Taille: 420px × 600px
- Position: Bas droite aligné avec le bouton
- Header: Gradient bleu avec nom du robot
- Coins arrondis: 2xl (rounded-2xl)
- Shadow: 2xl avec border gris léger

### Émotions du robot
- Taille avatar header: 40x40px
- Taille avatar messages: 32x32px
- Transition: Scale au hover

## 🔧 Utilisation

### Pour l'utilisateur

1. **Ouvrir le chatbot**
   - Cliquer sur le bouton flottant robot en bas à droite

2. **Sélectionner un équipement**
   - Utiliser la recherche pour filtrer
   - Cliquer sur l'équipement souhaité

3. **Poser des questions**
   - Taper la question dans le champ
   - Appuyer sur Entrée ou cliquer sur Envoyer
   - Le robot lit les manuels et répond

4. **Changer d'équipement**
   - Cliquer sur "← Changer d'équipement"
   - Sélectionner un nouvel équipement

### Pour le développeur

#### Ajouter le chatbot à une nouvelle page

```tsx
import GlobalChatbot from "@/components/dashboard/GlobalChatbot";

export default function MaPage() {
  return (
    <>
      {/* Votre contenu */}
      
      {/* Chatbot global */}
      <GlobalChatbot />
    </>
  );
}
```

#### Ajouter une nouvelle émotion

1. Ajouter l'image dans `public/images/bot/`
2. Ajouter l'émotion dans `ROBOT_EMOTIONS` :

```tsx
const ROBOT_EMOTIONS = {
  // ... existantes
  nouveauEtat: "/images/bot/nouveau-etat.png",
};
```

3. Utiliser l'émotion dans les messages :

```tsx
const message: Message = {
  role: "assistant",
  content: "...",
  emotion: "nouveauEtat",
};
```

## 🎯 Différences avec l'ancien chatbot

### Ancien (EquipmentChatbot)
- ❌ Accessible uniquement depuis la page équipement
- ❌ Lié à un seul équipement
- ❌ Pas d'avatar animé
- ❌ Design modal basique

### Nouveau (GlobalChatbot)
- ✅ Accessible depuis tout le dashboard
- ✅ Sélection de n'importe quel équipement
- ✅ Robot animé avec 5 émotions
- ✅ Design moderne et engageant
- ✅ Recherche d'équipement intégrée
- ✅ Bouton flottant toujours visible

## 🚀 Prochaines améliorations possibles

1. **Historique persistant**
   - Sauvegarder les conversations en DB
   - Reprendre les conversations précédentes

2. **Multi-équipements**
   - Poser des questions sur plusieurs équipements en même temps
   - Comparaison entre équipements

3. **Suggestions de questions**
   - Afficher des questions fréquentes
   - Autocomplete des questions

4. **Émotions dynamiques**
   - Animation entre les émotions
   - Micro-animations du robot

5. **Voice input**
   - Poser des questions vocalement
   - Lecture des réponses

6. **Export de conversation**
   - Télécharger l'historique en PDF
   - Partager une conversation

## 📊 Métriques à suivre

- Nombre d'ouvertures du chatbot par jour
- Équipements les plus consultés
- Questions les plus fréquentes
- Taux de satisfaction des réponses
- Temps moyen de réponse

## 🐛 Troubleshooting

### Le bouton flottant n'apparaît pas
- Vérifier que `<GlobalChatbot />` est bien ajouté au composant
- Vérifier que l'utilisateur est authentifié

### Aucun équipement n'apparaît
- Vérifier que des équipements ont des manuels
- Vérifier que les manuels sont indexés
- Check l'API `/api/user/equipments-with-manuals`

### Les images du robot ne s'affichent pas
- Vérifier que les images sont dans `public/images/bot/`
- Vérifier les noms de fichiers dans `ROBOT_EMOTIONS`
- Check la console pour les erreurs 404

### Le chatbot ne répond pas
- Vérifier que l'équipement a des chunks indexés
- Check les logs serveur pour voir les scores de similarité
- Vérifier `OPENAI_API_KEY`

