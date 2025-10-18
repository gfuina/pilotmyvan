import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import connectDB from "@/lib/mongodb";

// POST - User creates a new maintenance and adds it to their equipment
export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    await connectDB();

    const Maintenance = (await import("@/models/Maintenance")).default;
    const Equipment = (await import("@/models/Equipment")).default;
    const VehicleEquipment = (await import("@/models/VehicleEquipment")).default;
    const VehicleMaintenanceSchedule = (await import("@/models/VehicleMaintenanceSchedule")).default;

    const data = await request.json();
    const {
      equipmentId,
      vehicleEquipmentId,
      vehicleId,
      name,
      type,
      priority,
      difficulty,
      recurrence,
      conditions,
      description,
      instructions,
      photos,
      parts,
      estimatedDuration,
      estimatedCost,
      tags,
    } = data;

    // Validation
    if (!name || !equipmentId) {
      return NextResponse.json(
        { error: "Nom et équipement requis" },
        { status: 400 }
      );
    }

    if (!recurrence?.time && !recurrence?.kilometers) {
      return NextResponse.json(
        { error: "Au moins une récurrence (temporelle ou kilométrique) est requise" },
        { status: 400 }
      );
    }

    if (!vehicleEquipmentId || !vehicleId) {
      return NextResponse.json(
        { error: "Équipement véhicule requis" },
        { status: 400 }
      );
    }

    // Verify equipment exists
    const equipment = await Equipment.findById(equipmentId);
    if (!equipment) {
      return NextResponse.json(
        { error: "Équipement non trouvé" },
        { status: 404 }
      );
    }

    // Verify vehicle equipment belongs to user
    const vehicleEquipment = await VehicleEquipment.findOne({
      _id: vehicleEquipmentId,
      vehicleId,
    }).populate("vehicleId");

    if (!vehicleEquipment) {
      return NextResponse.json(
        { error: "Équipement véhicule non trouvé" },
        { status: 404 }
      );
    }

    // Verify vehicle belongs to user
    const Vehicle = (await import("@/models/Vehicle")).default;
    const vehicle = await Vehicle.findOne({
      _id: vehicleId,
      userId: session.user.id,
    });

    if (!vehicle) {
      return NextResponse.json(
        { error: "Véhicule non autorisé" },
        { status: 403 }
      );
    }

    // Create maintenance with pending status (will be reviewed by admin)
    const maintenance = await Maintenance.create({
      equipmentId,
      name,
      type,
      priority,
      difficulty,
      recurrence,
      conditions: conditions || [],
      description,
      instructions,
      photos: photos || [],
      parts: parts || [],
      estimatedDuration,
      estimatedCost,
      tags: tags || [],
      isOfficial: false,
      isUserContributed: true,
      contributedBy: session.user.id,
      status: "pending", // Admin will review to make it available for everyone
    });

    // Add maintenance schedule to user's vehicle equipment
    const maintenanceSchedule = await VehicleMaintenanceSchedule.create({
      vehicleId,
      vehicleEquipmentId,
      maintenanceId: maintenance._id,
      isCustom: false,
    });

    return NextResponse.json(
      {
        message: "Entretien créé et ajouté à votre équipement",
        maintenance,
        maintenanceSchedule,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating user maintenance:", error);
    return NextResponse.json(
      { error: "Erreur lors de la création de l'entretien" },
      { status: 500 }
    );
  }
}

