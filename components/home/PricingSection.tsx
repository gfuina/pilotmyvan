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
      name: "Gratuit",
      price: "0€",
      period: "/mois",
      description: "Pour commencer l'aventure",
      features: [
        "1 véhicule",
        "5 équipements maximum",
        "Rappels par email",
        "Historique complet",
        "Support communautaire",
      ],
      cta: "Commencer gratuitement",
      highlighted: false,
    },
    {
      name: "Pro",
      price: "2,99€",
      period: "/mois",
      description: "Pour les nomades confirmés",
      features: [
        "Véhicules illimités",
        "Équipements illimités",
        "Rappels intelligents",
        "Historique complet",
        "Export PDF",
        "Statistiques avancées",
        "Support prioritaire",
      ],
      cta: "Passer à Pro",
      highlighted: true,
      badge: "Recommandé",
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
            Un prix{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange to-orange-light">
              adapté à vos besoins
            </span>
          </h2>
          <p className="text-lg text-gray max-w-3xl mx-auto">
            Commencez gratuitement, évoluez à votre rythme.
            Parce que la liberté, c&apos;est aussi de choisir sans engagement.
          </p>
        </motion.div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {plans.map((plan, index) => (
            <motion.div
              key={index}
              {...animation}
              transition={{ delay: index * 0.1, duration: 0.6 }}
              className={`relative bg-white rounded-3xl p-8 border-2 transition-all duration-300 ${
                plan.highlighted
                  ? "border-orange shadow-2xl scale-105 md:scale-110"
                  : "border-gray-200 hover:border-orange/50 hover:shadow-xl"
              }`}
            >
              {plan.badge && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <span className="inline-block px-4 py-1.5 bg-gradient-to-r from-orange to-orange-light text-white font-bold text-xs rounded-full shadow-lg">
                    {plan.badge}
                  </span>
                </div>
              )}

              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold text-black mb-2">
                  {plan.name}
                </h3>
                <p className="text-sm text-gray mb-4">{plan.description}</p>
                <div className="flex items-baseline justify-center gap-1">
                  <span className="text-5xl font-bold text-black">
                    {plan.price}
                  </span>
                  <span className="text-gray">{plan.period}</span>
                </div>
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
                    <span className="text-sm text-gray">{feature}</span>
                  </li>
                ))}
              </ul>

              <Link
                href="/signup"
                className={`block w-full py-3 px-6 text-center font-bold rounded-2xl transition-all duration-300 ${
                  plan.highlighted
                    ? "bg-gradient-to-r from-orange to-orange-light text-white hover:shadow-lg hover:scale-105"
                    : "bg-black text-white hover:bg-gray-800"
                }`}
              >
                {plan.cta}
              </Link>
            </motion.div>
          ))}
        </div>

        {/* FAQ Link */}
        <motion.div
          {...animation}
          className="text-center mt-12"
        >
          <p className="text-gray">
            Des questions sur nos tarifs ?{" "}
            <a href="#faq" className="text-orange hover:text-orange-dark font-semibold">
              Consultez notre FAQ
            </a>
          </p>
        </motion.div>
      </div>
    </section>
  );
}

