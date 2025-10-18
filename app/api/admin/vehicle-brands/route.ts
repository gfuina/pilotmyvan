import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import connectDB from "@/lib/mongodb";
import VehicleBrand from "@/models/VehicleBrand";

// GET all vehicle brands
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

// POST create a new vehicle brand
export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    if (!session.user.isAdmin) {
      return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
    }

    const { name, logo } = await request.json();

    if (!name) {
      return NextResponse.json(
        { error: "Le nom est requis" },
        { status: 400 }
      );
    }

    await connectDB();

    // Check if brand already exists
    const existingBrand = await VehicleBrand.findOne({
      name: { $regex: new RegExp(`^${name}$`, "i") },
    });

    if (existingBrand) {
      return NextResponse.json(
        { error: "Cette marque existe déjà" },
        { status: 400 }
      );
    }

    const brand = await VehicleBrand.create({
      name,
      logo: logo || null,
    });

    return NextResponse.json({ brand }, { status: 201 });
  } catch (error) {
    console.error("Error creating vehicle brand:", error);
    return NextResponse.json(
      { error: "Erreur lors de la création de la marque" },
      { status: 500 }
    );
  }
}

