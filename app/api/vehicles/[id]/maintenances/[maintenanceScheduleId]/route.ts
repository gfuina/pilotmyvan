import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import connectToDatabase from "@/lib/mongodb";
import User from "@/models/User";
import Vehicle from "@/models/Vehicle";
import VehicleMaintenanceSchedule from "@/models/VehicleMaintenanceSchedule";
import MaintenanceRecord from "@/models/MaintenanceRecord";

// DELETE - Supprimer un entretien et son historique
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; maintenanceScheduleId: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const { id: vehicleId, maintenanceScheduleId } = await params;

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

    // Vérifier que l'entretien existe et appartient au véhicule
    const schedule = await VehicleMaintenanceSchedule.findOne({
      _id: maintenanceScheduleId,
      vehicleId,
    });

    if (!schedule) {
      return NextResponse.json(
        { error: "Entretien non trouvé" },
        { status: 404 }
      );
    }

    // Supprimer tous les enregistrements d'historique associés
    await MaintenanceRecord.deleteMany({
      vehicleMaintenanceScheduleId: maintenanceScheduleId,
    });

    // Supprimer l'entretien planifié
    await VehicleMaintenanceSchedule.findByIdAndDelete(maintenanceScheduleId);

    return NextResponse.json({
      message: "Entretien et historique supprimés avec succès",
    });
  } catch (error) {
    console.error("Erreur lors de la suppression de l'entretien:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

