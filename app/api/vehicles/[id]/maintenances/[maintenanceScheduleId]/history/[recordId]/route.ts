import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import connectToDatabase from "@/lib/mongodb";
import User from "@/models/User";
import Vehicle from "@/models/Vehicle";
import MaintenanceRecord from "@/models/MaintenanceRecord";
import VehicleMaintenanceSchedule from "@/models/VehicleMaintenanceSchedule";

// PATCH - Update a maintenance record
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; maintenanceScheduleId: string; recordId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const { id: vehicleId, maintenanceScheduleId, recordId } = await params;
    const body = await request.json();

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

    // Vérifier que le record existe et appartient à l'utilisateur
    const record = await MaintenanceRecord.findOne({
      _id: recordId,
      vehicleMaintenanceScheduleId: maintenanceScheduleId,
      vehicleId,
      userId: user._id,
    });

    if (!record) {
      return NextResponse.json(
        { error: "Enregistrement non trouvé" },
        { status: 404 }
      );
    }

    // Mettre à jour le record
    const updateData: any = {};
    if (body.completedAt !== undefined) updateData.completedAt = new Date(body.completedAt);
    if (body.mileageAtCompletion !== undefined) updateData.mileageAtCompletion = body.mileageAtCompletion;
    if (body.cost !== undefined) updateData.cost = body.cost;
    if (body.notes !== undefined) updateData.notes = body.notes;
    if (body.location !== undefined) updateData.location = body.location;

    Object.assign(record, updateData);
    await record.save();

    // Mettre à jour le schedule si c'est le dernier record
    const latestRecord = await MaintenanceRecord.findOne({
      vehicleMaintenanceScheduleId: maintenanceScheduleId,
      vehicleId,
    })
      .sort({ completedAt: -1 })
      .lean();

    if (latestRecord && latestRecord._id.toString() === recordId) {
      const schedule = await VehicleMaintenanceSchedule.findById(maintenanceScheduleId);
      if (schedule) {
        schedule.lastCompletedAt = latestRecord.completedAt;
        schedule.lastCompletedMileage = latestRecord.mileageAtCompletion;

        // Recalculer la prochaine échéance
        const maintenanceData = schedule.isCustom
          ? schedule.customData
          : await schedule.populate("maintenanceId");

        const recurrence = schedule.isCustom
          ? schedule.customData?.recurrence
          : (maintenanceData as any)?.recurrence;

        if (recurrence) {
          if (recurrence.time) {
            const { value, unit } = recurrence.time;
            const nextDate = new Date(latestRecord.completedAt);

            if (unit === "days") {
              nextDate.setDate(nextDate.getDate() + value);
            } else if (unit === "weeks") {
              nextDate.setDate(nextDate.getDate() + value * 7);
            } else if (unit === "months") {
              nextDate.setMonth(nextDate.getMonth() + value);
            } else if (unit === "years") {
              nextDate.setFullYear(nextDate.getFullYear() + value);
            }

            schedule.nextDueDate = nextDate;
          }

          if (recurrence.kilometers && latestRecord.mileageAtCompletion) {
            schedule.nextDueKilometers =
              latestRecord.mileageAtCompletion + recurrence.kilometers;
          }
        }

        await schedule.save();
      }
    }

    return NextResponse.json({
      message: "Enregistrement mis à jour",
      record,
    });
  } catch (error) {
    console.error("Erreur lors de la mise à jour de l'enregistrement:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

// DELETE - Delete a maintenance record
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; maintenanceScheduleId: string; recordId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const { id: vehicleId, maintenanceScheduleId, recordId } = await params;

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

    // Vérifier que le record existe et appartient à l'utilisateur
    const record = await MaintenanceRecord.findOne({
      _id: recordId,
      vehicleMaintenanceScheduleId: maintenanceScheduleId,
      vehicleId,
      userId: user._id,
    });

    if (!record) {
      return NextResponse.json(
        { error: "Enregistrement non trouvé" },
        { status: 404 }
      );
    }

    // Supprimer le record
    await MaintenanceRecord.deleteOne({ _id: recordId });

    // Mettre à jour le schedule avec le nouveau dernier record
    const latestRecord = await MaintenanceRecord.findOne({
      vehicleMaintenanceScheduleId: maintenanceScheduleId,
      vehicleId,
    })
      .sort({ completedAt: -1 })
      .lean();

    const schedule = await VehicleMaintenanceSchedule.findById(maintenanceScheduleId);
    if (schedule) {
      if (latestRecord) {
        schedule.lastCompletedAt = latestRecord.completedAt;
        schedule.lastCompletedMileage = latestRecord.mileageAtCompletion;

        // Recalculer la prochaine échéance basée sur le nouveau dernier record
        const maintenanceData = schedule.isCustom
          ? schedule.customData
          : await schedule.populate("maintenanceId");

        const recurrence = schedule.isCustom
          ? schedule.customData?.recurrence
          : (maintenanceData as any)?.recurrence;

        if (recurrence) {
          if (recurrence.time) {
            const { value, unit } = recurrence.time;
            const nextDate = new Date(latestRecord.completedAt);

            if (unit === "days") {
              nextDate.setDate(nextDate.getDate() + value);
            } else if (unit === "weeks") {
              nextDate.setDate(nextDate.getDate() + value * 7);
            } else if (unit === "months") {
              nextDate.setMonth(nextDate.getMonth() + value);
            } else if (unit === "years") {
              nextDate.setFullYear(nextDate.getFullYear() + value);
            }

            schedule.nextDueDate = nextDate;
          }

          if (recurrence.kilometers && latestRecord.mileageAtCompletion) {
            schedule.nextDueKilometers =
              latestRecord.mileageAtCompletion + recurrence.kilometers;
          }
        }
      } else {
        // Plus aucun record, réinitialiser
        schedule.lastCompletedAt = undefined;
        schedule.lastCompletedMileage = undefined;

        // Recalculer à partir de maintenant
        const maintenanceData = schedule.isCustom
          ? schedule.customData
          : await schedule.populate("maintenanceId");

        const recurrence = schedule.isCustom
          ? schedule.customData?.recurrence
          : (maintenanceData as any)?.recurrence;

        if (recurrence) {
          if (recurrence.time) {
            const { value, unit } = recurrence.time;
            const nextDate = new Date();

            if (unit === "days") {
              nextDate.setDate(nextDate.getDate() + value);
            } else if (unit === "weeks") {
              nextDate.setDate(nextDate.getDate() + value * 7);
            } else if (unit === "months") {
              nextDate.setMonth(nextDate.getMonth() + value);
            } else if (unit === "years") {
              nextDate.setFullYear(nextDate.getFullYear() + value);
            }

            schedule.nextDueDate = nextDate;
          }

          if (recurrence.kilometers && vehicle.currentMileage) {
            schedule.nextDueKilometers =
              vehicle.currentMileage + recurrence.kilometers;
          }
        }
      }

      await schedule.save();
    }

    return NextResponse.json({
      message: "Enregistrement supprimé",
    });
  } catch (error) {
    console.error("Erreur lors de la suppression de l'enregistrement:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

