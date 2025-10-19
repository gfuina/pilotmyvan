"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";

interface Vehicle {
  _id: string;
  name: string;
  make: string;
  model: string;
  currentMileage: number;
}

interface QuickMileageUpdateModalProps {
  vehicleId: string;
  onClose: () => void;
  onSuccess: () => void;
}

export default function QuickMileageUpdateModal({
  vehicleId,
  onClose,
  onSuccess,
}: QuickMileageUpdateModalProps) {
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [mileage, setMileage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    fetchVehicle();
  }, [vehicleId]);

  const fetchVehicle = async () => {
    try {
      const response = await fetch(`/api/vehicles/${vehicleId}`);
      if (response.ok) {
        const data = await response.json();
        setVehicle(data.vehicle);
        setMileage(data.vehicle.currentMileage.toString());
      }
    } catch (error) {
      console.error("Error fetching vehicle:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    const mileageValue = parseInt(mileage);
    if (isNaN(mileageValue) || mileageValue < 0) {
      setError("Veuillez entrer un kilométrage valide");
      setIsSubmitting(false);
      return;
    }

    try {
      const response = await fetch(`/api/vehicles/${vehicleId}/mileage`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ mileage: mileageValue }),
      });

      const data = await response.json();

      if (response.ok) {
        setSuccessMessage("Kilométrage enregistré !");
        setTimeout(() => {
          onSuccess();
          onClose();
        }, 1500);
      } else {
        setError(data.error || "Erreur lors de l'enregistrement");
      }
    } catch (error) {
      setError("Erreur lors de l'enregistrement");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!vehicle) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.2 }}
        className="bg-white rounded-3xl w-full max-w-md overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-6 text-white">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-2xl font-bold">Mettre à jour</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-full transition-colors"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
          <p className="text-blue-100 text-sm">
            {vehicle.name} - {vehicle.make} {vehicle.model}
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6">
          {successMessage && (
            <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-xl">
              <p className="text-green-600 text-sm font-medium">
                {successMessage}
              </p>
            </div>
          )}

          {error && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-xl">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          <div className="mb-6">
            <label className="block text-sm font-medium text-black mb-2">
              Kilométrage actuel
            </label>
            <div className="relative">
              <input
                type="number"
                value={mileage}
                onChange={(e) => setMileage(e.target.value)}
                placeholder="Ex: 45000"
                min="0"
                required
                className="w-full px-4 py-3 text-lg font-semibold border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              />
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500">
                km
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              Actuel: {vehicle.currentMileage.toLocaleString()} km
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="flex-1 px-6 py-3 bg-gray-100 text-black font-semibold rounded-xl hover:bg-gray-200 transition-all duration-300 disabled:opacity-50"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-bold rounded-xl hover:shadow-lg transition-all duration-300 disabled:opacity-50"
            >
              {isSubmitting ? "Enregistrement..." : "Enregistrer"}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

