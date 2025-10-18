import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { isUserAdmin } from "@/lib/admin";
import connectDB from "@/lib/mongodb";
import mongoose from "mongoose";

// POST - Reject a user-contributed equipment
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

    const Equipment = (await import("@/models/Equipment")).default;
    const data = await request.json();
    const { reason } = data;

    const equipment = await Equipment.findById(id);

    if (!equipment) {
      return NextResponse.json(
        { error: "Équipement non trouvé" },
        { status: 404 }
      );
    }

    if (!equipment.isUserContributed) {
      return NextResponse.json(
        { error: "Cet équipement n'est pas une contribution utilisateur" },
        { status: 400 }
      );
    }

    if (equipment.status !== "pending") {
      return NextResponse.json(
        { error: "Cet équipement a déjà été traité" },
        { status: 400 }
      );
    }

    equipment.status = "rejected";
    equipment.approvedBy = new mongoose.Types.ObjectId(session.user.id);
    equipment.approvedAt = new Date();
    equipment.rejectionReason = reason;
    await equipment.save();

    return NextResponse.json(
      {
        message: "Équipement rejeté",
        equipment,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error rejecting equipment:", error);
    return NextResponse.json(
      { error: "Erreur lors du rejet" },
      { status: 500 }
    );
  }
}

