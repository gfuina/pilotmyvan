/**
 * Script de test pour le système de notifications
 * Usage: node scripts/test-notifications.mjs
 */

import "dotenv/config";

const CRON_SECRET = process.env.CRON_SECRET || "test-secret";
const API_URL = process.env.NEXTAUTH_URL || "http://localhost:3000";

async function testNotificationCron() {
  console.log("🚀 Test du système de notifications\n");
  console.log(`📍 URL: ${API_URL}/api/cron/send-maintenance-notifications`);
  console.log(`🔐 CRON_SECRET: ${CRON_SECRET.substring(0, 10)}...\n`);

  try {
    const response = await fetch(
      `${API_URL}/api/cron/send-maintenance-notifications`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${CRON_SECRET}`,
          "Content-Type": "application/json",
        },
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error("❌ Erreur:", data);
      return;
    }

    console.log("✅ Cron job exécuté avec succès!\n");
    console.log("📊 Résultats:");
    console.log(`   - Utilisateurs traités: ${data.results.totalUsers}`);
    console.log(`   - Notifications totales: ${data.results.totalNotifications}`);
    console.log(`   - Emails envoyés: ${data.results.successfulEmails}`);
    console.log(`   - Emails échoués: ${data.results.failedEmails}`);

    if (data.results.errors && data.results.errors.length > 0) {
      console.log("\n⚠️  Erreurs:");
      data.results.errors.forEach((error, index) => {
        console.log(`   ${index + 1}. ${error}`);
      });
    }

    console.log(`\n⏰ Timestamp: ${data.timestamp}`);
  } catch (error) {
    console.error("❌ Erreur lors de l'appel:", error.message);
  }
}

// Exécuter le test
testNotificationCron();

