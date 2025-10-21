"use client";

import { useState, useEffect, useCallback } from "react";

interface UsePushNotificationsReturn {
  isSupported: boolean;
  isSubscribed: boolean;
  isLoading: boolean;
  permission: NotificationPermission;
  subscribe: () => Promise<boolean>;
  unsubscribe: () => Promise<boolean>;
  requestPermission: () => Promise<boolean>;
}

function urlBase64ToUint8Array(base64String: string): Uint8Array<ArrayBuffer> {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding)
    .replace(/\-/g, "+")
    .replace(/_/g, "/");

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray as Uint8Array<ArrayBuffer>;
}

export function usePushNotifications(): UsePushNotificationsReturn {
  const [isSupported, setIsSupported] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [permission, setPermission] = useState<NotificationPermission>("default");

  // Vérifier le support et l'état actuel
  useEffect(() => {
    if (typeof window === "undefined") return;

    const checkSupport = async () => {
      const supported =
        "serviceWorker" in navigator &&
        "PushManager" in window &&
        "Notification" in window;

      setIsSupported(supported);

      if (supported) {
        setPermission(Notification.permission);
        
        try {
          const registration = await navigator.serviceWorker.ready;
          const subscription = await registration.pushManager.getSubscription();
          setIsSubscribed(!!subscription);
        } catch (error) {
          console.error("Erreur lors de la vérification de la subscription:", error);
        }
      }

      setIsLoading(false);
    };

    checkSupport();
  }, []);

  // Demander la permission
  const requestPermission = useCallback(async (): Promise<boolean> => {
    if (!isSupported) {
      console.error("Les notifications push ne sont pas supportées");
      return false;
    }

    try {
      const result = await Notification.requestPermission();
      setPermission(result);
      return result === "granted";
    } catch (error) {
      console.error("Erreur lors de la demande de permission:", error);
      return false;
    }
  }, [isSupported]);

  // S'abonner aux notifications push
  const subscribe = useCallback(async (): Promise<boolean> => {
    if (!isSupported) {
      console.error("Les notifications push ne sont pas supportées");
      return false;
    }

    if (permission !== "granted") {
      const granted = await requestPermission();
      if (!granted) {
        return false;
      }
    }

    try {
      setIsLoading(true);

      // Récupérer la clé publique VAPID
      const response = await fetch("/api/user/push-subscription");
      
      if (!response.ok) {
        console.error("Erreur lors de la récupération de la clé VAPID:", response.status);
        throw new Error("Les notifications push ne sont pas configurées sur le serveur");
      }
      
      const data = await response.json();
      const { publicKey } = data;

      if (!publicKey) {
        console.error("Clé publique VAPID manquante dans la réponse");
        throw new Error("Clé publique VAPID non disponible");
      }
      
      console.log("Clé VAPID récupérée avec succès");

      // Enregistrer le service worker s'il n'est pas déjà enregistré
      let registration = await navigator.serviceWorker.getRegistration();
      
      if (!registration) {
        // next-pwa enregistre déjà le service worker, mais on s'assure qu'il est prêt
        registration = await navigator.serviceWorker.ready;
      }

      // Vérifier si déjà abonné
      let subscription = await registration.pushManager.getSubscription();
      
      if (!subscription) {
        console.log("Création d'une nouvelle subscription push...");
        // Créer une nouvelle subscription
        subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(publicKey),
        });
        console.log("Subscription créée:", subscription.endpoint.substring(0, 50) + "...");
      } else {
        console.log("Subscription existante trouvée");
      }

      // Envoyer la subscription au serveur
      const saveResponse = await fetch("/api/user/push-subscription", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          subscription: subscription.toJSON(),
          userAgent: navigator.userAgent,
        }),
      });

      if (!saveResponse.ok) {
        const errorData = await saveResponse.json();
        console.error("Erreur serveur lors de l'enregistrement:", errorData);
        throw new Error(errorData.error || "Erreur lors de l'enregistrement de la subscription");
      }

      console.log("✅ Subscription enregistrée avec succès sur le serveur");
      setIsSubscribed(true);
      return true;
    } catch (error) {
      console.error("❌ Erreur lors de l'abonnement:", error);
      alert(`Erreur: ${error instanceof Error ? error.message : "Impossible d'activer les notifications push"}`);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [isSupported, permission, requestPermission]);

  // Se désabonner des notifications push
  const unsubscribe = useCallback(async (): Promise<boolean> => {
    if (!isSupported) {
      return false;
    }

    try {
      setIsLoading(true);

      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();

      if (subscription) {
        // Supprimer la subscription du serveur
        await fetch("/api/user/push-subscription", {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            endpoint: subscription.endpoint,
          }),
        });

        // Désabonner localement
        await subscription.unsubscribe();
      }

      setIsSubscribed(false);
      return true;
    } catch (error) {
      console.error("Erreur lors du désabonnement:", error);
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [isSupported]);

  return {
    isSupported,
    isSubscribed,
    isLoading,
    permission,
    subscribe,
    unsubscribe,
    requestPermission,
  };
}

