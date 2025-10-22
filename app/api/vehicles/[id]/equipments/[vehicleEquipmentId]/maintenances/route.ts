import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import connectDB from "@/lib/mongodb";

// GET vehicle equipment maintenances
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; vehicleEquipmentId: string }> }
) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const { id, vehicleEquipmentId } = await params;

    await connectDB();

    const Vehicle = (await import("@/models/Vehicle")).default;
    const VehicleEquipment = (await import("@/models/VehicleEquipment")).default;
    const VehicleMaintenanceSchedule = (await import("@/models/VehicleMaintenanceSchedule")).default;
    const Maintenance = (await import("@/models/Maintenance")).default;
    
    // Force registration
    void Maintenance;

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

    // Verify equipment belongs to vehicle
    const equipment = await VehicleEquipment.findOne({
      _id: vehicleEquipmentId,
      vehicleId: id,
    });

    if (!equipment) {
      return NextResponse.json(
        { error: "Équipement non trouvé" },
        { status: 404 }
      );
    }

    // Get maintenance schedules
    const maintenances = await VehicleMaintenanceSchedule.find({
      vehicleId: id,
      vehicleEquipmentId: vehicleEquipmentId,
    })
      .populate({
        path: "maintenanceId",
        select: "name type priority difficulty recurrence description instructions estimatedDuration estimatedCost tags isOfficial",
      })
      .sort({ status: 1, nextDueDate: 1 });

    return NextResponse.json({ maintenances }, { status: 200 });
  } catch (error) {
    console.error("Error fetching maintenances:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération des entretiens" },
      { status: 500 }
    );
  }
}

// POST add maintenance schedules (bulk)
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; vehicleEquipmentId: string }> }
) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const { id, vehicleEquipmentId } = await params;
    const body = await request.json();
    const { maintenanceIds, isCustom, customData } = body;

    await connectDB();

    const Vehicle = (await import("@/models/Vehicle")).default;
    const VehicleEquipment = (await import("@/models/VehicleEquipment")).default;
    const VehicleMaintenanceSchedule = (await import("@/models/VehicleMaintenanceSchedule")).default;
    const Maintenance = (await import("@/models/Maintenance")).default;

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

    // Verify equipment belongs to vehicle
    const equipment = await VehicleEquipment.findOne({
      _id: vehicleEquipmentId,
      vehicleId: id,
    });

    if (!equipment) {
      return NextResponse.json(
        { error: "Équipement non trouvé" },
        { status: 404 }
      );
    }

    // Validate input
    if (!isCustom && (!maintenanceIds || !Array.isArray(maintenanceIds) || maintenanceIds.length === 0)) {
      return NextResponse.json(
        { error: "maintenanceIds requis" },
        { status: 400 }
      );
    }

    if (isCustom && (!customData || !customData.name)) {
      return NextResponse.json(
        { error: "Nom requis pour entretien personnalisé" },
        { status: 400 }
      );
    }

    const created = [];
    const errors = [];

    if (isCustom) {
      // Create custom maintenance
      try {
        const schedule = await VehicleMaintenanceSchedule.create({
          vehicleId: id,
          vehicleEquipmentId: vehicleEquipmentId,
          isCustom: true,
          customData,
        });
        created.push(schedule);
      } catch (error) {
        const err = error as { code?: number; message?: string };
        if (err.code === 11000) {
          errors.push({ maintenanceId: "custom", error: "Déjà ajouté" });
        } else {
          errors.push({ maintenanceId: "custom", error: err.message || "Erreur" });
        }
      }
    } else {
      // Create maintenance schedules for each selected maintenance
      for (const maintenanceId of maintenanceIds) {
        try {
          // Get maintenance data for recurrence calculation
          const maintenance = await Maintenance.findById(maintenanceId);
          
          if (!maintenance) {
            errors.push({ maintenanceId, error: "Entretien non trouvé" });
            continue;
          }

          const schedule = new VehicleMaintenanceSchedule({
            vehicleId: id,
            vehicleEquipmentId: vehicleEquipmentId,
            maintenanceId,
            isCustom: false,
          });

          // Calculate next due dates
          schedule.calculateNextDue(vehicle.currentMileage, maintenance);
          await schedule.save();

          created.push(schedule);
        } catch (error) {
          const err = error as { code?: number; message?: string };
          if (err.code === 11000) {
            errors.push({ maintenanceId, error: "Déjà ajouté" });
          } else {
            errors.push({ maintenanceId, error: err.message || "Erreur" });
          }
        }
      }
    }

    // Populate created schedules
    const populated = await VehicleMaintenanceSchedule.find({
      _id: { $in: created.map((s) => s._id) },
    }).populate({
      path: "maintenanceId",
      select: "name type priority difficulty recurrence description instructions estimatedDuration estimatedCost tags isOfficial",
    });

    return NextResponse.json(
      {
        success: true,
        created: populated,
        errors: errors.length > 0 ? errors : undefined,
      },
      { status: 201 }
    );
  } catch (error) {
    const err = error as { message?: string };
    console.error("Error adding maintenances:", error);
    return NextResponse.json(
      { error: err.message || "Erreur lors de l'ajout des entretiens" },
      { status: 500 }
    );
  }
}

