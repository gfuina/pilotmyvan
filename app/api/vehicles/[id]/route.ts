import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import connectDB from "@/lib/mongodb";
import Vehicle from "@/models/Vehicle";
import { del } from "@vercel/blob";

// GET single vehicle
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const { id } = await params;

    await connectDB();

    const vehicle = await Vehicle.findOne({
      _id: id,
      userId: session.user.id,
    });

    if (!vehicle) {
      return NextResponse.json(
        { error: "Véhicule non trouvé" },
        { status: 404 }
      );
    }

    return NextResponse.json({ vehicle }, { status: 200 });
  } catch (error) {
    console.error("Error fetching vehicle:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération du véhicule" },
      { status: 500 }
    );
  }
}

// PATCH update vehicle
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();
    const { currentMileage, mileageNote, ...updateData } = body;

    await connectDB();

    const vehicle = await Vehicle.findOne({
      _id: id,
      userId: session.user.id,
    });

    if (!vehicle) {
      return NextResponse.json(
        { error: "Véhicule non trouvé" },
        { status: 404 }
      );
    }

    // If mileage is being updated, add to history
    if (currentMileage !== undefined && currentMileage !== vehicle.currentMileage) {
      vehicle.mileageHistory.push({
        mileage: currentMileage,
        date: new Date(),
        note: mileageNote || "Mise à jour du kilométrage",
      });
      vehicle.currentMileage = currentMileage;
    }

    // Update other fields
    Object.assign(vehicle, updateData);

    await vehicle.save();

    return NextResponse.json({ vehicle }, { status: 200 });
  } catch (error) {
    console.error("Error updating vehicle:", error);
    return NextResponse.json(
      { error: "Erreur lors de la mise à jour du véhicule" },
      { status: 500 }
    );
  }
}

// DELETE vehicle
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const { id } = await params;

    await connectDB();

    const vehicle = await Vehicle.findOne({
      _id: id,
      userId: session.user.id,
    });

    if (!vehicle) {
      return NextResponse.json(
        { error: "Véhicule non trouvé" },
        { status: 404 }
      );
    }

    // Delete images from Blob storage
    const imagesToDelete = [
      vehicle.coverImage,
      ...(vehicle.gallery || []),
    ].filter(Boolean);

    for (const imageUrl of imagesToDelete) {
      try {
        await del(imageUrl as string);
      } catch (error) {
        console.error("Error deleting image from Blob:", error);
      }
    }

    await Vehicle.deleteOne({ _id: id });

    return NextResponse.json(
      { message: "Véhicule supprimé avec succès" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting vehicle:", error);
    return NextResponse.json(
      { error: "Erreur lors de la suppression du véhicule" },
      { status: 500 }
    );
  }
}

