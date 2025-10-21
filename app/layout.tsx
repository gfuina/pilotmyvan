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
  metadataBase: new URL(process.env.NEXTAUTH_URL || "https://pilotmyvan.com"),
  title: {
    default: "PilotMyVan - Gérez l'entretien de votre van & camping-car",
    template: "%s | PilotMyVan",
  },
  description:
    "Votre maison roulante mérite autant d'attention que votre chez-vous. Ne perdez plus vos garanties, évitez les pannes et roulez sereinement avec PilotMyVan. Rappels automatiques, historique complet et suivi kilométrique. Gratuit en béta.",
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
    "garantie constructeur",
    "carnet d'entretien",
    "révision van",
    "rappel vidange",
    "contrôle technique",
    "suivi kilométrage",
    "entretien véhicule de loisirs",
  ],
  authors: [{ name: "PilotMyVan", url: "https://pilotmyvan.com" }],
  creator: "PilotMyVan",
  publisher: "FUINA CREATIVE NETWORKS",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: "website",
    locale: "fr_FR",
    url: "https://pilotmyvan.com",
    title: "PilotMyVan - Gérez l'entretien de votre van & camping-car",
    description:
      "Ne perdez plus vos garanties, évitez les pannes et roulez sereinement. Rappels automatiques d'entretien pour votre maison roulante. Gratuit en béta.",
    siteName: "PilotMyVan",
    images: [
      {
        url: "/images/og-image.png",
        width: 1200,
        height: 630,
        alt: "PilotMyVan - Entretien de van simplifié",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "PilotMyVan - Gérez l'entretien de votre van & camping-car",
    description:
      "Ne perdez plus vos garanties, évitez les pannes. Rappels automatiques pour votre maison roulante. Gratuit en béta.",
    images: ["/images/og-image.png"],
    creator: "@pilotmyvan",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    // Ajoute ton code de vérification Google Search Console ici quand tu en auras un
    // google: 'ton-code-verification',
  },
  alternates: {
    canonical: "https://pilotmyvan.com",
  },
  category: "technology",
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
