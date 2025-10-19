import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";

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
    "Quand on vit sur la route, chaque entretien compte. PilotMyVan vous aide à prendre soin de votre maison roulante pour voyager l'esprit tranquille.",
  keywords: [
    "entretien van",
    "maintenance fourgon",
    "rappel entretien",
    "gestion van",
    "vanlife",
    "entretien camping-car",
    "suivi maintenance",
    "nomade",
    "camion aménagé",
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
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
