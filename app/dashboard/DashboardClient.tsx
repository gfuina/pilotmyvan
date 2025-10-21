"use client";

import { useState, useEffect } from "react";
import { signOut } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import VehicleCard from "@/components/dashboard/VehicleCard";
import AddVehicleModal from "@/components/dashboard/AddVehicleModal";
import NotificationPreferencesCard from "@/components/dashboard/NotificationPreferencesCard";
import MaintenancesOverviewCard from "@/components/dashboard/MaintenancesOverviewCard";
import QuickActionsCard from "@/components/dashboard/QuickActionsCard";
import QuickMileageUpdateModal from "@/components/dashboard/QuickMileageUpdateModal";
import QuickFuelRecordModal from "@/components/dashboard/QuickFuelRecordModal";

interface Vehicle {
  _id: string;
  name: string;
  make: string;
  model: string;
  year: number;
  vehicleType: string;
  currentMileage: number;
  coverImage?: string;
  gallery: string[];
}

interface DashboardClientProps {
  user: {
    name?: string | null;
    email?: string | null;
    isAdmin?: boolean;
  };
}

export default function DashboardClient({ user }: DashboardClientProps) {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isMileageModalOpen, setIsMileageModalOpen] = useState(false);
  const [isFuelModalOpen, setIsFuelModalOpen] = useState(false);
  const [selectedVehicleId, setSelectedVehicleId] = useState<string>("");
  const [error, setError] = useState("");

  const fetchVehicles = async () => {
    try {
      const response = await fetch("/api/vehicles");
      if (response.ok) {
        const data = await response.json();
        setVehicles(data.vehicles);
      } else {
        setError("Erreur lors du chargement des véhicules");
      }
    } catch (error) {
      setError("Erreur lors du chargement des véhicules");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchVehicles();
  }, []);

  const handleVehicleAdded = () => {
    fetchVehicles();
    setIsAddModalOpen(false);
  };

  const handleVehicleDeleted = () => {
    fetchVehicles();
  };

  const handleSignOut = async () => {
    await signOut({ callbackUrl: "/" });
  };

  const handleMileageUpdateClick = (vehicleId: string) => {
    setSelectedVehicleId(vehicleId);
    setIsMileageModalOpen(true);
  };

  const handleFuelRecordClick = (vehicleId: string) => {
    setSelectedVehicleId(vehicleId);
    setIsFuelModalOpen(true);
  };

  const handleQuickActionSuccess = () => {
    fetchVehicles();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-40">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="flex items-center justify-between py-4">
            {/* Logo */}
            <Link href="/" className="flex items-center">
              <img
                src="/images/logo/logo-icon-text-orange.png"
                alt="PilotMyVan"
                className="h-10 w-auto"
              />
            </Link>

            {/* User Menu */}
            <div className="flex items-center gap-4">
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
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 lg:px-8 py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Maintenances Overview */}
          <MaintenancesOverviewCard />

          {/* Quick Actions */}
          {!isLoading && vehicles.length > 0 && (
            <div className="mb-8">
              <QuickActionsCard
                onMileageUpdateClick={handleMileageUpdateClick}
                onFuelRecordClick={handleFuelRecordClick}
              />
            </div>
          )}

          {/* Header Section */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
            <div>
              <h1 className="text-3xl lg:text-4xl font-bold text-black mb-2">
                Mes véhicules 🚐
              </h1>
              <p className="text-gray text-lg">
                Gérez l'entretien de vos maisons roulantes
              </p>
            </div>
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="mt-4 md:mt-0 inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-orange to-orange-light text-white font-bold rounded-2xl hover:shadow-lg hover:scale-105 transition-all duration-300"
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
                  d="M12 4v16m8-8H4"
                />
              </svg>
              Ajouter un véhicule
            </button>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-2xl">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          {/* Loading State */}
          {isLoading && (
            <div className="flex justify-center items-center py-20">
              <div className="w-12 h-12 border-4 border-orange border-t-transparent rounded-full animate-spin" />
            </div>
          )}

          {/* Empty State */}
          {!isLoading && vehicles.length === 0 && (
            <div className="bg-white rounded-3xl shadow-lg p-12 text-center">
              <div className="max-w-md mx-auto">
                <div className="w-20 h-20 bg-gradient-to-br from-orange/10 to-orange-light/10 rounded-full flex items-center justify-center mx-auto mb-6">
                  <svg
                    className="w-10 h-10 text-orange"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                    />
                  </svg>
                </div>

                <h2 className="text-2xl font-bold text-black mb-4">
                  Aucun véhicule pour le moment
                </h2>
                <p className="text-gray mb-8">
                  Ajoutez votre premier véhicule pour commencer à suivre son
                  entretien et rouler l&apos;esprit tranquille.
                </p>

                <button
                  onClick={() => setIsAddModalOpen(true)}
                  className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-orange to-orange-light text-white font-bold rounded-2xl hover:shadow-lg hover:scale-105 transition-all duration-300"
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
                      d="M12 4v16m8-8H4"
                    />
                  </svg>
                  Ajouter mon premier véhicule
                </button>
              </div>
            </div>
          )}

          {/* Vehicles Grid */}
          {!isLoading && vehicles.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {vehicles.map((vehicle, index) => (
                <motion.div
                  key={vehicle._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <VehicleCard
                    vehicle={vehicle}
                    onDeleted={handleVehicleDeleted}
                  />
                </motion.div>
              ))}
            </div>
          )}

          {/* Secondary Cards */}
          <div className="mt-12 max-w-2xl">
            <NotificationPreferencesCard />
          </div>
        </motion.div>
      </main>

      {/* Add Vehicle Modal */}
      <AnimatePresence>
        {isAddModalOpen && (
          <AddVehicleModal
            onClose={() => setIsAddModalOpen(false)}
            onSuccess={handleVehicleAdded}
          />
        )}
      </AnimatePresence>

      {/* Quick Mileage Update Modal */}
      <AnimatePresence>
        {isMileageModalOpen && selectedVehicleId && (
          <QuickMileageUpdateModal
            vehicleId={selectedVehicleId}
            onClose={() => setIsMileageModalOpen(false)}
            onSuccess={handleQuickActionSuccess}
          />
        )}
      </AnimatePresence>

      {/* Quick Fuel Record Modal */}
      <AnimatePresence>
        {isFuelModalOpen && selectedVehicleId && (
          <QuickFuelRecordModal
            vehicleId={selectedVehicleId}
            onClose={() => setIsFuelModalOpen(false)}
            onSuccess={handleQuickActionSuccess}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
