"use client";

import Link from "next/link";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-black border-t border-white/10">
      <div className="container mx-auto px-4 lg:px-8 py-12">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          {/* Brand */}
          <div>
            <div className="mb-4">
              <img
                src="/images/logo/logo-icon-text-slogan-white.png"
                alt="PilotMyVan - Entretien de van simplifié"
                className="h-16 w-auto"
              />
            </div>
            <p className="text-white/70 text-sm">
              Parce que votre maison roulante mérite autant d&apos;attention que celle qui ne bouge pas.
              Ne perdez plus vos garanties, évitez les pannes, roulez sereinement.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-bold mb-4">Liens rapides</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <a
                  href="#features"
                  className="text-white/70 hover:text-orange transition-colors"
                >
                  Fonctionnalités
                </a>
              </li>
              <li>
                <a
                  href="#pricing"
                  className="text-white/70 hover:text-orange transition-colors"
                >
                  Tarifs
                </a>
              </li>
              <li>
                <Link
                  href="/login"
                  className="text-white/70 hover:text-orange transition-colors"
                >
                  Connexion
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="text-white font-bold mb-4">Légal</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  href="/mentions-legales"
                  className="text-white/70 hover:text-orange transition-colors"
                >
                  Mentions légales
                </Link>
              </li>
              <li>
                <Link
                  href="/cgv"
                  className="text-white/70 hover:text-orange transition-colors"
                >
                  CGV
                </Link>
              </li>
              <li>
                <Link
                  href="/politique-confidentialite"
                  className="text-white/70 hover:text-orange transition-colors"
                >
                  Politique de confidentialité
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Copyright */}
        <div className="text-center pt-6 border-t border-white/20">
          <p className="text-white/70 text-sm">
            &copy; {currentYear} PilotMyVan. Tous droits réservés.
          </p>
        </div>
      </div>
    </footer>
  );
}

