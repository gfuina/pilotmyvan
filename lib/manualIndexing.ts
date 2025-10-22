import OpenAI from "openai";
import { extractText } from "unpdf";
import ManualChunk from "@/models/ManualChunk";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const CHUNK_SIZE = 1000; // caractères par chunk
const CHUNK_OVERLAP = 200; // overlap entre chunks

/**
 * Télécharge un PDF depuis une URL
 */
async function downloadPdf(url: string): Promise<ArrayBuffer> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to download PDF: ${response.statusText}`);
  }
  return await response.arrayBuffer();
}

/**
 * Extrait le texte d'un PDF en utilisant unpdf (compatible ESM)
 */
async function extractTextFromPdf(pdfBuffer: ArrayBuffer): Promise<string> {
  const { text } = await extractText(pdfBuffer, { mergePages: true });
  return text;
}

/**
 * Découpe le texte en chunks avec overlap
 */
function chunkText(text: string): string[] {
  const chunks: string[] = [];
  let startIndex = 0;

  while (startIndex < text.length) {
    const endIndex = Math.min(startIndex + CHUNK_SIZE, text.length);
    const chunk = text.slice(startIndex, endIndex).trim();
    
    if (chunk.length > 0) {
      chunks.push(chunk);
    }
    
    startIndex += CHUNK_SIZE - CHUNK_OVERLAP;
  }

  return chunks;
}

/**
 * Crée un embedding avec OpenAI
 */
async function createEmbedding(text: string): Promise<number[]> {
  const response = await openai.embeddings.create({
    model: "text-embedding-3-small",
    input: text,
  });
  
  return response.data[0].embedding;
}

/**
 * Index un manuel complet
 */
export async function indexManual(
  equipmentId: string,
  manualTitle: string,
  manualUrl: string,
  isExternal: boolean
): Promise<{ success: boolean; chunksCreated: number; error?: string }> {
  try {
    // 1. Télécharger le PDF
    let pdfBuffer: ArrayBuffer;
    
    if (isExternal) {
      pdfBuffer = await downloadPdf(manualUrl);
    } else {
      // Pour les Blobs stockés, il faudra adapter selon ton système de stockage
      // Supposons que c'est une URL Vercel Blob
      pdfBuffer = await downloadPdf(manualUrl);
    }

    // 2. Extraire le texte
    const text = await extractTextFromPdf(pdfBuffer);
    
    if (!text || text.trim().length === 0) {
      return { success: false, chunksCreated: 0, error: "No text extracted from PDF" };
    }

    // 3. Découper en chunks
    const chunks = chunkText(text);

    // 4. Supprimer les anciens chunks de ce manuel
    await ManualChunk.deleteMany({ 
      equipmentId, 
      manualUrl 
    });

    // 5. Créer les embeddings et sauvegarder
    const chunkPromises = chunks.map(async (chunk, index) => {
      const embedding = await createEmbedding(chunk);
      
      return ManualChunk.create({
        equipmentId,
        manualTitle,
        manualUrl,
        chunkIndex: index,
        content: chunk,
        embedding,
      });
    });

    await Promise.all(chunkPromises);

    return { success: true, chunksCreated: chunks.length };
  } catch (error: any) {
    console.error("Error indexing manual:", error);
    return { 
      success: false, 
      chunksCreated: 0, 
      error: error.message || "Unknown error" 
    };
  }
}

/**
 * Recherche sémantique dans les manuels d'un équipement
 */
export async function searchManuals(
  equipmentId: string,
  query: string,
  topK: number = 8 // Augmenté de 5 à 8 pour plus de contexte
): Promise<Array<{ content: string; manualTitle: string; similarity: number }>> {
  try {
    // 1. Enrichir la question avec du contexte pour améliorer la recherche
    const enrichedQuery = `${query} installation montage procédure`;
    
    // 2. Créer l'embedding de la question enrichie
    const queryEmbedding = await createEmbedding(enrichedQuery);

    // 3. Récupérer tous les chunks de cet équipement
    const chunks = await ManualChunk.find({ equipmentId }).lean();

    if (chunks.length === 0) {
      return [];
    }

    // 4. Calculer la similarité cosine
    const chunksWithSimilarity = chunks.map((chunk) => {
      const similarity = cosineSimilarity(queryEmbedding, chunk.embedding);
      return {
        content: chunk.content,
        manualTitle: chunk.manualTitle,
        similarity,
      };
    });

    // 5. Trier par similarité et prendre les top K avec un seuil minimum
    chunksWithSimilarity.sort((a, b) => b.similarity - a.similarity);
    
    // Filtrer avec un seuil de similarité minimum (0.3 = 30%)
    const filtered = chunksWithSimilarity.filter(c => c.similarity > 0.3);
    
    // Log pour debug (voir les scores de similarité)
    console.log(`[Search] Question: "${query}"`);
    console.log(`[Search] Top results:`, filtered.slice(0, 3).map(c => ({
      title: c.manualTitle,
      similarity: Math.round(c.similarity * 100) + '%',
      preview: c.content.substring(0, 100) + '...'
    })));
    
    return filtered.slice(0, topK);
  } catch (error) {
    console.error("Error searching manuals:", error);
    return [];
  }
}

/**
 * Calcule la similarité cosine entre deux vecteurs
 */
function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length) {
    throw new Error("Vectors must have the same length");
  }

  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }

  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

/**
 * Génère une réponse avec GPT basée sur le contexte
 */
export async function generateAnswer(
  query: string,
  context: Array<{ content: string; manualTitle: string }>
): Promise<string> {
  if (context.length === 0) {
    return "Je n'ai pas trouvé d'information pertinente dans les manuels de cet équipement pour répondre à votre question.";
  }

  const contextText = context
    .map((c, i) => `[Extrait ${i + 1} - ${c.manualTitle}]\n"${c.content}"`)
    .join("\n\n---\n\n");

  const systemPrompt = `Tu es un assistant technique spécialisé dans les équipements de camping-car et vans aménagés.
Tu dois répondre en te basant sur les extraits de manuels fournis ci-dessous.

RÈGLES DE RÉPONSE:
1. ANALYSE ET SYNTHÈSE
   - Analyse TOUS les extraits fournis pour trouver des informations pertinentes
   - Réponds à la question en utilisant toutes les informations disponibles
   - Si la réponse directe n'est pas dans les extraits, utilise les informations connexes pour aider l'utilisateur
   - Donne des conseils pratiques basés sur ce que tu trouves dans les extraits

2. CITATIONS OBLIGATOIRES
   - CITE TOUJOURS les passages pertinents mot pour mot entre guillemets
   - Format: "citation exacte du manuel" [Extrait X]
   - Les citations doivent être littérales, ne pas paraphraser entre guillemets
   - Après les citations, tu peux interpréter et expliquer

3. STRUCTURE DE RÉPONSE
   - Réponds d'abord à la question de manière pratique
   - Cite ensuite les passages du manuel qui appuient ta réponse
   - Ajoute des détails contextuels si trouvés dans les extraits
   
4. LIMITATIONS
   - Ne JAMAIS inventer des informations
   - Si vraiment aucune info pertinente dans les extraits, dis-le clairement
   - Reste fidèle au contenu des manuels

EXEMPLE:
Question: Où installer le chauffage ?
Réponse: Le manuel précise les exigences d'installation : "l'emplacement de montage souhaité (une variété de supports de montage peut être achetée chez votre revendeur)" [Extrait 1]. Il mentionne aussi qu'il faut éviter "papiers, conduites de gaz, réservoirs de carburant" [Extrait 2] à proximité. Le manuel détaille "les exigences principales de l'installation des ensembles et des unités" [Extrait 3]. Je vous recommande de consulter ces sections pour choisir l'emplacement optimal.

CONTEXTE DES MANUELS:
${contextText}`;

  const completion = await openai.chat.completions.create({
    model: "gpt-4-turbo-preview",
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: query },
    ],
    temperature: 0.2, // Légèrement augmenté pour plus de flexibilité dans l'interprétation
    max_tokens: 700,
  });

  return completion.choices[0].message.content || "Erreur lors de la génération de la réponse.";
}

