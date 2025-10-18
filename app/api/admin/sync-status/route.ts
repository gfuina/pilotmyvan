import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import connectDB from "@/lib/mongodb";
import User from "@/models/User";
import { isAdminEmail } from "@/lib/admin";

// Route pour synchroniser le statut admin d'un utilisateur
export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    await connectDB();

    const user = await User.findById(session.user.id);
    
    if (!user) {
      return NextResponse.json({ error: "Utilisateur non trouvé" }, { status: 404 });
    }

    // Check if user should be admin
    const shouldBeAdmin = isAdminEmail(user.email);
    
    // Update admin status
    user.isAdmin = shouldBeAdmin;
    await user.save();

    return NextResponse.json(
      { 
        message: "Statut admin synchronisé",
        isAdmin: shouldBeAdmin,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error syncing admin status:", error);
    return NextResponse.json(
      { error: "Erreur lors de la synchronisation" },
      { status: 500 }
    );
  }
}

