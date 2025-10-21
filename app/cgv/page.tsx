import Link from "next/link";

export default function CGVPage() {
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
            Conditions Générales d&apos;Utilisation
          </h1>
          <p className="text-gray-500 mb-8">
            Dernière mise à jour : {new Date().toLocaleDateString("fr-FR", { 
              day: "numeric", 
              month: "long", 
              year: "numeric" 
            })}
          </p>

          {/* Introduction */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-black mb-4 flex items-center gap-2">
              <span className="text-orange">1.</span> Introduction
            </h2>
            <p className="text-gray-700 mb-3">
              Bienvenue sur PilotMyVan, une application de gestion d&apos;entretien pour véhicules
              de loisirs (vans, camping-cars, fourgons aménagés).
            </p>
            <p className="text-gray-700">
              Les présentes Conditions Générales d&apos;Utilisation (ci-après "CGU") régissent
              votre utilisation de l&apos;application PilotMyVan, accessible via le site web et
              l&apos;application mobile (ci-après collectivement désignés comme le "Service").
            </p>
            <p className="text-gray-700 mt-3 font-semibold">
              En utilisant notre Service, vous acceptez d&apos;être lié par ces CGU. Si vous
              n&apos;acceptez pas ces conditions, veuillez ne pas utiliser notre Service.
            </p>
          </section>

          {/* Définitions */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-black mb-4 flex items-center gap-2">
              <span className="text-orange">2.</span> Définitions
            </h2>
            <ul className="text-gray-700 space-y-2 list-none">
              <li>
                <strong>"Utilisateur"</strong> : toute personne qui accède à et/ou utilise le Service.
              </li>
              <li>
                <strong>"Compte"</strong> : l&apos;espace personnel créé par l&apos;Utilisateur sur le Service.
              </li>
              <li>
                <strong>"Véhicule"</strong> : tout véhicule de loisirs enregistré par l&apos;Utilisateur
                (van, camping-car, fourgon aménagé, camion aménagé).
              </li>
              <li>
                <strong>"Données d&apos;entretien"</strong> : ensemble des informations relatives aux
                maintenances, révisions et réparations effectuées sur vos véhicules.
              </li>
            </ul>
          </section>

          {/* Inscription et Compte */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-black mb-4 flex items-center gap-2">
              <span className="text-orange">3.</span> Inscription et Compte
            </h2>
            <div className="text-gray-700 space-y-3">
              <p>
                Pour utiliser le Service, vous devez créer un compte. Vous vous engagez à fournir
                des informations exactes, complètes et à jour lors de votre inscription.
              </p>
              <p>
                Vous êtes responsable de la confidentialité de votre mot de passe et de toutes les
                activités qui se produisent sous votre compte. Vous devez nous informer immédiatement
                de toute utilisation non autorisée de votre compte.
              </p>
            </div>
          </section>

          {/* Utilisation du Service */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-black mb-4 flex items-center gap-2">
              <span className="text-orange">4.</span> Utilisation du Service
            </h2>
            <div className="text-gray-700 space-y-3">
              <p>
                Vous vous engagez à utiliser le Service conformément aux présentes CGU et aux lois
                applicables. Le Service vous permet de :
              </p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>Enregistrer vos véhicules et leurs informations</li>
                <li>Planifier et suivre les entretiens et maintenances</li>
                <li>Recevoir des rappels automatiques par email</li>
                <li>Conserver un historique de vos entretiens avec photos et factures</li>
                <li>Suivre votre kilométrage et votre consommation de carburant</li>
              </ul>
              <p className="mt-3">
                Vous vous engagez à ne pas :
              </p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>Utiliser le Service à des fins illégales ou non autorisées</li>
                <li>Tenter de contourner les mesures de sécurité du Service</li>
                <li>Interférer avec le bon fonctionnement du Service</li>
                <li>Collecter des informations sur d&apos;autres utilisateurs</li>
              </ul>
            </div>
          </section>

          {/* Données et Contenu */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-black mb-4 flex items-center gap-2">
              <span className="text-orange">5.</span> Vos Données et Contenu
            </h2>
            <div className="text-gray-700 space-y-3">
              <p>
                Vous conservez tous les droits sur les données et contenus que vous soumettez au
                Service (informations véhicules, photos, notes, factures, etc.).
              </p>
              <p>
                En utilisant le Service, vous nous accordez une licence pour stocker, traiter et
                afficher ces données uniquement dans le cadre de la fourniture du Service.
              </p>
              <p className="font-semibold">
                Vos données sont strictement personnelles et ne sont jamais partagées avec d&apos;autres
                utilisateurs ni vendues à des tiers.
              </p>
            </div>
          </section>

          {/* Notifications */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-black mb-4 flex items-center gap-2">
              <span className="text-orange">6.</span> Notifications et Rappels
            </h2>
            <div className="text-gray-700 space-y-3">
              <p>
                Le Service envoie des notifications par email pour vous rappeler vos entretiens
                à venir. Vous pouvez configurer vos préférences de notification dans votre compte.
              </p>
              <p>
                Nous ne garantissons pas que les notifications seront toujours délivrées à temps
                en raison de facteurs indépendants de notre volonté (serveurs email, spam, etc.).
              </p>
              <p className="font-semibold">
                Il reste de votre responsabilité de vérifier régulièrement l&apos;état de vos
                entretiens dans l&apos;application.
              </p>
            </div>
          </section>

          {/* Abonnements */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-black mb-4 flex items-center gap-2">
              <span className="text-orange">7.</span> Phase Béta et Abonnements Futurs
            </h2>
            <div className="text-gray-700 space-y-3">
              <p>
                Le Service est actuellement en phase béta et entièrement gratuit. Les utilisateurs
                qui rejoignent durant cette phase conserveront gratuitement toutes les
                fonctionnalités actuelles à vie.
              </p>
              <p>
                Des formules d&apos;abonnement premium pourront être proposées à l&apos;avenir pour
                de nouvelles fonctionnalités (mode hors-ligne, export PDF, statistiques avancées, etc.).
              </p>
              <p className="font-semibold text-orange-600">
                Engagement : Les utilisateurs béta ne seront jamais contraints de payer pour les
                fonctionnalités dont ils bénéficient actuellement.
              </p>
            </div>
          </section>

          {/* Propriété Intellectuelle */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-black mb-4 flex items-center gap-2">
              <span className="text-orange">8.</span> Propriété Intellectuelle
            </h2>
            <p className="text-gray-700">
              Le Service et son contenu original (design, fonctionnalités, code, logos, etc.) sont
              et resteront la propriété exclusive de FUINA CREATIVE NETWORKS. Le Service est
              protégé par le droit d&apos;auteur et autres lois en France et à l&apos;étranger.
            </p>
          </section>

          {/* Limitation de Responsabilité */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-black mb-4 flex items-center gap-2">
              <span className="text-orange">9.</span> Limitation de Responsabilité
            </h2>
            <div className="text-gray-700 space-y-3">
              <p>
                Le Service est fourni "tel quel" sans garantie d&apos;aucune sorte. Nous ne
                garantissons pas que le Service sera toujours disponible, exempt d&apos;erreurs
                ou sécurisé.
              </p>
              <p className="font-semibold">
                Vous reconnaissez que :
              </p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>Il reste de votre responsabilité d&apos;entretenir votre véhicule</li>
                <li>Le Service est un outil d&apos;aide, pas un remplacement de votre vigilance</li>
                <li>Nous ne sommes pas responsables des pannes ou problèmes mécaniques</li>
                <li>Nous ne garantissons pas l&apos;exactitude des informations de la bibliothèque</li>
                <li>Les photos et contenus utilisateurs sont sous leur responsabilité</li>
              </ul>
              <p className="mt-3">
                Dans la mesure permise par la loi, nous ne serons pas responsables des dommages
                indirects, accessoires ou consécutifs résultant de l&apos;utilisation du Service.
              </p>
            </div>
          </section>

          {/* Modification des CGU */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-black mb-4 flex items-center gap-2">
              <span className="text-orange">10.</span> Modification des CGU
            </h2>
            <p className="text-gray-700">
              Nous nous réservons le droit de modifier ces CGU à tout moment. Les modifications
              prendront effet dès leur publication sur le Service. Votre utilisation continue du
              Service après la publication des modifications constitue votre acceptation de ces
              modifications.
            </p>
          </section>

          {/* Résiliation */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-black mb-4 flex items-center gap-2">
              <span className="text-orange">11.</span> Résiliation
            </h2>
            <div className="text-gray-700 space-y-3">
              <p>
                Vous pouvez supprimer votre compte à tout moment via les paramètres de votre compte.
                La suppression entraînera la suppression définitive de toutes vos données.
              </p>
              <p>
                Nous nous réservons le droit de suspendre ou de résilier votre accès au Service,
                sans préavis, si vous enfreignez ces CGU.
              </p>
            </div>
          </section>

          {/* Loi Applicable */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-black mb-4 flex items-center gap-2">
              <span className="text-orange">12.</span> Loi Applicable
            </h2>
            <p className="text-gray-700">
              Ces CGU sont régies et interprétées conformément aux lois françaises. En cas de
              litige, les tribunaux français seront seuls compétents.
            </p>
          </section>

          {/* Contact */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-black mb-4 flex items-center gap-2">
              <span className="text-orange">13.</span> Contact
            </h2>
            <p className="text-gray-700">
              Si vous avez des questions concernant ces CGU, veuillez nous contacter à l&apos;adresse
              suivante :{" "}
              <a href="mailto:contact@pilotmyvan.com" className="text-orange hover:underline font-semibold">
                contact@pilotmyvan.com
              </a>
            </p>
          </section>

          {/* Informations Légales */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-black mb-4 flex items-center gap-2">
              <span className="text-orange">14.</span> Informations Légales
            </h2>
            <p className="text-gray-700 text-sm">
              Le Service est édité par la société <strong>FUINA CREATIVE NETWORKS</strong>, SAS au
              capital social de 100€, immatriculée au Registre du Commerce et des Sociétés de Paris
              sous le numéro <strong>935 061 036</strong>, dont le siège social est situé au{" "}
              <strong>14 RUE BAUSSET, 75015 PARIS, France</strong>. Numéro de TVA intracommunautaire :
              FR59935061036. Directeur de la publication : Gianni FUINA. Email de contact :{" "}
              <a href="mailto:contact@pilotmyvan.com" className="text-orange hover:underline">
                contact@pilotmyvan.com
              </a>.
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

