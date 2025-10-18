import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import connectDB from "@/lib/mongodb";
import VehicleBrand from "@/models/VehicleBrand";
import { del } from "@vercel/blob";

// PATCH update vehicle brand
export async function PATCH(
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

    const { name, logo } = await request.json();

    await connectDB();

    const { id } = await params;
    const brand = await VehicleBrand.findById(id);

    if (!brand) {
      return NextResponse.json(
        { error: "Marque non trouvée" },
        { status: 404 }
      );
    }

    // Check if new name conflicts with existing brand
    if (name && name !== brand.name) {
      const existingBrand = await VehicleBrand.findOne({
        name: { $regex: new RegExp(`^${name}$`, "i") },
        _id: { $ne: id },
      });

      if (existingBrand) {
        return NextResponse.json(
          { error: "Cette marque existe déjà" },
          { status: 400 }
        );
      }
    }

    if (name) brand.name = name;
    if (logo !== undefined) brand.logo = logo || null;

    await brand.save();

    return NextResponse.json({ brand }, { status: 200 });
  } catch (error) {
    console.error("Error updating vehicle brand:", error);
    return NextResponse.json(
      { error: "Erreur lors de la mise à jour de la marque" },
      { status: 500 }
    );
  }
}

// DELETE vehicle brand
export async function DELETE(
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

    await connectDB();

    const { id } = await params;
    const brand = await VehicleBrand.findById(id);

    if (!brand) {
      return NextResponse.json(
        { error: "Marque non trouvée" },
        { status: 404 }
      );
    }

    // Delete logo from Blob storage if exists
    if (brand.logo) {
      try {
        await del(brand.logo);
      } catch (error) {
        console.error("Error deleting logo from Blob:", error);
      }
    }

    await VehicleBrand.deleteOne({ _id: id });

    return NextResponse.json(
      { message: "Marque supprimée avec succès" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting vehicle brand:", error);
    return NextResponse.json(
      { error: "Erreur lors de la suppression de la marque" },
      { status: 500 }
    );
  }
}

