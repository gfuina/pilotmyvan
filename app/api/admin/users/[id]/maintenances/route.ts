import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import connectDB from "@/lib/mongodb";
import MaintenanceRecord from "@/models/MaintenanceRecord";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    if (!session.user.isAdmin) {
      return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
    }

    const { id } = await params;

    await connectDB();

    const maintenances = await MaintenanceRecord.find({ userId: id })
      .populate("vehicleId")
      .populate({
        path: "vehicleMaintenanceScheduleId",
        populate: {
          path: "maintenanceId",
        },
      })
      .sort({ completedAt: -1 });

    return NextResponse.json({ maintenances }, { status: 200 });
  } catch (error) {
    console.error("Error fetching user maintenances:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération des maintenances" },
      { status: 500 }
    );
  }
}

