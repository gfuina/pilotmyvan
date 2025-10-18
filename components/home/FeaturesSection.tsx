"use client";

import { motion } from "framer-motion";
import { useIsMobile } from "@/hooks/useIsMobile";
import { getAnimation } from "@/lib/animations";
import Image from "next/image";

export function FeaturesSection() {
  const isMobile = useIsMobile();
  const animation = getAnimation(isMobile);

  const features = [
    {
      icon: (
        <svg
          className="w-8 h-8"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
          />
        </svg>
      ),
      title: "Rappels intelligents",
      description:
        "Restez serein sur la route : recevez des notifications pour prendre soin de votre maison roulante au bon moment.",
    },
    {
      icon: (
        <svg
          className="w-8 h-8"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
          />
        </svg>
      ),
      title: "Historique complet",
      description:
        "Gardez précieusement la mémoire de votre van avec dates, photos et factures de chaque entretien.",
    },
    {
      icon: (
        <svg
          className="w-8 h-8"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"
          />
        </svg>
      ),
      title: "Tous vos équipements",
      description:
        "Moteur, frigo, chauffage, panneaux solaires... Chaque élément de votre home sweet home est important.",
    },
    {
      icon: (
        <svg
          className="w-8 h-8"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
          />
        </svg>
      ),
      title: "Budget maîtrisé",
      description:
        "Anticipez vos dépenses pour rouler sans stress et profiter pleinement de votre aventure.",
    },
    {
      icon: (
        <svg
          className="w-8 h-8"
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
      ),
      title: "Toujours avec vous",
      description:
        "Où que la route vous mène, vos données vous suivent. Disponible sur iOS et Android.",
    },
    {
      icon: (
        <svg
          className="w-8 h-8"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z"
          />
        </svg>
      ),
      title: "Vos données protégées",
      description:
        "Sauvegarde automatique et synchronisation en temps réel. Votre historique est en sécurité.",
    },
  ];

  return (
    <section id="features" className="py-24 lg:py-32 bg-white relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute top-0 left-0 w-1/3 h-1/3 bg-orange/5 rounded-full blur-3xl" />
      <div className="absolute bottom-0 right-0 w-1/4 h-1/4 bg-orange-light/5 rounded-full blur-3xl" />

      <div className="container mx-auto px-4 lg:px-8 relative z-10">
        {/* Section Header */}
        <motion.div {...animation} className="text-center mb-16">
          <span className="inline-block px-5 py-2.5 bg-gradient-to-r from-orange/10 to-orange-light/10 text-orange font-bold text-sm rounded-2xl mb-4">
            Fonctionnalités
          </span>
          <h2 className="text-4xl lg:text-5xl font-bold text-black mb-6">
            Tout ce dont vous avez besoin pour{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange to-orange-light">
              vivre sereinement
            </span>
          </h2>
          <p className="text-lg text-gray max-w-3xl mx-auto">
            Des fonctionnalités pensées pour les vanlifers qui veulent profiter de
            la route sans se soucier des imprévus.
          </p>
        </motion.div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              {...animation}
              transition={{ delay: index * 0.1, duration: 0.6 }}
              className="group bg-white p-8 rounded-3xl border border-gray-200 hover:border-orange/50 hover:shadow-xl transition-all duration-300"
            >
              <div className="w-16 h-16 bg-gradient-to-br from-orange to-orange-light rounded-2xl flex items-center justify-center text-white mb-6 group-hover:scale-110 transition-transform duration-300">
                {feature.icon}
              </div>
              <h3 className="text-xl font-bold text-black mb-3">
                {feature.title}
              </h3>
              <p className="text-gray leading-relaxed">{feature.description}</p>
            </motion.div>
          ))}
        </div>

        {/* App Preview */}
        <motion.div
          {...animation}
          className="mt-20 relative"
        >
          <div className="bg-gradient-to-br from-black to-dark-gray rounded-3xl p-8 lg:p-12 shadow-2xl overflow-hidden">
            <div className="grid lg:grid-cols-2 gap-8 items-center">
              <div>
                <h3 className="text-3xl lg:text-4xl font-bold text-white mb-6">
                  Une interface{" "}
                  <span className="text-orange">pensée pour la route</span>
                </h3>
                <p className="text-white/80 mb-6">
                  Simple, rapide, même avec un réseau faible. Parce que votre temps
                  est précieux et la vraie vie est dehors, pas dans une app.
                </p>
                <ul className="space-y-3">
                  {[
                    "Dashboard personnalisé",
                    "Navigation rapide",
                    "Mode hors ligne",
                    "Export PDF",
                  ].map((item, index) => (
                    <li key={index} className="flex items-center gap-3 text-white/90">
                      <svg
                        className="w-5 h-5 text-orange flex-shrink-0"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="relative aspect-[4/3] lg:aspect-square">
                <div className="absolute inset-0 bg-gradient-to-br from-orange/20 to-orange-light/20 rounded-2xl" />
                <Image
                  src="/images/app-screenshot.png"
                  alt="Aperçu de l'application PilotMyVan"
                  fill
                  className="object-contain p-4"
                />
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

