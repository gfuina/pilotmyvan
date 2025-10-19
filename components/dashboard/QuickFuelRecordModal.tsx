"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";

interface Vehicle {
  _id: string;
  name: string;
  make: string;
  model: string;
  currentMileage: number;
  fuelType?: string;
  fuelTankCapacity?: number;
}

interface QuickFuelRecordModalProps {
  vehicleId: string;
  onClose: () => void;
  onSuccess: () => void;
}

export default function QuickFuelRecordModal({
  vehicleId,
  onClose,
  onSuccess,
}: QuickFuelRecordModalProps) {
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [mileage, setMileage] = useState("");
  const [amountPaid, setAmountPaid] = useState("");
  const [liters, setLiters] = useState("");
  const [pricePerLiter, setPricePerLiter] = useState("");
  const [isFull, setIsFull] = useState(true);
  const [note, setNote] = useState("");
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

  // Auto-calculate price per liter or liters
  useEffect(() => {
    if (amountPaid && liters && !pricePerLiter) {
      const calculated = (parseFloat(amountPaid) / parseFloat(liters)).toFixed(3);
      setPricePerLiter(calculated);
    }
  }, [amountPaid, liters, pricePerLiter]);

  useEffect(() => {
    if (amountPaid && pricePerLiter && !liters) {
      const calculated = (parseFloat(amountPaid) / parseFloat(pricePerLiter)).toFixed(2);
      setLiters(calculated);
    }
  }, [amountPaid, pricePerLiter, liters]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    const mileageValue = parseInt(mileage);
    const amountPaidValue = parseFloat(amountPaid);
    const litersValue = liters ? parseFloat(liters) : undefined;
    const pricePerLiterValue = pricePerLiter ? parseFloat(pricePerLiter) : undefined;

    if (isNaN(mileageValue) || mileageValue < 0) {
      setError("Veuillez entrer un kilométrage valide");
      setIsSubmitting(false);
      return;
    }

    if (isNaN(amountPaidValue) || amountPaidValue <= 0) {
      setError("Veuillez entrer un montant valide");
      setIsSubmitting(false);
      return;
    }

    try {
      const response = await fetch(`/api/vehicles/${vehicleId}/fuel-records`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          mileage: mileageValue,
          amountPaid: amountPaidValue,
          liters: litersValue,
          pricePerLiter: pricePerLiterValue,
          isFull,
          note: note || undefined,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        let message = "Plein enregistré !";
        if (data.consumption) {
          message += ` Consommation: ${data.consumption} L/100km`;
        }
        setSuccessMessage(message);
        setTimeout(() => {
          onSuccess();
          onClose();
        }, 2000);
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
        className="bg-white rounded-3xl w-full max-w-md overflow-hidden max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-orange to-orange-light p-6 text-white">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <span className="text-3xl">⛽</span>
              <h2 className="text-2xl font-bold">Faire le plein</h2>
            </div>
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
          <p className="text-orange-100 text-sm">
            {vehicle.name} - {vehicle.fuelType}
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto">
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

          <div className="space-y-4 mb-6">
            {/* Mileage */}
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Kilométrage *
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={mileage}
                  onChange={(e) => setMileage(e.target.value)}
                  placeholder="Ex: 45000"
                  min="0"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange focus:border-transparent outline-none text-sm"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-500">
                  km
                </span>
              </div>
            </div>

            {/* Amount Paid */}
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Montant payé *
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="0.01"
                  value={amountPaid}
                  onChange={(e) => setAmountPaid(e.target.value)}
                  placeholder="Ex: 65.50"
                  min="0"
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange focus:border-transparent outline-none text-sm"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-500">
                  €
                </span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              {/* Liters */}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Litres (optionnel)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.01"
                    value={liters}
                    onChange={(e) => {
                      setLiters(e.target.value);
                      setPricePerLiter(""); // Reset price when manually changing liters
                    }}
                    placeholder="Ex: 45.5"
                    min="0"
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange focus:border-transparent outline-none text-sm"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-500">
                    L
                  </span>
                </div>
              </div>

              {/* Price per liter */}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Prix/litre (optionnel)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.001"
                    value={pricePerLiter}
                    onChange={(e) => {
                      setPricePerLiter(e.target.value);
                      setLiters(""); // Reset liters when manually changing price
                    }}
                    placeholder="Ex: 1.649"
                    min="0"
                    className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange focus:border-transparent outline-none text-sm"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-500">
                    €/L
                  </span>
                </div>
              </div>
            </div>

            {/* Fuel capacity indicator */}
            {vehicle.fuelTankCapacity && liters && parseFloat(liters) > 0 && (
              <div className="p-3 bg-blue-50 rounded-xl border border-blue-200">
                <div className="flex items-center justify-between mb-1">
                  <p className="text-xs text-gray-600">Capacité réservoir</p>
                  <p className="text-xs font-semibold text-gray-800">
                    {vehicle.fuelTankCapacity}L
                  </p>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                    style={{
                      width: `${Math.min((parseFloat(liters) / vehicle.fuelTankCapacity) * 100, 100)}%`,
                    }}
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {((parseFloat(liters) / vehicle.fuelTankCapacity) * 100).toFixed(0)}% du réservoir
                </p>
              </div>
            )}

            {/* Full tank checkbox */}
            <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-xl">
              <input
                type="checkbox"
                id="isFull"
                checked={isFull}
                onChange={(e) => setIsFull(e.target.checked)}
                className="w-4 h-4 rounded border-gray-300 text-orange focus:ring-orange"
              />
              <label htmlFor="isFull" className="text-sm text-gray-700 cursor-pointer">
                Plein complet
              </label>
            </div>

            {/* Note */}
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Note (optionnel)
              </label>
              <input
                type="text"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Ex: Station Total sur l'autoroute"
                className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange focus:border-transparent outline-none text-sm"
              />
            </div>
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
              className="flex-1 px-6 py-3 bg-gradient-to-r from-orange to-orange-light text-white font-bold rounded-xl hover:shadow-lg transition-all duration-300 disabled:opacity-50"
            >
              {isSubmitting ? "Enregistrement..." : "Enregistrer"}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

