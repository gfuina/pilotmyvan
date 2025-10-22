import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import connectDB from "@/lib/mongodb";
import Equipment from "@/models/Equipment";
import ManualChunk from "@/models/ManualChunk";

export async function GET() {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    await connectDB();

    // Récupérer tous les équipements approuvés avec des manuels
    const equipments = await Equipment.find({
      status: "approved",
      manuals: { $exists: true, $not: { $size: 0 } },
    })
      .select("_id name description categoryId equipmentBrands photos manuals")
      .populate("categoryId", "name")
      .populate("equipmentBrands", "name")
      .lean();

    // Vérifier lesquels ont des chunks indexés
    const equipmentsWithIndexedManuals = await Promise.all(
      equipments.map(async (equipment) => {
        const chunksCount = await ManualChunk.countDocuments({
          equipmentId: equipment._id,
        });
        
        return {
          ...equipment,
          isIndexed: chunksCount > 0,
          manualsCount: equipment.manuals?.length || 0,
        };
      })
    );

    // Ne retourner que ceux qui sont indexés
    const indexedEquipments = equipmentsWithIndexedManuals.filter(
      (eq) => eq.isIndexed
    );

    return NextResponse.json({
      equipments: indexedEquipments,
      total: indexedEquipments.length,
    });
  } catch (error: any) {
    console.error("Error fetching equipments with manuals:", error);
    return NextResponse.json(
      { error: error.message || "Erreur lors de la récupération" },
      { status: 500 }
    );
  }
}

