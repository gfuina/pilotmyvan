import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import connectToDatabase from "@/lib/mongodb";
import User from "@/models/User";
import Vehicle from "@/models/Vehicle";
import MileageHistory from "@/models/MileageHistory";

// GET - Récupérer l'historique de kilométrage d'un véhicule
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const { id: vehicleId } = await params;
    await connectToDatabase();

    const user = await User.findOne({ email: session.user.email });
    if (!user) {
      return NextResponse.json(
        { error: "Utilisateur non trouvé" },
        { status: 404 }
      );
    }

    // Vérifier que le véhicule appartient à l'utilisateur
    const vehicle = await Vehicle.findOne({ _id: vehicleId, userId: user._id });
    if (!vehicle) {
      return NextResponse.json(
        { error: "Véhicule non trouvé" },
        { status: 404 }
      );
    }

    // Récupérer l'historique (limité aux 100 dernières entrées)
    const history = await MileageHistory.find({ vehicleId })
      .sort({ recordedAt: -1 })
      .limit(100)
      .lean();

    // Récupérer la dernière mise à jour pour vérifier le délai
    const lastUpdate = history[0];
    const canUpdate = lastUpdate
      ? Date.now() - new Date(lastUpdate.recordedAt).getTime() >=
        2 * 60 * 60 * 1000 // 2 heures en millisecondes
      : true;

    const nextUpdateAvailable = lastUpdate
      ? new Date(
          new Date(lastUpdate.recordedAt).getTime() + 2 * 60 * 60 * 1000
        )
      : null;

    return NextResponse.json({
      history,
      canUpdate,
      lastUpdate: lastUpdate || null,
      nextUpdateAvailable,
    });
  } catch (error) {
    console.error("Erreur lors de la récupération de l'historique:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

// POST - Ajouter une nouvelle entrée de kilométrage
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const { id: vehicleId } = await params;
    const body = await request.json();
    const { mileage } = body;

    // Validation
    if (typeof mileage !== "number" || mileage < 0) {
      return NextResponse.json(
        { error: "Le kilométrage doit être un nombre positif" },
        { status: 400 }
      );
    }

    await connectToDatabase();
    const user = await User.findOne({ email: session.user.email });

    if (!user) {
      return NextResponse.json(
        { error: "Utilisateur non trouvé" },
        { status: 404 }
      );
    }

    // Vérifier que le véhicule appartient à l'utilisateur
    const vehicle = await Vehicle.findOne({ _id: vehicleId, userId: user._id });
    if (!vehicle) {
      return NextResponse.json(
        { error: "Véhicule non trouvé" },
        { status: 404 }
      );
    }

    // Vérifier la dernière mise à jour pour ce véhicule
    const lastUpdate = await MileageHistory.findOne({ vehicleId })
      .sort({ recordedAt: -1 })
      .lean();

    if (lastUpdate) {
      const timeSinceLastUpdate =
        Date.now() - new Date(lastUpdate.recordedAt).getTime();
      const twoHoursInMs = 2 * 60 * 60 * 1000;

      if (timeSinceLastUpdate < twoHoursInMs) {
        const minutesRemaining = Math.ceil(
          (twoHoursInMs - timeSinceLastUpdate) / 60000
        );
        return NextResponse.json(
          {
            error: `Vous devez attendre ${minutesRemaining} minute(s) avant de pouvoir mettre à jour à nouveau`,
            nextUpdateAvailable: new Date(
              new Date(lastUpdate.recordedAt).getTime() + twoHoursInMs
            ),
          },
          { status: 429 }
        );
      }

      // Vérifier que le nouveau kilométrage est supérieur ou égal au dernier
      if (mileage < lastUpdate.mileage) {
        return NextResponse.json(
          {
            error: `Le kilométrage ne peut pas être inférieur au dernier enregistré (${lastUpdate.mileage} km)`,
          },
          { status: 400 }
        );
      }
    }

    // Créer la nouvelle entrée
    const newEntry = await MileageHistory.create({
      userId: user._id,
      vehicleId,
      mileage,
      recordedAt: new Date(),
    });

    // Mettre à jour le currentMileage du véhicule
    await Vehicle.findByIdAndUpdate(vehicleId, {
      currentMileage: mileage,
    });

    return NextResponse.json({
      message: "Kilométrage enregistré",
      entry: newEntry,
    });
  } catch (error) {
    console.error("Erreur lors de l'enregistrement du kilométrage:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

