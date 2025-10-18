import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { isUserAdmin } from "@/lib/admin";
import connectDB from "@/lib/mongodb";

// GET all pending user-contributed equipments
export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id || !(await isUserAdmin(session.user.id))) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
    }

    await connectDB();

    const Equipment = (await import("@/models/Equipment")).default;
    const User = (await import("@/models/User")).default;
    const Category = (await import("@/models/Category")).default;
    const VehicleBrand = (await import("@/models/VehicleBrand")).default;
    const EquipmentBrand = (await import("@/models/EquipmentBrand")).default;

    const pendingEquipments = await Equipment.find({
      isUserContributed: true,
      status: "pending",
    })
      .populate("contributedBy", "name email")
      .populate("categoryId", "name")
      .populate("vehicleBrands", "name logo")
      .populate("equipmentBrands", "name logo")
      .sort({ createdAt: -1 });

    return NextResponse.json({ equipments: pendingEquipments }, { status: 200 });
  } catch (error) {
    console.error("Error fetching pending equipments:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération" },
      { status: 500 }
    );
  }
}

