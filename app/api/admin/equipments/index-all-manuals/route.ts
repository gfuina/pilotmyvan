import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import connectDB from "@/lib/mongodb";
import Equipment from "@/models/Equipment";
import { indexManual } from "@/lib/manualIndexing";

export async function POST() {
  try {
    const session = await auth();

    if (!session?.user || !session.user.isAdmin) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    await connectDB();

    // Récupérer tous les équipements qui ont des manuels
    const equipments = await Equipment.find({
      manuals: { $exists: true, $not: { $size: 0 } },
    }).select("_id name manuals");

    if (equipments.length === 0) {
      return NextResponse.json(
        { message: "Aucun équipement avec manuels trouvé" },
        { status: 200 }
      );
    }

    let totalIndexed = 0;
    let totalChunks = 0;
    const errors: Array<{ equipmentName: string; error: string }> = [];

    // Indexer chaque équipement
    for (const equipment of equipments) {
      try {
        // Indexer tous les manuels de cet équipement
        const manualResults = await Promise.allSettled(
          equipment.manuals.map((manual) =>
            indexManual(
              String(equipment._id),
              manual.title,
              manual.url,
              manual.isExternal
            )
          )
        );

        const successfulManuals = manualResults.filter(
          (r) => r.status === "fulfilled" && r.value.success
        );

        if (successfulManuals.length > 0) {
          totalIndexed++;
          totalChunks += successfulManuals.reduce((sum, r) => {
            if (r.status === "fulfilled") {
              return sum + r.value.chunksCreated;
            }
            return sum;
          }, 0);
        }

        // Collecter les erreurs
        const failedManuals = manualResults.filter(
          (r) => r.status === "rejected" || (r.status === "fulfilled" && !r.value.success)
        );
        
        if (failedManuals.length > 0) {
          errors.push({
            equipmentName: equipment.name,
            error: `${failedManuals.length} manuel(s) échoué(s)`,
          });
        }
      } catch (error: any) {
        errors.push({
          equipmentName: equipment.name,
          error: error.message || "Erreur inconnue",
        });
      }
    }

    return NextResponse.json({
      success: true,
      message: `${totalIndexed}/${equipments.length} équipements indexés`,
      totalChunks,
      totalEquipments: equipments.length,
      indexedEquipments: totalIndexed,
      errors: errors.length > 0 ? errors : undefined,
    });
  } catch (error: any) {
    console.error("Error indexing all manuals:", error);
    return NextResponse.json(
      { error: error.message || "Erreur lors de l'indexation globale" },
      { status: 500 }
    );
  }
}

