import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { isUserAdmin } from "@/lib/admin";
import connectDB from "@/lib/mongodb";

// GET all pending user-contributed maintenances
export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id || !(await isUserAdmin(session.user.id))) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
    }

    await connectDB();

    const Maintenance = (await import("@/models/Maintenance")).default;
    const Equipment = (await import("@/models/Equipment")).default;
    const User = (await import("@/models/User")).default;
    
    // Force registration
    void Equipment;
    void User;

    const pendingMaintenances = await Maintenance.find({
      isUserContributed: true,
      status: "pending",
    })
      .populate("contributedBy", "name email")
      .populate("equipmentId", "name categoryId photos")
      .sort({ createdAt: -1 });

    return NextResponse.json({ maintenances: pendingMaintenances }, { status: 200 });
  } catch (error) {
    console.error("Error fetching pending maintenances:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération" },
      { status: 500 }
    );
  }
}

