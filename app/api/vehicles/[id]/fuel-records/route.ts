import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import connectDB from "@/lib/mongodb";
import FuelRecord from "@/models/FuelRecord";
import Vehicle from "@/models/Vehicle";
import MileageHistory from "@/models/MileageHistory";

// GET - Récupérer l'historique des pleins d'un véhicule
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    await connectDB();
    const { id: vehicleId } = await params;

    // Vérifier que le véhicule appartient à l'utilisateur
    const vehicle = await Vehicle.findOne({
      _id: vehicleId,
      userId: session.user.id,
    });

    if (!vehicle) {
      return NextResponse.json(
        { error: "Véhicule non trouvé" },
        { status: 404 }
      );
    }

    // Récupérer l'historique des pleins
    const fuelRecords = await FuelRecord.find({
      userId: session.user.id,
      vehicleId: vehicleId,
    })
      .sort({ recordedAt: -1 })
      .limit(50)
      .lean();

    // Calculer les statistiques
    const stats = calculateFuelStats(fuelRecords, vehicle);

    return NextResponse.json({
      fuelRecords,
      stats,
      fuelType: vehicle.fuelType,
      fuelTankCapacity: vehicle.fuelTankCapacity,
    });
  } catch (error) {
    console.error("Error fetching fuel records:", error);
    return NextResponse.json(
      { error: "Erreur serveur" },
      { status: 500 }
    );
  }
}

// POST - Ajouter un nouveau plein
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const body = await req.json();
    const { mileage, amountPaid, liters, pricePerLiter, isFull, note } = body;

    // Validation
    if (!mileage || mileage < 0) {
      return NextResponse.json(
        { error: "Kilométrage invalide" },
        { status: 400 }
      );
    }

    if (!amountPaid || amountPaid <= 0) {
      return NextResponse.json(
        { error: "Montant invalide" },
        { status: 400 }
      );
    }

    await connectDB();
    const { id: vehicleId } = await params;

    // Vérifier que le véhicule appartient à l'utilisateur
    const vehicle = await Vehicle.findOne({
      _id: vehicleId,
      userId: session.user.id,
    });

    if (!vehicle) {
      return NextResponse.json(
        { error: "Véhicule non trouvé" },
        { status: 404 }
      );
    }

    // Vérifier que le kilométrage n'est pas inférieur au dernier enregistré
    const lastFuelRecord = await FuelRecord.findOne({
      userId: session.user.id,
      vehicleId: vehicleId,
    }).sort({ recordedAt: -1 });

    if (lastFuelRecord && mileage < lastFuelRecord.mileage) {
      return NextResponse.json(
        {
          error: `Le kilométrage doit être supérieur ou égal à ${lastFuelRecord.mileage} km`,
        },
        { status: 400 }
      );
    }

    // Calculer le prix au litre si fourni
    let calculatedPricePerLiter = pricePerLiter;
    if (liters && !pricePerLiter) {
      calculatedPricePerLiter = amountPaid / liters;
    }

    // Créer l'enregistrement de plein
    const fuelRecord = await FuelRecord.create({
      userId: session.user.id,
      vehicleId: vehicleId,
      mileage,
      amountPaid,
      liters: liters || undefined,
      pricePerLiter: calculatedPricePerLiter || undefined,
      isFull: isFull !== undefined ? isFull : true,
      fuelType: vehicle.fuelType,
      note,
      recordedAt: new Date(),
    });

    // Mettre à jour le kilométrage du véhicule si supérieur
    if (mileage > vehicle.currentMileage) {
      vehicle.currentMileage = mileage;
      await vehicle.save();
    }

    // Ajouter l'entrée dans l'historique de kilométrage
    await MileageHistory.create({
      userId: session.user.id,
      vehicleId: vehicleId,
      mileage,
      recordedAt: new Date(),
    });

    // Calculer la consommation si possible
    let consumption = null;
    if (lastFuelRecord && liters) {
      const distance = mileage - lastFuelRecord.mileage;
      if (distance > 0) {
        consumption = (liters / distance) * 100; // L/100km
      }
    }

    return NextResponse.json({
      success: true,
      fuelRecord,
      consumption: consumption ? consumption.toFixed(2) : null,
    });
  } catch (error) {
    console.error("Error creating fuel record:", error);
    return NextResponse.json(
      { error: "Erreur lors de l'enregistrement" },
      { status: 500 }
    );
  }
}

// Fonction helper pour calculer les statistiques
function calculateFuelStats(fuelRecords: any[], vehicle: any) {
  if (fuelRecords.length === 0) {
    return {
      totalSpent: 0,
      totalLiters: 0,
      averageConsumption: 0,
      averagePricePerLiter: 0,
      totalDistance: 0,
    };
  }

  let totalSpent = 0;
  let totalLiters = 0;
  let totalDistance = 0;
  let consumptionSum = 0;
  let consumptionCount = 0;
  let pricePerLiterSum = 0;
  let pricePerLiterCount = 0;

  for (let i = 0; i < fuelRecords.length; i++) {
    const record = fuelRecords[i];
    totalSpent += record.amountPaid;

    if (record.liters) {
      totalLiters += record.liters;
    }

    if (record.pricePerLiter) {
      pricePerLiterSum += record.pricePerLiter;
      pricePerLiterCount++;
    }

    // Calculer la consommation entre deux pleins
    if (i < fuelRecords.length - 1 && record.liters) {
      const nextRecord = fuelRecords[i + 1];
      const distance = record.mileage - nextRecord.mileage;
      if (distance > 0) {
        totalDistance += distance;
        const consumption = (record.liters / distance) * 100;
        consumptionSum += consumption;
        consumptionCount++;
      }
    }
  }

  // Si on a le premier et le dernier, calculer la distance totale
  if (fuelRecords.length >= 2) {
    totalDistance = fuelRecords[0].mileage - fuelRecords[fuelRecords.length - 1].mileage;
  }

  return {
    totalSpent: Math.round(totalSpent * 100) / 100,
    totalLiters: Math.round(totalLiters * 10) / 10,
    averageConsumption:
      consumptionCount > 0
        ? Math.round((consumptionSum / consumptionCount) * 10) / 10
        : 0,
    averagePricePerLiter:
      pricePerLiterCount > 0
        ? Math.round((pricePerLiterSum / pricePerLiterCount) * 100) / 100
        : 0,
    totalDistance: Math.round(totalDistance),
  };
}

