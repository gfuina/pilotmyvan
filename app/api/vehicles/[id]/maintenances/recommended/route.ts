import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import connectDB from "@/lib/mongodb";

// GET recommended maintenances for vehicle (based on equipments, not yet added)
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
    const VehicleMaintenanceSchedule = (await import("@/models/VehicleMaintenanceSchedule")).default;
    const Maintenance = (await import("@/models/Maintenance")).default;
    const Equipment = (await import("@/models/Equipment")).default;
    
    // Force registration
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

    // Get all vehicle equipments (only library equipments, not custom)
    const vehicleEquipments = await VehicleEquipment.find({
      vehicleId: id,
      isCustom: false,
      equipmentId: { $ne: null },
    }).select("equipmentId");

    if (vehicleEquipments.length === 0) {
      return NextResponse.json({ recommendations: [] }, { status: 200 });
    }

    const equipmentIds = vehicleEquipments.map((ve) => ve.equipmentId);

    // Get all recommended maintenances for these equipments
    const allRecommendedMaintenances = await Maintenance.find({
      equipmentId: { $in: equipmentIds },
    })
      .populate({
        path: "equipmentId",
        select: "name photos",
      })
      .sort({ priority: 1 });

    // Get already added maintenance IDs
    const addedSchedules = await VehicleMaintenanceSchedule.find({
      vehicleId: id,
      maintenanceId: { $ne: null },
    }).select("maintenanceId vehicleEquipmentId");

    const addedMaintenanceIds = new Set(
      addedSchedules.map((s) => s.maintenanceId?.toString() || "")
    );

    // Filter out already added maintenances and group by equipment
    type RecommendationGroup = {
      equipment: typeof allRecommendedMaintenances[0]["equipmentId"];
      vehicleEquipmentId: typeof vehicleEquipments[0]["_id"];
      maintenances: typeof allRecommendedMaintenances;
    };
    const recommendationsByEquipment: Record<string, RecommendationGroup> = {};

    for (const maintenance of allRecommendedMaintenances) {
      if (!addedMaintenanceIds.has(maintenance._id?.toString() || "")) {
        const equipmentId = maintenance.equipmentId._id.toString();
        
        if (!recommendationsByEquipment[equipmentId]) {
          // Find the vehicleEquipmentId for this equipment
          const vehicleEquipment = vehicleEquipments.find(
            (ve) => ve.equipmentId.toString() === equipmentId
          );

          recommendationsByEquipment[equipmentId] = {
            equipment: maintenance.equipmentId,
            vehicleEquipmentId: vehicleEquipment?._id,
            maintenances: [],
          };
        }

        recommendationsByEquipment[equipmentId].maintenances.push(maintenance);
      }
    }

    const recommendations = Object.values(recommendationsByEquipment);

    return NextResponse.json({ recommendations }, { status: 200 });
  } catch (error) {
    console.error("Error fetching recommended maintenances:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération des recommandations" },
      { status: 500 }
    );
  }
}

