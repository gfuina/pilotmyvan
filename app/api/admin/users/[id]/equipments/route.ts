import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import connectDB from "@/lib/mongodb";
import VehicleEquipment from "@/models/VehicleEquipment";
import Vehicle from "@/models/Vehicle";
import Equipment from "@/models/Equipment";
import Category from "@/models/Category";
import VehicleBrand from "@/models/VehicleBrand";
import EquipmentBrand from "@/models/EquipmentBrand";

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

    // First get all vehicles for this user
    const vehicles = await Vehicle.find({ userId: id }).select("_id");
    const vehicleIds = vehicles.map((v) => v._id);

    // Then get all equipments for these vehicles
    const vehicleEquipments = await VehicleEquipment.find({
      vehicleId: { $in: vehicleIds },
    })
      .populate("equipmentId")
      .populate("vehicleId")
      .sort({ createdAt: -1 });

    return NextResponse.json({ equipments: vehicleEquipments }, { status: 200 });
  } catch (error) {
    console.error("Error fetching user equipments:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération des équipements" },
      { status: 500 }
    );
  }
}

