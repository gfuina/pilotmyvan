"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface Vehicle {
  _id: string;
  name: string;
  make: string;
  model: string;
  currentMileage: number;
  fuelType?: string;
  fuelTankCapacity?: number;
}

interface QuickActionsCardProps {
  onFuelRecordClick: (vehicleId: string) => void;
  onMileageUpdateClick: (vehicleId: string) => void;
}

export default function QuickActionsCard({
  onFuelRecordClick,
  onMileageUpdateClick,
}: QuickActionsCardProps) {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedVehicleId, setSelectedVehicleId] = useState<string>("");

  useEffect(() => {
    fetchVehicles();
  }, []);

  const fetchVehicles = async () => {
    try {
      const response = await fetch("/api/vehicles");
      if (response.ok) {
        const data = await response.json();
        setVehicles(data.vehicles);
        if (data.vehicles.length > 0) {
          setSelectedVehicleId(data.vehicles[0]._id);
        }
      }
    } catch (error) {
      console.error("Error fetching vehicles:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const selectedVehicle = vehicles.find((v) => v._id === selectedVehicleId);
  const hasFuelTracking = selectedVehicle?.fuelType && selectedVehicle?.fuelTankCapacity;

  if (isLoading || vehicles.length === 0) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="bg-white rounded-3xl shadow-lg p-6"
    >
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center">
          <svg
            className="w-5 h-5 text-orange"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 10V3L4 14h7v7l9-11h-7z"
            />
          </svg>
        </div>
        <div>
          <h2 className="text-xl font-bold text-black">Actions rapides</h2>
          <p className="text-sm text-gray-500">
            Enregistrez vos données en un clic
          </p>
        </div>
      </div>

      {/* Vehicle Selector */}
      {vehicles.length > 1 && (
        <div className="mb-4">
          <label className="text-xs font-medium text-gray-600 block mb-2">
            Sélectionner un véhicule
          </label>
          <select
            value={selectedVehicleId}
            onChange={(e) => setSelectedVehicleId(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange focus:border-transparent outline-none text-sm"
          >
            {vehicles.map((vehicle) => (
              <option key={vehicle._id} value={vehicle._id}>
                {vehicle.name} - {vehicle.make} {vehicle.model}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Quick Actions */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {/* Update Mileage */}
        <button
          onClick={() => onMileageUpdateClick(selectedVehicleId)}
          className="flex items-center gap-3 p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl hover:shadow-md transition-all duration-300 group"
        >
          <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center flex-shrink-0">
            <svg
              className="w-5 h-5 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 10V3L4 14h7v7l9-11h-7z"
              />
            </svg>
          </div>
          <div className="text-left flex-1">
            <p className="font-semibold text-gray-800 text-sm">
              Mettre à jour
            </p>
            <p className="text-xs text-gray-600">
              {selectedVehicle?.currentMileage.toLocaleString()} km
            </p>
          </div>
          <svg
            className="w-5 h-5 text-gray-400 group-hover:translate-x-1 transition-transform"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5l7 7-7 7"
            />
          </svg>
        </button>

        {/* Add Fuel Record */}
        {hasFuelTracking ? (
          <button
            onClick={() => onFuelRecordClick(selectedVehicleId)}
            className="flex items-center gap-3 p-4 bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl hover:shadow-md transition-all duration-300 group"
          >
            <div className="w-10 h-10 bg-orange rounded-lg flex items-center justify-center flex-shrink-0">
              <span className="text-lg">⛽</span>
            </div>
            <div className="text-left flex-1">
              <p className="font-semibold text-gray-800 text-sm">
                Faire le plein
              </p>
              <p className="text-xs text-gray-600">
                {selectedVehicle?.fuelType}
              </p>
            </div>
            <svg
              className="w-5 h-5 text-gray-400 group-hover:translate-x-1 transition-transform"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </button>
        ) : (
          <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300">
            <div className="w-10 h-10 bg-gray-300 rounded-lg flex items-center justify-center flex-shrink-0">
              <span className="text-lg opacity-50">⛽</span>
            </div>
            <div className="text-left flex-1">
              <p className="font-semibold text-gray-500 text-sm">
                Faire le plein
              </p>
              <p className="text-xs text-gray-400">
                Activez le suivi carburant
              </p>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}

