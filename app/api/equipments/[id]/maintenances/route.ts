import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import connectDB from "@/lib/mongodb";

// GET recommended maintenances for an equipment (from library)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const { id } = await params;

    await connectDB();

    const Maintenance = (await import("@/models/Maintenance")).default;

    // Get all maintenances for this equipment
    const maintenances = await Maintenance.find({
      equipmentId: id,
    }).sort({ priority: 1, createdAt: -1 });

    return NextResponse.json({ maintenances }, { status: 200 });
  } catch (error) {
    console.error("Error fetching equipment maintenances:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération des entretiens recommandés" },
      { status: 500 }
    );
  }
}

