"use client";

import { useEffect } from "react";
import { usePushNotifications } from "@/hooks/usePushNotifications";

export default function PWAInstallListener() {
  const { isSupported, isSubscribed, subscribe, requestPermission } = usePushNotifications();

  useEffect(() => {
    console.log("🔍 PWAInstallListener initialisé", {
      isSupported,
      isSubscribed,
    });

    // Détecter l'installation de la PWA
    const handleAppInstalled = async () => {
      console.log("🎉 PWA installée ! Demande d'activation des notifications...");

      // Attendre un peu pour que l'installation soit complète
      setTimeout(async () => {
        // Si déjà abonné, ne rien faire
        if (isSubscribed) {
          console.log("✅ Déjà abonné aux notifications push");
          return;
        }

        console.log("📱 Demande de permission pour les notifications...");
        
        // Demander la permission
        const granted = await requestPermission();
        
        if (granted) {
          console.log("✅ Permission accordée, abonnement...");
          // S'abonner automatiquement
          const success = await subscribe();
          
          if (success) {
            console.log("✅ Notifications push activées automatiquement !");
            
            // Optionnel : afficher une notification de confirmation
            if ('Notification' in window && Notification.permission === 'granted') {
              new Notification("🎉 PilotMyVan installé !", {
                body: "Vous recevrez maintenant des notifications pour vos entretiens",
                icon: "/icon.png",
                badge: "/icon.png",
              });
            }
          } else {
            console.error("❌ Échec de l'abonnement aux notifications push");
          }
        } else {
          console.log("❌ Permission de notification refusée");
        }
      }, 1000);
    };

    // Écouter l'événement d'installation
    window.addEventListener("appinstalled", handleAppInstalled);

    // Alternative : détecter le mode standalone au premier chargement
    const checkStandalone = async () => {
      const isStandalone = window.matchMedia("(display-mode: standalone)").matches;
      const hasAskedBefore = localStorage.getItem("push-permission-asked");
      
      console.log("🔍 Check standalone mode:", {
        isStandalone,
        hasAskedBefore,
        isSubscribed,
        isSupported,
      });
      
      if (isStandalone && !hasAskedBefore && !isSubscribed && isSupported) {
        console.log("📱 App en mode standalone, demande des notifications...");
        
        // Marquer comme déjà demandé
        localStorage.setItem("push-permission-asked", "true");
        
        // Attendre un peu pour que l'utilisateur voie l'interface
        setTimeout(async () => {
          console.log("📱 Demande de permission après délai...");
          const granted = await requestPermission();
          
          if (granted) {
            console.log("✅ Permission accordée, abonnement...");
            const success = await subscribe();
            
            if (success && 'Notification' in window && Notification.permission === 'granted') {
              new Notification("🎉 Bienvenue sur PilotMyVan !", {
                body: "Vous recevrez des notifications pour vos entretiens",
                icon: "/icon.png",
                badge: "/icon.png",
              });
            }
          } else {
            console.log("❌ Permission refusée par l'utilisateur");
          }
        }, 2000);
      }
    };

    checkStandalone();

    return () => {
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, [isSupported, isSubscribed, subscribe, requestPermission]);

  return null; // Composant invisible
}

