import type { NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import connectDB from "@/lib/mongodb";
import User from "@/models/User";
import { Types } from "mongoose";

interface UserDocument {
  _id: Types.ObjectId;
  email: string;
  name: string;
  password?: string;
  emailVerified: Date | null;
  isAdmin?: boolean;
  comparePassword: (password: string) => Promise<boolean>;
}

export const authConfig = {
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email et mot de passe requis");
        }

        await connectDB();

        const user = await User.findOne({
          email: credentials.email,
        }).select("+password") as UserDocument | null;

        if (!user || !user.password) {
          throw new Error("Email ou mot de passe incorrect");
        }

        const isPasswordValid = await user.comparePassword(
          credentials.password as string
        );

        if (!isPasswordValid) {
          throw new Error("Email ou mot de passe incorrect");
        }

        if (!user.emailVerified) {
          throw new Error("Veuillez vérifier votre email avant de vous connecter");
        }

        return {
          id: user._id.toString(),
          email: user.email,
          name: user.name,
          emailVerified: user.emailVerified ? new Date() : null,
          isAdmin: user.isAdmin || false,
        };
      },
    }),
  ],
  pages: {
    signIn: "/login",
    error: "/login",
  },
  callbacks: {
    async signIn({ user, account, profile }) {
      // Pour Google OAuth, créer l'utilisateur s'il n'existe pas
      if (account?.provider === "google") {
        await connectDB();
        
        const existingUser = await User.findOne({ email: user.email });
        
        if (!existingUser) {
          await User.create({
            name: user.name,
            email: user.email,
            emailVerified: new Date(), // Auto-vérifié pour Google
            image: user.image,
            isAdmin: false,
          });
        } else if (!existingUser.emailVerified) {
          // Si l'utilisateur existe mais n'a pas vérifié son email, on le vérifie automatiquement
          existingUser.emailVerified = new Date();
          await existingUser.save();
        }
      }
      return true;
    },
    async jwt({ token, user, account }) {
      if (user) {
        await connectDB();
        const dbUser = await User.findOne({ email: user.email }) as UserDocument | null;
        token.id = dbUser?._id.toString() || user.id;
        token.isAdmin = dbUser?.isAdmin || false;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.isAdmin = token.isAdmin as boolean;
      }
      return session;
    },
  },
  session: {
    strategy: "jwt",
  },
  secret: process.env.NEXTAUTH_SECRET,
} satisfies NextAuthConfig;

