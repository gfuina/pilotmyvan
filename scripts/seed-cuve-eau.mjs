import mongoose from 'mongoose';
import { config } from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { readFileSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables from .env
const envPath = join(__dirname, '../.env');
config({ path: envPath });

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('⚠️  MONGODB_URI not found in .env');
  console.error('Trying to read .env manually...');
  try {
    const envContent = readFileSync(envPath, 'utf-8');
    const match = envContent.match(/MONGODB_URI=(.+)/);
    if (match) {
      process.env.MONGODB_URI = match[1].trim().replace(/["']/g, '');
      console.log('✅ MONGODB_URI loaded manually');
    } else {
      throw new Error('MONGODB_URI not found in .env file');
    }
  } catch (err) {
    throw new Error(`Cannot load MONGODB_URI: ${err.message}`);
  }
}

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
  // Category ID pour "Eau et sanitaires" - à vérifier dans votre base
  const categoryId = new mongoose.Types.ObjectId('68f35041be04ebdaad786b36');

  // 1. Créer l'équipement "Cuve à eau propre"
  const cuveEau = await Equipment.create({
    name: 'Cuve à eau propre',
    description: 'Réservoir d\'eau potable permettant de stocker l\'eau propre à bord du camping-car, fourgon ou van aménagé. Capacité variable selon les modèles (de 40 à 200 litres). Essentiel pour l\'autonomie en eau (cuisine, douche, lavabo).',
    categoryId: categoryId,
    vehicleBrands: [],
    equipmentBrands: [],
    photos: [],
    manuals: [],
    notes: 'Capacité et matériau varient selon les véhicules. Nécessite un entretien régulier pour garantir la qualité de l\'eau.',
    isUserContributed: false,
    status: 'approved',
  });

  console.log(`✅ Équipement créé: ${cuveEau.name} (ID: ${cuveEau._id})`);

  // 2. Créer les maintenances associées
  const maintenances = [
    {
      equipmentId: cuveEau._id,
      name: 'Désinfection complète de la cuve à eau',
      type: 'cleaning',
      priority: 'critical',
      difficulty: 'easy',
      recurrence: {
        time: {
          value: 6,
          unit: 'months',
        },
      },
      conditions: [
        'Avant la saison de voyage',
        'Après hivernage',
        'Si goût ou odeur désagréable',
      ],
      description: 'Désinfection de la cuve à eau propre pour éliminer bactéries, algues et biofilm. Indispensable pour garantir une eau saine.',
      instructions: '1. Vidanger complètement la cuve\n2. Préparer une solution désinfectante :\n   - Option 1 : 1 litre d\'eau de Javel pour 100 litres d\'eau\n   - Option 2 : Produit désinfectant spécifique camping-car (Puriclean, Aqua Kem, etc.)\n3. Remplir la cuve avec la solution désinfectante\n4. Ouvrir tous les robinets jusqu\'à ce que l\'eau javellisée sorte\n5. Laisser agir 12 heures minimum\n6. Vidanger complètement\n7. Rincer 2-3 fois à l\'eau claire\n8. Ouvrir les robinets pour rincer les canalisations\n9. Remplir avec de l\'eau propre et vérifier l\'absence d\'odeur de chlore',
      photos: [],
      videos: [],
      parts: [],
      estimatedDuration: 30,
      estimatedCost: 5,
      tags: ['Eau', 'Hygiène', 'Désinfection', 'Santé'],
      isOfficial: true,
      source: 'Bonnes pratiques camping-car',
      isUserContributed: false,
      status: 'approved',
    },
    {
      equipmentId: cuveEau._id,
      name: 'Vidange complète pour hivernage',
      type: 'drain',
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
        'Avant période d\'immobilisation prolongée',
        'Avant stockage hivernal',
      ],
      description: 'Vidange complète du circuit d\'eau pour éviter le gel et les dégâts causés par l\'expansion de l\'eau gelée.',
      instructions: '⚠️ OBLIGATOIRE si températures < 0°C\n\n1. Vidanger la cuve d\'eau propre via la vanne de vidange\n2. Ouvrir tous les robinets (chaud et froid)\n3. Vidanger le chauffe-eau\n4. Purger la pompe à eau\n5. Laisser tous les robinets ouverts\n6. Incliner le véhicule si possible pour évacuer l\'eau résiduelle\n7. Option : Injecter de l\'antigel spécial camping-car dans les canalisations\n8. Laisser les robinets ouverts pendant l\'hiver\n\n💡 L\'antigel spécial camping-car (non toxique) protège les résidus d\'eau',
      photos: [],
      videos: [],
      parts: [],
      estimatedDuration: 20,
      estimatedCost: 0,
      tags: ['Hivernage', 'Gel', 'Protection', 'Obligatoire'],
      isOfficial: true,
      source: 'Bonnes pratiques camping-car',
      isUserContributed: false,
      status: 'approved',
    },
    {
      equipmentId: cuveEau._id,
      name: 'Inspection de la cuve et recherche de fuites',
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
        'Avant la saison',
        'Si baisse de niveau anormale',
        'Après stockage prolongé',
      ],
      description: 'Contrôle visuel de l\'état de la cuve, des connexions et recherche de fuites éventuelles.',
      instructions: '1. Remplir la cuve complètement\n2. Inspecter visuellement la cuve sous le véhicule :\n   - Fissures\n   - Déformations\n   - Traces d\'humidité\n3. Vérifier tous les raccords et colliers de serrage\n4. Contrôler la vanne de vidange (étanchéité)\n5. Vérifier les durites (craquelures, durcissement)\n6. Tester le capteur de niveau d\'eau\n7. Vérifier l\'absence de fuite au niveau de la trappe de remplissage\n8. Resserrer les colliers si nécessaire\n9. Remplacer les durites endommagées',
      photos: [],
      videos: [],
      parts: [],
      estimatedDuration: 30,
      estimatedCost: 0,
      tags: ['Contrôle', 'Fuite', 'Prévention'],
      isOfficial: true,
      source: 'Bonnes pratiques camping-car',
      isUserContributed: false,
      status: 'approved',
    },
    {
      equipmentId: cuveEau._id,
      name: 'Rinçage après période d\'inutilisation',
      type: 'cleaning',
      priority: 'important',
      difficulty: 'easy',
      recurrence: {
        time: {
          value: 2,
          unit: 'months',
        },
      },
      conditions: [
        'Après plus de 2 semaines sans utilisation',
        'Eau stagnante',
      ],
      description: 'Rinçage du circuit d\'eau après une période d\'inutilisation pour éliminer l\'eau stagnante.',
      instructions: '1. Vidanger complètement la cuve\n2. Remplir avec de l\'eau fraîche\n3. Ouvrir tous les robinets et laisser couler 2-3 minutes\n4. Vidanger à nouveau\n5. Remplir avec de l\'eau propre\n6. Laisser couler à chaque robinet jusqu\'à eau claire\n7. Sentir et goûter (si eau potable) pour vérifier l\'absence de goût\n\n💡 Si goût/odeur désagréable persiste : désinfection complète nécessaire',
      photos: [],
      videos: [],
      parts: [],
      estimatedDuration: 15,
      estimatedCost: 0,
      tags: ['Eau', 'Rinçage', 'Hygiène'],
      isOfficial: true,
      source: 'Bonnes pratiques camping-car',
      isUserContributed: false,
      status: 'approved',
    },
    {
      equipmentId: cuveEau._id,
      name: 'Nettoyage ou remplacement du filtre à eau',
      type: 'cleaning',
      priority: 'recommended',
      difficulty: 'easy',
      recurrence: {
        time: {
          value: 3,
          unit: 'months',
        },
      },
      conditions: [
        'Si filtre installé',
        'Selon qualité de l\'eau',
      ],
      description: 'Entretien du filtre à eau installé sur le circuit d\'eau propre.',
      instructions: '1. Fermer l\'arrivée d\'eau\n2. Dévisser le bol du filtre avec la clé fournie\n3. Retirer la cartouche filtrante\n4. Selon le type :\n   - Filtre lavable : rincer sous l\'eau\n   - Cartouche jetable : remplacer\n5. Nettoyer le bol\n6. Vérifier le joint, remplacer si nécessaire\n7. Installer la cartouche neuve ou propre\n8. Revisser le bol\n9. Ouvrir l\'eau progressivement\n10. Vérifier l\'absence de fuite\n11. Purger l\'air en ouvrant un robinet',
      photos: [],
      videos: [],
      parts: [
        {
          name: 'Cartouche filtrante',
          reference: 'Variable selon modèle',
          quantity: 1,
          estimatedCost: 10,
        },
      ],
      estimatedDuration: 15,
      estimatedCost: 10,
      tags: ['Filtre', 'Eau', 'Qualité'],
      isOfficial: true,
      source: 'Bonnes pratiques camping-car',
      isUserContributed: false,
      status: 'approved',
    },
    {
      equipmentId: cuveEau._id,
      name: 'Vérification du capteur de niveau d\'eau',
      type: 'test',
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
        'Avant la saison',
      ],
      description: 'Test du bon fonctionnement du capteur de niveau d\'eau propre.',
      instructions: '1. Vidanger complètement la cuve\n2. Vérifier l\'affichage : doit indiquer VIDE\n3. Remplir progressivement par paliers de 25%\n4. Vérifier que l\'affichage suit la progression\n5. Si dysfonctionnement :\n   - Nettoyer les sondes du capteur\n   - Vérifier les connexions électriques\n   - Tester avec un multimètre si équipé\n6. Remplacer le capteur si défaillant\n\n💡 Certains capteurs à flotteur se nettoient facilement',
      photos: [],
      videos: [],
      parts: [],
      estimatedDuration: 20,
      estimatedCost: 0,
      tags: ['Électronique', 'Capteur', 'Diagnostic'],
      isOfficial: true,
      source: 'Bonnes pratiques camping-car',
      isUserContributed: false,
      status: 'approved',
    },
  ];

  // Insérer toutes les maintenances
  const insertedMaintenances = await Maintenance.insertMany(maintenances);
  console.log(`✅ ${insertedMaintenances.length} maintenances créées`);

  // Afficher le résumé
  console.log('\n📊 Résumé de l\'insertion:');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`Équipement: ${cuveEau.name}`);
  console.log(`ID: ${cuveEau._id}`);
  console.log('\nMaintenances:');
  insertedMaintenances.forEach((m, i) => {
    console.log(`  ${i + 1}. ${m.name} (${m.type} - ${m.priority})`);
  });
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

} catch (error) {
  console.error('❌ Erreur lors de l\'insertion:', error);
} finally {
  await mongoose.disconnect();
  console.log('\n✅ Déconnecté de MongoDB');
}

