import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import connectDB from "@/lib/mongodb";
import User from "@/models/User";

// GET: Récupérer la clé publique VAPID
export async function GET() {
  const vapidPublicKey = process.env.VAPID_PUBLIC_KEY;
  
  if (!vapidPublicKey) {
    return NextResponse.json(
      { error: "Les notifications push ne sont pas configurées" },
      { status: 500 }
    );
  }

  return NextResponse.json({ publicKey: vapidPublicKey });
}

// POST: Ajouter une nouvelle subscription
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    const { subscription, userAgent } = await request.json();

    if (!subscription || !subscription.endpoint || !subscription.keys) {
      return NextResponse.json(
        { error: "Subscription invalide" },
        { status: 400 }
      );
    }

    await connectDB();

    const user = await User.findOne({ email: session.user.email });
    if (!user) {
      return NextResponse.json(
        { error: "Utilisateur non trouvé" },
        { status: 404 }
      );
    }

    // Vérifier si cette subscription existe déjà
    const existingIndex = user.pushSubscriptions.findIndex(
      (sub: any) => sub.endpoint === subscription.endpoint
    );

    if (existingIndex !== -1) {
      // Mettre à jour la subscription existante
      user.pushSubscriptions[existingIndex] = {
        endpoint: subscription.endpoint,
        keys: {
          p256dh: subscription.keys.p256dh,
          auth: subscription.keys.auth,
        },
        userAgent: userAgent || user.pushSubscriptions[existingIndex].userAgent,
        subscribedAt: user.pushSubscriptions[existingIndex].subscribedAt,
      };
    } else {
      // Ajouter une nouvelle subscription
      user.pushSubscriptions.push({
        endpoint: subscription.endpoint,
        keys: {
          p256dh: subscription.keys.p256dh,
          auth: subscription.keys.auth,
        },
        userAgent,
        subscribedAt: new Date(),
      });
    }

    await user.save();

    return NextResponse.json({
      success: true,
      message: "Subscription enregistrée",
    });
  } catch (error: any) {
    console.error("Erreur lors de l'enregistrement de la subscription:", error);
    return NextResponse.json(
      { error: "Erreur serveur" },
      { status: 500 }
    );
  }
}

// DELETE: Supprimer une subscription
export async function DELETE(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    const { endpoint } = await request.json();

    if (!endpoint) {
      return NextResponse.json(
        { error: "Endpoint requis" },
        { status: 400 }
      );
    }

    await connectDB();

    const user = await User.findOne({ email: session.user.email });
    if (!user) {
      return NextResponse.json(
        { error: "Utilisateur non trouvé" },
        { status: 404 }
      );
    }

    // Supprimer la subscription
    user.pushSubscriptions = user.pushSubscriptions.filter(
      (sub: any) => sub.endpoint !== endpoint
    );

    await user.save();

    return NextResponse.json({
      success: true,
      message: "Subscription supprimée",
    });
  } catch (error: any) {
    console.error("Erreur lors de la suppression de la subscription:", error);
    return NextResponse.json(
      { error: "Erreur serveur" },
      { status: 500 }
    );
  }
}

