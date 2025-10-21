"use client";

import { motion } from "framer-motion";
import { useIsMobile } from "@/hooks/useIsMobile";
import { getAnimation } from "@/lib/animations";
import Link from "next/link";

export function PricingSection() {
  const isMobile = useIsMobile();
  const animation = getAnimation(isMobile);

  const plans = [
    {
      name: "Testeur Béta",
      price: "0€",
      period: "",
      description: "Toutes les fonctionnalités, pour toujours",
      features: [
        "Autant de véhicules que vous voulez",
        "Tous vos équipements (frigo, chauffage, batterie...)",
        "Rappels automatiques avant qu'il soit trop tard",
        "Calcul auto de vos prochaines vidanges & révisions",
        "Vos pleins et votre conso, pour budgétiser vos trips",
        "Toutes vos factures et photos au même endroit",
        "Base de maintenances par équipement",
        "Mise à jour kilométrage ultra rapide",
      ],
      cta: "Je teste gratuitement",
      highlighted: true,
      badge: "100% Gratuit",
      betaNote: "🎁 Vous gardez tout gratuitement, même après la béta !",
    },
  ];

  return (
    <section id="pricing" className="py-24 lg:py-32 bg-gradient-to-b from-white to-gray-50 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute top-20 right-0 w-96 h-96 bg-orange/10 rounded-full blur-3xl" />
      <div className="absolute bottom-20 left-0 w-96 h-96 bg-orange-light/10 rounded-full blur-3xl" />

      <div className="container mx-auto px-4 lg:px-8 relative z-10">
        {/* Section Header */}
        <motion.div {...animation} className="text-center mb-16">
          <span className="inline-block px-5 py-2.5 bg-gradient-to-r from-orange/10 to-orange-light/10 text-orange font-bold text-sm rounded-2xl mb-4">
            Tarifs
          </span>
          <h2 className="text-4xl lg:text-5xl font-bold text-black mb-6">
            Rejoignez l&apos;aventure{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange to-orange-light">
              gratuitement
            </span>
          </h2>
          <p className="text-lg text-gray max-w-3xl mx-auto">
            On lance la béta et on a besoin de vous pour la tester. En échange de vos retours,
            vous gardez gratuitement toutes les fonctionnalités à vie. Deal ?
          </p>
        </motion.div>

        {/* Pricing Cards */}
        <div className="max-w-2xl mx-auto">
          {plans.map((plan, index) => (
            <motion.div
              key={index}
              {...animation}
              transition={{ delay: index * 0.1, duration: 0.6 }}
              className="relative bg-white rounded-3xl p-8 lg:p-10 border-2 border-orange shadow-2xl"
            >
              {plan.badge && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <span className="inline-flex items-center gap-2 px-4 py-1.5 bg-gradient-to-r from-orange to-orange-light text-white font-bold text-xs rounded-full shadow-lg">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75" />
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-white" />
                    </span>
                    {plan.badge}
                  </span>
                </div>
              )}

              <div className="text-center mb-6">
                <h3 className="text-3xl font-bold text-black mb-2">
                  {plan.name}
                </h3>
                <p className="text-sm text-gray mb-4">{plan.description}</p>
                <div className="flex items-baseline justify-center gap-1 mb-4">
                  <span className="text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-orange to-orange-light">
                    {plan.price}
                  </span>
                  {plan.period && <span className="text-gray">{plan.period}</span>}
                </div>
                {plan.betaNote && (
                  <div className="inline-block px-4 py-2 bg-orange-50 border border-orange-200 rounded-xl">
                    <p className="text-sm font-semibold text-orange-900">
                      {plan.betaNote}
                    </p>
                  </div>
                )}
              </div>

              <ul className="space-y-3 mb-8">
                {plan.features.map((feature, idx) => (
                  <li key={idx} className="flex items-start gap-3">
                    <svg
                      className="w-5 h-5 text-orange flex-shrink-0 mt-0.5"
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
                    <span className="text-sm text-gray font-medium">{feature}</span>
                  </li>
                ))}
              </ul>

              <Link
                href="/signup"
                className="block w-full py-4 px-6 text-center font-bold text-lg rounded-2xl bg-gradient-to-r from-orange to-orange-light text-white hover:shadow-lg hover:scale-105 transition-all duration-300"
              >
                {plan.cta}
              </Link>
            </motion.div>
          ))}
        </div>

        {/* Future Plans Notice */}
        <motion.div
          {...animation}
          className="mt-12 max-w-2xl mx-auto bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-6 border border-gray-200"
        >
          <div className="flex items-start gap-4">
            <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center flex-shrink-0">
              <svg
                className="w-5 h-5 text-orange"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <div>
              <h4 className="font-bold text-black mb-2">Et si un jour c&apos;est payant ?</h4>
              <p className="text-sm text-gray">
                On prévoit des abonnements pour financer les nouvelles fonctionnalités (mode hors-ligne, export PDF pour l&apos;assurance...).
                Mais promis : <span className="font-semibold text-black">si vous rejoignez la béta aujourd&apos;hui, vous gardez tout gratuitement pour toujours</span>.
                C&apos;est notre façon de dire merci aux premiers aventuriers.
              </p>
            </div>
          </div>
        </motion.div>

      </div>
    </section>
  );
}

