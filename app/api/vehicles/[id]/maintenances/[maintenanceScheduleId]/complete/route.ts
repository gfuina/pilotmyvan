import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import connectToDatabase from "@/lib/mongodb";
import User from "@/models/User";
import Vehicle from "@/models/Vehicle";
import VehicleMaintenanceSchedule from "@/models/VehicleMaintenanceSchedule";
import MaintenanceRecord from "@/models/MaintenanceRecord";
import MileageHistory from "@/models/MileageHistory";
import Maintenance from "@/models/Maintenance";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; maintenanceScheduleId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const { id: vehicleId, maintenanceScheduleId } = await params;
    const body = await request.json();
    const {
      completedAt,
      mileageAtCompletion,
      notes,
      attachments = [],
      cost,
      location,
    } = body;

    // Validation
    if (!completedAt) {
      return NextResponse.json(
        { error: "La date d'exécution est requise" },
        { status: 400 }
      );
    }

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

    // Récupérer le schedule de maintenance
    const schedule = await VehicleMaintenanceSchedule.findOne({
      _id: maintenanceScheduleId,
      vehicleId,
    }).populate("maintenanceId");

    if (!schedule) {
      return NextResponse.json(
        { error: "Entretien non trouvé" },
        { status: 404 }
      );
    }

    // Créer l'enregistrement de maintenance
    const maintenanceRecord = await MaintenanceRecord.create({
      vehicleMaintenanceScheduleId: maintenanceScheduleId,
      vehicleId,
      userId: user._id,
      completedAt: new Date(completedAt),
      mileageAtCompletion,
      notes,
      attachments,
      cost,
      location,
    });

    // Mettre à jour le schedule avec la dernière exécution
    schedule.lastCompletedAt = new Date(completedAt);
    if (mileageAtCompletion) {
      schedule.lastCompletedMileage = mileageAtCompletion;
    }

    // Recalculer la prochaine échéance
    const maintenanceData = schedule.isCustom
      ? schedule.customData
      : schedule.maintenanceId;

    if (maintenanceData?.recurrence) {
      // Calcul basé sur la date
      if (maintenanceData.recurrence.time) {
        const { value, unit } = maintenanceData.recurrence.time;
        const nextDate = new Date(completedAt);

        if (unit === "days") {
          nextDate.setDate(nextDate.getDate() + value);
        } else if (unit === "months") {
          nextDate.setMonth(nextDate.getMonth() + value);
        } else if (unit === "years") {
          nextDate.setFullYear(nextDate.getFullYear() + value);
        }

        schedule.nextDueDate = nextDate;
      }

      // Calcul basé sur les kilomètres
      if (maintenanceData.recurrence.kilometers && mileageAtCompletion) {
        schedule.nextDueKilometers =
          mileageAtCompletion + maintenanceData.recurrence.kilometers;
      }
    }

    // Mettre à jour le statut
    schedule.status = "pending";

    await schedule.save();

    // Si un kilométrage est fourni, mettre à jour l'historique du véhicule
    if (mileageAtCompletion) {
      // Vérifier s'il faut créer une entrée de kilométrage
      const lastMileage = await MileageHistory.findOne({ vehicleId })
        .sort({ recordedAt: -1 })
        .lean();

      const shouldCreateMileageEntry = !lastMileage || 
        (mileageAtCompletion > lastMileage.mileage &&
        Date.now() - new Date(lastMileage.recordedAt).getTime() >= 2 * 60 * 60 * 1000);

      if (shouldCreateMileageEntry) {
        await MileageHistory.create({
          userId: user._id,
          vehicleId,
          mileage: mileageAtCompletion,
          recordedAt: new Date(completedAt),
        });

        // Mettre à jour le currentMileage du véhicule
        await Vehicle.findByIdAndUpdate(vehicleId, {
          currentMileage: mileageAtCompletion,
        });
      }
    }

    return NextResponse.json({
      message: "Entretien marqué comme effectué",
      record: maintenanceRecord,
      schedule,
    });
  } catch (error) {
    console.error("Erreur lors de la complétion de l'entretien:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

