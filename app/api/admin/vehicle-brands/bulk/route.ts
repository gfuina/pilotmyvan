import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import connectDB from "@/lib/mongodb";
import VehicleBrand from "@/models/VehicleBrand";

// POST bulk create vehicle brands
export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    if (!session.user.isAdmin) {
      return NextResponse.json({ error: "Accès refusé" }, { status: 403 });
    }

    const { names } = await request.json();

    if (!Array.isArray(names) || names.length === 0) {
      return NextResponse.json(
        { error: "Aucune marque fournie" },
        { status: 400 }
      );
    }

    await connectDB();

    const results = {
      added: 0,
      failed: [] as string[],
    };

    for (const name of names) {
      if (!name || typeof name !== "string") continue;

      const trimmedName = name.trim();
      if (!trimmedName) continue;

      try {
        // Check if brand already exists
        const existingBrand = await VehicleBrand.findOne({
          name: { $regex: new RegExp(`^${trimmedName}$`, "i") },
        });

        if (existingBrand) {
          results.failed.push(trimmedName);
          continue;
        }

        await VehicleBrand.create({ name: trimmedName });
        results.added++;
      } catch (error) {
        results.failed.push(trimmedName);
      }
    }

    return NextResponse.json(results, { status: 201 });
  } catch (error) {
    console.error("Error bulk creating vehicle brands:", error);
    return NextResponse.json(
      { error: "Erreur lors de la création des marques" },
      { status: 500 }
    );
  }
}

