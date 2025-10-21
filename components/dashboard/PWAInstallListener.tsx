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
      const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
      const isSecureContext = window.isSecureContext;
      const notificationPermission = typeof Notification !== 'undefined' ? Notification.permission : 'default';
      
      console.log("🔍 Check standalone mode:", {
        isStandalone,
        hasAskedBefore,
        isSubscribed,
        isSupported,
        isIOS,
        isSecureContext,
        href: window.location.href,
        notificationPermission,
      });
      
      // Sur iOS, vérifier HTTPS
      if (isIOS && !isSecureContext) {
        console.warn("⚠️ iOS nécessite HTTPS pour les notifications push");
        console.warn("⚠️ Utilisez https://localhost ou déployez sur Vercel pour tester");
        return;
      }
      
      // Réinitialiser le flag si la permission est "default" (jamais demandée vraiment)
      // Cela permet de redemander si l'utilisateur a fermé le popup sans répondre
      if (hasAskedBefore && notificationPermission === "default" && !isSubscribed) {
        console.log("🔄 Reset du flag car permission jamais accordée");
        localStorage.removeItem("push-permission-asked");
      }
      
      const shouldAskPermission = isStandalone && 
                                  !isSubscribed && 
                                  isSupported && 
                                  notificationPermission === "default" &&
                                  !hasAskedBefore;
      
      if (shouldAskPermission) {
        console.log("📱 App en mode standalone, demande des notifications...");
        
        // Marquer comme déjà demandé
        localStorage.setItem("push-permission-asked", "true");
        
        // Attendre un peu pour que l'utilisateur voie l'interface
        setTimeout(async () => {
          console.log("📱 Demande de permission après délai...");
          
          try {
            const granted = await requestPermission();
            
            if (granted) {
              console.log("✅ Permission accordée, abonnement...");
              const success = await subscribe();
              
              if (success && 'Notification' in window && Notification.permission === 'granted') {
                new Notification("🎉 Bienvenue sur PMV !", {
                  body: "Vous recevrez des notifications pour vos entretiens",
                  icon: "/icon.png",
                  badge: "/icon.png",
                });
              }
            } else {
              console.log("❌ Permission refusée par l'utilisateur");
            }
          } catch (error) {
            console.error("❌ Erreur lors de la demande de permission:", error);
          }
        }, 2000);
      } else {
        console.log("ℹ️ Pas de demande de notif:", {
          raison: !isStandalone ? "Pas en mode standalone" : 
                  isSubscribed ? "Déjà abonné" :
                  !isSupported ? "Non supporté" :
                  notificationPermission !== "default" ? `Permission déjà ${notificationPermission}` :
                  hasAskedBefore ? "Déjà demandé" : "Autre"
        });
      }
    };

    checkStandalone();

    return () => {
      window.removeEventListener("appinstalled", handleAppInstalled);
    };
  }, [isSupported, isSubscribed, subscribe, requestPermission]);

  return null; // Composant invisible
}

