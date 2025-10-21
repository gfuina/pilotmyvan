import webpush from "web-push";

console.log("🔐 Génération des clés VAPID pour les notifications push...\n");

const vapidKeys = webpush.generateVAPIDKeys();

console.log("✅ Clés générées avec succès !\n");
console.log("📋 Ajoutez ces variables à votre fichier .env :\n");
console.log("VAPID_PUBLIC_KEY=" + vapidKeys.publicKey);
console.log("VAPID_PRIVATE_KEY=" + vapidKeys.privateKey);
console.log("VAPID_EMAIL=contact@pilotmyvan.com");
console.log("\n");
console.log("⚠️  IMPORTANT :");
console.log("- Gardez la clé privée (VAPID_PRIVATE_KEY) secrète");
console.log("- La clé publique (VAPID_PUBLIC_KEY) est utilisée côté client");
console.log("- Ne committez JAMAIS ces clés dans Git");
console.log("- Ajoutez-les aussi dans vos variables d'environnement Vercel");

