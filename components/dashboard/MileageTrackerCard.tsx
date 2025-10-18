"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface MileageEntry {
  _id: string;
  mileage: number;
  recordedAt: string;
}

interface MileageTrackerCardProps {
  vehicleId: string;
  vehicleName?: string;
}

export default function MileageTrackerCard({
  vehicleId,
  vehicleName,
}: MileageTrackerCardProps) {
  const [history, setHistory] = useState<MileageEntry[]>([]);
  const [newMileage, setNewMileage] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [canUpdate, setCanUpdate] = useState(true);
  const [nextUpdateAvailable, setNextUpdateAvailable] = useState<Date | null>(
    null
  );
  const [timeRemaining, setTimeRemaining] = useState<string>("");

  useEffect(() => {
    fetchHistory();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [vehicleId]);

  // Mettre à jour le compteur en temps réel
  useEffect(() => {
    if (!canUpdate && nextUpdateAvailable) {
      const interval = setInterval(() => {
        const now = Date.now();
        const next = new Date(nextUpdateAvailable).getTime();
        const diff = next - now;

        if (diff <= 0) {
          setCanUpdate(true);
          setTimeRemaining("");
          clearInterval(interval);
        } else {
          const hours = Math.floor(diff / (1000 * 60 * 60));
          const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
          setTimeRemaining(`${hours}h ${minutes}min`);
        }
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [canUpdate, nextUpdateAvailable]);

  const fetchHistory = async () => {
    try {
      const response = await fetch(`/api/vehicles/${vehicleId}/mileage`);
      if (response.ok) {
        const data = await response.json();
        setHistory(data.history);
        setCanUpdate(data.canUpdate);
        setNextUpdateAvailable(
          data.nextUpdateAvailable ? new Date(data.nextUpdateAvailable) : null
        );
        if (data.lastUpdate) {
          setNewMileage(data.lastUpdate.mileage.toString());
        }
      }
    } catch (error) {
      console.error("Erreur lors du chargement de l'historique:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setError("");
    setSuccessMessage("");

    const mileageValue = parseInt(newMileage);
    if (isNaN(mileageValue) || mileageValue < 0) {
      setError("Veuillez entrer un kilométrage valide");
      setIsSaving(false);
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
        setTimeout(() => setSuccessMessage(""), 3000);
        fetchHistory(); // Recharger l'historique
      } else {
        setError(data.error || "Erreur lors de l'enregistrement");
        if (data.nextUpdateAvailable) {
          setNextUpdateAvailable(new Date(data.nextUpdateAvailable));
        }
      }
    } catch (error) {
      setError("Erreur lors de l'enregistrement");
    } finally {
      setIsSaving(false);
    }
  };

  // Préparer les données pour le graphique
  const chartData = history
    .slice()
    .reverse()
    .map((entry) => ({
      date: new Date(entry.recordedAt).toLocaleDateString("fr-FR", {
        day: "2-digit",
        month: "short",
      }),
      km: entry.mileage,
      fullDate: new Date(entry.recordedAt).toLocaleDateString("fr-FR"),
    }));

  const currentMileage = history[0]?.mileage || 0;
  const averageDailyKm =
    history.length >= 2
      ? Math.round(
          (history[0].mileage - history[history.length - 1].mileage) /
            Math.max(
              1,
              (new Date(history[0].recordedAt).getTime() -
                new Date(history[history.length - 1].recordedAt).getTime()) /
                (1000 * 60 * 60 * 24)
            )
        )
      : 0;

  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl shadow p-5">
        <div className="flex justify-center items-center py-8">
          <div className="w-8 h-8 border-4 border-orange border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-white rounded-2xl shadow p-5"
    >
      {/* Header */}
      <div className="flex items-center gap-3 mb-5">
        <div className="w-10 h-10 bg-gray-100 rounded-xl flex items-center justify-center">
          <svg
            className="w-5 h-5 text-gray-600"
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
          <h2 className="text-lg font-semibold text-black">
            Suivi du kilométrage
          </h2>
          <p className="text-xs text-gray-500">
            {vehicleName || "Historique et statistiques de vos trajets"}
          </p>
        </div>
      </div>

      {/* Stats rapides */}
      {history.length > 0 && (
        <div className="grid grid-cols-2 gap-3 mb-5">
          <div className="bg-gray-50 rounded-xl p-3">
            <p className="text-xs text-gray-500 mb-1">Kilométrage actuel</p>
            <p className="text-xl font-bold text-black">
              {currentMileage.toLocaleString()} km
            </p>
          </div>
          {history.length >= 2 && (
            <div className="bg-gray-50 rounded-xl p-3">
              <p className="text-xs text-gray-500 mb-1">Moyenne / jour</p>
              <p className="text-xl font-bold text-black">
                ~{averageDailyKm} km
              </p>
            </div>
          )}
        </div>
      )}

      {/* Graphique */}
      {chartData.length >= 2 && (
        <div className="mb-5">
          <h3 className="text-xs font-semibold text-gray-700 mb-3">
            Évolution du kilométrage
          </h3>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 11, fill: "#666" }}
                stroke="#ccc"
              />
              <YAxis
                tick={{ fontSize: 11, fill: "#666" }}
                stroke="#ccc"
                tickFormatter={(value) => `${value / 1000}k`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#fff",
                  border: "1px solid #e5e5e5",
                  borderRadius: "8px",
                  fontSize: "12px",
                }}
                formatter={(value: number) => [
                  `${value.toLocaleString()} km`,
                  "Kilométrage",
                ]}
                labelFormatter={(label, payload) =>
                  payload[0]?.payload.fullDate || label
                }
              />
              <Line
                type="monotone"
                dataKey="km"
                stroke="#ff6b35"
                strokeWidth={2}
                dot={{ fill: "#ff6b35", r: 4 }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Message si pas assez de données */}
      {chartData.length < 2 && history.length > 0 && (
        <div className="mb-5 p-3 bg-blue-50 border border-blue-200 rounded-xl">
          <p className="text-xs text-blue-600">
            📊 Ajoutez plus de données pour voir le graphique d&apos;évolution
          </p>
        </div>
      )}

      {/* Formulaire de mise à jour */}
      <form onSubmit={handleSubmit} className="mb-5">
        <label className="text-xs font-semibold text-gray-700 block mb-2">
          {history.length === 0
            ? "Enregistrer mon kilométrage actuel"
            : "Mettre à jour mon kilométrage"}
        </label>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <input
              type="number"
              value={newMileage}
              onChange={(e) => setNewMileage(e.target.value)}
              placeholder="Ex: 45000"
              min="0"
              disabled={!canUpdate || isSaving}
              className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange focus:border-transparent outline-none disabled:bg-gray-100 disabled:cursor-not-allowed text-sm"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-500">
              km
            </span>
          </div>
          <button
            type="submit"
            disabled={!canUpdate || isSaving}
            className="px-4 py-2 bg-gray-800 hover:bg-black text-white text-sm font-semibold rounded-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
          >
            {isSaving ? "..." : "Enregistrer"}
          </button>
        </div>
      </form>

      {/* Timer de cooldown */}
      {!canUpdate && timeRemaining && (
        <div className="mb-4 p-3 bg-orange-50 border border-orange-200 rounded-xl">
          <p className="text-xs text-orange-600">
            ⏱️ Prochaine mise à jour disponible dans {timeRemaining}
          </p>
        </div>
      )}

      {/* Messages */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl"
          >
            <p className="text-red-600 text-xs">{error}</p>
          </motion.div>
        )}
        {successMessage && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mb-4 p-3 bg-green-50 border border-green-200 rounded-xl"
          >
            <p className="text-green-600 text-xs">{successMessage}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Info */}
      <div className="text-xs text-gray-400 text-center">
        Mises à jour limitées à une fois toutes les 2 heures
      </div>
    </motion.div>
  );
}

