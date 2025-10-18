import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import dbConnect from "@/lib/mongodb";
import VehicleMaintenanceSchedule from "@/models/VehicleMaintenanceSchedule";
import Vehicle from "@/models/Vehicle";
import Maintenance from "@/models/Maintenance";
import VehicleEquipment from "@/models/VehicleEquipment";
import Equipment from "@/models/Equipment";

export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    await dbConnect();

    // Force les modèles à être enregistrés
    Maintenance;
    VehicleEquipment;
    Equipment;

    // Récupérer les véhicules de l'utilisateur
    const vehicles = await Vehicle.find({ userId: session.user.id }).select('_id name make model');

    const vehicleIds = vehicles.map(v => v._id);

    // Récupérer tous les entretiens pour ces véhicules
    const maintenances = await VehicleMaintenanceSchedule.find({
      vehicleId: { $in: vehicleIds }
    })
      .populate('maintenanceId')
      .populate({
        path: 'vehicleEquipmentId',
        populate: {
          path: 'equipmentId'
        }
      })
      .populate('vehicleId', 'name make model currentMileage')
      .sort({ nextDueDate: 1 }); // Trier par date d'échéance la plus proche

    // Enrichir les données avec les informations du véhicule
    const enrichedMaintenances = maintenances.map(m => {
      const maintenanceData = m.isCustom ? m.customData : m.maintenanceId;
      
      return {
        _id: m._id.toString(),
        vehicleId: m.vehicleId._id.toString(),
        vehicleEquipmentId: m.vehicleEquipmentId,
        maintenanceId: m.maintenanceId,
        isCustom: m.isCustom,
        customData: m.customData,
        status: m.status,
        history: m.history,
        lastCompletedAt: m.lastCompletedAt,
        lastCompletedMileage: m.lastCompletedMileage,
        nextDueDate: m.nextDueDate,
        nextDueKilometers: m.nextDueKilometers,
        notes: m.notes,
        createdAt: m.createdAt,
        updatedAt: m.updatedAt,
        vehicleInfo: {
          _id: m.vehicleId._id.toString(),
          name: m.vehicleId.name,
          make: m.vehicleId.make,
          model: m.vehicleId.model,
          currentMileage: m.vehicleId.currentMileage,
        },
        maintenanceData,
      };
    });

    return NextResponse.json({ maintenances: enrichedMaintenances });
  } catch (error) {
    console.error("Error fetching user maintenances:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération des entretiens" },
      { status: 500 }
    );
  }
}
