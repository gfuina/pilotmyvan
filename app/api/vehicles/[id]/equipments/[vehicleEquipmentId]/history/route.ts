import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import connectToDatabase from "@/lib/mongodb";
import User from "@/models/User";
import Vehicle from "@/models/Vehicle";
import VehicleEquipment from "@/models/VehicleEquipment";
import MaintenanceRecord from "@/models/MaintenanceRecord";
import VehicleMaintenanceSchedule from "@/models/VehicleMaintenanceSchedule";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; vehicleEquipmentId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const { id: vehicleId, vehicleEquipmentId } = await params;

    await connectToDatabase();
    const user = await User.findOne({ email: session.user.email });
    if (!user) {
      return NextResponse.json(
        { error: "Utilisateur non trouvé" },
        { status: 404 }
      );
    }

    // Vérifier que le véhicule appartient à l'utilisateur
    const vehicle = await Vehicle.findOne({ _id: vehicleId, userId: user._id });
    if (!vehicle) {
      return NextResponse.json(
        { error: "Véhicule non trouvé" },
        { status: 404 }
      );
    }

    // Vérifier que l'équipement appartient au véhicule
    const equipment = await VehicleEquipment.findOne({
      _id: vehicleEquipmentId,
      vehicleId,
    });

    if (!equipment) {
      return NextResponse.json(
        { error: "Équipement non trouvé" },
        { status: 404 }
      );
    }

    // Récupérer tous les schedules de cet équipement
    const schedules = await VehicleMaintenanceSchedule.find({
      vehicleEquipmentId,
    })
      .populate("maintenanceId")
      .lean();

    const scheduleIds = schedules.map((s) => s._id);

    // Récupérer tous les enregistrements de maintenance pour ces schedules
    const records = await MaintenanceRecord.find({
      vehicleMaintenanceScheduleId: { $in: scheduleIds },
    })
      .sort({ completedAt: -1 })
      .lean();

    // Enrichir les records avec les informations de maintenance
    const enrichedRecords = records.map((record) => {
      const schedule = schedules.find(
        (s) => s._id.toString() === record.vehicleMaintenanceScheduleId.toString()
      );
      
      const maintenanceData = schedule?.isCustom
        ? schedule.customData
        : schedule?.maintenanceId;

      return {
        ...record,
        maintenanceName: maintenanceData?.name || "Entretien personnalisé",
        maintenanceType: maintenanceData?.type,
        maintenancePriority: maintenanceData?.priority,
      };
    });

    // Calculer les statistiques globales
    const stats = {
      totalRecords: enrichedRecords.length,
      totalCost: enrichedRecords.reduce((sum, r) => sum + (r.cost || 0), 0),
      averageCost:
        enrichedRecords.length > 0
          ? enrichedRecords.reduce((sum, r) => sum + (r.cost || 0), 0) /
            enrichedRecords.filter((r) => r.cost).length
          : 0,
      lastMaintenanceDate:
        enrichedRecords.length > 0 ? enrichedRecords[0].completedAt : null,
      maintenanceTypes: schedules.reduce((acc: Record<string, number>, s) => {
        const data = s.isCustom ? s.customData : s.maintenanceId;
        const type = data?.type || "other";
        acc[type] = (acc[type] || 0) + 1;
        return acc;
      }, {}),
    };

    return NextResponse.json({
      records: enrichedRecords,
      stats,
      schedules: schedules.map((s) => ({
        _id: s._id,
        name: s.isCustom ? s.customData?.name : s.maintenanceId?.name,
        type: s.isCustom ? s.customData?.type : s.maintenanceId?.type,
      })),
    });
  } catch (error) {
    console.error("Erreur lors de la récupération de l'historique:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

