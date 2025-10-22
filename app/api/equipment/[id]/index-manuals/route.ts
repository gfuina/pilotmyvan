import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import connectDB from "@/lib/mongodb";
import Equipment from "@/models/Equipment";
import { indexManual } from "@/lib/manualIndexing";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();

    if (!session?.user || !session.user.isAdmin) {
      return NextResponse.json(
        { error: "Non autorisé" },
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
        { error: "Aucun manuel à indexer" },
        { status: 400 }
      );
    }

    // Indexer chaque manuel
    const results = await Promise.allSettled(
      equipment.manuals.map((manual) =>
        indexManual(
          String(equipment._id),
          manual.title,
          manual.url,
          manual.isExternal
        )
      )
    );

    const successful = results.filter((r) => r.status === "fulfilled");
    const failed = results.filter((r) => r.status === "rejected");

    const totalChunks = successful.reduce((sum, r) => {
      if (r.status === "fulfilled") {
        return sum + r.value.chunksCreated;
      }
      return sum;
    }, 0);

    return NextResponse.json({
      success: true,
      message: `${successful.length}/${equipment.manuals.length} manuels indexés`,
      totalChunks,
      errors: failed.map((r) => r.status === "rejected" ? r.reason : null),
    });
  } catch (error: any) {
    console.error("Error indexing manuals:", error);
    return NextResponse.json(
      { error: error.message || "Erreur lors de l'indexation" },
      { status: 500 }
    );
  }
}

