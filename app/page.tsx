import { Metadata } from "next";
import { Header } from "@/components/layout/Header";
import { HeroSection } from "@/components/home/HeroSection";
import { FeaturesSection } from "@/components/home/FeaturesSection";
import { PricingSection } from "@/components/home/PricingSection";
import { CTASection } from "@/components/home/CTASection";
import { ContactSection } from "@/components/home/ContactSection";
import { Footer } from "@/components/layout/Footer";

export const metadata: Metadata = {
  title: "PilotMyVan - Entretien de van & camping-car simplifié | Gratuit en béta",
  description:
    "Ne perdez plus vos garanties constructeur. PilotMyVan gère vos rappels d'entretien automatiquement : vidange, révision, contrôle technique. Suivi kilométrage et historique complet. Rejoignez la béta gratuite !",
  openGraph: {
    title: "PilotMyVan - Entretien de van & camping-car simplifié",
    description:
      "Ne perdez plus vos garanties constructeur. Rappels automatiques, suivi kilométrage et historique complet pour votre maison roulante. Gratuit en béta !",
  },
  alternates: {
    canonical: "https://pilotmyvan.com",
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: "PilotMyVan",
  applicationCategory: "LifestyleApplication",
  operatingSystem: "Web",
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "EUR",
    description: "Gratuit durant la phase béta",
  },
  aggregateRating: {
    "@type": "AggregateRating",
    ratingValue: "5",
    ratingCount: "1",
  },
  description:
    "Application web de gestion d'entretien pour vans, camping-cars et fourgons aménagés. Rappels automatiques, suivi kilométrique, historique complet.",
  featureList: [
    "Rappels automatiques d'entretien",
    "Suivi kilométrique",
    "Historique complet avec photos et factures",
    "Gestion multi-véhicules",
    "Suivi de consommation de carburant",
    "Calcul automatique des prochaines échéances",
  ],
  screenshot: "https://pilotmyvan.com/images/app-screenshot.png",
  author: {
    "@type": "Organization",
    name: "FUINA CREATIVE NETWORKS",
    url: "https://pilotmyvan.com",
    logo: "https://pilotmyvan.com/images/logo/logo-icon-text-orange.png",
    contactPoint: {
      "@type": "ContactPoint",
      email: "contact@pilotmyvan.com",
      contactType: "Customer Service",
      availableLanguage: "French",
    },
  },
};

const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "PilotMyVan",
  url: "https://pilotmyvan.com",
  logo: "https://pilotmyvan.com/images/logo/logo-icon-text-orange.png",
  sameAs: [],
  contactPoint: {
    "@type": "ContactPoint",
    email: "contact@pilotmyvan.com",
    contactType: "Customer Service",
    availableLanguage: ["French"],
  },
  address: {
    "@type": "PostalAddress",
    streetAddress: "14 RUE BAUSSET",
    addressLocality: "Paris",
    postalCode: "75015",
    addressCountry: "FR",
  },
};

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "Est-ce que PilotMyVan est gratuit ?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Oui ! PilotMyVan est actuellement en phase béta et entièrement gratuit. Les utilisateurs qui rejoignent durant cette phase conserveront gratuitement toutes les fonctionnalités actuelles à vie.",
      },
    },
    {
      "@type": "Question",
      name: "Quels types de véhicules sont supportés ?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "PilotMyVan prend en charge tous les véhicules de loisirs : vans, camping-cars, fourgons aménagés et camions aménagés. Vous pouvez gérer plusieurs véhicules depuis un seul compte.",
      },
    },
    {
      "@type": "Question",
      name: "Comment fonctionnent les rappels automatiques ?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "PilotMyVan vous envoie des notifications par email avant vos échéances d'entretien (une semaine avant, puis 3 jours avant). Le système calcule automatiquement vos prochaines maintenances en fonction du kilométrage et des dates.",
      },
    },
    {
      "@type": "Question",
      name: "Mes données sont-elles sécurisées ?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Absolument. Vos données sont hébergées en Europe (Paris, France), chiffrées, et ne sont jamais partagées avec d'autres utilisateurs. Vous gardez un contrôle total sur vos informations.",
      },
    },
  ],
};

export default function Home() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <Header />
      <main className="min-h-screen">
        <HeroSection />
        <FeaturesSection />
        <PricingSection />
        <CTASection />
        <ContactSection />
      </main>
      <Footer />
    </>
  );
}
