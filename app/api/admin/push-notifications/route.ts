import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import connectDB from "@/lib/mongodb";
import User from "@/models/User";
import { sendPushNotificationToMultiple, PushNotificationPayload } from "@/lib/pushNotifications";

// GET: Récupérer les statistiques des abonnés
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    await connectDB();

    const currentUser = await User.findOne({ email: session.user.email });
    if (!currentUser?.isAdmin) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
    }

    // Récupérer tous les utilisateurs avec leurs subscriptions
    const users = await User.find(
      { "pushSubscriptions.0": { $exists: true } },
      { name: 1, email: 1, pushSubscriptions: 1, emailVerified: 1 }
    );

    const stats = {
      totalUsersWithPush: users.length,
      totalSubscriptions: users.reduce((acc, user) => acc + user.pushSubscriptions.length, 0),
      users: users.map((user) => ({
        _id: user._id,
        name: user.name,
        email: user.email,
        emailVerified: user.emailVerified,
        subscriptionsCount: user.pushSubscriptions.length,
        subscriptions: user.pushSubscriptions.map((sub: any) => ({
          endpoint: sub.endpoint.substring(0, 50) + "...",
          userAgent: sub.userAgent,
          subscribedAt: sub.subscribedAt,
        })),
      })),
    };

    return NextResponse.json(stats);
  } catch (error: any) {
    console.error("Erreur lors de la récupération des stats:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

// POST: Envoyer une notification push en masse
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 });
    }

    await connectDB();

    const currentUser = await User.findOne({ email: session.user.email });
    if (!currentUser?.isAdmin) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
    }

    const { title, body, url, icon, userIds } = await request.json();

    if (!title || !body) {
      return NextResponse.json(
        { error: "Titre et message requis" },
        { status: 400 }
      );
    }

    // Si userIds est fourni, envoyer seulement à ces utilisateurs, sinon à tous
    const query = userIds && userIds.length > 0
      ? { _id: { $in: userIds }, "pushSubscriptions.0": { $exists: true } }
      : { "pushSubscriptions.0": { $exists: true } };

    const users = await User.find(query, { pushSubscriptions: 1 });

    if (users.length === 0) {
      return NextResponse.json(
        { error: "Aucun utilisateur abonné trouvé" },
        { status: 404 }
      );
    }

    // Collecter toutes les subscriptions
    const allSubscriptions = users.flatMap((user) => user.pushSubscriptions);

    const payload: PushNotificationPayload = {
      title,
      body,
      icon: icon || "/icon.png",
      badge: "/icon.png",
      data: {
        url: url || "/dashboard",
        type: "admin_broadcast",
      },
      actions: [
        { action: "view", title: "Voir" },
        { action: "dismiss", title: "Ignorer" },
      ],
    };

    const results = await sendPushNotificationToMultiple(allSubscriptions, payload);

    // Supprimer les subscriptions expirées
    if (results.expired.length > 0) {
      for (const user of users) {
        user.pushSubscriptions = user.pushSubscriptions.filter(
          (sub: any) => !results.expired.includes(sub.endpoint)
        );
        await user.save();
      }
    }

    return NextResponse.json({
      success: true,
      message: "Notifications envoyées",
      results: {
        targetUsers: users.length,
        totalSubscriptions: allSubscriptions.length,
        successful: results.successful,
        failed: results.failed,
        expired: results.expired.length,
      },
    });
  } catch (error: any) {
    console.error("Erreur lors de l'envoi des notifications:", error);
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}

