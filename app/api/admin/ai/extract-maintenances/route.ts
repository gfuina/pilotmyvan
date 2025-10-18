import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { isUserAdmin } from "@/lib/admin";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id || !isUserAdmin(session.user)) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const body = await request.json();
    const { equipmentName, manuals, manualText } = body;

    if (!manuals || manuals.length === 0) {
      return NextResponse.json(
        { error: "Aucun manuel fourni" },
        { status: 400 }
      );
    }

    // Prepare context for AI
    console.log(`📄 Preparing analysis for ${equipmentName}...`);
    console.log(`   Manuals: ${manuals.length}`);
    console.log(`   Manual text provided: ${manualText ? `${manualText.length} characters` : 'No'}`);
    
    const manualsInfo = manuals.map((m: { title: string; url: string; isExternal: boolean }, i: number) => 
      `${i + 1}. "${m.title}"`
    ).join('\n');

    // Call OpenAI to extract maintenance recommendations
    const completion = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `Tu es un expert en maintenance de véhicules aménagés (vans, camping-cars). 
Ta mission est de générer les entretiens recommandés pour l'équipement fourni.

RÈGLES STRICTES - LANGUE:
- TOUT le contenu DOIT être en FRANÇAIS (noms, descriptions, instructions, tags)
- Si le manuel source est en anglais ou autre langue, TRADUIS automatiquement en français
- Aucune faute d'orthographe tolérée
- Utilise un français naturel et professionnel
- Format JSON valide uniquement
- SEULES les valeurs d'enum (type/priority/difficulty) restent en anglais

Structure JSON EXACTE pour chaque entretien:
{
  "name": "Vérification du filtre à air",
  "type": "inspection",
  "priority": "important",
  "difficulty": "easy",
  "recurrence": {
    "time": { "value": 6, "unit": "months" },
    "kilometers": 10000
  },
  "conditions": ["Avant l'hiver", "Après longue inactivité"],
  "description": "Inspection visuelle du filtre à air et nettoyage si nécessaire",
  "instructions": "1. Arrêter le chauffage et attendre qu'il refroidisse\n2. Démonter le capot d'accès\n3. Retirer le filtre\n4. Inspecter visuellement\n5. Nettoyer ou remplacer si encrassé\n6. Remonter dans l'ordre inverse",
  "parts": [
    {
      "name": "Filtre à air",
      "reference": "REF-123",
      "quantity": 1,
      "estimatedCost": 15
    }
  ],
  "estimatedDuration": 15,
  "estimatedCost": 15,
  "tags": ["Sécurité", "Performance"],
  "isOfficial": false,
  "source": "Recommandations constructeur standards"
}

EXEMPLE DE TRADUCTION:
Manuel source (anglais): "Check the fuel pump every 6 months"
→ Nom: "Vérification de la pompe à carburant"
→ Description: "Contrôle de fonctionnement de la pompe à carburant"
→ Instructions: "1. Démarrer l'appareil\n2. Vérifier le bruit de la pompe\n3. Contrôler l'absence de fuites"

VALEURS AUTORISÉES (ne change JAMAIS):
- type: "inspection", "cleaning", "replacement", "service", "lubrication", "adjustment", "drain", "test", "calibration", "other"
- priority: "critical", "important", "recommended", "optional"
- difficulty: "easy", "intermediate", "advanced", "professional"
- unit: "days", "months", "years"

IMPORTANT:
- Au moins UNE récurrence (time OU kilometers) est OBLIGATOIRE
- Nom en français, clair et précis
- Description en français
- Instructions en français, numérotées
- Durée en minutes (nombre entier)
- Pas de fautes d'orthographe
- Retourne un objet avec clé "maintenances" contenant l'array`,
        },
        {
          role: "user",
          content: `Équipement à analyser: ${equipmentName}

Manuels de référence:
${manualsInfo}

${manualText ? `
CONTENU DU MANUEL FOURNI:
===========================
${manualText.substring(0, 80000)}
===========================

MISSION: Analyse le contenu du manuel ci-dessus et extrais TOUS les entretiens, maintenances et vérifications recommandés par le constructeur.

IMPORTANT:
- Le manuel peut être en ANGLAIS ou autre langue → TRADUIS TOUT EN FRANÇAIS
- Sois exhaustif: chaque mention d'un nettoyage, inspection, vérification, test, remplacement ou entretien doit être extrait avec sa fréquence exacte
- Les noms, descriptions et instructions doivent être en FRANÇAIS naturel
- Exemple: "Check air filter" → "Vérification du filtre à air"
` : `
MISSION: Génère les entretiens de maintenance standards et recommandés pour cet équipement.

Pour un équipement de type "${equipmentName}", fournis 5 à 10 entretiens courants incluant:
- Nettoyages réguliers
- Inspections visuelles
- Vérifications de sécurité
- Remplacements périodiques de pièces d'usure
- Tests de fonctionnement
- Entretiens saisonniers (hivernage, déstockage)
`}

ATTENTION ORTHOGRAPHE:
- Noms en français correct (ex: "Nettoyage du filtre", pas "cleaning filter")
- "mois" reste "mois" au pluriel (12 mois, 6 mois, JAMAIS "moiss")
- "an" devient "ans" au pluriel (2 ans, 3 ans)
- "jour" devient "jours" au pluriel (2 jours, 3 jours)
- Pas de double "s" (ex: "6 mois" PAS "6 moiss", "12 mois" PAS "12 moiss")
- Récurrence réaliste (ex: filtre tous les 6 mois ou 10000km)
- Durées cohérentes (15-60 min pour simple, 120+ min pour complexe)

Format de réponse: { "maintenances": [...] }`,
        },
      ],
      temperature: 0.3,
      response_format: { type: "json_object" },
    });

    const responseText = completion.choices[0]?.message?.content;

    if (!responseText) {
      return NextResponse.json(
        { error: "Aucune réponse de l'IA" },
        { status: 500 }
      );
    }

    // Parse the JSON response
    let parsedResponse;
    try {
      parsedResponse = JSON.parse(responseText);
    } catch (error) {
      console.error("Error parsing AI response:", error);
      return NextResponse.json(
        { error: "Erreur lors du parsing de la réponse IA" },
        { status: 500 }
      );
    }

    // Extract maintenances array (handle different response formats)
    let maintenances = parsedResponse.maintenances || parsedResponse.entretiens || parsedResponse;

    // Check if AI returned an error
    if (parsedResponse.error) {
      console.error(`❌ AI returned error: ${parsedResponse.error}`);
      return NextResponse.json(
        { 
          error: `L'IA n'a pas pu extraire d'entretiens: ${parsedResponse.error}`,
          rawResponse: responseText 
        },
        { status: 400 }
      );
    }

    if (!Array.isArray(maintenances)) {
      maintenances = [maintenances];
    }

    // Filter out any error objects or invalid entries
    const validMaintenances = maintenances.filter((m: { name?: string; type?: string; error?: string }) => {
      if (!m || m.error) {
        console.warn(`⚠️  Filtered out invalid maintenance:`, m);
        return false;
      }
      if (!m.name || !m.type) {
        console.warn(`⚠️  Filtered out maintenance without name/type:`, m);
        return false;
      }
      return true;
    });

    console.log(`✅ Found ${validMaintenances.length} valid maintenances`);

    if (validMaintenances.length === 0) {
      return NextResponse.json(
        { 
          error: "Aucun entretien valide n'a pu être extrait des manuels. Les manuels ne semblent pas contenir d'informations de maintenance, ou sont peut-être des certificats plutôt que des manuels d'entretien.",
          rawResponse: responseText 
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        maintenances: validMaintenances,
        rawResponse: responseText,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error extracting maintenances:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Erreur lors de l'extraction des entretiens" },
      { status: 500 }
    );
  }
}

