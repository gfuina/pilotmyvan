import 'dotenv/config';
import mongoose from 'mongoose';

// Define Category schema inline
const CategorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    level: {
      type: Number,
      required: true,
      min: 1,
    },
    parentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
      default: null,
    },
    order: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

CategorySchema.index({ parentId: 1, order: 1 });
CategorySchema.index({ level: 1 });

const Category = mongoose.models?.Category || mongoose.model('Category', CategorySchema);

// Structure des catégories
const categoriesData = [
  {
    name: "MÉCANIQUE & CHÂSSIS",
    level: 1,
    children: [
      {
        name: "Moteur",
        level: 2,
        children: [
          { name: "Filtres (huile, air, carburant, habitacle)", level: 3 },
          { name: "Distribution (courroie, chaîne, tendeurs)", level: 3 },
          { name: "Refroidissement (liquide, radiateur, durites)", level: 3 },
          { name: "Échappement (pot, FAP, vanne EGR)", level: 3 },
          { name: "Injection (injecteurs, pompe, calculateur)", level: 3 },
        ],
      },
      {
        name: "Transmission",
        level: 2,
        children: [
          { name: "Boîte de vitesses", level: 3 },
          { name: "Embrayage", level: 3 },
          { name: "Pont & différentiel", level: 3 },
          { name: "Cardans & soufflets", level: 3 },
        ],
      },
      {
        name: "Freinage",
        level: 2,
        children: [
          { name: "Plaquettes & disques", level: 3 },
          { name: "Liquide de frein", level: 3 },
          { name: "Étriers & cylindres", level: 3 },
          { name: "Frein à main", level: 3 },
        ],
      },
      {
        name: "Suspension & direction",
        level: 2,
        children: [
          { name: "Amortisseurs", level: 3 },
          { name: "Ressorts & lames", level: 3 },
          { name: "Rotules & silentblocs", level: 3 },
          { name: "Direction assistée", level: 3 },
          { name: "Géométrie & parallélisme", level: 3 },
        ],
      },
      {
        name: "Pneumatiques",
        level: 2,
        children: [
          { name: "Pneus avant", level: 3 },
          { name: "Pneus arrière", level: 3 },
          { name: "Roue de secours", level: 3 },
          { name: "Équilibrage & permutation", level: 3 },
        ],
      },
    ],
  },
  {
    name: "ÉLECTRICITÉ & ÉNERGIE",
    level: 1,
    children: [
      {
        name: "Batterie moteur",
        level: 2,
        children: [
          { name: "Batterie principale", level: 3 },
          { name: "Alternateur", level: 3 },
          { name: "Démarreur", level: 3 },
        ],
      },
      {
        name: "Batterie auxiliaire (cellule)",
        level: 2,
        children: [
          { name: "Batteries AGM/Lithium", level: 3 },
          { name: "Coupleur séparateur", level: 3 },
          { name: "Chargeur de batterie", level: 3 },
        ],
      },
      {
        name: "Énergie solaire",
        level: 2,
        children: [
          { name: "Panneaux solaires", level: 3 },
          { name: "Régulateur MPPT", level: 3 },
          { name: "Câblage & fixations", level: 3 },
        ],
      },
      {
        name: "Convertisseur & onduleur",
        level: 2,
        children: [
          { name: "Convertisseur 12V", level: 3 },
          { name: "Onduleur 220V", level: 3 },
        ],
      },
      {
        name: "Éclairage",
        level: 2,
        children: [
          { name: "Éclairage intérieur", level: 3 },
          { name: "Éclairage extérieur", level: 3 },
          { name: "Feux de signalisation", level: 3 },
        ],
      },
    ],
  },
  {
    name: "CHAUFFAGE & CLIMATISATION",
    level: 1,
    children: [
      {
        name: "Chauffage stationnaire",
        level: 2,
        children: [
          { name: "Chauffage diesel (Webasto, Eberspächer, Autoterm...)", level: 3 },
          { name: "Chauffage gaz", level: 3 },
          { name: "Radiateur électrique", level: 3 },
        ],
      },
      {
        name: "Climatisation",
        level: 2,
        children: [
          { name: "Clim cabine (moteur)", level: 3 },
          { name: "Clim cellule (autonome)", level: 3 },
        ],
      },
      {
        name: "Ventilation",
        level: 2,
        children: [
          { name: "Lanterneau ventilé", level: 3 },
          { name: "Extracteurs d'air", level: 3 },
          { name: "Aérations", level: 3 },
        ],
      },
    ],
  },
  {
    name: "EAU & SANITAIRE",
    level: 1,
    children: [
      {
        name: "Eau propre",
        level: 2,
        children: [
          { name: "Réservoir eau propre", level: 3 },
          { name: "Pompe à eau", level: 3 },
          { name: "Filtres à eau", level: 3 },
          { name: "Tuyauterie & raccords", level: 3 },
        ],
      },
      {
        name: "Eau chaude",
        level: 2,
        children: [
          { name: "Chauffe-eau (Truma, gaz, électrique)", level: 3 },
          { name: "Serpentin échangeur", level: 3 },
        ],
      },
      {
        name: "Eaux usées",
        level: 2,
        children: [
          { name: "Réservoir eaux grises", level: 3 },
          { name: "Réservoir eaux noires", level: 3 },
          { name: "Vannes & vidanges", level: 3 },
        ],
      },
      {
        name: "Sanitaires",
        level: 2,
        children: [
          { name: "Toilettes (cassette, chimiques, sèches)", level: 3 },
          { name: "Douche", level: 3 },
          { name: "Robinetterie", level: 3 },
        ],
      },
    ],
  },
  {
    name: "GAZ & RÉFRIGÉRATION",
    level: 1,
    children: [
      {
        name: "Installation gaz",
        level: 2,
        children: [
          { name: "Bouteilles de gaz", level: 3 },
          { name: "Détendeur", level: 3 },
          { name: "Tuyauterie gaz", level: 3 },
          { name: "Contrôle étanchéité", level: 3 },
        ],
      },
      {
        name: "Réfrigération",
        level: 2,
        children: [
          { name: "Réfrigérateur (à compression, absorption)", level: 3 },
          { name: "Glacière électrique", level: 3 },
          { name: "Congélateur", level: 3 },
        ],
      },
      {
        name: "Cuisson",
        level: 2,
        children: [
          { name: "Plaques de cuisson (gaz, électrique)", level: 3 },
          { name: "Four", level: 3 },
          { name: "Micro-ondes", level: 3 },
        ],
      },
    ],
  },
  {
    name: "AMÉNAGEMENT INTÉRIEUR",
    level: 1,
    children: [
      {
        name: "Mobilier",
        level: 2,
        children: [
          { name: "Placards & rangements", level: 3 },
          { name: "Table", level: 3 },
          { name: "Assises", level: 3 },
          { name: "Plan de travail", level: 3 },
        ],
      },
      {
        name: "Couchage",
        level: 2,
        children: [
          { name: "Lit fixe", level: 3 },
          { name: "Banquette convertible", level: 3 },
          { name: "Lit pavillon", level: 3 },
          { name: "Matelas", level: 3 },
        ],
      },
      {
        name: "Revêtements",
        level: 2,
        children: [
          { name: "Sol (vinyle, parquet)", level: 3 },
          { name: "Murs & plafond", level: 3 },
          { name: "Rideaux & stores", level: 3 },
        ],
      },
      {
        name: "Isolation",
        level: 2,
        children: [
          { name: "Isolation thermique", level: 3 },
          { name: "Isolation phonique", level: 3 },
          { name: "Étanchéité", level: 3 },
        ],
      },
    ],
  },
  {
    name: "ÉQUIPEMENTS EXTÉRIEURS",
    level: 1,
    children: [
      {
        name: "Carrosserie",
        level: 2,
        children: [
          { name: "Peinture & vernis", level: 3 },
          { name: "Pare-chocs", level: 3 },
          { name: "Portières & hayon", level: 3 },
          { name: "Vitres & pare-brise", level: 3 },
        ],
      },
      {
        name: "Toiture",
        level: 2,
        children: [
          { name: "Lanterneau", level: 3 },
          { name: "Galerie de toit", level: 3 },
          { name: "Étanchéité toit", level: 3 },
          { name: "Antennes (TV, 4G, GPS)", level: 3 },
        ],
      },
      {
        name: "Accessoires de voyage",
        level: 2,
        children: [
          { name: "Auvent & store", level: 3 },
          { name: "Porte-vélos", level: 3 },
          { name: "Coffre de toit/arrière", level: 3 },
          { name: "Marchepied", level: 3 },
        ],
      },
      {
        name: "Attelage & remorque",
        level: 2,
        children: [
          { name: "Boule d'attelage", level: 3 },
          { name: "Prise électrique", level: 3 },
          { name: "Remorque", level: 3 },
        ],
      },
    ],
  },
  {
    name: "SÉCURITÉ & CONFORT",
    level: 1,
    children: [
      {
        name: "Sécurité passive",
        level: 2,
        children: [
          { name: "Extincteur", level: 3 },
          { name: "Détecteur gaz/CO", level: 3 },
          { name: "Détecteur fumée", level: 3 },
          { name: "Trousse premiers secours", level: 3 },
        ],
      },
      {
        name: "Sécurité active",
        level: 2,
        children: [
          { name: "Alarme", level: 3 },
          { name: "Antivol", level: 3 },
          { name: "Safe-lock portes", level: 3 },
        ],
      },
      {
        name: "Multimédia",
        level: 2,
        children: [
          { name: "Autoradio", level: 3 },
          { name: "Caméra de recul", level: 3 },
          { name: "TV/Satellite", level: 3 },
          { name: "Wifi/4G", level: 3 },
        ],
      },
    ],
  },
  {
    name: "ENTRETIEN COURANT",
    level: 1,
    children: [
      {
        name: "Révisions périodiques",
        level: 2,
        children: [
          { name: "Révision complète", level: 3 },
          { name: "Vidange moteur", level: 3 },
          { name: "Contrôle technique", level: 3 },
          { name: "Révision gaz (obligatoire)", level: 3 },
        ],
      },
      {
        name: "Nettoyage & entretien",
        level: 2,
        children: [
          { name: "Nettoyage extérieur", level: 3 },
          { name: "Nettoyage intérieur", level: 3 },
          { name: "Traitement carrosserie", level: 3 },
          { name: "Désinfection circuit eau", level: 3 },
        ],
      },
      {
        name: "Hivernage",
        level: 2,
        children: [
          { name: "Vidange circuits eau", level: 3 },
          { name: "Mise en hivernage", level: 3 },
          { name: "Bâchage", level: 3 },
          { name: "Entretien batteries", level: 3 },
        ],
      },
    ],
  },
  {
    name: "ADMINISTRATIF & DIVERS",
    level: 1,
    children: [
      {
        name: "Documents",
        level: 2,
        children: [
          { name: "Assurance", level: 3 },
          { name: "Carte grise", level: 3 },
          { name: "Contrôle technique", level: 3 },
        ],
      },
      {
        name: "Accessoires divers",
        level: 2,
        children: [
          { name: "Cales de roue", level: 3 },
          { name: "Câbles & rallonges", level: 3 },
          { name: "Tuyaux d'eau", level: 3 },
          { name: "Outils & pièces de rechange", level: 3 },
        ],
      },
    ],
  },
];

async function seedCategories() {
  try {
    // Connect to MongoDB
    const MONGODB_URI = process.env.MONGODB_URI;
    if (!MONGODB_URI) {
      throw new Error('MONGODB_URI not found in environment variables');
    }

    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Clear existing categories
    console.log('🗑️  Clearing existing categories...');
    await Category.deleteMany({});
    console.log('✅ Existing categories cleared');

    let totalInserted = 0;

    // Insert categories level by level
    for (const level1 of categoriesData) {
      console.log(`\n📁 Creating: ${level1.name}`);
      
      const cat1 = await Category.create({
        name: level1.name,
        level: 1,
        parentId: null,
        order: totalInserted + 1,
      });
      totalInserted++;

      if (level1.children) {
        for (const level2 of level1.children) {
          console.log(`  📂 Creating: ${level2.name}`);
          
          const cat2 = await Category.create({
            name: level2.name,
            level: 2,
            parentId: cat1._id,
            order: totalInserted + 1,
          });
          totalInserted++;

          if (level2.children) {
            for (const level3 of level2.children) {
              console.log(`    📄 Creating: ${level3.name}`);
              
              await Category.create({
                name: level3.name,
                level: 3,
                parentId: cat2._id,
                order: totalInserted + 1,
              });
              totalInserted++;
            }
          }
        }
      }
    }

    console.log(`\n✨ Successfully created ${totalInserted} categories!`);
    console.log('📊 Summary:');
    console.log(`   - Level 1: ${categoriesData.length} categories`);
    console.log(`   - Level 2: ${categoriesData.reduce((acc, cat) => acc + (cat.children?.length || 0), 0)} categories`);
    console.log(`   - Level 3: ${categoriesData.reduce((acc, cat1) => acc + (cat1.children?.reduce((acc2, cat2) => acc2 + (cat2.children?.length || 0), 0) || 0), 0)} categories`);
    
  } catch (error) {
    console.error('❌ Error seeding categories:', error);
    process.exit(1);
  } finally {
    await mongoose.connection.close();
    console.log('\n👋 Disconnected from MongoDB');
    process.exit(0);
  }
}

// Run the seeder
seedCategories();

