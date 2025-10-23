import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import connectDB from "@/lib/mongodb";

// POST - User creates a new equipment and adds it to their vehicle
export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    await connectDB();

    const Equipment = (await import("@/models/Equipment")).default;
    const Category = (await import("@/models/Category")).default;
    const VehicleBrand = (await import("@/models/VehicleBrand")).default;
    const EquipmentBrand = (await import("@/models/EquipmentBrand")).default;
    const VehicleEquipment = (await import("@/models/VehicleEquipment")).default;
    const Vehicle = (await import("@/models/Vehicle")).default;

    const data = await request.json();
    const {
      name,
      description,
      categoryId,
      vehicleBrands,
      equipmentBrands,
      customEquipmentBrands,
      photos,
      manuals,
      notes,
      vehicleId, // The vehicle to add this equipment to
    } = data;

    // Validation
    if (!name || !categoryId) {
      return NextResponse.json(
        { error: "Nom et catégorie requis" },
        { status: 400 }
      );
    }

    if (!vehicleId) {
      return NextResponse.json(
        { error: "Véhicule requis" },
        { status: 400 }
      );
    }

    // Verify vehicle belongs to user
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

    // Verify category exists
    const category = await Category.findById(categoryId);
    if (!category) {
      return NextResponse.json(
        { error: "Catégorie invalide" },
        { status: 400 }
      );
    }

    // Verify vehicle brands exist
    if (vehicleBrands && vehicleBrands.length > 0) {
      const validBrands = await VehicleBrand.find({
        _id: { $in: vehicleBrands },
      });
      if (validBrands.length !== vehicleBrands.length) {
        return NextResponse.json(
          { error: "Certaines marques de véhicule sont invalides" },
          { status: 400 }
        );
      }
    }

    // Verify equipment brands exist
    if (equipmentBrands && equipmentBrands.length > 0) {
      const validBrands = await EquipmentBrand.find({
        _id: { $in: equipmentBrands },
      });
      if (validBrands.length !== equipmentBrands.length) {
        return NextResponse.json(
          { error: "Certaines marques d'équipement sont invalides" },
          { status: 400 }
        );
      }
    }

    // Handle custom equipment brands - create them as pending for admin review
    const customBrandIds: string[] = [];
    if (customEquipmentBrands && customEquipmentBrands.length > 0) {
      for (const brandName of customEquipmentBrands) {
        // Check if brand already exists (case insensitive)
        let existingBrand = await EquipmentBrand.findOne({
          name: { $regex: new RegExp(`^${brandName.trim()}$`, "i") },
        });

        if (!existingBrand) {
          // Create new brand with pending status for admin review
          existingBrand = await EquipmentBrand.create({
            name: brandName.trim(),
            status: "pending",
            createdBy: session.user.id,
          });
        }

        customBrandIds.push(existingBrand._id.toString());
      }
    }

    // Merge regular brands and custom brands
    const allEquipmentBrands = [
      ...(equipmentBrands || []),
      ...customBrandIds,
    ];

    // Create equipment with pending status (will be reviewed by admin)
    const equipment = await Equipment.create({
      name,
      description,
      categoryId,
      vehicleBrands: vehicleBrands || [],
      equipmentBrands: allEquipmentBrands,
      photos: photos || [],
      manuals: manuals || [],
      notes,
      isUserContributed: true,
      contributedBy: session.user.id,
      status: "pending", // Admin will review to make it available for everyone
    });

    // Add equipment to user's vehicle
    const vehicleEquipment = await VehicleEquipment.create({
      vehicleId,
      equipmentId: equipment._id,
      isCustom: false,
    });

    return NextResponse.json(
      {
        message: "Équipement créé et ajouté à votre véhicule",
        equipment,
        vehicleEquipment,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating user equipment:", error);
    return NextResponse.json(
      { error: "Erreur lors de la création de l'équipement" },
      { status: 500 }
    );
  }
}

