import Link from "next/link";
import { signOut } from "next-auth/react";

interface DashboardHeaderProps {
  user?: {
    name?: string | null;
    email?: string | null;
    isAdmin?: boolean;
  };
  showBackButton?: boolean;
  backHref?: string;
}

export default function DashboardHeader({
  user,
  showBackButton = false,
  backHref = "/dashboard",
}: DashboardHeaderProps) {
  const handleSignOut = async () => {
    await signOut({ callbackUrl: "/" });
  };

  return (
    <header className="bg-white shadow-sm sticky top-0 z-40">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="flex items-center justify-between py-4">
          {/* Logo */}
          <Link href="/dashboard" className="flex items-center">
            <img
              src="/images/logo/logo-icon-text-slogan-orange.png"
              alt="PilotMyVan"
              className="h-10 w-auto"
            />
          </Link>

          {/* Actions */}
          <div className="flex items-center gap-4">
            {user && (
              <>
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-medium text-black">{user.name}</p>
                  <p className="text-xs text-gray">{user.email}</p>
                </div>
                {user.isAdmin && (
                  <Link
                    href="/administration"
                    className="px-4 py-2 bg-orange hover:bg-orange-dark text-white font-semibold rounded-2xl transition-all duration-300"
                  >
                    Admin
                  </Link>
                )}
                <button
                  onClick={handleSignOut}
                  className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-black font-semibold rounded-2xl transition-all duration-300"
                >
                  Déconnexion
                </button>
              </>
            )}
            {showBackButton && (
              <Link
                href={backHref}
                className="inline-flex items-center gap-2 px-4 py-2 bg-gray-200 hover:bg-gray-300 text-black font-semibold rounded-2xl transition-all duration-300"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10 19l-7-7m0 0l7-7m-7 7h18"
                  />
                </svg>
                Retour
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

