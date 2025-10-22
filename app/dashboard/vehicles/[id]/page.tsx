import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import VehicleDetailClient from "./VehicleDetailClient";
import DashboardHeader from "@/components/layout/DashboardHeader";

export default async function VehicleDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const { id } = await params;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <DashboardHeader showBackButton />

      {/* Main Content */}
      <main className="container mx-auto px-4 lg:px-8 py-8">
        <VehicleDetailClient vehicleId={id} />
      </main>
    </div>
  );
}

