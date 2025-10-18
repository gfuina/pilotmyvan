import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import connectDB from "@/lib/mongodb";
import Maintenance from "@/models/Maintenance";
import { isUserAdmin } from "@/lib/admin";

// GET all maintenances (optionally filtered by equipmentId)
export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id || !isUserAdmin(session.user)) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const equipmentId = searchParams.get("equipmentId");

    await connectDB();

    const query = equipmentId ? { equipmentId } : {};

    const maintenances = await Maintenance.find(query)
      .populate("equipmentId", "name categoryId photos")
      .sort({ priority: 1, createdAt: -1 });

    return NextResponse.json({ maintenances }, { status: 200 });
  } catch (error) {
    console.error("Error fetching maintenances:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération des entretiens" },
      { status: 500 }
    );
  }
}

// POST create maintenance
export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id || !isUserAdmin(session.user)) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const body = await request.json();

    // Validate at least one recurrence
    if (!body.recurrence?.time && !body.recurrence?.kilometers) {
      return NextResponse.json(
        { error: "Au moins une récurrence (temporelle ou kilométrique) est requise" },
        { status: 400 }
      );
    }

    await connectDB();

    const maintenance = await Maintenance.create(body);

    const populatedMaintenance = await Maintenance.findById(maintenance._id).populate(
      "equipmentId",
      "name categoryId photos"
    );

    return NextResponse.json({ maintenance: populatedMaintenance }, { status: 201 });
  } catch (error) {
    console.error("Error creating maintenance:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Erreur lors de la création de l'entretien" },
      { status: 500 }
    );
  }
}

