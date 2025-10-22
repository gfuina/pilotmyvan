import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import connectDB from "@/lib/mongodb";
import Equipment from "@/models/Equipment";
import ManualChunk from "@/models/ManualChunk";
import Category from "@/models/Category";
import EquipmentBrand from "@/models/EquipmentBrand";
import Vehicle from "@/models/Vehicle";
import VehicleEquipment from "@/models/VehicleEquipment";

export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    await connectDB();
    
    // Force model registration for production build
    void Category;
    void EquipmentBrand;

    // Récupérer les véhicules de l'utilisateur
    const vehicles = await Vehicle.find({ userId: session.user.id }).select("_id");
    const vehicleIds = vehicles.map((v) => v._id);

    if (vehicleIds.length === 0) {
      return NextResponse.json({
        equipments: [],
        total: 0,
      });
    }

    // Récupérer les équipements de ces véhicules
    const vehicleEquipments = await VehicleEquipment.find({
      vehicleId: { $in: vehicleIds },
      isCustom: false, // On ne prend que les équipements standards (pas les custom sans manuels)
    })
      .select("equipmentId")
      .lean();

    const equipmentIds = vehicleEquipments
      .map((ve) => ve.equipmentId)
      .filter((id) => id != null);

    if (equipmentIds.length === 0) {
      return NextResponse.json({
        equipments: [],
        total: 0,
      });
    }

    // Récupérer les détails des équipements qui ont des manuels
    const equipments = await Equipment.find({
      _id: { $in: equipmentIds },
      status: "approved",
      manuals: { $exists: true, $not: { $size: 0 } },
    })
      .select("_id name description categoryId equipmentBrands photos manuals")
      .populate("categoryId", "name")
      .populate("equipmentBrands", "name")
      .lean();

    // Vérifier lesquels ont des chunks indexés
    const equipmentsWithIndexedManuals = await Promise.all(
      equipments.map(async (equipment) => {
        const chunksCount = await ManualChunk.countDocuments({
          equipmentId: equipment._id,
        });
        
        return {
          ...equipment,
          isIndexed: chunksCount > 0,
          manualsCount: equipment.manuals?.length || 0,
        };
      })
    );

    // Ne retourner que ceux qui sont indexés
    const indexedEquipments = equipmentsWithIndexedManuals.filter(
      (eq) => eq.isIndexed
    );

    return NextResponse.json({
      equipments: indexedEquipments,
      total: indexedEquipments.length,
    });
  } catch (error: any) {
    console.error("Error fetching equipments with manuals:", error);
    return NextResponse.json(
      { error: error.message || "Erreur lors de la récupération" },
      { status: 500 }
    );
  }
}

