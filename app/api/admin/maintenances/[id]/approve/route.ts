import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { isUserAdmin } from "@/lib/admin";
import connectDB from "@/lib/mongodb";
import mongoose from "mongoose";

// POST - Approve a user-contributed maintenance
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();

    if (!session?.user?.id || !(await isUserAdmin(session.user.id))) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
    }

    const { id } = await params;

    await connectDB();

    const Maintenance = (await import("@/models/Maintenance")).default;

    const maintenance = await Maintenance.findById(id);

    if (!maintenance) {
      return NextResponse.json(
        { error: "Entretien non trouvé" },
        { status: 404 }
      );
    }

    if (!maintenance.isUserContributed) {
      return NextResponse.json(
        { error: "Cet entretien n'est pas une contribution utilisateur" },
        { status: 400 }
      );
    }

    if (maintenance.status !== "pending") {
      return NextResponse.json(
        { error: "Cet entretien a déjà été traité" },
        { status: 400 }
      );
    }

    maintenance.status = "approved";
    await maintenance.save();

    return NextResponse.json(
      {
        message: "Entretien approuvé avec succès",
        maintenance,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error approving maintenance:", error);
    return NextResponse.json(
      { error: "Erreur lors de l'approbation" },
      { status: 500 }
    );
  }
}


