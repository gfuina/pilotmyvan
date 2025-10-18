import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import connectDB from "@/lib/mongodb";
import Category from "@/models/Category";
import { isUserAdmin } from "@/lib/admin";

interface CategoryWithChildren {
  _id: string;
  name: string;
  level: number;
  parentId?: string;
  order: number;
  children: CategoryWithChildren[];
}

// GET all categories (hierarchical)
export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.id || !isUserAdmin(session.user)) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    await connectDB();

    const categories = await Category.find({}).sort({ level: 1, order: 1 });

    // Build hierarchical structure
    const categoryMap = new Map<string, CategoryWithChildren>();
    const rootCategories: CategoryWithChildren[] = [];

    // First pass: create map
    categories.forEach((cat) => {
      const catObj = cat.toObject() as {
        _id: { toString: () => string };
        name: string;
        level: number;
        parentId?: { toString: () => string } | null;
        order: number;
      };
      const categoryId = catObj._id.toString();
      categoryMap.set(categoryId, {
        _id: categoryId,
        name: catObj.name,
        level: catObj.level,
        parentId: catObj.parentId?.toString(),
        order: catObj.order,
        children: [],
      });
    });

    // Second pass: build tree
    categories.forEach((cat) => {
      const catObj = cat.toObject() as {
        _id: { toString: () => string };
        parentId?: { toString: () => string } | null;
      };
      const categoryId = catObj._id.toString();
      const parentId = catObj.parentId?.toString();
      const category = categoryMap.get(categoryId);
      
      if (parentId && category) {
        const parent = categoryMap.get(parentId);
        if (parent) {
          parent.children.push(category);
        }
      } else if (category) {
        rootCategories.push(category);
      }
    });

    return NextResponse.json({ categories: rootCategories }, { status: 200 });
  } catch (error) {
    console.error("Error fetching categories:", error);
    return NextResponse.json(
      { error: "Erreur lors de la récupération des catégories" },
      { status: 500 }
    );
  }
}

// POST create category
export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id || !isUserAdmin(session.user)) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
    }

    const body = await request.json();
    const { name, parentId, level, order } = body;

    if (!name || !level) {
      return NextResponse.json(
        { error: "Nom et niveau requis" },
        { status: 400 }
      );
    }

    await connectDB();

    // If parentId provided, verify it exists and calculate level
    let actualLevel = level;
    if (parentId) {
      const parent = await Category.findById(parentId);
      if (!parent) {
        return NextResponse.json(
          { error: "Catégorie parent non trouvée" },
          { status: 404 }
        );
      }
      actualLevel = parent.level + 1;
    }

    // Get next order number for this parent
    const maxOrder = await Category.findOne({
      parentId: parentId || null,
    })
      .sort({ order: -1 })
      .select("order");

    const category = await Category.create({
      name,
      level: actualLevel,
      parentId: parentId || null,
      order: order !== undefined ? order : (maxOrder?.order || 0) + 1,
    });

    return NextResponse.json({ category }, { status: 201 });
  } catch (error) {
    console.error("Error creating category:", error);
    return NextResponse.json(
      { error: "Erreur lors de la création de la catégorie" },
      { status: 500 }
    );
  }
}

