import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import connectDB from "@/lib/mongodb";
import Maintenance from "@/models/Maintenance";
import { isUserAdmin } from "@/lib/admin";
import { del } from "@vercel/blob";

// GET single maintenance
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
    const maintenance = await Maintenance.findById(id).populate(
      "equipmentId",
      "name categoryId photos"
    );

    if (!maintenance) {
      return NextResponse.json(
        { error: "Entretien non trouvé" },
        { status: 404 }
      );
    }

    return NextResponse.json({ maintenance }, { status: 200 });
  } catch (error) {
    console.error("Error fetching maintenance:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération de l'entretien" },
      { status: 500 }
    );
  }
}

// PATCH update maintenance
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
    const { id } = await params;

    // Validate at least one recurrence if recurrence is being updated
    if (body.recurrence !== undefined) {
      if (!body.recurrence?.time && !body.recurrence?.kilometers) {
        return NextResponse.json(
          { error: "Au moins une récurrence (temporelle ou kilométrique) est requise" },
          { status: 400 }
        );
      }
    }

    await connectDB();

    const maintenance = await Maintenance.findByIdAndUpdate(
      id,
      { $set: body },
      { new: true, runValidators: true }
    ).populate("equipmentId", "name categoryId photos");

    if (!maintenance) {
      return NextResponse.json(
        { error: "Entretien non trouvé" },
        { status: 404 }
      );
    }

    return NextResponse.json({ maintenance }, { status: 200 });
  } catch (error) {
    console.error("Error updating maintenance:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Erreur lors de la mise à jour de l'entretien" },
      { status: 500 }
    );
  }
}

// DELETE maintenance
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();

    if (!session?.user?.id || !isUserAdmin(session.user)) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const { id } = await params;

    await connectDB();

    const maintenance = await Maintenance.findById(id);

    if (!maintenance) {
      return NextResponse.json(
        { error: "Entretien non trouvé" },
        { status: 404 }
      );
    }

    // Delete photos from Blob storage
    if (maintenance.photos && maintenance.photos.length > 0) {
      for (const photoUrl of maintenance.photos) {
        try {
          await del(photoUrl);
        } catch (error) {
          console.error("Error deleting photo from Blob:", error);
        }
      }
    }

    await Maintenance.findByIdAndDelete(id);

    return NextResponse.json(
      { message: "Entretien supprimé avec succès" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error deleting maintenance:", error);
    return NextResponse.json(
      { error: "Erreur lors de la suppression de l'entretien" },
      { status: 500 }
    );
  }
}

