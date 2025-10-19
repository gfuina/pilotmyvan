import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import connectDB from "@/lib/mongodb";
import Vehicle from "@/models/Vehicle";

// GET all vehicles for the current user
export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    await connectDB();

    const vehicles = await Vehicle.find({ userId: session.user.id }).sort({
      createdAt: -1,
    });

    return NextResponse.json({ vehicles }, { status: 200 });
  } catch (error) {
    console.error("Error fetching vehicles:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération des véhicules" },
      { status: 500 }
    );
  }
}

// POST create a new vehicle
export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const body = await request.json();
    const {
      name,
      make,
      model,
      year,
      vehicleType,
      currentMileage,
      coverImage,
      gallery,
      vin,
      licensePlate,
      purchaseDate,
      notes,
      fuelType,
      fuelTankCapacity,
    } = body;

    // Validation
    if (!name || !make || !model || !year || !vehicleType || currentMileage === undefined) {
      return NextResponse.json(
        { error: "Tous les champs obligatoires doivent être remplis" },
        { status: 400 }
      );
    }

    await connectDB();

    const vehicle = await Vehicle.create({
      userId: session.user.id,
      name,
      make,
      model,
      year,
      vehicleType,
      currentMileage,
      coverImage,
      gallery: gallery || [],
      vin,
      licensePlate,
      purchaseDate,
      notes,
      fuelType,
      fuelTankCapacity,
    });

    return NextResponse.json({ vehicle }, { status: 201 });
  } catch (error) {
    console.error("Error creating vehicle:", error);
    return NextResponse.json(
      { error: "Erreur lors de la création du véhicule" },
      { status: 500 }
    );
  }
}

