import connectDB from "./mongodb";
import User from "@/models/User";

// Liste des emails administrateurs
// Vous pouvez aussi utiliser une variable d'environnement : process.env.ADMIN_EMAILS?.split(',')
const ADMIN_EMAILS: string[] = [
  'fuina.gianni@gmail.com',
];

/**
 * Vérifie si un email est dans la liste des admins
 */
export function isAdminEmail(email: string): boolean {
  return ADMIN_EMAILS.includes(email.toLowerCase());
}

/**
 * Vérifie si un utilisateur est admin (par son ID ou objet user)
 */
export async function isUserAdmin(userOrId: string | { id?: string; isAdmin?: boolean }): Promise<boolean> {
  try {
    // If it's an object with isAdmin property, return it directly
    if (typeof userOrId === 'object' && userOrId !== null) {
      return userOrId.isAdmin || false;
    }
    
    // Otherwise, fetch from database
    await connectDB();
    const user = await User.findById(userOrId);
    return user?.isAdmin || false;
  } catch (error) {
    console.error("Error checking admin status:", error);
    return false;
  }
}

/**
 * Synchronise le statut admin d'un utilisateur avec la liste ADMIN_EMAILS
 * À appeler lors du signup ou de la connexion
 */
export async function syncAdminStatus(userId: string, email: string): Promise<void> {
  try {
    await connectDB();
    const shouldBeAdmin = isAdminEmail(email);
    await User.findByIdAndUpdate(userId, { isAdmin: shouldBeAdmin });
  } catch (error) {
    console.error("Error syncing admin status:", error);
  }
}

