"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface Maintenance {
  _id: string;
  name: string;
  type: string;
  priority: "critical" | "important" | "recommended" | "optional";
  difficulty: string;
  recurrence: {
    time?: { value: number; unit: string };
    kilometers?: number;
  };
  description?: string;
  instructions?: string;
  estimatedDuration?: number;
  estimatedCost?: number;
  tags?: string[];
  isOfficial?: boolean;
}

interface AddMaintenanceScheduleModalProps {
  vehicleId: string;
  vehicleEquipmentId: string;
  equipmentName: string;
  onClose: () => void;
  onSuccess: () => void;
}

const TYPE_LABELS: Record<string, string> = {
  inspection: "Inspection",
  cleaning: "Nettoyage",
  replacement: "Remplacement",
  service: "Révision",
  lubrication: "Lubrification",
  adjustment: "Réglage",
  drain: "Vidange",
  test: "Test",
  calibration: "Calibration",
  other: "Autre",
};

const PRIORITY_COLORS: Record<string, string> = {
  critical: "bg-red-100 text-red-700 border-red-300",
  important: "bg-orange-100 text-orange-700 border-orange-300",
  recommended: "bg-yellow-100 text-yellow-700 border-yellow-300",
  optional: "bg-gray-100 text-gray-700 border-gray-300",
};

const PRIORITY_ICONS: Record<string, string> = {
  critical: "🔴",
  important: "🟠",
  recommended: "🟡",
  optional: "⚪",
};

export default function AddMaintenanceScheduleModal({
  vehicleId,
  vehicleEquipmentId,
  equipmentName,
  onClose,
  onSuccess,
}: AddMaintenanceScheduleModalProps) {
  const [activeTab, setActiveTab] = useState<"recommended" | "custom">("recommended");
  const [maintenances, setMaintenances] = useState<Maintenance[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedMaintenances, setSelectedMaintenances] = useState<Set<string>>(new Set());
  const [isAdding, setIsAdding] = useState(false);
  const [error, setError] = useState("");

  const fetchRecommendedMaintenances = async () => {
    setIsLoading(true);
    try {
      // First get the equipment to find its equipmentId
      const equipmentRes = await fetch(`/api/vehicles/${vehicleId}/equipments`);
      if (!equipmentRes.ok) return;
      
      const equipmentData = await equipmentRes.json();
      const equipment = equipmentData.equipments.find(
        (e: { _id: string }) => e._id === vehicleEquipmentId
      );

      if (!equipment || !equipment.equipmentId) {
        setError("Aucun entretien recommandé disponible pour cet équipement");
        setIsLoading(false);
        return;
      }

      // Get recommended maintenances for this equipment
      const response = await fetch(`/api/equipments/${equipment.equipmentId._id}/maintenances`);
      if (response.ok) {
        const data = await response.json();
        setMaintenances(data.maintenances);
      }
    } catch (error) {
      console.error("Error fetching maintenances:", error);
      setError("Erreur lors du chargement des entretiens recommandés");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRecommendedMaintenances();
  }, []);

  const toggleSelection = (maintenanceId: string) => {
    const newSelected = new Set(selectedMaintenances);
    if (newSelected.has(maintenanceId)) {
      newSelected.delete(maintenanceId);
    } else {
      newSelected.add(maintenanceId);
    }
    setSelectedMaintenances(newSelected);
  };

  const selectAll = () => {
    setSelectedMaintenances(new Set(maintenances.map((m) => m._id)));
  };

  const deselectAll = () => {
    setSelectedMaintenances(new Set());
  };

  const handleAdd = async () => {
    if (selectedMaintenances.size === 0) {
      setError("Veuillez sélectionner au moins un entretien");
      return;
    }

    setIsAdding(true);
    setError("");

    try {
      const response = await fetch(
        `/api/vehicles/${vehicleId}/equipments/${vehicleEquipmentId}/maintenances`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            maintenanceIds: Array.from(selectedMaintenances),
            isCustom: false,
          }),
        }
      );

      if (response.ok) {
        const data = await response.json();
        if (data.errors && data.errors.length > 0) {
          const errorMsg = data.errors
            .map((e: { maintenanceId: string; error: string }) => `${e.maintenanceId}: ${e.error}`)
            .join(", ");
          setError(`Certains entretiens n&apos;ont pas pu être ajoutés: ${errorMsg}`);
        } else {
          onSuccess();
        }
      } else {
        const data = await response.json();
        setError(data.error || "Erreur lors de l'ajout");
      }
    } catch (error) {
      setError("Erreur lors de l'ajout");
    } finally {
      setIsAdding(false);
    }
  };

  const formatRecurrence = (recurrence: { time?: { value: number; unit: string }; kilometers?: number }) => {
    const parts = [];
    if (recurrence?.time) {
      const unitLabels: Record<string, string> = { days: "jour", months: "mois", years: "an" };
      const unit = unitLabels[recurrence.time.unit] || recurrence.time.unit;
      const plural =
        recurrence.time.value > 1 && unit !== "mois" && !unit.endsWith("s") ? "s" : "";
      parts.push(`Tous les ${recurrence.time.value} ${unit}${plural}`);
    }
    if (recurrence?.kilometers) {
      parts.push(`Tous les ${recurrence.kilometers.toLocaleString()} km`);
    }
    return parts.join(" • ") || "Aucune récurrence";
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.2 }}
        className="bg-white rounded-3xl w-full max-w-5xl my-8 max-h-[90vh] flex flex-col shadow-2xl"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 flex-shrink-0">
          <div>
            <h2 className="text-2xl font-bold text-black">
              Ajouter des entretiens
            </h2>
            <p className="text-sm text-gray">Pour: {equipmentName}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
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

        {/* Tabs */}
        <div className="flex gap-2 p-6 border-b border-gray-200">
          <button
            onClick={() => setActiveTab("recommended")}
            className={`flex-1 px-6 py-3 font-semibold rounded-2xl transition-all duration-300 ${
              activeTab === "recommended"
                ? "bg-gradient-to-r from-orange to-orange-light text-white shadow-lg"
                : "bg-gray-100 text-gray hover:bg-gray-200"
            }`}
          >
            ⭐ Recommandés
          </button>
          <button
            onClick={() => setActiveTab("custom")}
            className={`flex-1 px-6 py-3 font-semibold rounded-2xl transition-all duration-300 ${
              activeTab === "custom"
                ? "bg-gradient-to-r from-orange to-orange-light text-white shadow-lg"
                : "bg-gray-100 text-gray hover:bg-gray-200"
            }`}
          >
            ✏️ Créer le mien
          </button>
        </div>

        {error && (
          <div className="mx-6 mt-6 p-4 bg-red-50 border border-red-200 rounded-2xl">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}

        {/* Content */}
        <div className="flex-1 overflow-y-auto min-h-0">
          <AnimatePresence mode="wait">
            {activeTab === "recommended" ? (
              <motion.div
                key="recommended"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.2 }}
                className="flex flex-col min-h-full"
              >
                {/* Actions bar */}
                {maintenances.length > 0 && (
                  <div className="p-6 border-b border-gray-200 bg-gray-50 flex-shrink-0">
                    <div className="flex items-center justify-between">
                      <div className="text-sm">
                        <span className="font-bold text-black">
                          {selectedMaintenances.size}
                        </span>
                        <span className="text-gray">
                          {" "}
                          / {maintenances.length} sélectionné
                          {selectedMaintenances.size > 1 ? "s" : ""}
                        </span>
                      </div>
                      <div className="flex gap-3">
                        <button
                          onClick={selectAll}
                          className="px-4 py-2 bg-white text-black text-sm font-semibold rounded-xl hover:bg-gray-100 transition-colors border border-gray-200"
                        >
                          Tout sélectionner
                        </button>
                        {selectedMaintenances.size > 0 && (
                          <button
                            onClick={deselectAll}
                            className="px-4 py-2 bg-white text-black text-sm font-semibold rounded-xl hover:bg-gray-100 transition-colors border border-gray-200"
                          >
                            Tout désélectionner
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Maintenances List */}
                <div className="p-6">
                  {isLoading ? (
                    <div className="flex justify-center items-center py-20">
                      <div className="w-12 h-12 border-4 border-orange border-t-transparent rounded-full animate-spin" />
                    </div>
                  ) : maintenances.length === 0 ? (
                    <div className="text-center py-12">
                      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg
                          className="w-8 h-8 text-gray"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                      </div>
                      <h3 className="text-lg font-semibold text-black mb-2">
                        Aucun entretien recommandé
                      </h3>
                      <p className="text-gray text-sm">
                        Cet équipement n&apos;a pas encore d&apos;entretiens recommandés dans la
                        bibliothèque. Créez les vôtres !
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {maintenances.map((maintenance, index) => {
                        const isSelected = selectedMaintenances.has(maintenance._id);
                        return (
                          <motion.div
                            key={maintenance._id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.03 }}
                            onClick={() => toggleSelection(maintenance._id)}
                            className={`border-2 rounded-2xl p-4 transition-all cursor-pointer ${
                              isSelected
                                ? "border-orange bg-orange/5"
                                : "border-gray-200 bg-white hover:border-orange/50"
                            }`}
                          >
                            <div className="flex items-start gap-4">
                              {/* Checkbox */}
                              <div className="pt-1">
                                <input
                                  type="checkbox"
                                  checked={isSelected}
                                  onChange={() => toggleSelection(maintenance._id)}
                                  className="w-5 h-5 text-orange rounded"
                                />
                              </div>

                              {/* Priority Icon */}
                              <div
                                className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl border-2 flex-shrink-0 ${
                                  PRIORITY_COLORS[maintenance.priority]
                                }`}
                              >
                                {PRIORITY_ICONS[maintenance.priority]}
                              </div>

                              {/* Content */}
                              <div className="flex-1 min-w-0">
                                <div className="flex items-start justify-between gap-4 mb-2">
                                  <h4 className="font-bold text-black text-lg">
                                    {maintenance.name}
                                  </h4>
                                  {maintenance.isOfficial && (
                                    <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-semibold rounded-full flex-shrink-0">
                                      Officiel
                                    </span>
                                  )}
                                </div>

                                {maintenance.description && (
                                  <p className="text-sm text-gray mb-3 line-clamp-2">
                                    {maintenance.description}
                                  </p>
                                )}

                                <div className="flex flex-wrap gap-2">
                                  <span className="px-3 py-1 bg-blue-50 text-blue-700 text-xs font-semibold rounded-full">
                                    {TYPE_LABELS[maintenance.type] || maintenance.type}
                                  </span>
                                  <span className="px-3 py-1 bg-purple-50 text-purple-700 text-xs font-semibold rounded-full">
                                    {formatRecurrence(maintenance.recurrence)}
                                  </span>
                                  {maintenance.estimatedDuration && (
                                    <span className="px-3 py-1 bg-orange-50 text-orange-700 text-xs font-semibold rounded-full">
                                      ⏱️ {maintenance.estimatedDuration} min
                                    </span>
                                  )}
                                  {maintenance.estimatedCost !== undefined && (
                                    <span className="px-3 py-1 bg-green-50 text-green-700 text-xs font-semibold rounded-full">
                                      💰 {maintenance.estimatedCost === 0 ? "Gratuit" : `${maintenance.estimatedCost}€`}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="custom"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
                className="p-6"
              >
                {/* Custom Maintenance Form (Maquette) */}
                <div className="max-w-2xl mx-auto">
                  <div className="bg-blue-50 border-2 border-blue-200 rounded-2xl p-8 mb-6">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center flex-shrink-0">
                        <svg
                          className="w-6 h-6 text-white"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-bold text-blue-900 mb-2">
                          Fonctionnalité à venir
                        </h3>
                        <p className="text-blue-700 text-sm mb-3">
                          Vous pourrez bientôt créer vos propres entretiens personnalisés
                          avec récurrence, instructions, photos, pièces nécessaires, etc.
                        </p>
                        <p className="text-blue-600 text-xs">
                          💡 En attendant, utilisez les entretiens recommandés ou contactez
                          l&apos;admin pour enrichir la bibliothèque.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Maquette du formulaire */}
                  <div className="space-y-4 opacity-50 pointer-events-none">
                    <div>
                      <label className="block text-sm font-medium text-black mb-2">
                        Nom de l&apos;entretien <span className="text-orange">*</span>
                      </label>
                      <input
                        type="text"
                        placeholder="Ex: Vérification du filtre"
                        className="w-full px-4 py-3 rounded-2xl border border-gray-200 focus:outline-none"
                        disabled
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-black mb-2">
                          Type
                        </label>
                        <select
                          className="w-full px-4 py-3 rounded-2xl border border-gray-200 focus:outline-none"
                          disabled
                        >
                          <option>Inspection</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-black mb-2">
                          Priorité
                        </label>
                        <select
                          className="w-full px-4 py-3 rounded-2xl border border-gray-200 focus:outline-none"
                          disabled
                        >
                          <option>Recommandé</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-black mb-2">
                        Récurrence
                      </label>
                      <div className="flex gap-3">
                        <input
                          type="number"
                          placeholder="6"
                          className="w-24 px-4 py-3 rounded-2xl border border-gray-200 focus:outline-none"
                          disabled
                        />
                        <select
                          className="flex-1 px-4 py-3 rounded-2xl border border-gray-200 focus:outline-none"
                          disabled
                        >
                          <option>Mois</option>
                        </select>
                      </div>
                    </div>

                    <button
                      disabled
                      className="w-full px-6 py-4 bg-gradient-to-r from-orange to-orange-light text-white font-bold rounded-2xl"
                    >
                      Créer mon entretien
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer Actions */}
        {activeTab === "recommended" && maintenances.length > 0 && (
          <div className="flex gap-4 p-6 border-t border-gray-200 flex-shrink-0">
            <button
              onClick={onClose}
              disabled={isAdding}
              className="flex-1 px-6 py-3 bg-gray-100 text-black font-semibold rounded-2xl hover:bg-gray-200 transition-all duration-300 disabled:opacity-50"
            >
              Annuler
            </button>
            <button
              onClick={handleAdd}
              disabled={isAdding || selectedMaintenances.size === 0}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-orange to-orange-light text-white font-bold rounded-2xl hover:shadow-lg hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:hover:scale-100"
            >
              {isAdding
                ? "Ajout en cours..."
                : `Ajouter ${selectedMaintenances.size} entretien${
                    selectedMaintenances.size > 1 ? "s" : ""
                  }`}
            </button>
          </div>
        )}
      </motion.div>
    </div>
  );
}

