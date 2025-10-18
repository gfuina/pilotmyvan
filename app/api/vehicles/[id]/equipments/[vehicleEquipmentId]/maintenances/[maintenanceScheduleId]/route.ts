import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import connectDB from "@/lib/mongodb";

// DELETE vehicle maintenance schedule
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; vehicleEquipmentId: string; maintenanceScheduleId: string }> }
) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const { id, vehicleEquipmentId, maintenanceScheduleId } = await params;

    await connectDB();

    const Vehicle = (await import("@/models/Vehicle")).default;
    const VehicleMaintenanceSchedule = (await import("@/models/VehicleMaintenanceSchedule")).default;

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

    // Delete maintenance schedule
    const result = await VehicleMaintenanceSchedule.findOneAndDelete({
      _id: maintenanceScheduleId,
      vehicleId: id,
      vehicleEquipmentId: vehicleEquipmentId,
    });

    if (!result) {
      return NextResponse.json(
        { error: "Entretien non trouvé" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Error deleting maintenance schedule:", error);
    return NextResponse.json(
      { error: "Erreur lors de la suppression" },
      { status: 500 }
    );
  }
}

