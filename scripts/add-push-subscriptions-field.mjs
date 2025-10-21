import mongoose from "mongoose";
import dotenv from "dotenv";

// Charger les variables d'environnement (essayer .env.local puis .env)
dotenv.config({ path: ".env.local" });
dotenv.config({ path: ".env" });

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error("❌ MONGODB_URI n'est pas défini dans .env.local");
  process.exit(1);
}

async function addPushSubscriptionsField() {
  try {
    console.log("🔄 Connexion à MongoDB...");
    await mongoose.connect(MONGODB_URI);
    console.log("✅ Connecté à MongoDB");

    const db = mongoose.connection.db;
    const usersCollection = db.collection("users");

    // Trouver tous les utilisateurs sans le champ pushSubscriptions
    const usersWithoutField = await usersCollection.countDocuments({
      pushSubscriptions: { $exists: false },
    });

    console.log(`\n📊 Utilisateurs sans pushSubscriptions: ${usersWithoutField}`);

    if (usersWithoutField === 0) {
      console.log("✅ Tous les utilisateurs ont déjà le champ pushSubscriptions");
      await mongoose.disconnect();
      return;
    }

    // Ajouter le champ pushSubscriptions à tous les utilisateurs qui ne l'ont pas
    const result = await usersCollection.updateMany(
      { pushSubscriptions: { $exists: false } },
      { $set: { pushSubscriptions: [] } }
    );

    console.log(`\n✅ Mise à jour effectuée :`);
    console.log(`   - ${result.modifiedCount} utilisateurs mis à jour`);
    console.log(`   - Champ ajouté: pushSubscriptions: []`);

    // Vérifier le résultat
    const totalUsers = await usersCollection.countDocuments({});
    const usersWithField = await usersCollection.countDocuments({
      pushSubscriptions: { $exists: true },
    });

    console.log(`\n📈 Résultat final :`);
    console.log(`   - Total utilisateurs: ${totalUsers}`);
    console.log(`   - Avec pushSubscriptions: ${usersWithField}`);

    await mongoose.disconnect();
    console.log("\n✅ Migration terminée avec succès !");
  } catch (error) {
    console.error("❌ Erreur lors de la migration:", error);
    await mongoose.disconnect();
    process.exit(1);
  }
}

addPushSubscriptionsField();

