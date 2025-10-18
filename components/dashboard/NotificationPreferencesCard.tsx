"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function NotificationPreferencesCard() {
  const [daysBeforeMaintenance, setDaysBeforeMaintenance] = useState<number[]>(
    [1]
  );
  const [newDayValue, setNewDayValue] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // Charger les préférences actuelles
  useEffect(() => {
    fetchPreferences();
  }, []);

  const fetchPreferences = async () => {
    try {
      const response = await fetch("/api/user/notification-preferences");
      if (response.ok) {
        const data = await response.json();
        setDaysBeforeMaintenance(
          data.notificationPreferences.daysBeforeMaintenance
        );
      }
    } catch (error) {
      console.error("Erreur lors du chargement des préférences:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const savePreferences = async () => {
    setIsSaving(true);
    setError("");
    setSuccessMessage("");

    try {
      const response = await fetch("/api/user/notification-preferences", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          daysBeforeMaintenance: daysBeforeMaintenance.sort((a, b) => a - b),
        }),
      });

      if (response.ok) {
        setSuccessMessage("Préférences enregistrées !");
        setTimeout(() => setSuccessMessage(""), 3000);
      } else {
        const data = await response.json();
        setError(data.error || "Erreur lors de la sauvegarde");
      }
    } catch (error) {
      setError("Erreur lors de la sauvegarde");
    } finally {
      setIsSaving(false);
    }
  };

  const addDayPreference = () => {
    const dayValue = parseInt(newDayValue);
    if (isNaN(dayValue) || dayValue <= 0) {
      setError("Veuillez entrer un nombre de jours valide");
      return;
    }

    if (daysBeforeMaintenance.includes(dayValue)) {
      setError("Cette préférence existe déjà");
      return;
    }

    setDaysBeforeMaintenance([...daysBeforeMaintenance, dayValue]);
    setNewDayValue("");
    setError("");
  };

  const removeDayPreference = (dayToRemove: number) => {
    if (daysBeforeMaintenance.length === 1) {
      setError("Vous devez garder au moins une préférence");
      return;
    }
    setDaysBeforeMaintenance(
      daysBeforeMaintenance.filter((day) => day !== dayToRemove)
    );
    setError("");
  };

  const formatDayLabel = (days: number) => {
    if (days === 1) return "24 heures avant";
    if (days === 7) return "1 semaine avant";
    if (days === 30) return "1 mois avant";
    return `${days} jours avant`;
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-3xl shadow-lg p-6">
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
              d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
            />
          </svg>
        </div>
        <div>
          <h2 className="text-lg font-semibold text-black">
            Notifications d&apos;entretien
          </h2>
          <p className="text-xs text-gray-500">
            Recevez des rappels par email avant vos entretiens
          </p>
        </div>
      </div>

      {/* Current Preferences */}
      <div className="mb-5">
        <h3 className="text-xs font-semibold text-gray-700 mb-2">
          Vous recevrez des notifications :
        </h3>
        <div className="space-y-2">
          <AnimatePresence>
            {daysBeforeMaintenance
              .sort((a, b) => a - b)
              .map((days) => (
                <motion.div
                  key={days}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="flex items-center justify-between bg-gray-50 rounded-xl p-3"
                >
                  <div className="flex items-center gap-2">
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
                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <span className="text-sm font-medium text-black">
                      {formatDayLabel(days)}
                    </span>
                  </div>
                  <button
                    onClick={() => removeDayPreference(days)}
                    className="text-red-500 hover:text-red-700 transition-colors"
                    title="Supprimer"
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
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                </motion.div>
              ))}
          </AnimatePresence>
        </div>
      </div>

      {/* Add New Preference */}
      <div className="mb-5">
        <label className="text-xs font-semibold text-gray-700 block mb-2">
          Ajouter un rappel
        </label>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <input
              type="number"
              value={newDayValue}
              onChange={(e) => setNewDayValue(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === "Enter") {
                  addDayPreference();
                }
              }}
              placeholder="Ex: 7, 14, 30..."
              min="1"
              className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange focus:border-transparent outline-none"
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray">
              jours
            </span>
          </div>
          <button
            onClick={addDayPreference}
            className="px-4 py-2 bg-gradient-to-r from-orange to-orange-light text-white font-semibold rounded-xl hover:shadow-lg transition-all duration-300"
          >
            Ajouter
          </button>
        </div>
      </div>

      {/* Quick Presets */}
      <div className="mb-5">
        <p className="text-xs text-gray-500 mb-2">Suggestions rapides :</p>
        <div className="flex flex-wrap gap-2">
          {[1, 3, 7, 14, 30].map((preset) => (
            <button
              key={preset}
              onClick={() => {
                if (!daysBeforeMaintenance.includes(preset)) {
                  setDaysBeforeMaintenance([
                    ...daysBeforeMaintenance,
                    preset,
                  ]);
                }
              }}
              disabled={daysBeforeMaintenance.includes(preset)}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                daysBeforeMaintenance.includes(preset)
                  ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                  : "bg-orange/10 text-orange hover:bg-orange/20"
              }`}
            >
              {formatDayLabel(preset)}
            </button>
          ))}
        </div>
      </div>

      {/* Messages */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl"
          >
            <p className="text-red-600 text-sm">{error}</p>
          </motion.div>
        )}
        {successMessage && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mb-4 p-3 bg-green-50 border border-green-200 rounded-xl"
          >
            <p className="text-green-600 text-sm">{successMessage}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Save Button */}
      <button
        onClick={savePreferences}
        disabled={isSaving}
        className="w-full px-4 py-2 bg-gray-800 hover:bg-black text-white text-sm font-semibold rounded-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isSaving ? "Enregistrement..." : "Enregistrer"}
      </button>
    </motion.div>
  );
}

