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
  // Category ID pour "Réfrigérateur (à compression, absorption)"
  const categoryId = new mongoose.Types.ObjectId('68f35043be04ebdaad786b5e');

  // Créer l'équipement "Réfrigérateur domestique"
  const frigoDomestique = await Equipment.create({
    name: 'Réfrigérateur domestique (220V)',
    description: 'Réfrigérateur de type domestique installé dans un van ou camping-car, fonctionnant sur secteur 220V via onduleur. Solution économique avec grande capacité de stockage, mais nécessite une installation électrique adaptée (onduleur puissant, batterie conséquente). Non conçu à l\'origine pour usage mobile : sensible aux vibrations et à l\'inclinaison.',
    categoryId: categoryId,
    vehicleBrands: [],
    equipmentBrands: [],
    photos: [],
    manuals: [],
    notes: 'Nécessite onduleur pur sinus 1000-1500W et batterie lithium conséquente. Préférer modèles basse consommation (A+++). Installation fixe indispensable.',
    isUserContributed: false,
    status: 'approved',
  });

  console.log(`✅ Équipement créé: ${frigoDomestique.name} (ID: ${frigoDomestique._id})`);

  // Créer les maintenances associées
  const maintenances = [
    {
      equipmentId: frigoDomestique._id,
      name: 'Vérification de la mise à niveau',
      type: 'inspection',
      priority: 'critical',
      difficulty: 'easy',
      recurrence: {
        time: {
          value: 3,
          unit: 'months',
        },
      },
      conditions: [
        'Après conduite sur route difficile',
        'Si bruits anormaux du compresseur',
        'Si porte ferme mal',
      ],
      description: 'Contrôle crucial de la mise à niveau du frigo pour assurer le bon fonctionnement du compresseur et l\'étanchéité de la porte.',
      instructions: '⚠️ CRITIQUE POUR FRIGO DOMESTIQUE EN VAN\n\n1. Vérifier avec un niveau à bulle :\n   - Poser le niveau sur le dessus du frigo\n   - Avant/arrière\n   - Gauche/droite\n2. Niveau requis :\n   - Parfaitement horizontal = IDÉAL\n   - Tolérance max : 2-3° (selon fabricant)\n   - Au-delà : risque pour le compresseur\n3. Ajuster si nécessaire :\n   - Utiliser des cales sous les pieds\n   - Ajuster les pieds réglables\n   - Vérifier après ajustement\n4. Tester la porte :\n   - Doit se fermer d\'elle-même à 45°\n   - Si reste ouverte = mauvais niveau\n5. Vérifier après conduite :\n   - Vibrations peuvent dérégler le niveau\n   - Contrôle systématique recommandé\n\n🚨 DANGER : Frigo non de niveau = \n   - Compresseur endommagé\n   - Durée de vie réduite\n   - Performances dégradées\n   - Consommation excessive\n\n💡 Un frigo domestique N\'EST PAS conçu pour bouger',
      photos: [],
      videos: [],
      parts: [],
      estimatedDuration: 10,
      estimatedCost: 0,
      tags: ['Niveau', 'Compresseur', 'Critical', 'Installation'],
      isOfficial: true,
      source: 'Recommandations fabricants',
      isUserContributed: false,
      status: 'approved',
    },
    {
      equipmentId: frigoDomestique._id,
      name: 'Contrôle de la fixation et anti-vibrations',
      type: 'inspection',
      priority: 'critical',
      difficulty: 'intermediate',
      recurrence: {
        time: {
          value: 3,
          unit: 'months',
        },
      },
      conditions: [
        'Après conduite sur piste',
        'Si bruits/vibrations anormaux',
        'Avant long voyage',
      ],
      description: 'Vérification de la fixation du frigo et des systèmes anti-vibrations pour protéger le compresseur.',
      instructions: '⚠️ FRIGO DOMESTIQUE = FRAGILE AUX VIBRATIONS\n\n1. Vérifier le système de fixation :\n   - Sangles de maintien serrées\n   - Cales latérales bien positionnées\n   - Fixations arrière sécurisées\n   - Frigo ne bouge PAS du tout\n2. Tester la stabilité :\n   - Pousser le frigo : aucun mouvement\n   - Vérifier tous les côtés\n3. Système anti-vibrations :\n   - Tapis/mousse anti-vibrations sous le frigo\n   - Amortisseurs si installés\n   - État des supports\n4. Vérifier les espacements :\n   - 5-10 cm sur les côtés (ventilation)\n   - 10 cm à l\'arrière\n   - Frigo ne touche pas les parois\n5. Protections intérieures :\n   - Clayettes bien enclenchées\n   - Bacs fixés\n   - Rien ne peut bouger à l\'intérieur\n6. Contrôler les bruits :\n   - Compresseur ne vibre pas excessivement\n   - Pas de cliquetis métallique\n   - Pas de frottement\n\n🚨 Vibrations = ennemi n°1 du compresseur domestique\n💡 Utiliser des mousses haute densité\n💡 Éviter les pistes trop difficiles si possible',
      photos: [],
      videos: [],
      parts: [
        {
          name: 'Tapis anti-vibrations',
          reference: 'Mousse haute densité',
          quantity: 1,
          estimatedCost: 20,
        },
      ],
      estimatedDuration: 20,
      estimatedCost: 0,
      tags: ['Fixation', 'Vibrations', 'Compresseur', 'Critical'],
      isOfficial: true,
      source: 'Adaptation van/camping-car',
      isUserContributed: false,
      status: 'approved',
    },
    {
      equipmentId: frigoDomestique._id,
      name: 'Vérification onduleur et alimentation 220V',
      type: 'test',
      priority: 'critical',
      difficulty: 'intermediate',
      recurrence: {
        time: {
          value: 3,
          unit: 'months',
        },
      },
      conditions: [
        'Si coupures fréquentes',
        'Si onduleur chauffe',
        'Si frigo ne démarre pas',
      ],
      description: 'Contrôle de l\'onduleur et de l\'alimentation électrique nécessaire au fonctionnement du frigo 220V.',
      instructions: '⚠️ FRIGO DOMESTIQUE = ONDULEUR PUISSANT REQUIS\n\n1. Vérifier les specs de l\'onduleur :\n   - Puissance : minimum 1000W continu\n   - Type : OBLIGATOIRE pur sinus\n   - Pic de démarrage : 2000-3000W (compresseur)\n2. Tester la tension de sortie :\n   - Utiliser un multimètre\n   - Doit afficher 220-230V stable\n   - Pas de fluctuations importantes\n3. Contrôler la consommation du frigo :\n   - Mesurer avec wattmètre\n   - Démarrage compresseur : 400-800W (pic)\n   - En fonctionnement : 80-150W\n   - Comparer aux specs\n4. Vérifier l\'état de la batterie :\n   - Capacité suffisante (200Ah lithium min)\n   - Tension de batterie stable\n   - Pas de chute de tension au démarrage\n5. Inspection des connexions :\n   - Câbles batterie vers onduleur (section 25-35mm²)\n   - Serrage des cosses\n   - Absence de chauffe\n   - Fusibles appropriés (150-200A)\n6. Protection de l\'onduleur :\n   - Ventilation correcte\n   - Pas de surchauffe\n   - Alarmes fonctionnelles\n7. Tester en situation réelle :\n   - Démarrage compresseur OK\n   - Pas de coupure onduleur\n   - Autonomie acceptable\n\n💡 Consommation frigo domestique : 50-80Ah/24h\n🚨 Onduleur modifié = risque pour le compresseur\n💡 Préférer frigos basse conso (A+++ = 0,5kWh/24h)',
      photos: [],
      videos: [],
      parts: [],
      estimatedDuration: 30,
      estimatedCost: 0,
      tags: ['Onduleur', '220V', 'Électrique', 'Critical', 'Batterie'],
      isOfficial: true,
      source: 'Installation électrique van',
      isUserContributed: false,
      status: 'approved',
    },
    {
      equipmentId: frigoDomestique._id,
      name: 'Nettoyage intérieur du réfrigérateur',
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
        'Si odeurs désagréables',
        'En cas de déversement',
        'Avant stockage prolongé',
      ],
      description: 'Nettoyage régulier de l\'intérieur du frigo pour maintenir l\'hygiène alimentaire.',
      instructions: '1. Vider le réfrigérateur et le congélateur\n2. Débrancher ou couper l\'onduleur\n3. Retirer tous les éléments amovibles :\n   - Clayettes en verre\n   - Bacs à légumes\n   - Balconnets de porte\n4. Nettoyer l\'intérieur :\n   - Eau tiède + bicarbonate de soude\n   - Ou vinaigre blanc dilué\n   - Éponge douce\n   - Insister dans les recoins\n5. Nettoyer les joints de porte :\n   - Chiffon avec eau savonneuse\n   - Passer dans tous les plis\n   - Vérifier absence de moisissure\n6. Nettoyer les éléments amovibles :\n   - Eau savonneuse\n   - Rincer\n   - Sécher\n7. Nettoyer l\'extérieur et les poignées\n8. Laisser sécher 15 minutes porte ouverte\n9. Remettre tous les éléments\n10. Rebrancher\n\n💡 Éviter produits chimiques agressifs\n💡 Bicarbonate = anti-odeurs naturel',
      photos: [],
      videos: [],
      parts: [],
      estimatedDuration: 30,
      estimatedCost: 0,
      tags: ['Nettoyage', 'Hygiène', 'Odeurs'],
      isOfficial: true,
      source: 'Recommandations fabricants',
      isUserContributed: false,
      status: 'approved',
    },
    {
      equipmentId: frigoDomestique._id,
      name: 'Nettoyage du condenseur et grilles arrière',
      type: 'cleaning',
      priority: 'important',
      difficulty: 'intermediate',
      recurrence: {
        time: {
          value: 3,
          unit: 'months',
        },
      },
      conditions: [
        'Si frigo chauffe anormalement',
        'Si consommation excessive',
        'Si performances dégradées',
      ],
      description: 'Nettoyage du condenseur (radiateur arrière) pour maintenir l\'efficacité de refroidissement.',
      instructions: '⚠️ ESSENTIEL POUR LES PERFORMANCES\n\n1. Débrancher le frigo (couper onduleur)\n2. Accéder à l\'arrière du frigo :\n   - Tirer le frigo si possible\n   - Ou retirer le panneau arrière\n3. Localiser le condenseur :\n   - Grille métallique noire à l\'arrière\n   - Serpentin avec ailettes\n4. Aspirer la poussière :\n   - Utiliser un aspirateur avec embout brosse\n   - Passer délicatement entre les ailettes\n   - Ne pas plier les ailettes\n5. Brosser si nécessaire :\n   - Brosse douce\n   - Mouvements verticaux\n6. Souffler avec air comprimé (optionnel) :\n   - Pression faible\n   - Expulser poussière tenace\n7. Nettoyer le ventilateur (si équipé) :\n   - Enlever poussière sur les pales\n   - Vérifier rotation libre\n8. Nettoyer la grille de ventilation extérieure\n9. Vérifier l\'espace de ventilation (10cm min)\n10. Replacer le frigo ou le panneau\n11. Rebrancher et tester\n\n💡 En van : condenseur s\'encrasse plus vite (poussière route)\n🚨 Condenseur encrassé = +30% consommation\n💡 Nettoyer plus souvent en été',
      photos: [],
      videos: [],
      parts: [],
      estimatedDuration: 30,
      estimatedCost: 0,
      tags: ['Condenseur', 'Nettoyage', 'Performance', 'Ventilation'],
      isOfficial: true,
      source: 'Recommandations fabricants',
      isUserContributed: false,
      status: 'approved',
    },
    {
      equipmentId: frigoDomestique._id,
      name: 'Dégivrage du congélateur',
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
        'Si couche de givre > 5mm',
        'Si porte du freezer ferme mal',
        'Si performances dégradées',
      ],
      description: 'Dégivrage du compartiment congélateur pour maintenir les performances énergétiques.',
      instructions: '1. Vider le congélateur\n2. Transférer aliments congelés (glacière avec pains de glace)\n3. Débrancher le frigo (couper onduleur)\n4. Laisser porte du freezer ouverte\n5. Placer des serviettes au fond\n6. Laisser dégeler naturellement (2-4h) :\n   - Option : bol d\'eau chaude dans le freezer (accélère)\n   - NE JAMAIS gratter avec objet dur\n   - NE JAMAIS utiliser sèche-cheveux\n7. Récupérer l\'eau de fonte :\n   - Essuyer régulièrement\n   - Vider le bac récupérateur si équipé\n8. Nettoyer le freezer (eau + bicarbonate)\n9. Bien sécher\n10. Rebrancher\n11. Attendre retour température avant de recharger\n\n💡 Givre épais = +50% consommation freezer\n💡 Si frigo No-Frost : dégivrage automatique (rare en van)\n⚠️ Planifier quand alimentations riches disponibles\n💡 Durée totale : 3-4h',
      photos: [],
      videos: [],
      parts: [],
      estimatedDuration: 240,
      estimatedCost: 0,
      tags: ['Dégivrage', 'Congélateur', 'Freezer', 'Performance'],
      isOfficial: true,
      source: 'Recommandations fabricants',
      isUserContributed: false,
      status: 'approved',
    },
    {
      equipmentId: frigoDomestique._id,
      name: 'Contrôle du joint de porte',
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
        'Si porte ferme mal',
        'Si givre anormal',
      ],
      description: 'Vérification de l\'étanchéité des joints de porte du réfrigérateur et du congélateur.',
      instructions: '1. Test visuel du joint :\n   - Pas de craquelures\n   - Pas de déchirures\n   - Souplesse conservée\n   - Propreté (pas de moisissure)\n2. Test d\'étanchéité :\n   - Méthode 1 : Feuille de papier\n   - Fermer la porte sur une feuille\n   - Tirer : doit résister\n   - Tester sur tout le périmètre\n   - Méthode 2 : Lampe torche\n   - Mettre lampe allumée dans frigo\n   - Fermer porte, éteindre lumière pièce\n   - Si lumière visible = fuite\n3. Nettoyer le joint :\n   - Eau savonneuse tiède\n   - Passer dans tous les plis\n   - Bien sécher\n4. Si joint sec/dur :\n   - Appliquer talc ou vaseline\n   - Redonne souplesse\n5. Vérifier l\'alignement de la porte :\n   - Charnières serrées\n   - Porte bien droite\n6. Si joint défaillant :\n   - Commander référence exacte\n   - Remplacement facile (clips ou colle)\n\n💡 Joint défaillant = +25% consommation\n💡 Vibrations du van peuvent user les joints plus vite',
      photos: [],
      videos: [],
      parts: [
        {
          name: 'Joint de porte frigo',
          reference: 'Selon modèle exact',
          quantity: 1,
          estimatedCost: 40,
        },
      ],
      estimatedDuration: 20,
      estimatedCost: 0,
      tags: ['Joint', 'Étanchéité', 'Condensation', 'Performance'],
      isOfficial: true,
      source: 'Recommandations fabricants',
      isUserContributed: false,
      status: 'approved',
    },
    {
      equipmentId: frigoDomestique._id,
      name: 'Vérification des réglages température',
      type: 'test',
      priority: 'recommended',
      difficulty: 'easy',
      recurrence: {
        time: {
          value: 3,
          unit: 'months',
        },
      },
      conditions: [
        'Changement de saison',
        'Si température instable',
        'Si consommation anormale',
      ],
      description: 'Contrôle et ajustement des températures pour optimiser conservation et consommation.',
      instructions: '1. Mesurer la température réelle :\n   - Thermomètre au centre du frigo\n   - Attendre 4-6h après fermeture\n   - Température idéale : 4-5°C\n2. Congélateur :\n   - Thermomètre au centre\n   - Température idéale : -18°C\n3. Ajuster si nécessaire :\n   - Molette de réglage (1-7 généralement)\n   - Position moyenne souvent optimale\n   - Attendre 24h entre ajustements\n4. Optimiser selon saison :\n   - Été/chaleur : réglage plus fort\n   - Hiver/froid : réglage plus faible\n5. Vérifier la consommation :\n   - Mesurer avec wattmètre\n   - Comparer aux specs fabricant\n   - Frigo A+++ : 0,5-0,7 kWh/24h\n6. Conseils d\'optimisation :\n   - Ne pas surcharger (air doit circuler)\n   - Laisser refroidir aliments avant rangement\n   - Limiter ouvertures prolongées\n   - Organiser pour limiter recherches\n\n💡 Température trop basse = gaspillage énergie\n💡 4°C = température optimale conservation\n💡 Économie : -1°C = +5% consommation',
      photos: [],
      videos: [],
      parts: [],
      estimatedDuration: 15,
      estimatedCost: 0,
      tags: ['Température', 'Réglage', 'Performance', 'Consommation'],
      isOfficial: true,
      source: 'Bonnes pratiques',
      isUserContributed: false,
      status: 'approved',
    },
    {
      equipmentId: frigoDomestique._id,
      name: 'Gestion électrique et autonomie',
      type: 'service',
      priority: 'critical',
      difficulty: 'advanced',
      recurrence: {
        time: {
          value: 6,
          unit: 'months',
        },
      },
      conditions: [
        'Si autonomie insuffisante',
        'Si batterie se décharge trop vite',
        'Changement de saison',
      ],
      description: 'Optimisation de la gestion électrique pour maximiser l\'autonomie avec un frigo domestique.',
      instructions: '⚠️ FRIGO DOMESTIQUE = GROS CONSOMMATEUR\n\n1. Calculer la consommation réelle :\n   - Mesurer sur 24h avec wattmètre\n   - Calculer en Ah (Wh ÷ tension batterie)\n   - Ex: 600Wh/jour ÷ 12V = 50Ah/jour\n2. Vérifier la capacité batterie :\n   - Lithium recommandé (200-400Ah)\n   - AGM possible mais capacité x2 nécessaire\n   - Profondeur décharge max 80% (lithium)\n3. Calculer l\'autonomie :\n   - (Capacité batterie x 0,8) ÷ Consommation frigo\n   - Ex: (300Ah x 0,8) ÷ 50Ah = 4,8 jours\n4. Solutions si autonomie insuffisante :\n   - Augmenter capacité batterie\n   - Ajouter panneaux solaires (400-800W)\n   - Recharge alternateur améliorée\n   - Brancher sur secteur dès que possible\n5. Optimisations :\n   - Thermostat intelligent (coupure batterie basse)\n   - Minuterie (arrêt nocturne si possible)\n   - Isolation renforcée du frigo\n6. Surveillance :\n   - Moniteur de batterie (shunt)\n   - Alarme batterie basse\n   - Suivi consommation journalière\n7. Mode économie d\'énergie :\n   - Température moins froide en hiver\n   - Remplir au maximum (inertie thermique)\n   - Pré-refroidir les aliments\n\n💡 Budget électrique frigo domestique :\n   - Frigo A+++ : 50-80Ah/24h\n   - Batterie lithium 300Ah minimum\n   - Solaire 400W minimum\n🚨 Sans solaire conséquent = frigo sur secteur uniquement\n💡 Alternative : passer à glacière à compression (20-45Ah/24h)',
      photos: [],
      videos: [],
      parts: [],
      estimatedDuration: 60,
      estimatedCost: 0,
      tags: ['Électrique', 'Autonomie', 'Batterie', 'Consommation', 'Solaire'],
      isOfficial: true,
      source: 'Installation électrique van',
      isUserContributed: false,
      status: 'approved',
    },
    {
      equipmentId: frigoDomestique._id,
      name: 'Hivernage et stockage longue durée',
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
        'Si inutilisation > 1 mois',
      ],
      description: 'Préparation du frigo pour une période d\'immobilisation prolongée du véhicule.',
      instructions: '1. Vider complètement frigo et congélateur\n2. Débrancher (couper onduleur)\n3. Dégivrer le freezer complètement\n4. Nettoyage complet :\n   - Intérieur frigo et freezer\n   - Clayettes et bacs\n   - Joints\n   - Extérieur\n5. Sécher parfaitement :\n   - Essuyer toute humidité\n   - Laisser porte ouverte 24h\n6. Neutraliser odeurs :\n   - Bol de bicarbonate à l\'intérieur\n   - Ou charbon actif\n   - Ou boule de papier journal\n7. Laisser portes entrouvertes :\n   - Frigo et freezer\n   - Caler avec un chiffon\n   - Évite moisissures et odeurs\n8. Protéger si nécessaire :\n   - Couvrir pour éviter poussière\n9. Vérifier fixation pour stockage\n10. Débrancher onduleur complètement\n\n💡 Avant remise en service :\n   - Nettoyer à nouveau\n   - Vérifier niveau et fixation\n   - Faire tourner à vide 2h\n   - Vérifier température avant de charger\n💡 Si stockage dans le froid :\n   - Pas de risque (frigo éteint)\n   - Mais vérifier niveau au redémarrage',
      photos: [],
      videos: [],
      parts: [],
      estimatedDuration: 60,
      estimatedCost: 0,
      tags: ['Hivernage', 'Stockage', 'Moisissure', 'Conservation'],
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
  console.log(`Équipement: ${frigoDomestique.name}`);
  console.log(`ID: ${frigoDomestique._id}`);
  console.log('\nMaintenances:');
  insertedMaintenances.forEach((m, i) => {
    console.log(`  ${i + 1}. ${m.name} (${m.type} - ${m.priority})`);
  });
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('\n⚠️  SPÉCIFICITÉS FRIGO DOMESTIQUE EN VAN :');
  console.log('   • CRITIQUE : Mise à niveau parfaite requise');
  console.log('   • CRITIQUE : Fixation anti-vibrations indispensable');
  console.log('   • CRITIQUE : Onduleur pur sinus 1000W minimum');
  console.log('   • Batterie lithium 200-400Ah recommandée');
  console.log('   • Consommation : 50-80Ah/24h (vs 20-45Ah glacière)');
  console.log('   • Solaire 400W+ fortement conseillé');
  console.log('   • Non conçu pour usage mobile = fragile');

} catch (error) {
  console.error('❌ Erreur lors de l\'insertion:', error);
} finally {
  await mongoose.disconnect();
  console.log('\n✅ Déconnecté de MongoDB');
}

