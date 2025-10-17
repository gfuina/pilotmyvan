import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "PilotMyVan - Gérez l'entretien de votre van",
    template: "%s | PilotMyVan",
  },
  description:
    "Ne manquez plus jamais une révision. PilotMyVan vous aide à suivre l'entretien de votre van et de tous vos équipements.",
  keywords: [
    "entretien van",
    "maintenance fourgon",
    "rappel entretien",
    "gestion van",
    "vanlife",
    "entretien camping-car",
    "suivi maintenance",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
