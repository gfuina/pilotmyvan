import Link from "next/link";

export default function MentionsLegalesPage() {
  const currentYear = new Date().getFullYear();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-40">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="flex items-center justify-between py-4">
            <Link href="/" className="flex flex-col">
              <span className="text-2xl font-bold text-black leading-none">
                P<span className="text-orange">M</span>V
              </span>
              <span className="text-[10px] text-gray font-medium leading-none mt-0.5">
                PilotMyVan
              </span>
            </Link>

            <Link
              href="/"
              className="inline-flex items-center gap-2 px-4 py-2 bg-gray-200 hover:bg-gray-300 text-black font-semibold rounded-2xl transition-all duration-300"
            >
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
                  d="M10 19l-7-7m0 0l7-7m-7 7h18"
                />
              </svg>
              Retour à l&apos;accueil
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 lg:px-8 py-12">
        <div className="max-w-4xl mx-auto bg-white rounded-3xl shadow-lg p-8 lg:p-12">
          <h1 className="text-4xl font-bold text-black mb-4">
            Mentions Légales
          </h1>
          <p className="text-gray-500 mb-8">
            Dernière mise à jour : {new Date().toLocaleDateString("fr-FR", { 
              day: "numeric", 
              month: "long", 
              year: "numeric" 
            })}
          </p>

          {/* Éditeur du site */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-black mb-4 flex items-center gap-2">
              <span className="text-orange">1.</span> Éditeur du site
            </h2>
            <div className="text-gray-700 space-y-2">
              <p>
                Le site PilotMyVan et l&apos;application sont édités par la société{" "}
                <strong>FUINA CREATIVE NETWORKS</strong>, SAS au capital social de 100€,
                immatriculée au Registre du Commerce et des Sociétés de Paris sous le
                numéro <strong>935 061 036</strong>, dont le siège social est situé au{" "}
                <strong>14 RUE BAUSSET, 75015 PARIS, France</strong>.
              </p>
              <ul className="list-none space-y-1 ml-4">
                <li>• Numéro de TVA intracommunautaire : <strong>FR59935061036</strong></li>
                <li>• Email : <a href="mailto:contact@pilotmyvan.com" className="text-orange hover:underline">contact@pilotmyvan.com</a></li>
              </ul>
            </div>
          </section>

          {/* Directeur de la publication */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-black mb-4 flex items-center gap-2">
              <span className="text-orange">2.</span> Directeur de la publication
            </h2>
            <p className="text-gray-700">
              Le Directeur de la publication du site est Monsieur <strong>Gianni FUINA</strong>.
            </p>
          </section>

          {/* Hébergement */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-black mb-4 flex items-center gap-2">
              <span className="text-orange">3.</span> Hébergement
            </h2>
            <div className="text-gray-700 space-y-2">
              <p>
                Le site PilotMyVan est hébergé par{" "}
                <strong>Vercel Inc.</strong>, dont le siège social est situé à San Francisco, Californie, États-Unis.
              </p>
              <p>
                Site web de l&apos;hébergeur :{" "}
                <a 
                  href="https://vercel.com" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-orange hover:underline"
                >
                  https://vercel.com
                </a>
              </p>
              <p className="mt-4">
                Les données utilisateurs sont stockées via <strong>MongoDB Atlas</strong>.
              </p>
              <p>
                Site web :{" "}
                <a 
                  href="https://www.mongodb.com/atlas" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-orange hover:underline"
                >
                  https://www.mongodb.com/atlas
                </a>
              </p>
            </div>
          </section>

          {/* Propriété intellectuelle */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-black mb-4 flex items-center gap-2">
              <span className="text-orange">4.</span> Propriété intellectuelle
            </h2>
            <div className="text-gray-700 space-y-3">
              <p>
                L&apos;ensemble du contenu du site PilotMyVan (architecture, textes, logos,
                graphismes, photographies, vidéos, etc.) est la propriété exclusive de la
                société FUINA CREATIVE NETWORKS ou de ses partenaires, et est protégé par
                les lois françaises et internationales relatives à la propriété intellectuelle.
              </p>
              <p>
                Toute reproduction totale ou partielle de ce contenu est strictement interdite
                sans autorisation préalable écrite de FUINA CREATIVE NETWORKS.
              </p>
            </div>
          </section>

          {/* Données personnelles */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-black mb-4 flex items-center gap-2">
              <span className="text-orange">5.</span> Données personnelles
            </h2>
            <p className="text-gray-700">
              Les informations concernant la collecte et le traitement des données personnelles
              sont détaillées dans notre{" "}
              <Link href="/politique-confidentialite" className="text-orange hover:underline font-semibold">
                Politique de Confidentialité
              </Link>.
            </p>
          </section>

          {/* Liens hypertextes */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-black mb-4 flex items-center gap-2">
              <span className="text-orange">6.</span> Liens hypertextes
            </h2>
            <p className="text-gray-700">
              Le site PilotMyVan peut contenir des liens hypertextes vers d&apos;autres sites Internet.
              La société FUINA CREATIVE NETWORKS n&apos;exerce aucun contrôle sur ces sites et décline
              toute responsabilité quant à leur contenu.
            </p>
          </section>

          {/* Droit applicable */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-black mb-4 flex items-center gap-2">
              <span className="text-orange">7.</span> Droit applicable et juridiction compétente
            </h2>
            <p className="text-gray-700">
              Les présentes mentions légales sont soumises au droit français. En cas de litige,
              les tribunaux français seront seuls compétents.
            </p>
          </section>

          {/* Contact */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-black mb-4 flex items-center gap-2">
              <span className="text-orange">8.</span> Contact
            </h2>
            <p className="text-gray-700">
              Pour toute question relative aux présentes mentions légales, vous pouvez nous
              contacter à l&apos;adresse suivante :{" "}
              <a href="mailto:contact@pilotmyvan.com" className="text-orange hover:underline font-semibold">
                contact@pilotmyvan.com
              </a>
            </p>
          </section>

          {/* Back to home CTA */}
          <div className="mt-12 pt-8 border-t border-gray-200 text-center">
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-orange to-orange-light text-white font-bold rounded-2xl hover:shadow-lg hover:scale-105 transition-all duration-300"
            >
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
                  d="M10 19l-7-7m0 0l7-7m-7 7h18"
                />
              </svg>
              Retour à l&apos;accueil
            </Link>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-black border-t border-white/10 mt-12">
        <div className="container mx-auto px-4 lg:px-8 py-8">
          <p className="text-center text-white/70 text-sm">
            &copy; {currentYear} PilotMyVan. Tous droits réservés.
          </p>
        </div>
      </footer>
    </div>
  );
}

