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
  const equipments = [];
  const allMaintenances = [];

  // IDs des catégories
  const categoryBouteillesGaz = new mongoose.Types.ObjectId('68f35042be04ebdaad786b54');
  const categoryDetendeur = new mongoose.Types.ObjectId('68f35042be04ebdaad786b56');
  const categoryTuyauterieGaz = new mongoose.Types.ObjectId('68f35042be04ebdaad786b58');
  const categoryControleEtancheite = new mongoose.Types.ObjectId('68f35042be04ebdaad786b5a');

  // ============================================
  // 1. BOUTEILLES DE GAZ
  // ============================================
  
  const bouteillesGaz = await Equipment.create({
    name: 'Bouteilles de gaz (Propane/Butane)',
    description: 'Réservoirs de gaz GPL (butane ou propane) pour l\'alimentation des appareils à gaz du véhicule : chauffage, cuisson, réfrigérateur. Capacité standard : 6kg, 10kg ou 13kg. Le propane est préférable pour l\'hiver (utilisable jusqu\'à -40°C vs 0°C pour le butane).',
    categoryId: categoryBouteillesGaz,
    vehicleBrands: [],
    equipmentBrands: [],
    photos: [],
    manuals: [],
    notes: 'Propane = hiver, Butane = été. Vérifier la réglementation du pays pour le transport et l\'utilisation.',
    isUserContributed: false,
    status: 'approved',
  });
  equipments.push(bouteillesGaz);

  const maintenancesBouteilles = [
    {
      equipmentId: bouteillesGaz._id,
      name: 'Inspection visuelle des bouteilles',
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
        'Avant chaque remplissage',
        'Après choc ou chute',
        'Si suspicion de corrosion',
      ],
      description: 'Contrôle visuel de l\'état des bouteilles de gaz pour détecter corrosion, chocs ou dommages.',
      instructions: '1. Inspecter visuellement chaque bouteille :\n   - Absence de rouille, corrosion\n   - Pas de bosses, déformations\n   - État du revêtement de peinture\n   - Lisibilité de l\'étiquetage\n2. Vérifier les robinets :\n   - Pas de fuite au niveau du robinet\n   - Manœuvre fluide (ouverture/fermeture)\n   - Pas de déformation du volant\n3. Contrôler la date de dernière épreuve :\n   - Gravée sur la bouteille\n   - Bouteilles de +10 ans = à remplacer ou réprouver\n4. Vérifier le joint du robinet\n5. Tester la présence de fuite (eau savonneuse)\n\n⚠️ Ne jamais utiliser une bouteille endommagée\n⚠️ Bouteilles rouillées = danger',
      photos: [],
      videos: [],
      parts: [],
      estimatedDuration: 10,
      estimatedCost: 0,
      tags: ['Gaz', 'Sécurité', 'Inspection', 'GPL'],
      isOfficial: true,
      source: 'Norme NF EN 1949',
      isUserContributed: false,
      status: 'approved',
    },
    {
      equipmentId: bouteillesGaz._id,
      name: 'Vérification du serrage et fixation',
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
        'Après chaque changement de bouteille',
        'Après conduite sur piste',
        'Si bruits suspects',
      ],
      description: 'Contrôle de la fixation des bouteilles dans leur coffre pour éviter tout mouvement en roulant.',
      instructions: '1. Vérifier le système de fixation :\n   - Sangles de maintien serrées\n   - Cales bien positionnées\n   - Absence de jeu\n2. Tester la stabilité :\n   - Bouteilles ne doivent pas bouger\n   - Pas de mouvement latéral\n3. Vérifier l\'aération du coffre :\n   - Grilles de ventilation dégagées\n   - Pas d\'obstruction\n   - Évacuation vers l\'extérieur fonctionnelle\n4. Contrôler la propreté du coffre\n5. Vérifier que les bouteilles sont en position verticale\n\n⚠️ Les bouteilles doivent TOUJOURS être en position verticale\n⚠️ Le coffre DOIT être ventilé (gaz plus lourd que l\'air)',
      photos: [],
      videos: [],
      parts: [],
      estimatedDuration: 10,
      estimatedCost: 0,
      tags: ['Fixation', 'Sécurité', 'Gaz'],
      isOfficial: true,
      source: 'Bonnes pratiques GPL',
      isUserContributed: false,
      status: 'approved',
    },
    {
      equipmentId: bouteillesGaz._id,
      name: 'Test de détection de fuite',
      type: 'test',
      priority: 'critical',
      difficulty: 'easy',
      recurrence: {
        time: {
          value: 3,
          unit: 'months',
        },
      },
      conditions: [
        'Après chaque changement de bouteille',
        'Si odeur de gaz',
        'Après toute intervention sur le circuit',
      ],
      description: 'Détection de fuites au niveau des robinets, raccords et détendeur pour prévenir tout risque d\'explosion ou d\'intoxication.',
      instructions: '⚠️ TEST DE SÉCURITÉ CRITIQUE\n\n1. Préparer une solution d\'eau savonneuse (liquide vaisselle)\n2. Ouvrir le robinet de la bouteille\n3. Appliquer l\'eau savonneuse sur :\n   - Le robinet de la bouteille\n   - Le raccord bouteille/détendeur\n   - Les joints\n   - Le détendeur\n4. Observer pendant 30 secondes\n5. Si bulles = FUITE :\n   - Fermer immédiatement le robinet\n   - Aérer la zone\n   - Identifier et corriger la fuite\n   - Remplacer le joint si nécessaire\n6. Retester après correction\n\n🚨 DANGER : Ne JAMAIS utiliser de flamme pour détecter une fuite\n⚠️ En cas de fuite importante : évacuer et appeler les secours',
      photos: [],
      videos: [],
      parts: [
        {
          name: 'Joint de robinet de bouteille',
          reference: 'Universel',
          quantity: 2,
          estimatedCost: 3,
        },
      ],
      estimatedDuration: 15,
      estimatedCost: 3,
      tags: ['Fuite', 'Sécurité', 'Test', 'Critical', 'Gaz'],
      isOfficial: true,
      source: 'Norme NF EN 1949',
      isUserContributed: false,
      status: 'approved',
    },
    {
      equipmentId: bouteillesGaz._id,
      name: 'Remplacement des joints de robinet',
      type: 'replacement',
      priority: 'important',
      difficulty: 'easy',
      recurrence: {
        time: {
          value: 2,
          unit: 'years',
        },
      },
      conditions: [
        'Si fuite détectée',
        'Lors du changement de bouteille si joint abîmé',
        'Préventivement tous les 2 ans',
      ],
      description: 'Remplacement préventif des joints d\'étanchéité entre bouteille et détendeur.',
      instructions: '1. Fermer le robinet de la bouteille\n2. Dévisser le détendeur\n3. Retirer l\'ancien joint\n4. Nettoyer la surface de contact\n5. Installer le nouveau joint :\n   - Vérifier qu\'il est adapté (butane/propane)\n   - Le positionner correctement\n   - Ne pas graisser\n6. Revisser le détendeur à la main (ne pas forcer)\n7. Ouvrir légèrement le robinet\n8. Tester l\'étanchéité (eau savonneuse)\n9. Si fuite : resserrer légèrement\n10. Retester\n\n💡 Avoir toujours des joints de rechange',
      photos: [],
      videos: [],
      parts: [
        {
          name: 'Joints de robinet bouteille (lot de 5)',
          reference: 'Universel GPL',
          quantity: 1,
          estimatedCost: 5,
        },
      ],
      estimatedDuration: 15,
      estimatedCost: 5,
      tags: ['Joint', 'Étanchéité', 'Remplacement'],
      isOfficial: true,
      source: 'Bonnes pratiques GPL',
      isUserContributed: false,
      status: 'approved',
    },
  ];

  allMaintenances.push(...maintenancesBouteilles);

  // ============================================
  // 2. DÉTENDEUR
  // ============================================
  
  const detendeur = await Equipment.create({
    name: 'Détendeur de gaz',
    description: 'Régulateur de pression qui réduit la pression du gaz de la bouteille (variable) à une pression constante utilisable par les appareils (30 ou 37 mbar). Essentiel pour la sécurité et le bon fonctionnement des équipements. Types : détendeur simple, inverseur automatique 2 bouteilles, détendeur réglable.',
    categoryId: categoryDetendeur,
    vehicleBrands: [],
    equipmentBrands: [],
    photos: [],
    manuals: [],
    notes: 'Durée de vie : 10 ans maximum. Vérifier la compatibilité butane/propane.',
    isUserContributed: false,
    status: 'approved',
  });
  equipments.push(detendeur);

  const maintenancesDetendeur = [
    {
      equipmentId: detendeur._id,
      name: 'Remplacement du détendeur',
      type: 'replacement',
      priority: 'critical',
      difficulty: 'easy',
      recurrence: {
        time: {
          value: 10,
          unit: 'years',
        },
      },
      conditions: [
        'Obligatoire après 10 ans',
        'Si dysfonctionnement détecté',
        'Si débit irrégulier',
        'Si givrage répété',
      ],
      description: 'Remplacement obligatoire du détendeur tous les 10 ans maximum selon la réglementation française.',
      instructions: '⚠️ REMPLACEMENT OBLIGATOIRE APRÈS 10 ANS\n\n1. Fermer le robinet de la bouteille\n2. Purger le circuit (allumer un feu jusqu\'à extinction)\n3. Dévisser l\'ancien détendeur\n4. Vérifier la date de fabrication (gravée dessus)\n5. Choisir le bon détendeur :\n   - 30 mbar (norme française ancienne)\n   - 37 mbar (norme européenne actuelle)\n   - Propane/Butane selon utilisation\n   - Débit adapté aux appareils\n6. Installer le nouveau détendeur\n7. Vérifier le joint (neuf fourni)\n8. Serrer à la main (pas de clé)\n9. Ouvrir le robinet progressivement\n10. Tester l\'étanchéité (eau savonneuse)\n11. Vérifier le bon fonctionnement des appareils\n\n💡 Noter la date d\'installation sur le détendeur',
      photos: [],
      videos: [],
      parts: [
        {
          name: 'Détendeur 37 mbar propane/butane',
          reference: 'Conforme NF',
          quantity: 1,
          estimatedCost: 25,
        },
      ],
      estimatedDuration: 20,
      estimatedCost: 25,
      tags: ['Détendeur', 'Remplacement', 'Obligatoire', 'Sécurité'],
      isOfficial: true,
      source: 'Norme NF EN 12864',
      isUserContributed: false,
      status: 'approved',
    },
    {
      equipmentId: detendeur._id,
      name: 'Vérification du fonctionnement du détendeur',
      type: 'test',
      priority: 'important',
      difficulty: 'easy',
      recurrence: {
        time: {
          value: 6,
          unit: 'months',
        },
      },
      conditions: [
        'Si flammes irrégulières',
        'Si appareils ne fonctionnent pas correctement',
        'Si givrage du détendeur',
      ],
      description: 'Contrôle du bon fonctionnement du détendeur et détection d\'anomalies.',
      instructions: '1. Allumer un appareil à gaz (cuisinière)\n2. Observer la flamme :\n   - Doit être bleue et stable\n   - Pas de clignotement\n   - Pas de sifflement anormal\n3. Vérifier le détendeur :\n   - Pas de givrage excessif (léger givrage = normal)\n   - Pas de sifflement\n   - Pas de vibration\n4. Tester avec plusieurs appareils simultanément\n5. Vérifier que le débit est suffisant\n6. Contrôler l\'étanchéité (eau savonneuse)\n7. Vérifier la soupape de sécurité\n\n🚨 Signes de dysfonctionnement :\n   - Flammes jaunes/orangées\n   - Coupures intempestives\n   - Odeur de gaz\n   - Givrage important et permanent\n   → Remplacer le détendeur',
      photos: [],
      videos: [],
      parts: [],
      estimatedDuration: 15,
      estimatedCost: 0,
      tags: ['Test', 'Détendeur', 'Diagnostic'],
      isOfficial: true,
      source: 'Bonnes pratiques GPL',
      isUserContributed: false,
      status: 'approved',
    },
    {
      equipmentId: detendeur._id,
      name: 'Nettoyage des orifices du détendeur',
      type: 'cleaning',
      priority: 'recommended',
      difficulty: 'easy',
      recurrence: {
        time: {
          value: 1,
          unit: 'years',
        },
      },
      conditions: [
        'Si poussière accumulée',
        'Après stockage prolongé',
      ],
      description: 'Nettoyage des orifices de ventilation du détendeur pour assurer son bon fonctionnement.',
      instructions: '1. Fermer le robinet de bouteille\n2. Inspecter visuellement le détendeur\n3. Nettoyer délicatement :\n   - Les orifices de ventilation\n   - La membrane (si accessible)\n   - Utiliser une brosse douce\n   - Souffler avec de l\'air comprimé (faible pression)\n4. Ne JAMAIS démonter le détendeur\n5. Vérifier l\'absence de toile d\'araignée\n6. Contrôler l\'état général\n7. Retester le fonctionnement\n\n⚠️ Ne pas utiliser de produits chimiques\n⚠️ Ne pas démonter le détendeur',
      photos: [],
      videos: [],
      parts: [],
      estimatedDuration: 10,
      estimatedCost: 0,
      tags: ['Nettoyage', 'Entretien', 'Détendeur'],
      isOfficial: true,
      source: 'Bonnes pratiques GPL',
      isUserContributed: false,
      status: 'approved',
    },
  ];

  allMaintenances.push(...maintenancesDetendeur);

  // ============================================
  // 3. FLEXIBLE ET TUYAUTERIE GAZ
  // ============================================
  
  const tuyauterieGaz = await Equipment.create({
    name: 'Flexible et tuyauterie gaz',
    description: 'Ensemble des conduites et flexibles acheminant le gaz du détendeur aux différents appareils. Comprend : tuyaux cuivre rigides, flexibles haute pression, raccords rapides. Les flexibles doivent être conformes NF et remplacés selon les préconisations (5-10 ans).',
    categoryId: categoryTuyauterieGaz,
    vehicleBrands: [],
    equipmentBrands: [],
    photos: [],
    manuals: [],
    notes: 'Les flexibles ont une durée de vie limitée. Date de péremption marquée dessus.',
    isUserContributed: false,
    status: 'approved',
  });
  equipments.push(tuyauterieGaz);

  const maintenancesTuyauterie = [
    {
      equipmentId: tuyauterieGaz._id,
      name: 'Remplacement des flexibles gaz',
      type: 'replacement',
      priority: 'critical',
      difficulty: 'intermediate',
      recurrence: {
        time: {
          value: 5,
          unit: 'years',
        },
      },
      conditions: [
        'Obligatoire selon date de péremption',
        'Si craquelures visibles',
        'Si durcissement du flexible',
        'Après 10 ans maximum',
      ],
      description: 'Remplacement obligatoire des flexibles gaz selon leur date de péremption (marquée dessus) ou leur état.',
      instructions: '⚠️ REMPLACEMENT OBLIGATOIRE SELON DATE DE PÉREMPTION\n\n1. Fermer le robinet de gaz\n2. Purger le circuit\n3. Identifier tous les flexibles :\n   - Cuisinière\n   - Réfrigérateur\n   - Chauffage\n4. Vérifier la date de péremption (marquée sur le flexible)\n5. Déconnecter l\'ancien flexible\n6. Vérifier la compatibilité du raccord\n7. Installer le nouveau flexible :\n   - Utiliser uniquement des flexibles NF\n   - Respecter la longueur (max 2m)\n   - Éviter les coudes serrés\n   - Ne pas tendre le flexible\n8. Serrer les raccords (2 clés)\n9. Tester l\'étanchéité (eau savonneuse)\n10. Vérifier le fonctionnement de l\'appareil\n11. Noter la date de remplacement\n\n💡 Types de flexibles :\n   - Caoutchouc : 5 ans\n   - Inox : 10 ans\n   - Toujours marqués NF',
      photos: [],
      videos: [],
      parts: [
        {
          name: 'Flexible gaz NF inox 1,5m',
          reference: 'Certification NF',
          quantity: 1,
          estimatedCost: 15,
        },
      ],
      estimatedDuration: 30,
      estimatedCost: 15,
      tags: ['Flexible', 'Remplacement', 'Obligatoire', 'Sécurité'],
      isOfficial: true,
      source: 'Norme NF D 36-121',
      isUserContributed: false,
      status: 'approved',
    },
    {
      equipmentId: tuyauterieGaz._id,
      name: 'Inspection des tuyauteries et raccords',
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
        'Après conduite difficile',
        'Si odeur de gaz',
      ],
      description: 'Contrôle visuel et tactile de l\'ensemble de la tuyauterie gaz et des raccords.',
      instructions: '1. Accéder à l\'ensemble du circuit gaz\n2. Inspecter visuellement :\n   - Tuyaux cuivre : pas de choc, déformation\n   - Flexibles : pas de craquelure, durcissement\n   - Raccords : pas de corrosion\n3. Vérifier les fixations :\n   - Colliers de serrage\n   - Supports de tuyauterie\n   - Absence de frottement\n4. Contrôler les raccords rapides\n5. Vérifier que les tuyaux ne sont pas comprimés\n6. Tester l\'étanchéité sur tous les raccords\n7. Vérifier la ventilation du compartiment gaz\n\n🚨 Signes d\'alerte :\n   - Flexible craquelé\n   - Tuyau déformé\n   - Raccord desserré\n   - Corrosion visible\n   → Intervention immédiate',
      photos: [],
      videos: [],
      parts: [],
      estimatedDuration: 25,
      estimatedCost: 0,
      tags: ['Inspection', 'Tuyauterie', 'Sécurité'],
      isOfficial: true,
      source: 'Bonnes pratiques GPL',
      isUserContributed: false,
      status: 'approved',
    },
    {
      equipmentId: tuyauterieGaz._id,
      name: 'Test d\'étanchéité du circuit complet',
      type: 'test',
      priority: 'critical',
      difficulty: 'intermediate',
      recurrence: {
        time: {
          value: 1,
          unit: 'years',
        },
      },
      conditions: [
        'Après toute intervention sur le circuit',
        'Si odeur de gaz',
        'Avant contrôle réglementaire',
      ],
      description: 'Test complet d\'étanchéité de l\'ensemble du circuit gaz du véhicule.',
      instructions: '⚠️ TEST DE SÉCURITÉ MAJEUR\n\n1. Fermer tous les appareils à gaz\n2. Ouvrir le robinet de la bouteille\n3. Méthode 1 - Test à l\'eau savonneuse :\n   - Préparer eau + liquide vaisselle\n   - Appliquer sur TOUS les raccords\n   - Détendeur\n   - Tous les flexibles\n   - Robinets d\'appareils\n   - Observer pendant 1 minute minimum\n4. Méthode 2 - Test au manomètre (pro) :\n   - Mettre le circuit en pression\n   - Connecter un manomètre\n   - Observer la pression pendant 15 min\n   - Toute baisse = fuite\n5. Si fuite détectée :\n   - Fermer immédiatement le gaz\n   - Aérer\n   - Localiser précisément\n   - Réparer ou remplacer\n   - Retester\n6. Documenter les résultats\n\n🚨 En cas de fuite importante : faire appel à un professionnel',
      photos: [],
      videos: [],
      parts: [],
      estimatedDuration: 45,
      estimatedCost: 0,
      tags: ['Test', 'Étanchéité', 'Circuit', 'Sécurité', 'Critical'],
      isOfficial: true,
      source: 'Norme NF EN 1949',
      isUserContributed: false,
      status: 'approved',
    },
  ];

  allMaintenances.push(...maintenancesTuyauterie);

  // ============================================
  // 4. CONTRÔLE D'ÉTANCHÉITÉ / RÉVISION GAZ
  // ============================================
  
  const controleGaz = await Equipment.create({
    name: 'Installation gaz complète',
    description: 'Ensemble du système d\'alimentation gaz du véhicule, comprenant bouteilles, détendeur, tuyauterie, robinets et appareils. Nécessite un contrôle réglementaire périodique par un professionnel agréé selon la norme NF EN 1949.',
    categoryId: categoryControleEtancheite,
    vehicleBrands: [],
    equipmentBrands: [],
    photos: [],
    manuals: [],
    notes: 'Contrôle obligatoire tous les 5 ans pour les véhicules de loisirs en France (certificat de conformité).',
    isUserContributed: false,
    status: 'approved',
  });
  equipments.push(controleGaz);

  const maintenancesControle = [
    {
      equipmentId: controleGaz._id,
      name: 'Révision gaz réglementaire (Qualigaz)',
      type: 'service',
      priority: 'critical',
      difficulty: 'professional',
      recurrence: {
        time: {
          value: 5,
          unit: 'years',
        },
      },
      conditions: [
        'OBLIGATOIRE tous les 5 ans',
        'Lors d\'une vente du véhicule',
        'Après modification du circuit gaz',
        'Pour certaines assurances',
      ],
      description: 'Contrôle réglementaire obligatoire de l\'installation gaz par un professionnel agréé Qualigaz ou équivalent selon la norme NF EN 1949.',
      instructions: '⚠️ CONTRÔLE OBLIGATOIRE PAR PROFESSIONNEL AGRÉÉ\n\nCe contrôle DOIT être effectué par un organisme agréé :\n- Qualigaz\n- Veritas\n- Bureau de contrôle agréé\n\nPoints contrôlés :\n1. Ventilation du coffre à bouteilles\n2. État et fixation des bouteilles\n3. Détendeur (date, fonctionnement)\n4. Flexibles (date de péremption, état)\n5. Tuyauterie rigide\n6. Tous les raccords\n7. Robinets et vannes\n8. Appareils à gaz\n9. Évacuation des gaz brûlés\n10. Test d\'étanchéité complet\n11. Ventilation haute et basse\n\nDocuments remis :\n- Certificat de conformité\n- Rapport de contrôle détaillé\n- Liste des anomalies éventuelles\n\n💡 Coût moyen : 80-150€\n💡 Durée : 1-2 heures\n📅 Valable 5 ans (noter la date)',
      photos: [],
      videos: [],
      parts: [],
      estimatedDuration: 120,
      estimatedCost: 120,
      tags: ['Révision', 'Obligatoire', 'Professionnel', 'Qualigaz', 'Réglementation'],
      isOfficial: true,
      source: 'Arrêté du 2 août 1977 - NF EN 1949',
      isUserContributed: false,
      status: 'approved',
    },
    {
      equipmentId: controleGaz._id,
      name: 'Vérification de la ventilation gaz',
      type: 'inspection',
      priority: 'critical',
      difficulty: 'easy',
      recurrence: {
        time: {
          value: 6,
          unit: 'months',
        },
      },
      conditions: [
        'Avant chaque saison',
        'Si odeur de gaz persistante',
        'Après hivernage',
      ],
      description: 'Contrôle des ventilations haute et basse obligatoires du compartiment gaz et des zones d\'utilisation.',
      instructions: '⚠️ VENTILATION OBLIGATOIRE (GPL plus lourd que l\'air)\n\n1. Compartiment des bouteilles :\n   - Ventilation BASSE (évacuation GPL)\n   - Grille d\'aération dégagée\n   - Évacuation vers l\'EXTÉRIEUR\n   - Surface minimale réglementaire\n   - Pas d\'obstruction\n2. Vérifier qu\'il n\'y a pas :\n   - De nid d\'insectes\n   - D\'obstruction\n   - De grille manquante\n3. Zone d\'utilisation des appareils :\n   - Ventilation haute (air vicié)\n   - Ventilation basse (air frais)\n4. Tester le tirage des appareils\n5. Nettoyer les grilles si nécessaire\n\n🚨 DANGER : Sans ventilation correcte :\n   - Risque d\'asphyxie (CO)\n   - Risque d\'explosion (accumulation GPL)\n   → Ventilation = OBLIGATION LÉGALE',
      photos: [],
      videos: [],
      parts: [],
      estimatedDuration: 20,
      estimatedCost: 0,
      tags: ['Ventilation', 'Sécurité', 'Obligatoire', 'CO'],
      isOfficial: true,
      source: 'Norme NF EN 1949',
      isUserContributed: false,
      status: 'approved',
    },
    {
      equipmentId: controleGaz._id,
      name: 'Test du détecteur de gaz',
      type: 'test',
      priority: 'critical',
      difficulty: 'easy',
      recurrence: {
        time: {
          value: 3,
          unit: 'months',
        },
      },
      conditions: [
        'Avant chaque voyage',
        'Après changement de batterie',
        'Si aucune alerte depuis longtemps',
      ],
      description: 'Vérification du bon fonctionnement du détecteur de gaz et de CO si équipé.',
      instructions: '1. Vérifier que le détecteur est alimenté\n2. Tester le bouton de test :\n   - Appuyer sur le bouton TEST\n   - L\'alarme doit sonner\n   - Le voyant doit s\'allumer\n3. Vérifier la date de péremption du détecteur\n4. Remplacer si :\n   - Plus de 5-7 ans (selon modèle)\n   - Ne sonne pas au test\n   - Voyant défectueux\n5. Vérifier l\'emplacement :\n   - GPL : détecteur BAS (gaz lourd)\n   - CO : détecteur à hauteur d\'homme\n6. Nettoyer la grille du capteur\n\n💡 Durée de vie détecteur : 5-7 ans\n🚨 OBLIGATOIRE pour la sécurité',
      photos: [],
      videos: [],
      parts: [
        {
          name: 'Détecteur de gaz GPL',
          reference: 'Certification EN 50194',
          quantity: 1,
          estimatedCost: 40,
        },
      ],
      estimatedDuration: 10,
      estimatedCost: 0,
      tags: ['Détecteur', 'Alarme', 'Sécurité', 'Test'],
      isOfficial: true,
      source: 'Norme EN 50194',
      isUserContributed: false,
      status: 'approved',
    },
    {
      equipmentId: controleGaz._id,
      name: 'Purge et vidange du circuit gaz (hivernage)',
      type: 'drain',
      priority: 'recommended',
      difficulty: 'easy',
      recurrence: {
        time: {
          value: 1,
          unit: 'years',
        },
      },
      conditions: [
        'Avant stockage prolongé',
        'En cas de non-utilisation hivernale',
        'Pour sécurité maximale',
      ],
      description: 'Purge complète du circuit gaz avant une période d\'immobilisation prolongée.',
      instructions: '1. Fermer le robinet de la bouteille\n2. Allumer tous les appareils à gaz\n3. Laisser brûler jusqu\'à extinction complète\n4. Vérifier que le circuit est bien purgé\n5. Fermer tous les robinets d\'appareils\n6. Option sécurité maximale :\n   - Déconnecter le détendeur\n   - Sortir les bouteilles du véhicule\n   - Stocker dans un local ventilé\n7. Laisser les robinets ouverts pendant le stockage\n8. Marquer "PURGÉ" sur le tableau de bord\n\n💡 Avantages :\n   - Sécurité maximale\n   - Pas de risque de fuite\n   - Moins d\'encrassement des injecteurs',
      photos: [],
      videos: [],
      parts: [],
      estimatedDuration: 15,
      estimatedCost: 0,
      tags: ['Purge', 'Hivernage', 'Sécurité', 'Stockage'],
      isOfficial: true,
      source: 'Bonnes pratiques GPL',
      isUserContributed: false,
      status: 'approved',
    },
  ];

  allMaintenances.push(...maintenancesControle);

  // ============================================
  // INSERTION EN BASE
  // ============================================

  const insertedMaintenances = await Maintenance.insertMany(allMaintenances);
  console.log(`✅ ${insertedMaintenances.length} maintenances créées au total`);

  // ============================================
  // RÉSUMÉ
  // ============================================
  
  console.log('\n\n📊 RÉSUMÉ DE L\'INSERTION - INSTALLATION GAZ');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  
  let maintenanceIndex = 0;
  equipments.forEach((eq, i) => {
    const eqMaintenances = allMaintenances.filter(m => m.equipmentId.equals(eq._id));
    console.log(`\n🔧 ÉQUIPEMENT ${i + 1}: ${eq.name}`);
    console.log(`   ID: ${eq._id}`);
    console.log(`   Maintenances (${eqMaintenances.length}):`);
    eqMaintenances.forEach((m, j) => {
      console.log(`   ${j + 1}. ${m.name} (${m.type} - ${m.priority})`);
    });
  });
  
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`✅ Total: ${equipments.length} équipements, ${allMaintenances.length} maintenances`);
  console.log('\n⚠️  POINTS DE SÉCURITÉ GAZ :');
  console.log('   • Révision Qualigaz obligatoire tous les 5 ans');
  console.log('   • Détendeur à remplacer tous les 10 ans MAX');
  console.log('   • Flexibles selon date de péremption (5-10 ans)');
  console.log('   • Ventilation obligatoire et fonctionnelle');
  console.log('   • Détecteur de gaz + CO recommandé');

} catch (error) {
  console.error('❌ Erreur lors de l\'insertion:', error);
} finally {
  await mongoose.disconnect();
  console.log('\n✅ Déconnecté de MongoDB');
}

