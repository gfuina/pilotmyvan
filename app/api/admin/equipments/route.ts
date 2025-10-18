import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import connectDB from "@/lib/mongodb";
import { isUserAdmin } from "@/lib/admin";

// GET all equipments with populated references
export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id || !isUserAdmin(session.user)) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const categoryId = searchParams.get("categoryId");

    await connectDB();

    // Import models after DB connection to ensure they're registered
    const Equipment = (await import("@/models/Equipment")).default;

    // Build query - exclude pending equipments (they appear in Contributions tab)
    const query: { categoryId?: string; $or: Array<{ status: { $ne: string } } | { status: { $exists: boolean } }> } = categoryId ? { categoryId, $or: [] } : { $or: [] };
    query.$or = [
      { status: { $ne: "pending" } },
      { status: { $exists: false } } // For old equipments without status field
    ];

    const equipments = await Equipment.find(query)
      .populate("categoryId", "name level")
      .populate("vehicleBrands", "name logo")
      .populate("equipmentBrands", "name logo")
      .sort({ createdAt: -1 });

    return NextResponse.json({ equipments }, { status: 200 });
  } catch (error) {
    console.error("Error fetching equipments:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération des équipements" },
      { status: 500 }
    );
  }
}

// POST create equipment
export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id || !isUserAdmin(session.user)) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const body = await request.json();
    const {
      name,
      description,
      categoryId,
      vehicleBrands,
      equipmentBrands,
      photos,
      manuals,
      notes,
    } = body;

    if (!name || !categoryId) {
      return NextResponse.json(
        { error: "Nom et catégorie requis" },
        { status: 400 }
      );
    }

    await connectDB();

    // Import models after DB connection
    const Equipment = (await import("@/models/Equipment")).default;

    const equipment = await Equipment.create({
      name,
      description,
      categoryId,
      vehicleBrands: vehicleBrands || [],
      equipmentBrands: equipmentBrands || [],
      photos: photos || [],
      manuals: manuals || [],
      notes,
      // Admin-created equipments are auto-approved
      isUserContributed: false,
      status: "approved",
    });

    const populatedEquipment = await Equipment.findById(equipment._id)
      .populate("categoryId", "name level")
      .populate("vehicleBrands", "name logo")
      .populate("equipmentBrands", "name logo");

    return NextResponse.json({ equipment: populatedEquipment }, { status: 201 });
  } catch (error) {
    console.error("Error creating equipment:", error);
    return NextResponse.json(
      { error: "Erreur lors de la création de l'équipement" },
      { status: 500 }
    );
  }
}

