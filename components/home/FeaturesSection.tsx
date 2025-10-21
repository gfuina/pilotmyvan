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
            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
          />
        </svg>
      ),
      title: "Ne ratez plus jamais une révision",
      description:
        "Définissez vos entretiens en kilomètres ou en mois, et laissez PilotMyVan calculer pour vous. Vidange tous les 15 000 km ? Contrôle gaz annuel ? On vous le rappelle pile au bon moment.",
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
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
          />
        </svg>
      ),
      title: "Des rappels qui s'adaptent",
      description:
        "Un petit mail une semaine avant, puis 3 jours avant. En retard ? On devient plus insistant. Très en retard ? Alerte rouge, parce que votre garantie constructeur ne rigole pas avec les entretiens oubliés.",
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
      title: "Combien vous coûte votre liberté ?",
      description:
        "Notez vos pleins et découvrez votre conso réelle. Ça vous aide à budgétiser vos voyages et à détecter si quelque chose cloche (surconsommation = problème moteur à venir).",
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
            d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
          />
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
          />
        </svg>
      ),
      title: "Tout ce qui fait votre maison",
      description:
        "Chauffage Webasto, frigo Dometic, panneau solaire, batteries... Chaque équipement a ses propres besoins d'entretien. On vous dit quoi faire et quand, avec les instructions détaillées.",
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
      title: "Prouvez que vous entretenez bien",
      description:
        "Factures perdues, garantie remise en question ? Gardez tout au même endroit : dates, photos, combien ça a coûté. Si un jour vous revendez, votre carnet d'entretien digital fera la différence.",
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
            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
          />
        </svg>
      ),
      title: "Toutes vos maisons roulantes",
      description:
        "Van pour le quotidien, camping-car pour les longs trips ? Gardez un œil sur tout votre parc, avec photos et historique distinct pour chacun. Tout au même endroit.",
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
            Prenez soin de votre maison,{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange to-orange-light">
              même sur roues
            </span>
          </h2>
          <p className="text-lg text-gray max-w-3xl mx-auto">
            Parce qu&apos;oublier un entretien, c&apos;est risquer une panne au milieu de nulle part,
            perdre sa garantie ou transformer un road trip de rêve en galère.
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
                  Pas besoin d&apos;être{" "}
                  <span className="text-orange">mécanicien pour comprendre</span>
                </h3>
                <p className="text-white/80 mb-6">
                  Simple comme bonjour. Pas de jargon technique. Juste ce qu&apos;il faut savoir,
                  au bon moment. Parce que vous préférez profiter du coucher de soleil plutôt que
                  de chercher dans vos carnets d&apos;entretien.
                </p>
                <ul className="space-y-3">
                  {[
                    "Ce qui est vraiment urgent en un coup d'œil",
                    "Ajoutez votre kilométrage en 10 secondes",
                    "Rouge = vraiment en retard, vert = nickel",
                    "Instructions pas-à-pas pour chaque entretien",
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
              <div className="relative aspect-[4/3] lg:aspect-square rounded-2xl overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-orange/20 to-orange-light/20 z-10 pointer-events-none" />
                <Image
                  src="/images/app-screenshot.png"
                  alt="Aperçu de l'application PilotMyVan"
                  fill
                  className="object-cover object-left"
                />
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

