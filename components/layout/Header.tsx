"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { usePathname } from "next/navigation";

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const pathname = usePathname();
  const isHomepage = pathname === "/";

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const menuItems = [
    { label: "Fonctionnalités", href: "#features" },
    { label: "Tarifs", href: "#pricing" },
    { label: "FAQ", href: "#faq" },
  ];

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        isScrolled || !isHomepage
          ? "bg-black shadow-lg py-3"
          : "bg-transparent py-4"
      }`}
    >
      <div className="container mx-auto px-4 lg:px-8">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="relative z-10 flex items-center group">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-gradient-to-br from-orange to-orange-light rounded-2xl flex items-center justify-center transform group-hover:rotate-12 transition-transform duration-300">
                <svg
                  className="w-6 h-6 text-white"
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
              </div>
              <span className="text-xl font-bold text-white">
                Pilot<span className="text-orange">My</span>Van
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-1 xl:space-x-2">
            {menuItems.map((item, index) => (
              <a
                key={index}
                href={item.href}
                className="relative px-3 xl:px-4 py-2 text-sm xl:text-base font-medium text-white hover:text-orange transition-colors duration-300 group"
              >
                {item.label}
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-orange scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
              </a>
            ))}
            <Link
              href="/login"
              className="ml-4 px-6 py-2.5 bg-white text-black font-semibold rounded-2xl hover:bg-gray-100 transition-all duration-300"
            >
              Connexion
            </Link>
            <Link
              href="/signup"
              className="px-6 py-2.5 bg-gradient-to-r from-orange to-orange-light text-white font-semibold rounded-2xl hover:shadow-lg hover:scale-105 transition-all duration-300"
            >
              Essai gratuit
            </Link>
          </nav>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="lg:hidden relative z-10 p-2 text-white hover:text-orange transition-colors"
            aria-label="Toggle menu"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              {isMenuOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="lg:hidden overflow-hidden"
            >
              <nav className="py-4 space-y-2 bg-white/95 backdrop-blur-md rounded-b-3xl mt-4 shadow-xl">
                {menuItems.map((item, index) => (
                  <a
                    key={index}
                    href={item.href}
                    onClick={() => setIsMenuOpen(false)}
                    className="block px-4 py-2 text-black hover:bg-orange/10 hover:text-orange rounded-2xl transition-colors duration-200 mx-2"
                  >
                    {item.label}
                  </a>
                ))}
                <div className="pt-2 space-y-2 mx-2">
                  <Link
                    href="/login"
                    onClick={() => setIsMenuOpen(false)}
                    className="block px-4 py-2 text-center bg-gray-100 text-black font-semibold rounded-2xl hover:bg-gray-200 transition-all duration-300"
                  >
                    Connexion
                  </Link>
                  <Link
                    href="/signup"
                    onClick={() => setIsMenuOpen(false)}
                    className="block px-4 py-2 text-center bg-gradient-to-r from-orange to-orange-light text-white font-semibold rounded-2xl hover:shadow-lg transition-all duration-300"
                  >
                    Essai gratuit
                  </Link>
                </div>
              </nav>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
}

