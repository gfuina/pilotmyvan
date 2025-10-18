import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import connectDB from "@/lib/mongodb";
import Vehicle from "@/models/Vehicle";
import User from "@/models/User";

export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    if (!session.user.isAdmin) {
      return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
    }

    await connectDB();

    const vehicles = await Vehicle.find({}).sort({ createdAt: -1 });

    // Get user info for each vehicle
    const vehiclesWithUsers = await Promise.all(
      vehicles.map(async (vehicle) => {
        const user = await User.findById(vehicle.userId).select("name email");
        return {
          ...vehicle.toObject(),
          userName: user?.name,
          userEmail: user?.email,
        };
      })
    );

    return NextResponse.json({ vehicles: vehiclesWithUsers }, { status: 200 });
  } catch (error) {
    console.error("Error fetching vehicles:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération des véhicules" },
      { status: 500 }
    );
  }
}

