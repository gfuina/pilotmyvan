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
  // Category ID pour "Glacière électrique"
  const categoryId = new mongoose.Types.ObjectId('68f35043be04ebdaad786b60');

  // Créer l'équipement "Glacière à compression"
  const glaciere = await Equipment.create({
    name: 'Glacière à compression',
    description: 'Réfrigérateur/glacière portable à compresseur pour camping-car et van aménagé. Fonctionne sur 12V, 24V et/ou 220V. Performances élevées (congélation possible jusqu\'à -20°C), faible consommation énergétique, fonctionnement sur batterie auxiliaire. Capacité variable de 15L à 100L selon les modèles.',
    categoryId: categoryId,
    vehicleBrands: [],
    equipmentBrands: [],
    photos: [],
    manuals: [],
    notes: 'Technologie similaire aux frigos domestiques mais adaptée aux vibrations et inclinaisons. Marques courantes : Dometic, Engel, Waeco, Alpicool, etc.',
    isUserContributed: false,
    status: 'approved',
  });

  console.log(`✅ Équipement créé: ${glaciere.name} (ID: ${glaciere._id})`);

  // Créer les maintenances associées
  const maintenances = [
    {
      equipmentId: glaciere._id,
      name: 'Nettoyage intérieur de la glacière',
      type: 'cleaning',
      priority: 'important',
      difficulty: 'easy',
      recurrence: {
        time: {
          value: 1,
          unit: 'months',
        },
      },
      conditions: [
        'Après chaque utilisation prolongée',
        'Si odeurs désagréables',
        'En cas de déversement',
      ],
      description: 'Nettoyage régulier de l\'intérieur de la glacière pour garantir l\'hygiène et éviter les mauvaises odeurs.',
      instructions: '1. Vider complètement la glacière\n2. Débrancher l\'alimentation électrique\n3. Retirer les accessoires amovibles (bacs, grilles)\n4. Nettoyer l\'intérieur :\n   - Eau tiède + savon doux ou bicarbonate\n   - Éponge douce (pas d\'abrasif)\n   - Insister dans les coins\n5. Nettoyer le joint de porte :\n   - Passer dans les plis avec un chiffon\n   - Vérifier l\'absence de moisissure\n6. Rincer à l\'eau claire\n7. Sécher complètement avec un chiffon\n8. Laisser aérer 30 minutes porte ouverte\n9. Nettoyer les accessoires séparément\n10. Remonter le tout\n\n💡 Astuce anti-odeurs : laisser un bol de bicarbonate à l\'intérieur quand inutilisée',
      photos: [],
      videos: [],
      parts: [],
      estimatedDuration: 20,
      estimatedCost: 0,
      tags: ['Nettoyage', 'Hygiène', 'Entretien', 'Odeurs'],
      isOfficial: true,
      source: 'Recommandations fabricants',
      isUserContributed: false,
      status: 'approved',
    },
    {
      equipmentId: glaciere._id,
      name: 'Nettoyage des grilles de ventilation',
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
        'Si surchauffe de l\'appareil',
        'Si performances dégradées',
        'Après conduite sur pistes poussiéreuses',
      ],
      description: 'Nettoyage des grilles de ventilation pour assurer une bonne dissipation de la chaleur et maintenir les performances.',
      instructions: '⚠️ ESSENTIEL POUR LES PERFORMANCES\n\n1. Débrancher la glacière\n2. Localiser les grilles de ventilation :\n   - Généralement sur les côtés ou à l\'arrière\n   - Orifices d\'entrée d\'air frais\n   - Orifices d\'évacuation air chaud\n3. Nettoyer les grilles :\n   - Aspirer la poussière avec un aspirateur\n   - Brosse douce pour enlever les saletés\n   - Souffler avec de l\'air comprimé (si disponible)\n4. Vérifier qu\'il n\'y a pas :\n   - D\'obstruction\n   - De nid d\'insecte\n   - D\'accumulation de poussière importante\n5. Nettoyer le radiateur/condenseur si accessible :\n   - Aspirer délicatement\n   - Ne pas plier les ailettes\n6. Vérifier l\'espace de ventilation (minimum 5 cm)\n\n💡 Grilles obstruées = surconsommation + mauvaises performances\n⚠️ Respecter les espacements de ventilation lors de l\'installation',
      photos: [],
      videos: [],
      parts: [],
      estimatedDuration: 15,
      estimatedCost: 0,
      tags: ['Ventilation', 'Performance', 'Nettoyage', 'Condenseur'],
      isOfficial: true,
      source: 'Recommandations fabricants',
      isUserContributed: false,
      status: 'approved',
    },
    {
      equipmentId: glaciere._id,
      name: 'Vérification et entretien du joint de porte',
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
        'Si condensation excessive',
        'Si la porte ferme mal',
        'Si givre anormal',
      ],
      description: 'Contrôle de l\'état du joint de porte pour maintenir l\'étanchéité et les performances de refroidissement.',
      instructions: '1. Inspecter visuellement le joint :\n   - Pas de craquelures\n   - Pas de déformation\n   - Souplesse conservée\n   - Absence de moisissure\n2. Test d\'étanchéité :\n   - Méthode 1 : Fermer une feuille de papier dans la porte\n   - Tirer la feuille : résistance = joint OK\n   - Si la feuille glisse facilement = joint défaillant\n   - Tester sur tout le périmètre\n3. Nettoyer le joint :\n   - Eau savonneuse tiède\n   - Chiffon doux\n   - Bien sécher\n4. Si le joint est sec :\n   - Appliquer un peu de talc ou vaseline\n   - Maintient la souplesse\n5. Si joint défaillant :\n   - Commander pièce de remplacement (référence modèle)\n   - Remplacement simple (clips ou collage)\n\n💡 Un joint défaillant = +20% de consommation\n💡 Nettoyage régulier du joint prolonge sa durée de vie',
      photos: [],
      videos: [],
      parts: [
        {
          name: 'Joint de porte glacière',
          reference: 'Selon modèle',
          quantity: 1,
          estimatedCost: 25,
        },
      ],
      estimatedDuration: 20,
      estimatedCost: 0,
      tags: ['Joint', 'Étanchéité', 'Performance', 'Condensation'],
      isOfficial: true,
      source: 'Recommandations fabricants',
      isUserContributed: false,
      status: 'approved',
    },
    {
      equipmentId: glaciere._id,
      name: 'Contrôle du drain et évacuation condensats',
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
        'Si eau stagnante au fond',
        'Si humidité excessive',
        'Après utilisation en mode congélateur',
      ],
      description: 'Vérification et nettoyage du système d\'évacuation des condensats (si équipé).',
      instructions: '1. Vérifier si votre modèle a un drain :\n   - Généralement au fond de la glacière\n   - Petit orifice ou bouchon\n2. Si équipé d\'un drain :\n   - Retirer le bouchon\n   - Vérifier qu\'il n\'est pas obstrué\n   - Passer un fil de fer souple si besoin\n   - Verser un peu d\'eau pour tester l\'écoulement\n3. Nettoyer le fond de la glacière :\n   - Vérifier l\'absence d\'eau stagnante\n   - Essuyer avec un chiffon\n4. Si condensation excessive :\n   - Vérifier le joint de porte\n   - Vérifier la température de consigne\n   - Limiter les ouvertures fréquentes\n5. Remettre le bouchon de drain\n\n💡 Certains modèles n\'ont pas de drain (normal)\n💡 En mode congélateur : dégivrage peut être nécessaire',
      photos: [],
      videos: [],
      parts: [],
      estimatedDuration: 10,
      estimatedCost: 0,
      tags: ['Drain', 'Condensation', 'Humidité'],
      isOfficial: true,
      source: 'Recommandations fabricants',
      isUserContributed: false,
      status: 'approved',
    },
    {
      equipmentId: glaciere._id,
      name: 'Vérification des connexions électriques',
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
        'Si coupures intempestives',
        'Si fusible grille régulièrement',
        'Avant la saison',
      ],
      description: 'Contrôle des branchements électriques et de l\'alimentation de la glacière.',
      instructions: '1. Vérifier la prise 12V :\n   - État de la prise allume-cigare/12V\n   - Pas de jeu dans la connexion\n   - Connecteur propre\n   - Absence de trace de chauffe\n2. Inspecter le câble d\'alimentation :\n   - Pas de section endommagée\n   - Gaine intacte\n   - Pas de pliure marquée\n3. Vérifier le fusible :\n   - Sur le câble 12V (généralement 15A)\n   - Remplacer si grillé\n   - Avoir des fusibles de rechange\n4. Si branchement 220V :\n   - Vérifier le transfo/adaptateur\n   - État de la prise\n   - Câble en bon état\n5. Tester la tension d\'alimentation :\n   - 12V batterie : minimum 11,5V\n   - Si < 11V : risque de coupure par protection\n6. Vérifier la protection batterie (si équipée) :\n   - Réglages corrects\n   - Fonctionne correctement\n\n⚠️ Vérifier que le câble 12V est de section suffisante (2,5mm² min)\n💡 Consommation moyenne : 0,7 à 4A selon modèle',
      photos: [],
      videos: [],
      parts: [
        {
          name: 'Fusible 15A (lot de 5)',
          reference: 'Standard automobile',
          quantity: 1,
          estimatedCost: 5,
        },
      ],
      estimatedDuration: 15,
      estimatedCost: 0,
      tags: ['Électrique', 'Connexion', '12V', 'Fusible'],
      isOfficial: true,
      source: 'Recommandations fabricants',
      isUserContributed: false,
      status: 'approved',
    },
    {
      equipmentId: glaciere._id,
      name: 'Contrôle de la fixation et stabilité',
      type: 'inspection',
      priority: 'important',
      difficulty: 'easy',
      recurrence: {
        time: {
          value: 3,
          unit: 'months',
        },
      },
      conditions: [
        'Après conduite sur route difficile',
        'Si bruits suspects',
        'Avant long voyage',
      ],
      description: 'Vérification de la fixation de la glacière pour éviter tout mouvement en roulant.',
      instructions: '1. Vérifier le système de fixation :\n   - Sangles de maintien serrées\n   - Supports vissés correctement\n   - Rails de fixation en bon état\n2. Tester la stabilité :\n   - Pousser la glacière : ne doit pas bouger\n   - Pas de jeu latéral\n   - Pas de mouvement avant/arrière\n3. Vérifier l\'installation :\n   - Glacière de niveau (important pour compresseur)\n   - Inclinaison max : 30° (selon modèle)\n   - Espacements de ventilation respectés\n4. Contrôler les points de friction :\n   - Glacière ne frotte pas contre mobilier\n   - Câble électrique bien rangé\n   - Pas de risque de pincement\n5. Si fixation par sangles :\n   - État des sangles (usure)\n   - Boucles fonctionnelles\n   - Tension correcte\n\n⚠️ Glacière non fixée = danger en cas de freinage brusque\n💡 Une glacière stable fonctionne mieux (compresseur)',
      photos: [],
      videos: [],
      parts: [],
      estimatedDuration: 10,
      estimatedCost: 0,
      tags: ['Fixation', 'Sécurité', 'Installation', 'Vibrations'],
      isOfficial: true,
      source: 'Bonnes pratiques',
      isUserContributed: false,
      status: 'approved',
    },
    {
      equipmentId: glaciere._id,
      name: 'Dégivrage (si mode congélateur)',
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
        'Si couche de givre > 5mm',
        'Si utilisation fréquente en mode congélateur',
        'Si performances dégradées',
      ],
      description: 'Dégivrage de la glacière lorsqu\'utilisée en mode congélateur pour maintenir les performances.',
      instructions: '1. Planifier le dégivrage :\n   - Consommer ou transférer les aliments congelés\n   - Prévoir 2-3 heures\n2. Éteindre et débrancher la glacière\n3. Vider complètement\n4. Ouvrir le couvercle/porte en grand\n5. Laisser dégeler naturellement :\n   - Option : placer des serviettes au fond\n   - Option : bol d\'eau chaude à l\'intérieur (accélère)\n   - NE JAMAIS gratter le givre avec objet dur\n   - NE JAMAIS utiliser de sèche-cheveux ou source de chaleur directe\n6. Récupérer l\'eau de fonte\n7. Nettoyer l\'intérieur (voir maintenance nettoyage)\n8. Bien sécher\n9. Redémarrer la glacière vide\n10. Attendre la température avant de recharger\n\n💡 Givre épais = surconsommation électrique\n💡 En mode réfrigérateur : dégivrage rarement nécessaire\n⚠️ Ne jamais forcer le dégivrage mécaniquement',
      photos: [],
      videos: [],
      parts: [],
      estimatedDuration: 180,
      estimatedCost: 0,
      tags: ['Dégivrage', 'Congélateur', 'Performance', 'Givre'],
      isOfficial: true,
      source: 'Recommandations fabricants',
      isUserContributed: false,
      status: 'approved',
    },
    {
      equipmentId: glaciere._id,
      name: 'Vérification des réglages et performances',
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
        'Si température instable',
        'Si surconsommation électrique',
        'Changement de saison',
      ],
      description: 'Contrôle des réglages et test des performances de refroidissement.',
      instructions: '1. Vérifier la température de consigne :\n   - Réfrigérateur : 3-5°C\n   - Congélateur : -15 à -20°C\n2. Mesurer la température réelle :\n   - Utiliser un thermomètre\n   - Placer au centre de la glacière\n   - Attendre 30 min après fermeture\n3. Comparer consigne vs réalité :\n   - Écart < 2°C = OK\n   - Écart > 3°C = problème\n4. Tester le temps de refroidissement :\n   - Glacière vide à température ambiante\n   - Atteindre 5°C en 2-3h = OK (selon modèle)\n5. Vérifier la consommation :\n   - Relever l\'ampérage (pince ampèremétrique)\n   - Comparer aux specs fabricant\n   - Consommation excessive = problème ventilation\n6. Optimiser les réglages selon usage :\n   - Été : température plus basse\n   - Hiver : peut être réduite\n   - Mode Eco si disponible\n\n💡 Une glacière bien réglée consomme 20-45Ah/24h\n💡 Éviter ouvertures fréquentes et prolongées',
      photos: [],
      videos: [],
      parts: [],
      estimatedDuration: 30,
      estimatedCost: 0,
      tags: ['Performance', 'Température', 'Réglage', 'Test', 'Consommation'],
      isOfficial: true,
      source: 'Bonnes pratiques',
      isUserContributed: false,
      status: 'approved',
    },
    {
      equipmentId: glaciere._id,
      name: 'Stockage et hivernage',
      type: 'service',
      priority: 'recommended',
      difficulty: 'easy',
      recurrence: {
        time: {
          value: 1,
          unit: 'years',
        },
      },
      conditions: [
        'Avant stockage hivernal',
        'Si inutilisation prolongée (>1 mois)',
      ],
      description: 'Préparation de la glacière pour une période d\'inutilisation prolongée.',
      instructions: '1. Vider complètement la glacière\n2. Débrancher électriquement\n3. Nettoyage complet :\n   - Intérieur (voir maintenance nettoyage)\n   - Extérieur\n   - Grilles de ventilation\n4. Dégivrer si nécessaire\n5. Bien sécher :\n   - Laisser porte ouverte 24h\n   - Essuyer toute humidité\n6. Neutraliser les odeurs :\n   - Bol de bicarbonate de soude à l\'intérieur\n   - Ou charbon actif\n7. Laisser la porte entrouverte :\n   - Évite moisissures et odeurs\n   - Caler avec un chiffon\n8. Stocker dans un endroit :\n   - Sec\n   - Tempéré si possible\n   - À l\'abri de la poussière\n9. Enrouler le câble proprement\n10. Protéger avec une housse (optionnel)\n\n💡 Avant remise en service :\n   - Nettoyer à nouveau\n   - Laisser tourner à vide 1h\n   - Vérifier température',
      photos: [],
      videos: [],
      parts: [],
      estimatedDuration: 45,
      estimatedCost: 0,
      tags: ['Hivernage', 'Stockage', 'Conservation', 'Moisissure'],
      isOfficial: true,
      source: 'Bonnes pratiques',
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
  console.log(`Équipement: ${glaciere.name}`);
  console.log(`ID: ${glaciere._id}`);
  console.log('\nMaintenances:');
  insertedMaintenances.forEach((m, i) => {
    console.log(`  ${i + 1}. ${m.name} (${m.type} - ${m.priority})`);
  });
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('\n💡 Points clés glacière à compression :');
  console.log('   • Nettoyage grilles ventilation = crucial pour performances');
  console.log('   • Joint de porte = étanchéité et économie d\'énergie');
  console.log('   • Consommation moyenne : 20-45Ah/24h');
  console.log('   • Espacements ventilation minimum : 5cm');
  console.log('   • Température optimale : 3-5°C (frigo) / -15 à -20°C (congel)');

} catch (error) {
  console.error('❌ Erreur lors de l\'insertion:', error);
} finally {
  await mongoose.disconnect();
  console.log('\n✅ Déconnecté de MongoDB');
}

