import "dotenv/config";
import mongoose from "mongoose";

// Connect to MongoDB
const connectDB = async () => {
  try {
    const MONGODB_URI = process.env.MONGODB_URI;
    if (!MONGODB_URI) {
      throw new Error("MONGODB_URI not found in environment variables");
    }
    await mongoose.connect(MONGODB_URI);
    console.log("✅ Connected to MongoDB");
  } catch (error) {
    console.error("❌ MongoDB connection error:", error);
    process.exit(1);
  }
};

// Equipment schema
const equipmentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: String,
  categoryId: { type: mongoose.Schema.Types.ObjectId, ref: "Category", required: true },
  vehicleBrands: [{ type: mongoose.Schema.Types.ObjectId, ref: "VehicleBrand" }],
  equipmentBrands: [{ type: mongoose.Schema.Types.ObjectId, ref: "EquipmentBrand" }],
  photos: [String],
  manuals: [{ title: String, url: String, isExternal: Boolean }],
  notes: String,
  isUserContributed: { type: Boolean, default: false },
  status: { type: String, enum: ["pending", "approved", "rejected"], default: "approved" },
}, { timestamps: true });

const Equipment = mongoose.models.Equipment || mongoose.model("Equipment", equipmentSchema);

// Maintenance schema
const maintenanceSchema = new mongoose.Schema({
  equipmentId: { type: mongoose.Schema.Types.ObjectId, ref: "Equipment", required: true },
  name: { type: String, required: true },
  type: { 
    type: String, 
    enum: ["inspection", "cleaning", "replacement", "service", "lubrication", "adjustment", "drain", "test", "calibration", "other"],
    required: true 
  },
  priority: { type: String, enum: ["critical", "important", "recommended", "optional"], default: "recommended" },
  difficulty: { type: String, enum: ["easy", "intermediate", "advanced", "professional"], default: "intermediate" },
  recurrence: {
    time: { value: Number, unit: { type: String, enum: ["days", "months", "years"] } },
    kilometers: Number,
  },
  conditions: [String],
  description: String,
  instructions: String,
  photos: [String],
  videos: [String],
  parts: [{
    name: String,
    reference: String,
    quantity: Number,
    estimatedCost: Number,
    purchaseLink: String,
  }],
  estimatedDuration: Number,
  estimatedCost: Number,
  tags: [String],
  isOfficial: { type: Boolean, default: true },
  source: String,
  isUserContributed: { type: Boolean, default: false },
  status: { type: String, enum: ["pending", "approved", "rejected"], default: "approved" },
}, { timestamps: true });

const Maintenance = mongoose.models.Maintenance || mongoose.model("Maintenance", maintenanceSchema);

// Generic equipment and maintenance data
const genericEquipmentData = [
  // MOTEUR - FILTRES
  {
    equipment: {
      name: "Filtre à huile moteur",
      description: "Filtre à huile permettant de nettoyer l'huile moteur des impuretés et particules métalliques générées par le fonctionnement du moteur. Essentiel pour prolonger la durée de vie du moteur.",
      categoryId: "68f3503ebe04ebdaad786aba", // Filtres (huile, air, carburant, habitacle)
      notes: "Vérifier la compatibilité avec votre moteur. Changer systématiquement lors de la vidange."
    },
    maintenances: [
      {
        name: "Remplacement du filtre à huile",
        type: "replacement",
        priority: "critical",
        difficulty: "easy",
        recurrence: { time: { value: 1, unit: "years" }, kilometers: 15000 },
        description: "Remplacement du filtre à huile lors de chaque vidange moteur pour garantir une filtration optimale.",
        instructions: "1. Vidanger l'huile moteur\n2. Dévisser l'ancien filtre avec une clé appropriée\n3. Nettoyer la surface de montage\n4. Lubrifier le joint du nouveau filtre avec de l'huile neuve\n5. Visser le nouveau filtre à la main jusqu'à contact du joint, puis serrer de 3/4 de tour\n6. Remplir d'huile neuve et vérifier le niveau\n7. Démarrer le moteur et vérifier l'absence de fuites",
        estimatedDuration: 30,
        estimatedCost: 15,
        tags: ["moteur", "vidange", "huile", "entretien courant"]
      }
    ]
  },
  {
    equipment: {
      name: "Filtre à air moteur",
      description: "Filtre permettant de purifier l'air entrant dans le moteur. Un filtre encrassé réduit les performances et augmente la consommation.",
      categoryId: "68f3503ebe04ebdaad786aba",
      notes: "À contrôler régulièrement, surtout en conditions poussiéreuses."
    },
    maintenances: [
      {
        name: "Contrôle et nettoyage du filtre à air",
        type: "inspection",
        priority: "recommended",
        difficulty: "easy",
        recurrence: { time: { value: 6, unit: "months" }, kilometers: 10000 },
        description: "Inspection visuelle et nettoyage si nécessaire du filtre à air.",
        instructions: "1. Ouvrir le boîtier du filtre à air\n2. Retirer le filtre\n3. Inspecter visuellement l'état (encrassement, déchirures)\n4. Si filtre en papier : remplacer si sale\n5. Si filtre lavable : nettoyer avec de l'air comprimé ou laver selon instructions fabricant\n6. Nettoyer le boîtier\n7. Remonter le filtre",
        estimatedDuration: 15,
        estimatedCost: 5,
        tags: ["moteur", "air", "performance"]
      },
      {
        name: "Remplacement du filtre à air",
        type: "replacement",
        priority: "important",
        difficulty: "easy",
        recurrence: { time: { value: 2, unit: "years" }, kilometers: 30000 },
        description: "Remplacement complet du filtre à air moteur.",
        instructions: "1. Ouvrir le boîtier du filtre à air\n2. Retirer l'ancien filtre\n3. Nettoyer le boîtier de tout résidu\n4. Installer le nouveau filtre en respectant le sens de montage\n5. Vérifier l'étanchéité du joint\n6. Refermer le boîtier",
        estimatedDuration: 10,
        estimatedCost: 25,
        tags: ["moteur", "air", "remplacement"]
      }
    ]
  },
  {
    equipment: {
      name: "Filtre à carburant",
      description: "Filtre essentiel pour éliminer les impuretés du carburant avant son injection dans le moteur. Particulièrement important sur les moteurs diesel.",
      categoryId: "68f3503ebe04ebdaad786aba",
      notes: "Critique sur diesel. Surveiller en cas de carburant de mauvaise qualité."
    },
    maintenances: [
      {
        name: "Remplacement du filtre à carburant",
        type: "replacement",
        priority: "critical",
        difficulty: "intermediate",
        recurrence: { time: { value: 2, unit: "years" }, kilometers: 30000 },
        description: "Remplacement du filtre à carburant pour éviter l'encrassement du système d'injection.",
        instructions: "1. Dépressuriser le circuit carburant\n2. Placer un récipient sous le filtre\n3. Déconnecter les durites d'arrivée et de sortie\n4. Retirer l'ancien filtre\n5. Installer le nouveau filtre en respectant le sens de passage\n6. Reconnecter les durites\n7. Amorcer le circuit (pompe manuelle ou contact)\n8. Vérifier l'absence de fuites\n9. Purger l'air si nécessaire (diesel)",
        estimatedDuration: 45,
        estimatedCost: 35,
        tags: ["moteur", "carburant", "diesel", "essence", "injection"]
      },
      {
        name: "Purge du filtre à carburant (diesel)",
        type: "drain",
        priority: "important",
        difficulty: "easy",
        recurrence: { time: { value: 1, unit: "years" }, kilometers: 20000 },
        conditions: ["Moteur diesel uniquement", "Plus fréquent si carburant de mauvaise qualité"],
        description: "Purge de l'eau accumulée dans le filtre à carburant diesel.",
        instructions: "1. Localiser la vis de purge sous le filtre\n2. Placer un récipient dessous\n3. Desserrer la vis de purge\n4. Laisser couler jusqu'à ce que le carburant soit clair (sans eau)\n5. Resserrer la vis de purge\n6. Amorcer le circuit si nécessaire",
        estimatedDuration: 10,
        estimatedCost: 0,
        tags: ["diesel", "eau", "purge"]
      }
    ]
  },
  {
    equipment: {
      name: "Filtre d'habitacle",
      description: "Filtre purifiant l'air entrant dans l'habitacle via le système de ventilation/climatisation. Protège contre pollens, poussières et odeurs.",
      categoryId: "68f3503ebe04ebdaad786aba",
      notes: "Modèles avec charbon actif pour filtrer les odeurs disponibles."
    },
    maintenances: [
      {
        name: "Remplacement du filtre d'habitacle",
        type: "replacement",
        priority: "recommended",
        difficulty: "easy",
        recurrence: { time: { value: 1, unit: "years" }, kilometers: 15000 },
        conditions: ["Plus fréquent si circulation urbaine dense", "En cas d'odeurs désagréables"],
        description: "Remplacement du filtre d'habitacle pour un air intérieur sain.",
        instructions: "1. Localiser le filtre (souvent derrière la boîte à gants ou sous le capot)\n2. Retirer le cache d'accès\n3. Extraire l'ancien filtre\n4. Nettoyer le logement\n5. Installer le nouveau filtre dans le bon sens (flèche indiquant le sens d'écoulement de l'air)\n6. Remonter le cache",
        estimatedDuration: 15,
        estimatedCost: 20,
        tags: ["habitacle", "air", "climatisation", "confort"]
      }
    ]
  },

  // MOTEUR - DISTRIBUTION
  {
    equipment: {
      name: "Courroie de distribution",
      description: "Courroie synchronisant la rotation du vilebrequin et de l'arbre à cames. Sa rupture peut causer de graves dommages moteur.",
      categoryId: "68f3503ebe04ebdaad786abc", // Distribution
      notes: "CRITIQUE : Respecter impérativement les intervalles de remplacement constructeur."
    },
    maintenances: [
      {
        name: "Remplacement de la courroie de distribution",
        type: "replacement",
        priority: "critical",
        difficulty: "professional",
        recurrence: { time: { value: 5, unit: "years" }, kilometers: 100000 },
        conditions: ["Vérifier les préconisations constructeur", "Remplacer également pompe à eau, tendeurs et galets"],
        description: "Remplacement préventif de la courroie de distribution avec kit complet.",
        instructions: "⚠️ INTERVENTION PROFESSIONNELLE RECOMMANDÉE\n\n1. Débrancher la batterie\n2. Déposer les protections moteur\n3. Caler le moteur au point mort haut (PMH)\n4. Déposer les accessoires gênants\n5. Retirer l'ancienne courroie\n6. Remplacer la pompe à eau\n7. Remplacer tous les galets et tendeurs\n8. Installer la nouvelle courroie en respectant les repères de calage\n9. Vérifier le calage\n10. Remonter et tester\n\nNécessite outils spécifiques de calage.",
        estimatedDuration: 240,
        estimatedCost: 600,
        tags: ["distribution", "courroie", "critique", "professionnel"]
      },
      {
        name: "Contrôle de la courroie de distribution",
        type: "inspection",
        priority: "critical",
        difficulty: "intermediate",
        recurrence: { time: { value: 1, unit: "years" }, kilometers: 20000 },
        description: "Inspection visuelle de l'état de la courroie de distribution.",
        instructions: "1. Retirer le cache de distribution si accessible\n2. Inspecter visuellement la courroie :\n   - Fissures\n   - Effilochage\n   - Traces d'huile\n   - Usure anormale\n3. Vérifier la tension (selon méthode constructeur)\n4. Contrôler l'état des galets et tendeurs\n5. Écouter les bruits anormaux au ralenti\n\n⚠️ En cas de doute, remplacer immédiatement",
        estimatedDuration: 30,
        estimatedCost: 0,
        tags: ["distribution", "contrôle", "préventif"]
      }
    ]
  },

  // MOTEUR - REFROIDISSEMENT
  {
    equipment: {
      name: "Liquide de refroidissement",
      description: "Liquide permettant de réguler la température moteur et protégeant contre le gel et la corrosion.",
      categoryId: "68f3503ebe04ebdaad786abe", // Refroidissement
      notes: "Ne jamais mélanger différents types de liquide. Respecter les spécifications constructeur."
    },
    maintenances: [
      {
        name: "Contrôle du niveau de liquide de refroidissement",
        type: "inspection",
        priority: "critical",
        difficulty: "easy",
        recurrence: { time: { value: 1, unit: "months" } },
        description: "Vérification mensuelle du niveau de liquide de refroidissement.",
        instructions: "⚠️ Moteur froid uniquement\n\n1. Localiser le vase d'expansion\n2. Vérifier le niveau entre MIN et MAX\n3. Si nécessaire, compléter avec le même liquide\n4. Inspecter l'absence de fuites\n5. Vérifier l'état du liquide (coloration, propreté)",
        estimatedDuration: 5,
        estimatedCost: 0,
        tags: ["refroidissement", "niveau", "contrôle mensuel"]
      },
      {
        name: "Remplacement du liquide de refroidissement",
        type: "replacement",
        priority: "important",
        difficulty: "intermediate",
        recurrence: { time: { value: 4, unit: "years" }, kilometers: 60000 },
        description: "Vidange et remplacement complet du liquide de refroidissement.",
        instructions: "⚠️ Moteur froid\n\n1. Placer un récipient sous le radiateur\n2. Ouvrir la vis de purge du radiateur\n3. Vidanger complètement\n4. Refermer la vis de purge\n5. Remplir avec le liquide spécifié (mélange glycol/eau selon climat)\n6. Faire tourner le moteur en purgeant l'air\n7. Compléter le niveau après refroidissement\n8. Vérifier l'absence de fuites",
        estimatedDuration: 60,
        estimatedCost: 40,
        tags: ["refroidissement", "vidange", "antigel"]
      }
    ]
  },

  // FREINAGE
  {
    equipment: {
      name: "Plaquettes de frein avant",
      description: "Garnitures de friction se pressant sur les disques de frein avant. S'usent à l'usage et nécessitent un remplacement régulier.",
      categoryId: "68f3503ebe04ebdaad786ad0", // Plaquettes & disques
      notes: "L'usure est plus rapide à l'avant qu'à l'arrière. Surveiller les témoins d'usure."
    },
    maintenances: [
      {
        name: "Contrôle de l'usure des plaquettes avant",
        type: "inspection",
        priority: "critical",
        difficulty: "easy",
        recurrence: { time: { value: 6, unit: "months" }, kilometers: 10000 },
        description: "Vérification de l'épaisseur des plaquettes de frein avant.",
        instructions: "1. Inspecter visuellement à travers la jante\n2. Mesurer l'épaisseur de garniture restante\n3. Minimum requis : 3mm (remplacer si < 4mm)\n4. Vérifier l'usure régulière des deux plaquettes\n5. Écouter les bruits anormaux (grincement = témoin d'usure)\n6. Contrôler le niveau de liquide de frein",
        estimatedDuration: 15,
        estimatedCost: 0,
        tags: ["freinage", "sécurité", "plaquettes", "contrôle"]
      },
      {
        name: "Remplacement des plaquettes de frein avant",
        type: "replacement",
        priority: "critical",
        difficulty: "intermediate",
        recurrence: { kilometers: 40000 },
        conditions: ["Épaisseur < 4mm", "Usure irrégulière", "Grincements"],
        description: "Remplacement des plaquettes de frein avant.",
        instructions: "1. Soulever et caler le véhicule\n2. Déposer la roue\n3. Repousser le piston avec outil approprié\n4. Retirer les plaquettes usagées\n5. Nettoyer l'étrier et les supports\n6. Graisser les points de contact (graisse spéciale haute température)\n7. Installer les nouvelles plaquettes\n8. Remonter la roue\n9. Pomper plusieurs fois la pédale de frein\n10. Rodage : freinage progressif sur 200-300 km",
        estimatedDuration: 60,
        estimatedCost: 80,
        tags: ["freinage", "plaquettes", "avant", "sécurité"]
      }
    ]
  },
  {
    equipment: {
      name: "Plaquettes de frein arrière",
      description: "Garnitures de friction se pressant sur les disques/tambours de frein arrière.",
      categoryId: "68f3503ebe04ebdaad786ad0",
      notes: "S'usent moins vite que les plaquettes avant."
    },
    maintenances: [
      {
        name: "Contrôle de l'usure des plaquettes arrière",
        type: "inspection",
        priority: "important",
        difficulty: "easy",
        recurrence: { time: { value: 1, unit: "years" }, kilometers: 15000 },
        description: "Vérification de l'épaisseur des plaquettes de frein arrière.",
        instructions: "1. Inspecter visuellement\n2. Mesurer l'épaisseur de garniture\n3. Minimum requis : 3mm\n4. Vérifier l'usure régulière\n5. Contrôler l'absence de bruits anormaux",
        estimatedDuration: 15,
        estimatedCost: 0,
        tags: ["freinage", "plaquettes", "arrière"]
      },
      {
        name: "Remplacement des plaquettes de frein arrière",
        type: "replacement",
        priority: "critical",
        difficulty: "intermediate",
        recurrence: { kilometers: 60000 },
        conditions: ["Épaisseur < 4mm"],
        description: "Remplacement des plaquettes de frein arrière.",
        instructions: "Procédure similaire aux plaquettes avant.\n\n⚠️ Sur certains véhicules avec frein de parking intégré, nécessite un outil spécifique pour rétracter le piston (mouvement rotatif).",
        estimatedDuration: 60,
        estimatedCost: 70,
        tags: ["freinage", "plaquettes", "arrière"]
      }
    ]
  },
  {
    equipment: {
      name: "Disques de frein avant",
      description: "Disques métalliques sur lesquels les plaquettes de frein viennent exercer une pression pour ralentir le véhicule.",
      categoryId: "68f3503ebe04ebdaad786ad0",
      notes: "Contrôler l'épaisseur et l'absence de voilage lors du remplacement des plaquettes."
    },
    maintenances: [
      {
        name: "Contrôle des disques de frein avant",
        type: "inspection",
        priority: "important",
        difficulty: "easy",
        recurrence: { time: { value: 1, unit: "years" }, kilometers: 20000 },
        description: "Inspection de l'état des disques de frein avant.",
        instructions: "1. Inspecter visuellement les disques\n2. Rechercher :\n   - Rayures profondes\n   - Fissures\n   - Voilage (ondulations)\n   - Rebord excessif sur le bord\n3. Mesurer l'épaisseur avec un palmer\n4. Comparer à l'épaisseur minimale gravée sur le disque\n5. En cas de vibrations au freinage : contrôler le voilage",
        estimatedDuration: 20,
        estimatedCost: 0,
        tags: ["freinage", "disques", "avant", "contrôle"]
      },
      {
        name: "Remplacement des disques de frein avant",
        type: "replacement",
        priority: "critical",
        difficulty: "intermediate",
        recurrence: { kilometers: 80000 },
        conditions: ["Épaisseur minimale atteinte", "Voilage", "Rayures profondes", "Fissures"],
        description: "Remplacement des disques de frein avant.",
        instructions: "⚠️ Toujours remplacer les deux disques par paire\n⚠️ Remplacer également les plaquettes\n\n1. Déposer l'étrier de frein\n2. Retirer les plaquettes\n3. Dévisser la vis de maintien du disque\n4. Retirer le disque usagé\n5. Nettoyer le moyeu\n6. Installer le nouveau disque\n7. Dégraisser le disque (frein-contact)\n8. Remonter plaquettes et étrier\n9. Rodage nécessaire sur 200-300 km",
        estimatedDuration: 90,
        estimatedCost: 150,
        tags: ["freinage", "disques", "avant", "remplacement"]
      }
    ]
  },
  {
    equipment: {
      name: "Liquide de frein",
      description: "Fluide hydraulique transmettant la pression de la pédale aux étriers de frein. Hygroscopique : absorbe l'humidité et perd ses propriétés.",
      categoryId: "68f3503ebe04ebdaad786ad2", // Liquide de frein
      notes: "Types : DOT3, DOT4, DOT5.1. Ne pas mélanger. DOT5 (silicone) incompatible."
    },
    maintenances: [
      {
        name: "Contrôle du niveau de liquide de frein",
        type: "inspection",
        priority: "critical",
        difficulty: "easy",
        recurrence: { time: { value: 1, unit: "months" } },
        description: "Vérification mensuelle du niveau de liquide de frein.",
        instructions: "1. Localiser le réservoir (compartiment moteur)\n2. Vérifier le niveau entre MIN et MAX\n3. ⚠️ Une baisse importante peut indiquer une fuite ou plaquettes usées\n4. Ne compléter que si nécessaire avec le DOT spécifié\n5. Vérifier l'absence de fuites sur les flexibles et étriers",
        estimatedDuration: 5,
        estimatedCost: 0,
        tags: ["freinage", "liquide", "sécurité", "contrôle mensuel"]
      },
      {
        name: "Remplacement du liquide de frein",
        type: "replacement",
        priority: "critical",
        difficulty: "intermediate",
        recurrence: { time: { value: 2, unit: "years" } },
        description: "Purge et remplacement complet du liquide de frein.",
        instructions: "⚠️ Le liquide de frein est corrosif, porter des gants\n\n1. Aspirer l'ancien liquide du réservoir\n2. Remplir avec du liquide neuf du bon type\n3. Purger les freins dans l'ordre :\n   - Roue arrière droite\n   - Roue arrière gauche\n   - Roue avant droite\n   - Roue avant gauche\n4. Pour chaque roue :\n   - Connecter un tuyau à la vis de purge\n   - Demander à quelqu'un de pomper la pédale\n   - Ouvrir la vis, laisser couler, refermer\n   - Répéter jusqu'à liquide clair sans bulles\n   - Maintenir le niveau du réservoir\n5. Vérifier la dureté de la pédale\n6. Tester les freins à basse vitesse",
        estimatedDuration: 60,
        estimatedCost: 25,
        tags: ["freinage", "liquide", "purge", "sécurité"]
      }
    ]
  },

  // PNEUMATIQUES
  {
    equipment: {
      name: "Pneus avant",
      description: "Pneumatiques montés sur les roues avant du véhicule. Seul point de contact avec la route, essentiels pour la sécurité.",
      categoryId: "68f3503fbe04ebdaad786ae6", // Pneus avant
      notes: "Respecter les dimensions et indices de charge/vitesse préconisés."
    },
    maintenances: [
      {
        name: "Contrôle de la pression des pneus",
        type: "inspection",
        priority: "critical",
        difficulty: "easy",
        recurrence: { time: { value: 1, unit: "months" } },
        conditions: ["Avant long trajet", "Changement de température"],
        description: "Vérification mensuelle de la pression des pneumatiques.",
        instructions: "⚠️ Pneus froids uniquement\n\n1. Consulter la pression recommandée (étiquette portière, manuel)\n2. Utiliser un manomètre fiable\n3. Contrôler les 4 pneus + roue de secours\n4. Ajuster la pression si nécessaire\n5. Vérifier les bouchons de valve\n6. Inspecter visuellement :\n   - Usure de la bande de roulement\n   - Témoins d'usure (TWI)\n   - Coupures, hernies\n   - Corps étrangers",
        estimatedDuration: 10,
        estimatedCost: 0,
        tags: ["pneus", "pression", "sécurité", "mensuel"]
      },
      {
        name: "Contrôle de l'usure et de l'état des pneus",
        type: "inspection",
        priority: "critical",
        difficulty: "easy",
        recurrence: { time: { value: 3, unit: "months" }, kilometers: 5000 },
        description: "Inspection approfondie de l'état des pneumatiques.",
        instructions: "1. Mesurer la profondeur des sculptures\n   - Minimum légal : 1,6 mm\n   - Recommandé de remplacer à 3 mm\n2. Vérifier l'usure régulière\n   - Usure au centre : surpression\n   - Usure sur bords : sous-pression\n   - Usure irrégulière : géométrie\n3. Inspecter les flancs :\n   - Fissures\n   - Hernies\n   - Déformations\n4. Vérifier l'âge (DOT sur flanc)\n   - Remplacer après 6-8 ans même si peu usés\n5. Rechercher les corps étrangers",
        estimatedDuration: 20,
        estimatedCost: 0,
        tags: ["pneus", "usure", "sécurité"]
      },
      {
        name: "Permutation des pneus",
        type: "service",
        priority: "recommended",
        difficulty: "intermediate",
        recurrence: { kilometers: 10000 },
        description: "Rotation des pneus pour homogénéiser l'usure.",
        instructions: "Schéma de permutation (véhicule à traction) :\n- Avant gauche → Arrière droit\n- Avant droit → Arrière gauche\n- Arrière gauche → Avant gauche\n- Arrière droit → Avant droit\n\n1. Soulever le véhicule\n2. Marquer la position de chaque roue\n3. Démonter les 4 roues\n4. Remonter selon le schéma\n5. Serrer au couple (voir manuel)\n6. Ajuster les pressions\n7. Resserrer après 100 km",
        estimatedDuration: 45,
        estimatedCost: 0,
        tags: ["pneus", "permutation", "usure"]
      },
      {
        name: "Remplacement des pneus avant",
        type: "replacement",
        priority: "critical",
        difficulty: "professional",
        recurrence: { kilometers: 40000 },
        conditions: ["Profondeur < 3mm", "Âge > 6 ans", "Dommages", "Usure irrégulière"],
        description: "Remplacement des pneumatiques avant.",
        instructions: "⚠️ Intervention professionnelle recommandée\n\n1. Démonter les roues\n2. Déjanter les pneus usagés\n3. Contrôler l'état des jantes\n4. Remplacer les valves\n5. Monter les pneus neufs (sens de rotation)\n6. Équilibrer les roues\n7. Gonfler à la pression recommandée\n8. Remonter sur le véhicule\n9. Serrer au couple\n10. Vérifier après 100 km\n\n⚠️ Toujours remplacer par paire (les 2 avant)",
        estimatedDuration: 60,
        estimatedCost: 300,
        tags: ["pneus", "remplacement", "sécurité"]
      }
    ]
  },
  {
    equipment: {
      name: "Pneus arrière",
      description: "Pneumatiques montés sur les roues arrière du véhicule.",
      categoryId: "68f3503fbe04ebdaad786ae8", // Pneus arrière
      notes: "Sur véhicules utilitaires lourds, privilégier des pneus renforcés."
    },
    maintenances: [
      {
        name: "Remplacement des pneus arrière",
        type: "replacement",
        priority: "critical",
        difficulty: "professional",
        recurrence: { kilometers: 50000 },
        conditions: ["Profondeur < 3mm", "Âge > 6 ans", "Dommages"],
        description: "Remplacement des pneumatiques arrière.",
        instructions: "Procédure identique aux pneus avant.\n\n⚠️ Sur véhicules utilitaires : attention aux indices de charge",
        estimatedDuration: 60,
        estimatedCost: 300,
        tags: ["pneus", "arrière", "remplacement"]
      }
    ]
  },
  {
    equipment: {
      name: "Équilibrage des roues",
      description: "Service permettant de répartir uniformément les masses des roues pour éviter les vibrations.",
      categoryId: "68f3503fbe04ebdaad786aec", // Équilibrage & permutation
      notes: "Nécessaire après chaque montage de pneu neuf."
    },
    maintenances: [
      {
        name: "Équilibrage des roues",
        type: "calibration",
        priority: "important",
        difficulty: "professional",
        recurrence: { time: { value: 1, unit: "years" }, kilometers: 20000 },
        conditions: ["Après montage de pneus neufs", "En cas de vibrations", "Après choc"],
        description: "Équilibrage des 4 roues sur machine.",
        instructions: "⚠️ INTERVENTION PROFESSIONNELLE OBLIGATOIRE\n\nNécessite une équilibreuse électronique.\n\nLe professionnel :\n1. Monte chaque roue sur l'équilibreuse\n2. Lance le cycle de mesure\n3. Pose des masses d'équilibrage\n4. Vérifie l'équilibrage\n\nIndications d'un déséquilibre :\n- Vibrations dans le volant (60-100 km/h)\n- Usure irrégulière des pneus\n- Usure prématurée des suspensions",
        estimatedDuration: 30,
        estimatedCost: 40,
        tags: ["pneus", "équilibrage", "vibrations", "professionnel"]
      }
    ]
  },

  // SUSPENSION & DIRECTION
  {
    equipment: {
      name: "Amortisseurs avant",
      description: "Organes de suspension absorbant les chocs et maintenant le contact des roues avec la route.",
      categoryId: "68f3503fbe04ebdaad786ada", // Amortisseurs
      notes: "Toujours remplacer par paire (gauche + droite)."
    },
    maintenances: [
      {
        name: "Contrôle des amortisseurs avant",
        type: "inspection",
        priority: "important",
        difficulty: "easy",
        recurrence: { time: { value: 1, unit: "years" }, kilometers: 20000 },
        description: "Vérification de l'état et du fonctionnement des amortisseurs.",
        instructions: "Tests visuels :\n1. Inspecter les amortisseurs :\n   - Fuites d'huile\n   - Déformation de la tige\n   - Corrosion\n\nTests fonctionnels :\n2. Test de rebond :\n   - Appuyer fortement sur l'aile\n   - Relâcher\n   - Le véhicule doit se stabiliser en 1-2 oscillations\n   - Plus de 2 oscillations = amortisseur fatigué\n\n3. Sur route :\n   - Tenue de route dégradée\n   - Plongée excessive au freinage\n   - Rebonds après dos d'âne\n   - Déport en virage",
        estimatedDuration: 30,
        estimatedCost: 0,
        tags: ["suspension", "amortisseurs", "avant", "sécurité"]
      },
      {
        name: "Remplacement des amortisseurs avant",
        type: "replacement",
        priority: "important",
        difficulty: "advanced",
        recurrence: { kilometers: 80000 },
        conditions: ["Fuites", "Usure excessive", "Tenue de route dégradée"],
        description: "Remplacement des amortisseurs avant.",
        instructions: "⚠️ INTERVENTION DÉLICATE - Professionnel recommandé\n⚠️ Risque avec ressorts sous pression\n\n1. Soulever et caler le véhicule\n2. Retirer la roue\n3. Déposer l'amortisseur (fixations haute et basse)\n4. Si nécessaire : comprimer le ressort avec compresseur\n5. Démonter l'ensemble coupelle/ressort\n6. Installer le nouvel amortisseur\n7. Remonter l'ensemble\n8. Vérifier les silentblocs\n9. Contrôler la géométrie\n\n⚠️ Remplacer par paire\n⚠️ Prévoir contrôle géométrie après remplacement",
        estimatedDuration: 180,
        estimatedCost: 400,
        tags: ["suspension", "amortisseurs", "avant"]
      }
    ]
  },
  {
    equipment: {
      name: "Géométrie et parallélisme",
      description: "Réglage de l'angle des roues pour optimiser tenue de route, usure des pneus et stabilité.",
      categoryId: "68f3503fbe04ebdaad786ae2", // Géométrie & parallélisme
      notes: "Contrôle obligatoire après intervention sur suspension ou direction."
    },
    maintenances: [
      {
        name: "Contrôle et réglage de la géométrie",
        type: "calibration",
        priority: "important",
        difficulty: "professional",
        recurrence: { time: { value: 1, unit: "years" }, kilometers: 20000 },
        conditions: ["Après changement pneus", "Après choc", "Usure irrégulière pneus", "Véhicule tire d'un côté"],
        description: "Contrôle et réglage des angles de géométrie (parallélisme, carrossage, chasse).",
        instructions: "⚠️ INTERVENTION PROFESSIONNELLE OBLIGATOIRE\n\nNécessite un banc de géométrie 3D.\n\nLe professionnel mesure et règle :\n1. Parallélisme (pincement/ouverture)\n2. Carrossage (inclinaison roues)\n3. Chasse (angle colonne direction)\n4. Angle de poussée arrière\n\nSignes d'une géométrie défaillante :\n- Volant pas droit en ligne droite\n- Véhicule tire d'un côté\n- Usure irrégulière des pneus\n- Mauvaise tenue de route",
        estimatedDuration: 45,
        estimatedCost: 80,
        tags: ["direction", "géométrie", "parallélisme", "professionnel"]
      }
    ]
  },

  // BATTERIE
  {
    equipment: {
      name: "Batterie moteur principale",
      description: "Batterie de démarrage du moteur et alimentation des équipements de base du véhicule.",
      categoryId: "68f3503fbe04ebdaad786af2", // Batterie principale
      notes: "Durée de vie moyenne : 4-5 ans. Surveiller en hiver."
    },
    maintenances: [
      {
        name: "Contrôle de la batterie moteur",
        type: "inspection",
        priority: "important",
        difficulty: "easy",
        recurrence: { time: { value: 3, unit: "months" } },
        conditions: ["Avant l'hiver", "Avant long trajet"],
        description: "Vérification de l'état et de la charge de la batterie moteur.",
        instructions: "1. Inspection visuelle :\n   - Propreté des bornes\n   - Oxydation\n   - Fissures du boîtier\n   - Niveau d'électrolyte (si batterie ouverte)\n\n2. Test de tension :\n   - Moteur éteint : 12,4-12,7V = OK\n   - < 12,4V = déchargée\n   - < 12V = à remplacer\n   - Moteur tournant : 13,8-14,4V = alternateur OK\n\n3. Test de démarrage :\n   - Écouter le démarreur\n   - Démarrage difficile = batterie faible\n\n4. Nettoyage :\n   - Nettoyer les bornes si oxydées\n   - Graisser avec graisse diélectrique",
        estimatedDuration: 20,
        estimatedCost: 0,
        tags: ["batterie", "électricité", "démarrage"]
      },
      {
        name: "Remplacement de la batterie moteur",
        type: "replacement",
        priority: "critical",
        difficulty: "easy",
        recurrence: { time: { value: 5, unit: "years" } },
        conditions: ["Démarrage difficile", "Tension < 12V", "Âge > 5 ans"],
        description: "Remplacement de la batterie de démarrage.",
        instructions: "⚠️ Vérifier compatibilité : capacité (Ah), intensité démarrage (A), dimensions\n\n1. Noter les réglages radio, horloge\n2. Couper le contact\n3. Débrancher la borne NÉGATIVE (-) en premier\n4. Débrancher la borne POSITIVE (+)\n5. Retirer la fixation\n6. Extraire l'ancienne batterie\n7. Nettoyer le support\n8. Installer la nouvelle batterie\n9. Rebrancher POSITIVE (+) en premier\n10. Rebrancher NÉGATIVE (-)\n11. Serrer fermement\n12. Réinitialiser radio, horloge, vitres électriques\n\n♻️ Recycler l'ancienne batterie obligatoirement",
        estimatedDuration: 30,
        estimatedCost: 120,
        tags: ["batterie", "remplacement", "électricité"]
      }
    ]
  },

  // RÉVISION GÉNÉRALE
  {
    equipment: {
      name: "Révision complète du véhicule",
      description: "Entretien périodique complet incluant vidange, contrôles et vérifications selon préconisations constructeur.",
      categoryId: "68f35046be04ebdaad786bdc", // Révision complète
      notes: "Permet de conserver la garantie et d'anticiper les pannes."
    },
    maintenances: [
      {
        name: "Révision annuelle / 15 000 km",
        type: "service",
        priority: "critical",
        difficulty: "professional",
        recurrence: { time: { value: 1, unit: "years" }, kilometers: 15000 },
        description: "Révision périodique complète du véhicule selon plan d'entretien constructeur.",
        instructions: "⚠️ INTERVENTION PROFESSIONNELLE RECOMMANDÉE\n\nPoints de contrôle et entretien :\n\n🔧 MOTEUR\n- Vidange huile moteur\n- Remplacement filtre à huile\n- Contrôle filtre à air\n- Contrôle filtre à carburant\n- Contrôle courroie accessoires\n- Contrôle niveau liquides (refroidissement, lave-glace)\n\n🔧 FREINAGE\n- Contrôle plaquettes et disques\n- Contrôle niveau et état liquide de frein\n- Contrôle flexibles de frein\n- Test frein à main\n\n🔧 PNEUMATIQUES\n- Contrôle pression\n- Contrôle usure\n- Contrôle état général\n\n🔧 SUSPENSION/DIRECTION\n- Contrôle amortisseurs\n- Contrôle rotules et silentblocs\n- Contrôle direction assistée\n\n🔧 ÉCLAIRAGE\n- Contrôle tous feux\n- Réglage optiques si nécessaire\n\n🔧 ÉLECTRICITÉ\n- Test batterie\n- Contrôle alternateur\n\n🔧 SÉCURITÉ\n- Contrôle essuie-glaces\n- Contrôle klaxon\n- Contrôle ceintures\n\n📋 Remise d'un rapport de contrôle",
        estimatedDuration: 120,
        estimatedCost: 250,
        tags: ["révision", "entretien", "vidange", "contrôle général"]
      }
    ]
  },

  // CONTRÔLE TECHNIQUE
  {
    equipment: {
      name: "Contrôle technique périodique",
      description: "Contrôle réglementaire obligatoire vérifiant la conformité et la sécurité du véhicule.",
      categoryId: "68f35046be04ebdaad786be0", // Contrôle technique
      notes: "Obligatoire tous les 2 ans (4 ans pour véhicule neuf). Contre-visite sous 2 mois si défaillances."
    },
    maintenances: [
      {
        name: "Contrôle technique",
        type: "test",
        priority: "critical",
        difficulty: "professional",
        recurrence: { time: { value: 2, unit: "years" } },
        conditions: ["Obligatoire légalement", "4 ans pour véhicule neuf puis tous les 2 ans"],
        description: "Contrôle technique réglementaire du véhicule.",
        instructions: "⚠️ OBLIGATION LÉGALE\n\nPréparer le véhicule :\n1. Nettoyer le véhicule\n2. Vérifier tous les feux\n3. Contrôler les niveaux\n4. Tester klaxon et essuie-glaces\n5. Vérifier pression pneus\n6. Rassembler les documents :\n   - Carte grise\n   - Précédent CT si < 6 mois\n\nPoints contrôlés (133 points) :\n- Freinage\n- Direction\n- Visibilité\n- Éclairage\n- Liaison au sol\n- Structure et carrosserie\n- Équipements\n- Organes mécaniques\n- Pollution\n- Installation GPL/GNV si équipé\n\nRésultats possibles :\n✅ Favorable : OK\n⚠️ Défaillances mineures : OK mais points à surveiller\n❌ Défaillances majeures : Contre-visite sous 2 mois\n\n💡 Conseil : Faire réviser le véhicule avant le CT",
        estimatedDuration: 45,
        estimatedCost: 80,
        tags: ["contrôle technique", "réglementaire", "obligatoire", "sécurité"]
      }
    ]
  },

  // VIDANGE
  {
    equipment: {
      name: "Huile moteur",
      description: "Huile lubrifiante assurant le bon fonctionnement du moteur, sa protection et son refroidissement.",
      categoryId: "68f3503dbe04ebdaad786ab8", // Moteur
      notes: "Respecter la viscosité préconisée (ex: 5W30, 5W40). Essence et diesel ont des huiles différentes."
    },
    maintenances: [
      {
        name: "Contrôle du niveau d'huile moteur",
        type: "inspection",
        priority: "critical",
        difficulty: "easy",
        recurrence: { time: { value: 1, unit: "months" } },
        conditions: ["Avant long trajet", "Tous les 1000 km"],
        description: "Vérification du niveau d'huile moteur.",
        instructions: "⚠️ Moteur froid ou après 5 min d'arrêt\n⚠️ Véhicule sur terrain plat\n\n1. Localiser la jauge d'huile\n2. Retirer et essuyer la jauge\n3. Réinsérer complètement\n4. Retirer et lire le niveau\n5. Le niveau doit être entre MIN et MAX\n6. Si nécessaire, ajouter de l'huile (même type)\n7. Attendre et revérifier\n8. Ne jamais dépasser MAX\n\n⚠️ Consommation excessive = problème moteur",
        estimatedDuration: 5,
        estimatedCost: 0,
        tags: ["huile", "moteur", "niveau", "mensuel"]
      },
      {
        name: "Vidange huile moteur",
        type: "drain",
        priority: "critical",
        difficulty: "intermediate",
        recurrence: { time: { value: 1, unit: "years" }, kilometers: 15000 },
        conditions: ["Usage urbain intensif : tous les 10 000 km", "Huile minérale : 7500 km", "Huile synthèse : 15 000-20 000 km"],
        description: "Vidange complète de l'huile moteur et remplacement du filtre.",
        instructions: "⚠️ Moteur chaud (huile plus fluide)\n\nMatériel nécessaire :\n- Bac de récupération\n- Clé pour bouchon de vidange\n- Clé pour filtre à huile\n- Huile neuve (quantité selon manuel)\n- Filtre à huile neuf\n- Joint de bouchon neuf\n- Entonnoir\n\nProcédure :\n1. Soulever le véhicule\n2. Placer le bac sous le carter\n3. Dévisser le bouchon de vidange (attention chaud)\n4. Laisser couler complètement (10-15 min)\n5. Remplacer le joint du bouchon\n6. Revisser le bouchon au couple\n7. Remplacer le filtre à huile\n8. Remplir avec huile neuve (quantité selon manuel)\n9. Démarrer 1 min et couper\n10. Attendre 5 min et vérifier le niveau\n11. Compléter si nécessaire\n12. Vérifier l'absence de fuites\n13. Noter dans carnet d'entretien\n\n♻️ Apporter l'huile usagée en déchetterie",
        estimatedDuration: 45,
        estimatedCost: 60,
        tags: ["vidange", "huile", "moteur", "filtre", "entretien"]
      }
    ]
  }
];

async function seedGenericEquipment() {
  try {
    console.log("🌱 Starting generic equipment and maintenance seeding...\n");

    let equipmentCount = 0;
    let maintenanceCount = 0;

    for (const data of genericEquipmentData) {
      // Create equipment
      const equipment = new Equipment({
        ...data.equipment,
        categoryId: new mongoose.Types.ObjectId(data.equipment.categoryId),
        vehicleBrands: [],
        equipmentBrands: [],
        photos: [],
        manuals: [],
        isUserContributed: false,
        status: "approved"
      });

      await equipment.save();
      equipmentCount++;
      console.log(`✅ Equipment created: ${equipment.name}`);

      // Create maintenances for this equipment
      for (const maintenanceData of data.maintenances) {
        const maintenance = new Maintenance({
          ...maintenanceData,
          equipmentId: equipment._id,
          isOfficial: true,
          isUserContributed: false,
          status: "approved"
        });

        await maintenance.save();
        maintenanceCount++;
        console.log(`   ✅ Maintenance created: ${maintenance.name}`);
      }

      console.log("");
    }

    console.log("✅ Seeding completed successfully!");
    console.log(`📊 Summary:`);
    console.log(`   - Equipment created: ${equipmentCount}`);
    console.log(`   - Maintenances created: ${maintenanceCount}`);
  } catch (error) {
    console.error("❌ Error seeding data:", error);
    throw error;
  }
}

// Run the script
(async () => {
  try {
    await connectDB();
    await seedGenericEquipment();
    console.log("\n🎉 All done!");
  } catch (error) {
    console.error("❌ Script failed:", error);
  } finally {
    await mongoose.connection.close();
    console.log("\n👋 Disconnected from MongoDB");
    process.exit(0);
  }
})();

