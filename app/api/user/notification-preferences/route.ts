import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import connectToDatabase from "@/lib/mongodb";
import User from "@/models/User";

// GET - Récupérer les préférences de notification de l'utilisateur
export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    await connectToDatabase();
    const user = await User.findOne({ email: session.user.email });

    if (!user) {
      return NextResponse.json(
        { error: "Utilisateur non trouvé" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      notificationPreferences: user.notificationPreferences || {
        daysBeforeMaintenance: [1],
      },
    });
  } catch (error) {
    console.error("Erreur lors de la récupération des préférences:", error);
    return NextResponse.json(
      { error: "Erreur serveur" },
      { status: 500 }
    );
  }
}

// PUT - Mettre à jour les préférences de notification
export async function PUT(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const body = await request.json();
    const { daysBeforeMaintenance } = body;

    // Validation
    if (!Array.isArray(daysBeforeMaintenance)) {
      return NextResponse.json(
        { error: "daysBeforeMaintenance doit être un tableau" },
        { status: 400 }
      );
    }

    if (daysBeforeMaintenance.length === 0) {
      return NextResponse.json(
        { error: "Au moins une préférence de notification est requise" },
        { status: 400 }
      );
    }

    // Vérifier que tous les éléments sont des nombres positifs
    if (
      !daysBeforeMaintenance.every(
        (day) => typeof day === "number" && day > 0 && Number.isInteger(day)
      )
    ) {
      return NextResponse.json(
        {
          error:
            "Toutes les valeurs doivent être des nombres entiers positifs",
        },
        { status: 400 }
      );
    }

    await connectToDatabase();
    const user = await User.findOneAndUpdate(
      { email: session.user.email },
      {
        $set: {
          "notificationPreferences.daysBeforeMaintenance":
            daysBeforeMaintenance,
        },
      },
      { new: true }
    );

    if (!user) {
      return NextResponse.json(
        { error: "Utilisateur non trouvé" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: "Préférences mises à jour",
      notificationPreferences: user.notificationPreferences,
    });
  } catch (error) {
    console.error("Erreur lors de la mise à jour des préférences:", error);
    return NextResponse.json(
      { error: "Erreur serveur" },
      { status: 500 }
    );
  }
}

