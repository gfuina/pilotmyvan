#!/usr/bin/env node

/**
 * Script de diagnostic pour les notifications push
 * Vérifie que tout est bien configuré
 */

import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import { existsSync } from "fs";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Charger .env.local
const envPath = join(__dirname, "..", ".env.local");
if (existsSync(envPath)) {
  dotenv.config({ path: envPath });
  console.log("✅ .env.local trouvé et chargé");
} else {
  console.log("⚠️  .env.local non trouvé (normal si tu utilises d'autres variables d'env)");
}

console.log("\n🔍 Diagnostic Push Notifications\n");

// Vérifier les variables VAPID
const checks = {
  "VAPID_PUBLIC_KEY": process.env.VAPID_PUBLIC_KEY,
  "VAPID_PRIVATE_KEY": process.env.VAPID_PRIVATE_KEY,
  "VAPID_EMAIL": process.env.VAPID_EMAIL,
};

let allGood = true;

Object.entries(checks).forEach(([key, value]) => {
  if (value) {
    console.log(`✅ ${key}: ${key.includes("PRIVATE") ? "***" + value.slice(-10) : value.slice(0, 20) + "..."}`);
  } else {
    console.log(`❌ ${key}: MANQUANT`);
    allGood = false;
  }
});

console.log("\n" + "=".repeat(60) + "\n");

if (allGood) {
  console.log("✅ Toutes les variables VAPID sont présentes!\n");
  console.log("📱 Prochaines étapes:\n");
  console.log("1. Build en mode production:");
  console.log("   npm run build && npm start");
  console.log("");
  console.log("2. Sur Vercel, ajoute les mêmes variables:");
  console.log("   Settings → Environment Variables");
  console.log("");
  console.log("3. Test dans la PWA:");
  console.log("   - Ouvre la console");
  console.log("   - Tape: localStorage.removeItem('push-permission-asked')");
  console.log("   - Recharge la page");
  console.log("   - Tu devrais voir la demande de permission");
  console.log("");
  console.log("4. OU utilise le toggle manuel:");
  console.log("   Dashboard → Notifications d'entretien → Toggle Push");
} else {
  console.log("❌ Configuration incomplète!\n");
  console.log("Ajoute ces variables à ton .env.local:\n");
  console.log("VAPID_PUBLIC_KEY=ta_clé_publique");
  console.log("VAPID_PRIVATE_KEY=ta_clé_privée");
  console.log("VAPID_EMAIL=contact@pilotmyvan.com");
  console.log("");
  console.log("Pour générer les clés:");
  console.log("npm run generate-vapid");
}

console.log("\n" + "=".repeat(60) + "\n");

// Info sur le mode dev
console.log("⚠️  RAPPEL IMPORTANT:");
console.log("Le service worker est DÉSACTIVÉ en mode dev (npm run dev)");
console.log("Pour tester les push, tu DOIS utiliser:");
console.log("  • npm run build && npm start (local prod)");
console.log("  • OU déployer sur Vercel");
console.log("");

