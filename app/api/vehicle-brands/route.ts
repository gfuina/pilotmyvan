import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import connectDB from "@/lib/mongodb";

// GET all vehicle brands (user-facing)
export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    await connectDB();

    const VehicleBrand = (await import("@/models/VehicleBrand")).default;

    const brands = await VehicleBrand.find({}).sort({ name: 1 });

    return NextResponse.json({ brands }, { status: 200 });
  } catch (error) {
    console.error("Error fetching vehicle brands:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération des marques" },
      { status: 500 }
    );
  }
}
