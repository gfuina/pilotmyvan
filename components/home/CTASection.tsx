"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";

export function CTASection() {
  return (
    <section className="py-24 lg:py-32 bg-gradient-to-br from-black via-dark-gray to-black relative overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/images/cta-van-road.jpg"
          alt="Van sur la route"
          fill
          className="object-cover opacity-10"
          quality={90}
        />
      </div>

      {/* Decorative elements */}
      <div className="absolute top-20 left-20 w-96 h-96 bg-orange/20 rounded-full blur-3xl" />
      <div className="absolute bottom-20 right-20 w-96 h-96 bg-orange-light/20 rounded-full blur-3xl" />

      <div className="container mx-auto px-4 lg:px-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="max-w-4xl mx-auto text-center"
        >
          <h2 className="text-4xl lg:text-5xl xl:text-6xl font-bold text-white mb-6">
            Partez{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange to-orange-light">
              l&apos;esprit tranquille
            </span>
          </h2>
          <p className="text-lg lg:text-xl text-white/80 mb-10 max-w-2xl mx-auto">
              Plus jamais de panne évitable. Plus jamais de garantie perdue pour un entretien oublié.
              Juste vous, la route, et votre maison qui roule nickel.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link
              href="/signup"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-orange to-orange-light text-white font-bold text-lg rounded-2xl hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-orange/50"
            >
              Commencer maintenant
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
                  d="M13 7l5 5m0 0l-5 5m5-5H6"
                />
              </svg>
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-black font-bold text-lg rounded-2xl hover:bg-gray-100 transition-all duration-300"
            >
              Se connecter
            </Link>
          </div>

          <div className="mt-12 flex flex-wrap items-center justify-center gap-8 text-white/60 text-sm">
            <div className="flex items-center gap-2">
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
                  d="M5 13l4 4L19 7"
                />
              </svg>
              <span>100% gratuit en béta</span>
            </div>
            <div className="flex items-center gap-2">
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
                  d="M5 13l4 4L19 7"
                />
              </svg>
              <span>Sans carte bancaire</span>
            </div>
            <div className="flex items-center gap-2">
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
                  d="M5 13l4 4L19 7"
                />
              </svg>
              <span>Avantages béta à vie</span>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

