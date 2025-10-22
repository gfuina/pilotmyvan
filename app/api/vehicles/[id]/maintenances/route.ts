import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import connectDB from "@/lib/mongodb";

// GET all vehicle maintenances (across all equipments)
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
    const VehicleMaintenanceSchedule = (await import("@/models/VehicleMaintenanceSchedule")).default;
    const VehicleEquipment = (await import("@/models/VehicleEquipment")).default;
    
    // Import models for populate
    const Maintenance = (await import("@/models/Maintenance")).default;
    const Equipment = (await import("@/models/Equipment")).default;
    
    // Force registration
    void Maintenance;
    void Equipment;

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

    // Get all maintenance schedules for this vehicle
    const maintenances = await VehicleMaintenanceSchedule.find({
      vehicleId: id,
    })
      .populate({
        path: "maintenanceId",
        select: "name type priority difficulty recurrence description instructions estimatedDuration estimatedCost tags isOfficial",
      })
      .populate({
        path: "vehicleEquipmentId",
        select: "equipmentId customData isCustom",
        populate: {
          path: "equipmentId",
          select: "name photos",
        },
      })
      .sort({ status: 1, nextDueDate: 1 })
      .lean(); // Convert to plain JS objects to ensure proper serialization

    return NextResponse.json({ maintenances }, { status: 200 });
  } catch (error) {
    console.error("Error fetching vehicle maintenances:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération des entretiens" },
      { status: 500 }
    );
  }
}

