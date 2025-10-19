/**
 * Script de test pour le système de notifications
 * Usage: node scripts/test-notifications.mjs [type]
 * 
 * Types: 
 *   - upcoming (default): Test les notifications avant échéance
 *   - overdue: Test les notifications de retard
 *   - both: Test les deux types
 */

import "dotenv/config";

const CRON_SECRET = process.env.CRON_SECRET || "test-secret";
const API_URL = process.env.NEXTAUTH_URL || "http://localhost:3000";

const testType = process.argv[2] || "upcoming";

async function testUpcomingNotifications() {
  console.log("\n📅 Test des notifications AVANT échéance\n");
  console.log(`📍 URL: ${API_URL}/api/cron/send-maintenance-notifications`);

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

async function testOverdueNotifications() {
  console.log("\n🚨 Test des notifications EN RETARD\n");
  console.log(`📍 URL: ${API_URL}/api/cron/send-overdue-notifications`);

  try {
    const response = await fetch(
      `${API_URL}/api/cron/send-overdue-notifications`,
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

    console.log("✅ Cron job de retard exécuté avec succès!\n");
    console.log("📊 Résultats:");
    console.log(`   - Utilisateurs traités: ${data.results.totalUsers}`);
    console.log(`   - Maintenances en retard: ${data.results.totalOverdueMaintenances}`);
    console.log(`   - Notifications envoyées: ${data.results.totalNotifications}`);
    console.log(`   - Emails envoyés: ${data.results.successfulEmails}`);
    console.log(`   - Emails échoués: ${data.results.failedEmails}`);
    
    console.log("\n📈 Répartition par urgence:");
    console.log(`   - ⚠️  Warning (1-6j): ${data.results.breakdown.warning}`);
    console.log(`   - 🔥 Urgent (7-29j): ${data.results.breakdown.urgent}`);
    console.log(`   - 🚨 Critique (30+j): ${data.results.breakdown.critical}`);

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

// Exécuter les tests selon le type
console.log("🚀 Test du système de notifications");
console.log(`🔐 CRON_SECRET: ${CRON_SECRET.substring(0, 10)}...\n`);
console.log("═".repeat(60));

async function runTests() {
  if (testType === "upcoming" || testType === "both") {
    await testUpcomingNotifications();
  }

  if (testType === "overdue" || testType === "both") {
    if (testType === "both") {
      console.log("\n" + "═".repeat(60));
    }
    await testOverdueNotifications();
  }

  console.log("\n" + "═".repeat(60));
  console.log("\n✨ Tests terminés!\n");
}

runTests();

