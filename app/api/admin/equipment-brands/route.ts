import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import connectDB from "@/lib/mongodb";
import EquipmentBrand from "@/models/EquipmentBrand";

// GET all equipment brands
export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    await connectDB();

    // If admin, return all brands (including pending)
    // If regular user, return only approved brands
    const query = session.user.isAdmin 
      ? {} 
      : { $or: [{ status: "approved" }, { status: { $exists: false } }] };

    const brands = await EquipmentBrand.find(query).sort({ name: 1 });

    return NextResponse.json({ brands }, { status: 200 });
  } catch (error) {
    console.error("Error fetching equipment brands:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération des marques" },
      { status: 500 }
    );
  }
}

// POST create a new equipment brand
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
    const existingBrand = await EquipmentBrand.findOne({
      name: { $regex: new RegExp(`^${name}$`, "i") },
    });

    if (existingBrand) {
      return NextResponse.json(
        { error: "Cette marque existe déjà" },
        { status: 400 }
      );
    }

    const brand = await EquipmentBrand.create({
      name,
      logo: logo || null,
    });

    return NextResponse.json({ brand }, { status: 201 });
  } catch (error) {
    console.error("Error creating equipment brand:", error);
    return NextResponse.json(
      { error: "Erreur lors de la création de la marque" },
      { status: 500 }
    );
  }
}

