import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import connectToDatabase from "@/lib/mongodb";
import User from "@/models/User";
import Vehicle from "@/models/Vehicle";
import MaintenanceRecord from "@/models/MaintenanceRecord";

export async function GET(
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

    // Récupérer l'historique
    const records = await MaintenanceRecord.find({
      vehicleMaintenanceScheduleId: maintenanceScheduleId,
      vehicleId,
    })
      .sort({ completedAt: -1 })
      .lean();

    // Calculer des statistiques
    const totalRecords = records.length;
    const totalCost = records.reduce((sum, r) => sum + (r.cost || 0), 0);
    const averageCost = totalRecords > 0 ? totalCost / totalRecords : 0;
    
    // Intervalle moyen entre entretiens (en jours)
    let averageInterval = 0;
    if (totalRecords >= 2) {
      const intervals = [];
      for (let i = 0; i < records.length - 1; i++) {
        const diff = new Date(records[i].completedAt).getTime() - 
                     new Date(records[i + 1].completedAt).getTime();
        intervals.push(diff / (1000 * 60 * 60 * 24)); // Convertir en jours
      }
      averageInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;
    }

    return NextResponse.json({
      records,
      statistics: {
        totalRecords,
        totalCost,
        averageCost,
        averageInterval: Math.round(averageInterval),
      },
    });
  } catch (error) {
    console.error("Erreur lors de la récupération de l'historique:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

