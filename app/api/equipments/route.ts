import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import connectDB from "@/lib/mongodb";

// GET all equipments (user-facing, with search filters)
export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search");
    const vehicleBrandId = searchParams.get("vehicleBrandId");
    const equipmentBrandId = searchParams.get("equipmentBrandId");
    const categoryId = searchParams.get("categoryId");

    await connectDB();

    // Import models after DB connection
    const Equipment = (await import("@/models/Equipment")).default;
    await import("@/models/Category");
    await import("@/models/VehicleBrand");
    await import("@/models/EquipmentBrand");

    // Build query
    type QueryFilter = {
      $or?: Array<Record<string, unknown>>;
      $and?: Array<Record<string, unknown>>;
    };
    
    const query: QueryFilter = {};

    // Show approved equipments OR equipments created by current user
    query.$or = [
      { status: "approved" },
      { contributedBy: session.user.id },
    ];

    // Build search filters
    type SearchFilters = {
      $or?: Array<Record<string, unknown>>;
      vehicleBrands?: string;
      equipmentBrands?: string;
      categoryId?: string;
    };
    
    const filters: SearchFilters = {};

    if (search) {
      filters.$or = [
        { name: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    if (vehicleBrandId) {
      filters.vehicleBrands = vehicleBrandId;
    }

    if (equipmentBrandId) {
      filters.equipmentBrands = equipmentBrandId;
    }

    if (categoryId) {
      filters.categoryId = categoryId;
    }

    // Combine status filter with search filters
    const finalQuery = Object.keys(filters).length > 0
      ? { $and: [query, filters] }
      : query;

    const equipments = await Equipment.find(finalQuery)
      .populate("categoryId", "name level")
      .populate("vehicleBrands", "name logo")
      .populate("equipmentBrands", "name logo")
      .sort({ name: 1 })
      .limit(100); // Limit results for performance

    return NextResponse.json({ equipments }, { status: 200 });
  } catch (error) {
    console.error("Error fetching equipments:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération des équipements" },
      { status: 500 }
    );
  }
}

