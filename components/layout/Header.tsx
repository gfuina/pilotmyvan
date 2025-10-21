"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const pathname = usePathname();
  const isHomepage = pathname === "/";
  const { data: session } = useSession();

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
          <Link href="/" className="relative z-10 flex items-center gap-3 group">
            <div className="flex flex-col">
              <span className="text-2xl font-bold text-white leading-none">
                P<span className="text-orange">M</span>V
              </span>
              <span className="text-[10px] text-white/70 font-medium leading-none mt-0.5">
                PilotMyVan
              </span>
            </div>
            <span className="px-2 py-0.5 bg-orange/20 border border-orange/40 text-orange text-[10px] font-bold rounded-full">
              BÉTA
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-1 xl:space-x-2">
            {isHomepage && menuItems.map((item, index) => (
              <a
                key={index}
                href={item.href}
                className="relative px-3 xl:px-4 py-2 text-sm xl:text-base font-medium text-white hover:text-orange transition-colors duration-300 group"
              >
                {item.label}
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-orange scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
              </a>
            ))}
            
            {session ? (
              <>
                {session.user.isAdmin && (
                  <Link
                    href="/administration"
                    className="ml-4 px-6 py-2.5 bg-orange text-white font-semibold rounded-2xl hover:bg-orange-dark transition-all duration-300"
                  >
                    Admin
                  </Link>
                )}
                <Link
                  href="/dashboard"
                  className="ml-4 px-6 py-2.5 bg-white text-black font-semibold rounded-2xl hover:bg-gray-100 transition-all duration-300"
                >
                  Dashboard
                </Link>
                <button
                  onClick={() => signOut({ callbackUrl: "/" })}
                  className="px-6 py-2.5 bg-white/10 backdrop-blur-sm text-white font-semibold rounded-2xl hover:bg-white/20 transition-all duration-300 border border-white/30"
                >
                  Déconnexion
                </button>
              </>
            ) : (
              <>
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
                  Rejoindre la béta
                </Link>
              </>
            )}
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
                {isHomepage && menuItems.map((item, index) => (
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
                  {session ? (
                    <>
                      {session.user.isAdmin && (
                        <Link
                          href="/administration"
                          onClick={() => setIsMenuOpen(false)}
                          className="block px-4 py-2 text-center bg-orange text-white font-semibold rounded-2xl hover:bg-orange-dark transition-all duration-300"
                        >
                          Administration
                        </Link>
                      )}
                      <Link
                        href="/dashboard"
                        onClick={() => setIsMenuOpen(false)}
                        className="block px-4 py-2 text-center bg-gray-100 text-black font-semibold rounded-2xl hover:bg-gray-200 transition-all duration-300"
                      >
                        Dashboard
                      </Link>
                      <button
                        onClick={() => {
                          setIsMenuOpen(false);
                          signOut({ callbackUrl: "/" });
                        }}
                        className="w-full px-4 py-2 text-center bg-gradient-to-r from-orange to-orange-light text-white font-semibold rounded-2xl hover:shadow-lg transition-all duration-300"
                      >
                        Déconnexion
                      </button>
                    </>
                  ) : (
                    <>
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
                        Rejoindre la béta
                      </Link>
                    </>
                  )}
                </div>
              </nav>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
}

