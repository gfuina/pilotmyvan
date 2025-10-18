import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import User from "@/models/User";
import VerificationToken from "@/models/VerificationToken";

export async function POST(request: NextRequest) {
  try {
    const { token } = await request.json();

    if (!token) {
      return NextResponse.json(
        { error: "Token manquant" },
        { status: 400 }
      );
    }

    await connectDB();

    // Find the token
    const verificationToken = await VerificationToken.findOne({ token });

    if (!verificationToken) {
      return NextResponse.json(
        { error: "Token invalide ou expiré" },
        { status: 400 }
      );
    }

    // Check if token is expired
    if (new Date() > verificationToken.expires) {
      await VerificationToken.deleteOne({ token });
      return NextResponse.json(
        { error: "Token expiré" },
        { status: 400 }
      );
    }

    // Update user email verification
    const user = await User.findOne({ email: verificationToken.email });

    if (!user) {
      return NextResponse.json(
        { error: "Utilisateur non trouvé" },
        { status: 404 }
      );
    }

    user.emailVerified = new Date();
    await user.save();

    // Delete the token
    await VerificationToken.deleteOne({ token });

    return NextResponse.json(
      { message: "Email vérifié avec succès ! Vous pouvez maintenant vous connecter." },
      { status: 200 }
    );
  } catch (error) {
    console.error("Verification error:", error);
    return NextResponse.json(
      { error: "Une erreur est survenue lors de la vérification" },
      { status: 500 }
    );
  }
}

