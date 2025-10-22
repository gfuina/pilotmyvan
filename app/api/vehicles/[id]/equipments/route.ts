import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import connectDB from "@/lib/mongodb";

// GET vehicle equipments
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

    const Vehicle = (await import("@/models/Vehicle")).default;
    const VehicleEquipment = (await import("@/models/VehicleEquipment")).default;
    
    // Import models to ensure they're registered for populate
    const Equipment = (await import("@/models/Equipment")).default;
    const Category = (await import("@/models/Category")).default;
    const VehicleBrand = (await import("@/models/VehicleBrand")).default;
    const EquipmentBrand = (await import("@/models/EquipmentBrand")).default;

    // Verify vehicle belongs to user
    const vehicle = await Vehicle.findOne({
      _id: id,
      userId: session.user.id,
    });

    if (!vehicle) {
      return NextResponse.json(
        { error: "Véhicule non trouvé" },
        { status: 404 }
      );
    }

    // Get vehicle equipments with populated data
    const vehicleEquipments = await VehicleEquipment.find({
      vehicleId: id,
    })
      .populate({
        path: "equipmentId",
        populate: [
          { path: "categoryId", select: "name level" },
          { path: "vehicleBrands", select: "name logo" },
          { path: "equipmentBrands", select: "name logo" },
        ],
      })
      .sort({ createdAt: -1 });

    return NextResponse.json({ equipments: vehicleEquipments }, { status: 200 });
  } catch (error) {
    console.error("Error fetching vehicle equipments:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération des équipements" },
      { status: 500 }
    );
  }
}

// POST add equipment to vehicle
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { equipmentId, installDate, notes, isCustom, customData } = body;

    await connectDB();

    const Vehicle = (await import("@/models/Vehicle")).default;
    const VehicleEquipment = (await import("@/models/VehicleEquipment")).default;
    
    // Import models to ensure they're registered for populate
    await import("@/models/Equipment");
    await import("@/models/Category");
    await import("@/models/VehicleBrand");
    await import("@/models/EquipmentBrand");

    // Verify vehicle belongs to user
    const vehicle = await Vehicle.findOne({
      _id: id,
      userId: session.user.id,
    });

    if (!vehicle) {
      return NextResponse.json(
        { error: "Véhicule non trouvé" },
        { status: 404 }
      );
    }

    // Validate: either equipmentId (library) or customData (custom)
    if (!isCustom && !equipmentId) {
      return NextResponse.json(
        { error: "equipmentId requis pour équipement de bibliothèque" },
        { status: 400 }
      );
    }

    if (isCustom && (!customData || !customData.name)) {
      return NextResponse.json(
        { error: "Nom requis pour équipement personnalisé" },
        { status: 400 }
      );
    }

    // Check if equipment already added (for library items)
    if (!isCustom && equipmentId) {
      const existing = await VehicleEquipment.findOne({
        vehicleId: id,
        equipmentId,
      });

      if (existing) {
        return NextResponse.json(
          { error: "Cet équipement est déjà ajouté à ce véhicule" },
          { status: 409 }
        );
      }
    }

    // Create vehicle equipment
    const vehicleEquipment = await VehicleEquipment.create({
      vehicleId: id,
      equipmentId: isCustom ? null : equipmentId,
      installDate,
      notes,
      isCustom,
      customData: isCustom ? customData : undefined,
    });

    // Populate for response
    const populatedEquipment = await VehicleEquipment.findById(
      vehicleEquipment._id
    ).populate({
      path: "equipmentId",
      populate: [
        { path: "categoryId", select: "name level" },
        { path: "vehicleBrands", select: "name logo" },
        { path: "equipmentBrands", select: "name logo" },
      ],
    });

    return NextResponse.json(
      { equipment: populatedEquipment },
      { status: 201 }
    );
  } catch (error) {
    const err = error as { code?: number };
    console.error("Error adding vehicle equipment:", error);
    
    // Handle unique constraint violation
    if (err.code === 11000) {
      return NextResponse.json(
        { error: "Cet équipement est déjà ajouté à ce véhicule" },
        { status: 409 }
      );
    }
    
    return NextResponse.json(
      { error: "Erreur lors de l'ajout de l'équipement" },
      { status: 500 }
    );
  }
}

