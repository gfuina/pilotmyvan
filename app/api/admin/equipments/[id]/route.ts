import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import connectDB from "@/lib/mongodb";
import Equipment from "@/models/Equipment";
import VehicleBrand from "@/models/VehicleBrand";
import EquipmentBrand from "@/models/EquipmentBrand";
import Category from "@/models/Category";
import { isUserAdmin } from "@/lib/admin";
import { del } from "@vercel/blob";

// GET single equipment
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();

    if (!session?.user?.id || !isUserAdmin(session.user)) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    await connectDB();

    const { id } = await params;
    const equipment = await Equipment.findById(id)
      .populate("categoryId", "name level")
      .populate("vehicleBrands", "name logo")
      .populate("equipmentBrands", "name logo");

    if (!equipment) {
      return NextResponse.json(
        { error: "Équipement non trouvé" },
        { status: 404 }
      );
    }

    return NextResponse.json({ equipment }, { status: 200 });
  } catch (error) {
    console.error("Error fetching equipment:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération de l'équipement" },
      { status: 500 }
    );
  }
}

// PATCH update equipment
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();

    if (!session?.user?.id || !isUserAdmin(session.user)) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const body = await request.json();

    await connectDB();

    const { id } = await params;
    const equipment = await Equipment.findByIdAndUpdate(
      id,
      { $set: body },
      { new: true }
    )
      .populate("categoryId", "name level")
      .populate("vehicleBrands", "name logo")
      .populate("equipmentBrands", "name logo");

    if (!equipment) {
      return NextResponse.json(
        { error: "Équipement non trouvé" },
        { status: 404 }
      );
    }

    return NextResponse.json({ equipment }, { status: 200 });
  } catch (error) {
    console.error("Error updating equipment:", error);
    return NextResponse.json(
      { error: "Erreur lors de la mise à jour de l'équipement" },
      { status: 500 }
    );
  }
}

// DELETE equipment
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();

    if (!session?.user?.id || !isUserAdmin(session.user)) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    await connectDB();

    const { id } = await params;
    const equipment = await Equipment.findById(id);

    if (!equipment) {
      return NextResponse.json(
        { error: "Équipement non trouvé" },
        { status: 404 }
      );
    }

    // Delete photos from Blob storage
    for (const photoUrl of equipment.photos) {
      try {
        await del(photoUrl);
      } catch (error) {
        console.error("Error deleting photo from Blob:", error);
      }
    }

    // Delete manuals from Blob storage (only non-external)
    for (const manual of equipment.manuals) {
      if (!manual.isExternal) {
        try {
          await del(manual.url);
        } catch (error) {
          console.error("Error deleting manual from Blob:", error);
        }
      }
    }

    await Equipment.findByIdAndDelete(id);

    return NextResponse.json(
      { message: "Équipement supprimé avec succès" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting equipment:", error);
    return NextResponse.json(
      { error: "Erreur lors de la suppression de l'équipement" },
      { status: 500 }
    );
  }
}

