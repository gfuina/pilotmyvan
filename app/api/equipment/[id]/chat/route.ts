import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import connectDB from "@/lib/mongodb";
import Equipment from "@/models/Equipment";
import ManualChunk from "@/models/ManualChunk";
import { searchManuals, generateAnswer } from "@/lib/manualIndexing";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json(
        { error: "Non authentifié" },
        { status: 401 }
      );
    }

    await connectDB();

    const { id } = await params;
    const equipment = await Equipment.findById(id);

    if (!equipment) {
      return NextResponse.json(
        { error: "Équipement non trouvé" },
        { status: 404 }
      );
    }

    if (!equipment.manuals || equipment.manuals.length === 0) {
      return NextResponse.json(
        { error: "Cet équipement n'a pas de manuels disponibles" },
        { status: 400 }
      );
    }

    // Vérifier qu'il y a des chunks indexés
    const chunksCount = await ManualChunk.countDocuments({
      equipmentId: id,
    });

    if (chunksCount === 0) {
      return NextResponse.json(
        {
          error: "Les manuels de cet équipement n'ont pas encore été indexés. Veuillez contacter l'administrateur.",
        },
        { status: 400 }
      );
    }

    const { question } = await req.json();

    if (!question || typeof question !== "string" || question.trim().length === 0) {
      return NextResponse.json(
        { error: "Question invalide" },
        { status: 400 }
      );
    }

    // 1. Recherche sémantique (augmenté à 8 chunks)
    const relevantChunks = await searchManuals(id, question, 8);

    // 2. Générer la réponse
    const answer = await generateAnswer(question, relevantChunks);

    // 3. Grouper les sources par manuel (éviter les doublons)
    const sourcesMap = new Map<string, { manual: string; similarity: number; count: number }>();
    
    relevantChunks.forEach((chunk) => {
      const existing = sourcesMap.get(chunk.manualTitle);
      if (existing) {
        // Garder la meilleure similarité et incrémenter le compteur
        existing.similarity = Math.max(existing.similarity, chunk.similarity);
        existing.count++;
      } else {
        sourcesMap.set(chunk.manualTitle, {
          manual: chunk.manualTitle,
          similarity: chunk.similarity,
          count: 1,
        });
      }
    });

    const sources = Array.from(sourcesMap.values()).map((s) => ({
      manual: s.manual,
      similarity: s.similarity,
      chunksUsed: s.count,
    }));

    return NextResponse.json({
      answer,
      sources,
    });
  } catch (error: any) {
    console.error("Error in chat:", error);
    return NextResponse.json(
      { error: error.message || "Erreur lors de la génération de la réponse" },
      { status: 500 }
    );
  }
}

