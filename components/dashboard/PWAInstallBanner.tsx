"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export default function PWAInstallBanner() {
  const [isVisible, setIsVisible] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);

  useEffect(() => {
    // Vérifier si le bandeau a déjà été fermé
    const bannerDismissed = localStorage.getItem("pwa-banner-dismissed");
    if (bannerDismissed === "true") {
      return;
    }

    // Vérifier si l'app est déjà installée
    const isStandalone = window.matchMedia(
      "(display-mode: standalone)"
    ).matches;
    if (isStandalone) {
      return;
    }

    // Détecter le type d'appareil
    const userAgent = window.navigator.userAgent.toLowerCase();
    const ios = /iphone|ipad|ipod/.test(userAgent);
    const android = /android/.test(userAgent);

    setIsIOS(ios);

    // Si c'est iOS ou Android, afficher le bandeau
    if (ios || android) {
      setIsVisible(true);
    }

    // Écouter l'événement beforeinstallprompt (Android/Desktop)
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setIsVisible(true);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener(
        "beforeinstallprompt",
        handleBeforeInstallPrompt
      );
    };
  }, []);

  const handleDismiss = () => {
    setIsVisible(false);
    localStorage.setItem("pwa-banner-dismissed", "true");
  };

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === "accepted") {
      setDeferredPrompt(null);
      setIsVisible(false);
      localStorage.setItem("pwa-banner-dismissed", "true");
    }
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="bg-gradient-to-r from-orange to-orange-light text-white shadow-lg"
        >
          <div className="container mx-auto px-4 lg:px-8 py-4">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 mt-1">
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"
                  />
                </svg>
              </div>

              <div className="flex-1">
                <h3 className="font-bold text-lg mb-1">
                  Installez PilotMyVan sur votre téléphone 📱
                </h3>

                {isIOS ? (
                  <div className="text-sm space-y-1">
                    <p>
                      Accédez à votre van où que vous soyez, même hors
                      connexion :
                    </p>
                    <ol className="list-decimal list-inside space-y-1 mt-2">
                      <li>
                        Appuyez sur le bouton{" "}
                        <span className="inline-flex items-center mx-1">
                          <svg
                            className="w-4 h-4"
                            fill="currentColor"
                            viewBox="0 0 50 50"
                          >
                            <path d="M30.3 13.7L25 8.4l-5.3 5.3-1.4-1.4L25 5.6l6.7 6.7z" />
                            <path d="M24 7h2v21h-2z" />
                            <path d="M35 40H15c-1.7 0-3-1.3-3-3V19c0-1.7 1.3-3 3-3h7v2h-7c-.6 0-1 .4-1 1v18c0 .6.4 1 1 1h20c.6 0 1-.4 1-1V19c0-.6-.4-1-1-1h-7v-2h7c1.7 0 3 1.3 3 3v18c0 1.7-1.3 3-3 3z" />
                          </svg>
                        </span>{" "}
                        (Partager) en bas de Safari
                      </li>
                      <li>
                        Sélectionnez &quot;Sur l&apos;écran
                        d&apos;accueil&quot;
                      </li>
                      <li>Appuyez sur &quot;Ajouter&quot;</li>
                    </ol>
                  </div>
                ) : deferredPrompt ? (
                  <div className="text-sm">
                    <p className="mb-3">
                      Accédez à votre van où que vous soyez, même hors
                      connexion.
                    </p>
                    <button
                      onClick={handleInstallClick}
                      className="px-4 py-2 bg-white text-orange font-semibold rounded-xl hover:bg-gray-100 transition-colors"
                    >
                      Installer l&apos;application
                    </button>
                  </div>
                ) : (
                  <div className="text-sm space-y-1">
                    <p>
                      Accédez à votre van où que vous soyez, même hors
                      connexion :
                    </p>
                    <ol className="list-decimal list-inside space-y-1 mt-2">
                      <li>Ouvrez le menu de votre navigateur (⋮)</li>
                      <li>
                        Sélectionnez &quot;Installer l&apos;application&quot; ou
                        &quot;Ajouter à l&apos;écran d&apos;accueil&quot;
                      </li>
                    </ol>
                  </div>
                )}
              </div>

              <button
                onClick={handleDismiss}
                className="flex-shrink-0 p-1 hover:bg-white/20 rounded-lg transition-colors"
                aria-label="Fermer"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

