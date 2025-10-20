import mongoose from 'mongoose';
import { config } from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables from .env
const envPath = join(__dirname, '../.env');
config({ path: envPath });

// Connect to MongoDB
await mongoose.connect(process.env.MONGODB_URI);
console.log('✅ Connected to MongoDB');

// Define schemas
const EquipmentSchema = new mongoose.Schema({
  name: String,
  description: String,
  categoryId: mongoose.Schema.Types.ObjectId,
  vehicleBrands: [mongoose.Schema.Types.ObjectId],
  equipmentBrands: [mongoose.Schema.Types.ObjectId],
  photos: [String],
  manuals: [{
    title: String,
    url: String,
    isExternal: Boolean,
  }],
  notes: String,
  isUserContributed: Boolean,
  contributedBy: mongoose.Schema.Types.ObjectId,
  status: String,
  approvedBy: mongoose.Schema.Types.ObjectId,
  approvedAt: Date,
  rejectionReason: String,
}, { timestamps: true });

const MaintenanceSchema = new mongoose.Schema({
  equipmentId: mongoose.Schema.Types.ObjectId,
  name: String,
  type: String,
  priority: String,
  difficulty: String,
  recurrence: {
    time: {
      value: Number,
      unit: String,
    },
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
  isOfficial: Boolean,
  source: String,
  isUserContributed: Boolean,
  contributedBy: mongoose.Schema.Types.ObjectId,
  status: String,
}, { timestamps: true });

const Equipment = mongoose.models.Equipment || mongoose.model('Equipment', EquipmentSchema);
const Maintenance = mongoose.models.Maintenance || mongoose.model('Maintenance', MaintenanceSchema);

try {
  // Category ID pour "Eau et sanitaires"
  const categoryId = new mongoose.Types.ObjectId('68f35041be04ebdaad786b36');

  // ============================================
  // 1. CUVE À EAU GRISE INTÉRIEUR
  // ============================================
  
  const cuveGriseInterieur = await Equipment.create({
    name: 'Cuve à eau grise intérieur',
    description: 'Réservoir d\'eaux usées installé à l\'intérieur du véhicule, collectant les eaux de la cuisine, du lavabo et de la douche. Généralement entre 40 et 100 litres. Position intérieure protégée du gel.',
    categoryId: categoryId,
    vehicleBrands: [],
    equipmentBrands: [],
    photos: [],
    manuals: [],
    notes: 'Située à l\'intérieur, donc protégée du gel mais nécessite une vidange régulière pour éviter les odeurs.',
    isUserContributed: false,
    status: 'approved',
  });

  console.log(`\n✅ Équipement 1 créé: ${cuveGriseInterieur.name} (ID: ${cuveGriseInterieur._id})`);

  const maintenancesCuveInterieur = [
    {
      equipmentId: cuveGriseInterieur._id,
      name: 'Vidange de la cuve à eau grise',
      type: 'drain',
      priority: 'critical',
      difficulty: 'easy',
      recurrence: {
        time: {
          value: 3,
          unit: 'days',
        },
      },
      conditions: [
        'Lorsque la cuve est pleine',
        'Avant de prendre la route',
        'Tous les 2-3 jours en usage intensif',
      ],
      description: 'Vidange régulière de la cuve à eau grise pour éviter les odeurs, le débordement et la prolifération bactérienne.',
      instructions: '1. Repérer l\'emplacement de la borne de vidange\n2. Ouvrir la vanne de vidange de la cuve grise\n3. Laisser écouler complètement\n4. Refermer la vanne\n5. Vérifier l\'absence de fuite\n\n⚠️ Vidanger uniquement aux emplacements autorisés\n⚠️ Ne jamais vidanger dans la nature',
      photos: [],
      videos: [],
      parts: [],
      estimatedDuration: 10,
      estimatedCost: 0,
      tags: ['Vidange', 'Obligatoire', 'Hygiène', 'Environnement'],
      isOfficial: true,
      source: 'Bonnes pratiques camping-car',
      isUserContributed: false,
      status: 'approved',
    },
    {
      equipmentId: cuveGriseInterieur._id,
      name: 'Nettoyage et désinfection de la cuve grise',
      type: 'cleaning',
      priority: 'important',
      difficulty: 'easy',
      recurrence: {
        time: {
          value: 3,
          unit: 'months',
        },
      },
      conditions: [
        'Si odeurs persistantes',
        'Avant hivernage',
        'Après période d\'inutilisation',
      ],
      description: 'Nettoyage en profondeur de la cuve à eau grise pour éliminer les dépôts, graisses et mauvaises odeurs.',
      instructions: '1. Vidanger complètement la cuve\n2. Remplir avec de l\'eau chaude\n3. Ajouter un produit nettoyant spécifique eaux grises\n   - Option 1 : Produit du commerce (Aqua Kem, Thetford, etc.)\n   - Option 2 : 250ml vinaigre blanc + 2 cuillères à soupe bicarbonate\n4. Laisser agir 2-3 heures\n5. Utiliser normalement (douche, vaisselle) pour faire circuler\n6. Vidanger complètement\n7. Rincer avec 10-20 litres d\'eau claire\n8. Vidanger à nouveau\n\n💡 Utiliser régulièrement du bicarbonate dans l\'évier prévient les odeurs',
      photos: [],
      videos: [],
      parts: [
        {
          name: 'Produit nettoyant eaux grises',
          reference: 'Variable',
          quantity: 1,
          estimatedCost: 10,
        },
      ],
      estimatedDuration: 30,
      estimatedCost: 10,
      tags: ['Nettoyage', 'Odeurs', 'Désinfection', 'Hygiène'],
      isOfficial: true,
      source: 'Bonnes pratiques camping-car',
      isUserContributed: false,
      status: 'approved',
    },
    {
      equipmentId: cuveGriseInterieur._id,
      name: 'Vérification du capteur de niveau',
      type: 'inspection',
      priority: 'recommended',
      difficulty: 'easy',
      recurrence: {
        time: {
          value: 6,
          unit: 'months',
        },
      },
      conditions: [
        'Si affichage erroné',
        'Après nettoyage de la cuve',
      ],
      description: 'Contrôle du bon fonctionnement du capteur de niveau de la cuve à eau grise.',
      instructions: '1. Vidanger complètement la cuve\n2. Vérifier l\'affichage : doit indiquer VIDE\n3. Remplir progressivement\n4. Vérifier que l\'affichage évolue correctement\n5. Si dysfonctionnement :\n   - Les capteurs d\'eaux grises s\'encrassent facilement\n   - Nettoyer avec un produit spécifique capteurs\n   - Laisser agir selon instructions\n   - Rincer abondamment\n6. Remplacer si le nettoyage n\'améliore pas\n\n💡 Un nettoyage régulier de la cuve prévient l\'encrassement des capteurs',
      photos: [],
      videos: [],
      parts: [],
      estimatedDuration: 20,
      estimatedCost: 0,
      tags: ['Capteur', 'Diagnostic', 'Électronique'],
      isOfficial: true,
      source: 'Bonnes pratiques camping-car',
      isUserContributed: false,
      status: 'approved',
    },
    {
      equipmentId: cuveGriseInterieur._id,
      name: 'Inspection de la vanne et des joints',
      type: 'inspection',
      priority: 'important',
      difficulty: 'easy',
      recurrence: {
        time: {
          value: 6,
          unit: 'months',
        },
      },
      conditions: [
        'Si fuite détectée',
        'Si vanne difficile à manœuvrer',
      ],
      description: 'Contrôle de l\'état de la vanne de vidange et des joints pour prévenir les fuites.',
      instructions: '1. Vérifier le fonctionnement de la vanne :\n   - Ouverture/fermeture fluide\n   - Absence de blocage\n   - Fermeture étanche\n2. Inspecter visuellement :\n   - État du joint de vanne\n   - Fissures sur le mécanisme\n   - Traces d\'humidité sous le véhicule\n3. Lubrifier le mécanisme si nécessaire (graisse silicone)\n4. Vérifier les colliers de serrage des durites\n5. Resserrer si nécessaire\n6. Remplacer le joint si dégradé\n\n⚠️ Une vanne qui fuit = risque de vidange intempestive en roulant',
      photos: [],
      videos: [],
      parts: [
        {
          name: 'Joint de vanne',
          reference: 'Variable selon modèle',
          quantity: 1,
          estimatedCost: 5,
        },
      ],
      estimatedDuration: 20,
      estimatedCost: 5,
      tags: ['Vanne', 'Joint', 'Fuite', 'Prévention'],
      isOfficial: true,
      source: 'Bonnes pratiques camping-car',
      isUserContributed: false,
      status: 'approved',
    },
    {
      equipmentId: cuveGriseInterieur._id,
      name: 'Traitement anti-odeurs préventif',
      type: 'service',
      priority: 'recommended',
      difficulty: 'easy',
      recurrence: {
        time: {
          value: 2,
          unit: 'months',
        },
      },
      conditions: [
        'Utilisation fréquente',
        'Températures élevées',
      ],
      description: 'Application préventive d\'un traitement pour limiter les mauvaises odeurs des eaux grises.',
      instructions: '1. Verser un produit anti-odeurs spécifique eaux grises\n2. Options efficaces :\n   - Produits enzymatiques du commerce\n   - 2 cuillères à soupe de bicarbonate de soude\n   - Vinaigre blanc (250ml)\n3. Faire couler de l\'eau pour répartir\n4. Utiliser normalement\n\n💡 Conseils pour réduire les odeurs :\n- Utiliser un bac à graisse sur l\'évier\n- Éviter de verser des huiles/graisses\n- Vidanger fréquemment\n- Utiliser des produits vaisselle biodégradables',
      photos: [],
      videos: [],
      parts: [],
      estimatedDuration: 5,
      estimatedCost: 5,
      tags: ['Odeurs', 'Prévention', 'Confort', 'Hygiène'],
      isOfficial: true,
      source: 'Bonnes pratiques camping-car',
      isUserContributed: false,
      status: 'approved',
    },
  ];

  const insertedMaintenancesInterieur = await Maintenance.insertMany(maintenancesCuveInterieur);
  console.log(`✅ ${insertedMaintenancesInterieur.length} maintenances créées pour cuve intérieur`);

  // ============================================
  // 2. CUVE À EAU GRISE SOUS CHÂSSIS
  // ============================================
  
  const cuveGriseChassis = await Equipment.create({
    name: 'Cuve à eau grise sous châssis',
    description: 'Réservoir d\'eaux usées monté sous le châssis du véhicule, exposé aux intempéries. Capacité généralement plus importante (80-150 litres). Nécessite une protection contre le gel en hiver.',
    categoryId: categoryId,
    vehicleBrands: [],
    equipmentBrands: [],
    photos: [],
    manuals: [],
    notes: 'Exposition aux projections, route, gel. Nécessite un entretien spécifique et une protection hivernale renforcée.',
    isUserContributed: false,
    status: 'approved',
  });

  console.log(`\n✅ Équipement 2 créé: ${cuveGriseChassis.name} (ID: ${cuveGriseChassis._id})`);

  const maintenancesCuveChassis = [
    {
      equipmentId: cuveGriseChassis._id,
      name: 'Vidange de la cuve à eau grise',
      type: 'drain',
      priority: 'critical',
      difficulty: 'easy',
      recurrence: {
        time: {
          value: 3,
          unit: 'days',
        },
      },
      conditions: [
        'Lorsque la cuve est pleine',
        'Avant de prendre la route',
        'Tous les 2-3 jours en usage intensif',
      ],
      description: 'Vidange régulière de la cuve à eau grise pour éviter les odeurs, le débordement et la prolifération bactérienne.',
      instructions: '1. Repérer l\'emplacement de la borne de vidange\n2. Ouvrir la vanne de vidange de la cuve grise\n3. Laisser écouler complètement\n4. Refermer la vanne\n5. Vérifier l\'absence de fuite\n\n⚠️ Vidanger uniquement aux emplacements autorisés\n⚠️ Ne jamais vidanger dans la nature\n⚠️ En hiver : vidanger avant le gel (eau résiduelle peut geler)',
      photos: [],
      videos: [],
      parts: [],
      estimatedDuration: 10,
      estimatedCost: 0,
      tags: ['Vidange', 'Obligatoire', 'Hygiène', 'Environnement'],
      isOfficial: true,
      source: 'Bonnes pratiques camping-car',
      isUserContributed: false,
      status: 'approved',
    },
    {
      equipmentId: cuveGriseChassis._id,
      name: 'Nettoyage et désinfection de la cuve grise',
      type: 'cleaning',
      priority: 'important',
      difficulty: 'easy',
      recurrence: {
        time: {
          value: 3,
          unit: 'months',
        },
      },
      conditions: [
        'Si odeurs persistantes',
        'Avant hivernage',
        'Après période d\'inutilisation',
      ],
      description: 'Nettoyage en profondeur de la cuve à eau grise pour éliminer les dépôts, graisses et mauvaises odeurs.',
      instructions: '1. Vidanger complètement la cuve\n2. Remplir avec de l\'eau chaude\n3. Ajouter un produit nettoyant spécifique eaux grises\n4. Laisser agir 2-3 heures\n5. Utiliser normalement pour faire circuler\n6. Vidanger complètement\n7. Rincer avec 20-30 litres d\'eau claire\n8. Vidanger à nouveau\n\n💡 Les cuves sous châssis s\'encrassent plus (poussières, projections)',
      photos: [],
      videos: [],
      parts: [
        {
          name: 'Produit nettoyant eaux grises',
          reference: 'Variable',
          quantity: 1,
          estimatedCost: 10,
        },
      ],
      estimatedDuration: 30,
      estimatedCost: 10,
      tags: ['Nettoyage', 'Odeurs', 'Désinfection', 'Hygiène'],
      isOfficial: true,
      source: 'Bonnes pratiques camping-car',
      isUserContributed: false,
      status: 'approved',
    },
    {
      equipmentId: cuveGriseChassis._id,
      name: 'Inspection de la cuve et protection',
      type: 'inspection',
      priority: 'important',
      difficulty: 'intermediate',
      recurrence: {
        time: {
          value: 6,
          unit: 'months',
        },
      },
      conditions: [
        'Avant l\'hiver',
        'Après conduite sur pistes/chemins',
        'Si bruits suspects',
      ],
      description: 'Contrôle de l\'état de la cuve sous châssis, de ses fixations et de sa protection contre les chocs.',
      instructions: '1. Passer sous le véhicule pour inspection visuelle\n2. Vérifier la cuve :\n   - Fissures ou déformations\n   - Traces de chocs\n   - État général du plastique\n3. Contrôler les fixations :\n   - Sangles de maintien\n   - Colliers\n   - Vis et boulons\n   - Resserrer si nécessaire\n4. Vérifier la protection :\n   - Plaque de protection si équipée\n   - État des mousses isolantes\n5. Inspecter les durites et raccords\n6. Vérifier l\'étanchéité de la vanne\n7. Nettoyer les projections de boue\n\n⚠️ Une cuve mal fixée peut se décrocher en roulant\n⚠️ Attention aux chocs sur routes difficiles',
      photos: [],
      videos: [],
      parts: [],
      estimatedDuration: 30,
      estimatedCost: 0,
      tags: ['Inspection', 'Fixation', 'Sécurité', 'Protection'],
      isOfficial: true,
      source: 'Bonnes pratiques camping-car',
      isUserContributed: false,
      status: 'approved',
    },
    {
      equipmentId: cuveGriseChassis._id,
      name: 'Préparation hivernale et protection gel',
      type: 'service',
      priority: 'critical',
      difficulty: 'easy',
      recurrence: {
        time: {
          value: 1,
          unit: 'years',
        },
      },
      conditions: [
        'Avant températures négatives',
        'Si stationnement hivernal',
        'Dès risque de gel',
      ],
      description: 'Protection de la cuve sous châssis contre le gel pour éviter fissures et dégâts causés par l\'expansion de l\'eau gelée.',
      instructions: '⚠️ CRITIQUE pour cuves sous châssis (très exposées au gel)\n\n1. Vidanger complètement la cuve\n2. Ouvrir tous les robinets pour vidanger les canalisations\n3. Laisser la vanne de vidange ouverte\n4. Options de protection supplémentaires :\n   - Installer un kit de chauffage de cuve (si équipé)\n   - Ajouter une isolation thermique temporaire\n   - Utiliser un câble chauffant autorégulant\n5. Si utilisation hivernale :\n   - Vidanger quotidiennement\n   - Ne jamais laisser pleine par gel\n   - Surveiller la température\n6. Si stockage hivernal :\n   - Laisser vanne ouverte tout l\'hiver\n   - Vérifier l\'absence d\'eau résiduelle\n\n💡 L\'eau grise gèle plus difficilement que l\'eau propre (savons, sels) mais peut quand même endommager la cuve',
      photos: [],
      videos: [],
      parts: [],
      estimatedDuration: 20,
      estimatedCost: 0,
      tags: ['Hivernage', 'Gel', 'Protection', 'Critique', 'Hiver'],
      isOfficial: true,
      source: 'Bonnes pratiques camping-car',
      isUserContributed: false,
      status: 'approved',
    },
    {
      equipmentId: cuveGriseChassis._id,
      name: 'Inspection de la vanne et du mécanisme',
      type: 'inspection',
      priority: 'important',
      difficulty: 'easy',
      recurrence: {
        time: {
          value: 6,
          unit: 'months',
        },
      },
      conditions: [
        'Si fuite détectée',
        'Si vanne difficile à manœuvrer',
        'Après exposition au gel',
      ],
      description: 'Contrôle de l\'état de la vanne de vidange et de son mécanisme, particulièrement exposés sous le châssis.',
      instructions: '1. Accéder à la vanne sous le véhicule\n2. Vérifier le fonctionnement :\n   - Ouverture/fermeture fluide\n   - Absence de blocage ou grippage\n   - Fermeture étanche\n3. Inspecter visuellement :\n   - État du joint de vanne\n   - Corrosion du mécanisme\n   - Fissures\n   - Traces d\'humidité\n4. Nettoyer le mécanisme (projections, boue)\n5. Lubrifier avec graisse silicone\n6. Vérifier le câble ou la tirette de commande\n7. Tester plusieurs cycles ouverture/fermeture\n8. Remplacer si nécessaire\n\n⚠️ Les vannes sous châssis s\'encrassent et se grippent plus vite\n⚠️ Une vanne qui fuit = vidange en roulant',
      photos: [],
      videos: [],
      parts: [
        {
          name: 'Kit joint de vanne',
          reference: 'Variable selon modèle',
          quantity: 1,
          estimatedCost: 10,
        },
        {
          name: 'Graisse silicone',
          reference: 'N/A',
          quantity: 1,
          estimatedCost: 5,
        },
      ],
      estimatedDuration: 25,
      estimatedCost: 15,
      tags: ['Vanne', 'Mécanique', 'Fuite', 'Entretien'],
      isOfficial: true,
      source: 'Bonnes pratiques camping-car',
      isUserContributed: false,
      status: 'approved',
    },
    {
      equipmentId: cuveGriseChassis._id,
      name: 'Vérification du capteur de niveau',
      type: 'inspection',
      priority: 'recommended',
      difficulty: 'easy',
      recurrence: {
        time: {
          value: 6,
          unit: 'months',
        },
      },
      conditions: [
        'Si affichage erroné',
        'Après nettoyage de la cuve',
      ],
      description: 'Contrôle du bon fonctionnement du capteur de niveau de la cuve à eau grise.',
      instructions: '1. Vidanger complètement la cuve\n2. Vérifier l\'affichage : doit indiquer VIDE\n3. Remplir progressivement\n4. Vérifier que l\'affichage évolue correctement\n5. Si dysfonctionnement :\n   - Nettoyer avec produit spécifique\n   - Vérifier les connexions électriques (corrosion)\n   - Inspecter le câblage sous le châssis\n6. Protéger les connexions électriques\n7. Remplacer si défaillant\n\n💡 Les capteurs sous châssis sont plus exposés à la corrosion',
      photos: [],
      videos: [],
      parts: [],
      estimatedDuration: 25,
      estimatedCost: 0,
      tags: ['Capteur', 'Électronique', 'Diagnostic'],
      isOfficial: true,
      source: 'Bonnes pratiques camping-car',
      isUserContributed: false,
      status: 'approved',
    },
    {
      equipmentId: cuveGriseChassis._id,
      name: 'Traitement anti-odeurs préventif',
      type: 'service',
      priority: 'recommended',
      difficulty: 'easy',
      recurrence: {
        time: {
          value: 2,
          unit: 'months',
        },
      },
      conditions: [
        'Utilisation fréquente',
        'Températures élevées',
      ],
      description: 'Application préventive d\'un traitement pour limiter les mauvaises odeurs des eaux grises.',
      instructions: '1. Verser un produit anti-odeurs spécifique\n2. Options efficaces :\n   - Produits enzymatiques\n   - Bicarbonate de soude (3 cuillères à soupe)\n   - Vinaigre blanc (300ml)\n3. Faire couler de l\'eau pour répartir\n4. Utiliser normalement\n\n💡 Les cuves sous châssis chauffent plus au soleil = plus d\'odeurs',
      photos: [],
      videos: [],
      parts: [],
      estimatedDuration: 5,
      estimatedCost: 5,
      tags: ['Odeurs', 'Prévention', 'Confort', 'Hygiène'],
      isOfficial: true,
      source: 'Bonnes pratiques camping-car',
      isUserContributed: false,
      status: 'approved',
    },
  ];

  const insertedMaintenancesChassis = await Maintenance.insertMany(maintenancesCuveChassis);
  console.log(`✅ ${insertedMaintenancesChassis.length} maintenances créées pour cuve sous châssis`);

  // ============================================
  // RÉSUMÉ
  // ============================================
  
  console.log('\n\n📊 RÉSUMÉ DE L\'INSERTION');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  
  console.log('\n🔧 ÉQUIPEMENT 1: ' + cuveGriseInterieur.name);
  console.log(`   ID: ${cuveGriseInterieur._id}`);
  console.log('   Maintenances:');
  insertedMaintenancesInterieur.forEach((m, i) => {
    console.log(`   ${i + 1}. ${m.name} (${m.type} - ${m.priority})`);
  });
  
  console.log('\n🔧 ÉQUIPEMENT 2: ' + cuveGriseChassis.name);
  console.log(`   ID: ${cuveGriseChassis._id}`);
  console.log('   Maintenances:');
  insertedMaintenancesChassis.forEach((m, i) => {
    console.log(`   ${i + 1}. ${m.name} (${m.type} - ${m.priority})`);
  });
  
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`✅ Total: 2 équipements, ${insertedMaintenancesInterieur.length + insertedMaintenancesChassis.length} maintenances`);

} catch (error) {
  console.error('❌ Erreur lors de l\'insertion:', error);
} finally {
  await mongoose.disconnect();
  console.log('\n✅ Déconnecté de MongoDB');
}

