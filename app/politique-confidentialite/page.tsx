import Link from "next/link";

export default function PolitiqueConfidentialitePage() {
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
            Politique de Confidentialité
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
            <div className="text-gray-700 space-y-3">
              <p>
                Chez PilotMyVan, nous accordons une grande importance à la protection de votre vie
                privée. Cette Politique de Confidentialité explique comment nous collectons, utilisons,
                divulguons et protégeons vos informations lorsque vous utilisez notre application et
                notre site web (collectivement, le "Service").
              </p>
              <p className="font-semibold">
                En utilisant notre Service, vous acceptez les pratiques décrites dans cette Politique
                de Confidentialité. Si vous n&apos;acceptez pas cette politique, veuillez ne pas
                utiliser notre Service.
              </p>
            </div>
          </section>

          {/* Informations collectées */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-black mb-4 flex items-center gap-2">
              <span className="text-orange">2.</span> Informations que nous collectons
            </h2>
            
            <h3 className="text-xl font-semibold text-black mb-3 mt-4">
              2.1. Base légale du traitement (RGPD)
            </h3>
            <div className="text-gray-700 space-y-2">
              <p>
                Le traitement de vos données personnelles repose sur les bases légales suivantes :
              </p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li><strong>Exécution du contrat</strong> (art. 6.1.b) : pour le fonctionnement du service et la création de compte</li>
                <li><strong>Consentement</strong> (art. 6.1.a) : pour les notifications par email, les plaques d&apos;immatriculation et numéros VIN</li>
                <li><strong>Intérêt légitime</strong> (art. 6.1.f) : pour la sécurité et l&apos;amélioration du service</li>
              </ul>
              <div className="mt-4 p-4 bg-orange-50 rounded-xl border border-orange-200">
                <h4 className="font-semibold text-orange-900 mb-2">
                  📋 Traitement des plaques d&apos;immatriculation et VIN
                </h4>
                <p className="text-sm text-gray-700">
                  Le traitement de vos <strong>plaques d&apos;immatriculation et numéros VIN</strong> repose sur votre{" "}
                  <strong>consentement explicite</strong> donné lors de l&apos;ajout ou la modification de ces informations
                  sur votre véhicule. Ce consentement constitue la base légale au sens de l&apos;article 6.1.a) du RGPD.
                </p>
                <p className="text-sm text-gray-700 mt-2">
                  Ces données sont utilisées <strong>uniquement pour votre usage personnel</strong> (identification de
                  votre véhicule, suivi administratif) et ne sont <strong>jamais partagées avec d&apos;autres utilisateurs</strong>.
                </p>
                <p className="text-sm text-gray-700 mt-2 font-semibold">
                  ✅ Vous pouvez retirer ce consentement à tout moment en supprimant ces informations dans les paramètres
                  de votre véhicule.
                </p>
              </div>
            </div>

            <h3 className="text-xl font-semibold text-black mb-3 mt-6">
              2.2. Types de données collectées
            </h3>
            <div className="text-gray-700 space-y-2">
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>
                  <strong>Informations de compte</strong> : nom, adresse email, mot de passe (chiffré)
                </li>
                <li>
                  <strong>Informations sur vos véhicules</strong> : marque, modèle, année, type,
                  kilométrage, photos, date d&apos;achat, notes
                </li>
                <li>
                  <strong>Données sensibles (avec consentement)</strong> : plaque d&apos;immatriculation,
                  numéro VIN - collectées uniquement avec votre consentement explicite via checkbox
                </li>
                <li>
                  <strong>Données d&apos;entretien</strong> : plannings de maintenance, historique
                  des entretiens, photos, factures, notes, coûts
                </li>
                <li>
                  <strong>Données d&apos;utilisation</strong> : pages visitées, fonctionnalités
                  utilisées, temps passé sur l&apos;application
                </li>
                <li>
                  <strong>Informations techniques</strong> : type d&apos;appareil, système
                  d&apos;exploitation, adresse IP, navigateur
                </li>
              </ul>
            </div>
          </section>

          {/* Utilisation des informations */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-black mb-4 flex items-center gap-2">
              <span className="text-orange">3.</span> Comment nous utilisons vos informations
            </h2>
            <div className="text-gray-700 space-y-2">
              <p>Nous utilisons les informations collectées pour :</p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>Fournir, maintenir et améliorer notre Service</li>
                <li>Créer et gérer votre compte utilisateur</li>
                <li>Stocker et afficher vos véhicules et leurs données d&apos;entretien</li>
                <li>Calculer automatiquement vos prochaines échéances d&apos;entretien</li>
                <li>Envoyer des rappels par email selon vos préférences</li>
                <li>Personnaliser votre expérience</li>
                <li>Analyser l&apos;utilisation du Service pour améliorer nos fonctionnalités</li>
                <li>Détecter, prévenir et résoudre les problèmes techniques et de sécurité</li>
                <li>Se conformer aux obligations légales</li>
              </ul>
              <p className="mt-3 font-semibold text-orange-600">
                Important : Vos données sont strictement personnelles. Nous ne partageons jamais
                vos informations de véhicules ou d&apos;entretien avec d&apos;autres utilisateurs.
              </p>
            </div>
          </section>

          {/* Partage des informations */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-black mb-4 flex items-center gap-2">
              <span className="text-orange">4.</span> Partage de vos informations
            </h2>
            <div className="text-gray-700 space-y-3">
              <p className="font-semibold">
                Nous ne vendons jamais vos informations personnelles à des tiers.
              </p>
              <p>
                Nous pouvons partager vos informations uniquement dans les cas suivants :
              </p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>
                  <strong>Prestataires de services</strong> : hébergement (Vercel, MongoDB Atlas),
                  envoi d&apos;emails (pour les notifications). Ces prestataires sont liés par des
                  accords de confidentialité.
                </li>
                <li>
                  <strong>Obligations légales</strong> : si la loi l&apos;exige ou pour protéger
                  nos droits et la sécurité de nos utilisateurs.
                </li>
              </ul>
            </div>
          </section>

          {/* Sécurité */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-black mb-4 flex items-center gap-2">
              <span className="text-orange">5.</span> Sécurité de vos informations
            </h2>
            <div className="text-gray-700 space-y-3">
              <p>
                Nous prenons des mesures techniques et organisationnelles pour protéger vos
                informations contre l&apos;accès, l&apos;utilisation, la modification ou la
                divulgation non autorisés :
              </p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>Chiffrement des données en transit (HTTPS/TLS)</li>
                <li>Chiffrement des données au repos</li>
                <li>Mots de passe hashés avec bcrypt</li>
                <li>Authentification sécurisée avec NextAuth.js</li>
                <li>Sauvegardes automatiques et chiffrées</li>
                <li>Accès restreint aux données</li>
              </ul>
              <p className="mt-3 italic">
                Cependant, aucune méthode de transmission sur Internet ou de stockage électronique
                n&apos;est 100% sécurisée. Nous ne pouvons garantir une sécurité absolue.
              </p>
            </div>
          </section>

          {/* Vos droits RGPD */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-black mb-4 flex items-center gap-2">
              <span className="text-orange">6.</span> Vos droits RGPD
            </h2>
            <div className="text-gray-700 space-y-3">
              <p>
                Conformément au Règlement Général sur la Protection des Données (RGPD), vous
                disposez des droits suivants :
              </p>
              <ul className="list-disc list-inside space-y-2 ml-4">
                <li>
                  <strong>Droit d&apos;accès</strong> (art. 15) : Accéder à vos informations
                  personnelles via votre compte
                </li>
                <li>
                  <strong>Droit de rectification</strong> (art. 16) : Corriger vos informations
                  inexactes ou incomplètes
                </li>
                <li>
                  <strong>Droit à l&apos;effacement</strong> (art. 17) : Demander la suppression
                  de vos données en supprimant votre compte
                </li>
                <li>
                  <strong>Droit d&apos;opposition</strong> (art. 21) : Vous opposer au traitement,
                  notamment en désactivant les notifications
                </li>
                <li>
                  <strong>Droit à la limitation</strong> (art. 18) : Limiter certains traitements
                  de vos données
                </li>
                <li>
                  <strong>Droit à la portabilité</strong> (art. 20) : Récupérer vos données dans
                  un format structuré
                </li>
                <li>
                  <strong>Droit de retrait du consentement</strong> : Retirer votre consentement
                  aux notifications à tout moment
                </li>
              </ul>
              <div className="mt-4 p-4 bg-orange-50 rounded-xl border border-orange-200">
                <p className="font-semibold text-orange-900 mb-2">Comment exercer vos droits :</p>
                <ul className="list-disc list-inside space-y-1 ml-4 text-sm">
                  <li>Via votre compte utilisateur pour la plupart des modifications</li>
                  <li>En nous contactant à{" "}
                    <a href="mailto:contact@pilotmyvan.com" className="text-orange-600 hover:underline font-semibold">
                      contact@pilotmyvan.com
                    </a>
                  </li>
                </ul>
                <p className="mt-2 text-sm">
                  <strong>Droit de réclamation :</strong> Vous avez le droit de déposer une plainte
                  auprès de la CNIL si vous estimez que vos droits ne sont pas respectés.
                </p>
              </div>
            </div>
          </section>

          {/* Conservation des données */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-black mb-4 flex items-center gap-2">
              <span className="text-orange">7.</span> Conservation des données
            </h2>
            <div className="text-gray-700 space-y-2">
              <p>Nous appliquons des durées de conservation spécifiques :</p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>
                  <strong>Données de compte</strong> : conservées tant que votre compte est actif,
                  puis supprimées dans les 30 jours suivant la suppression de votre compte
                </li>
                <li>
                  <strong>Données d&apos;entretien</strong> : supprimées avec la suppression de
                  votre compte
                </li>
                <li>
                  <strong>Logs de connexion</strong> : conservés 12 mois maximum pour la sécurité
                  du service
                </li>
                <li>
                  <strong>Emails de notification</strong> : conservés uniquement le temps de
                  l&apos;envoi
                </li>
              </ul>
              <p className="mt-3">
                Vous pouvez demander la suppression de vos données à tout moment en supprimant
                votre compte ou en nous contactant.
              </p>
            </div>
          </section>

          {/* Localisation et hébergement */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-black mb-4 flex items-center gap-2">
              <span className="text-orange">8.</span> Localisation et sécurité des données
            </h2>
            <div className="text-gray-700 space-y-3">
              <p className="font-semibold">
                Vos données sont hébergées en Union Européenne. Aucun transfert de données
                personnelles n&apos;a lieu en dehors de l&apos;UE.
              </p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>
                  <strong>Hébergement web</strong> : Vercel (région Europe)
                </li>
                <li>
                  <strong>Base de données</strong> : MongoDB Atlas région Paris, France (AWS eu-west-3)
                </li>
                <li>
                  <strong>Stockage fichiers</strong> : Vercel Blob (région Europe)
                </li>
              </ul>
              <p className="mt-3">
                <strong>Conformité :</strong> SOC 2, ISO 27001, GDPR
              </p>
            </div>
          </section>

          {/* Cookies */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-black mb-4 flex items-center gap-2">
              <span className="text-orange">9.</span> Cookies
            </h2>
            <div className="text-gray-700 space-y-3">
              <p>
                Nous utilisons des cookies essentiels pour le fonctionnement du Service :
              </p>
              <ul className="list-disc list-inside space-y-1 ml-4">
                <li>
                  <strong>Cookies d&apos;authentification</strong> : pour maintenir votre session
                  connectée (NextAuth)
                </li>
                <li>
                  <strong>Cookies de préférences</strong> : pour mémoriser vos choix (langue, thème)
                </li>
              </ul>
              <p>
                Ces cookies sont nécessaires au fonctionnement du Service et ne peuvent pas être
                désactivés. Nous n&apos;utilisons pas de cookies publicitaires ou de tracking.
              </p>
            </div>
          </section>

          {/* Modifications */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-black mb-4 flex items-center gap-2">
              <span className="text-orange">10.</span> Modifications de cette politique
            </h2>
            <p className="text-gray-700">
              Nous pouvons mettre à jour cette Politique de Confidentialité de temps à autre. Nous
              vous informerons de tout changement important en publiant la nouvelle politique sur
              cette page et en vous envoyant une notification par email. Nous vous encourageons à
              consulter régulièrement cette politique.
            </p>
          </section>

          {/* Contact DPO */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-black mb-4 flex items-center gap-2">
              <span className="text-orange">11.</span> Contact pour la protection des données
            </h2>
            <p className="text-gray-700">
              Pour toute question relative à la protection de vos données personnelles, vous pouvez
              nous contacter à l&apos;adresse :{" "}
              <a href="mailto:contact@pilotmyvan.com" className="text-orange hover:underline font-semibold">
                contact@pilotmyvan.com
              </a>
            </p>
          </section>

          {/* Informations de l'éditeur */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold text-black mb-4 flex items-center gap-2">
              <span className="text-orange">12.</span> Informations de l&apos;éditeur
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

