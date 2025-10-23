"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import MaintenanceForm, { MaintenanceFormData } from "./MaintenanceForm";

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
  const [activeTab, setActiveTab] = useState<"recommended" | "custom">("custom");
  const [maintenances, setMaintenances] = useState<Maintenance[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedMaintenances, setSelectedMaintenances] = useState<Set<string>>(new Set());
  const [isAdding, setIsAdding] = useState(false);
  const [error, setError] = useState("");
  const [isCreatingMaintenance, setIsCreatingMaintenance] = useState(false);
  const [equipmentIdForCustom, setEquipmentIdForCustom] = useState<string | null>(null);
  const [equipmentPhoto, setEquipmentPhoto] = useState<string | null>(null);

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

      if (!equipment) {
        setError("Équipement non trouvé");
        setIsLoading(false);
        return;
      }

      // Get photo from equipment or custom data
      if (equipment.isCustom && equipment.customData?.photos?.[0]) {
        setEquipmentPhoto(equipment.customData.photos[0]);
      } else if (equipment.equipmentId?.photos?.[0]) {
        setEquipmentPhoto(equipment.equipmentId.photos[0]);
      }

      // Store equipmentId for custom maintenance creation (if available)
      if (equipment.equipmentId?._id) {
        setEquipmentIdForCustom(equipment.equipmentId._id);
        
        // Get recommended maintenances for this equipment
        const response = await fetch(`/api/equipments/${equipment.equipmentId._id}/maintenances`);
        if (response.ok) {
          const data = await response.json();
          setMaintenances(data.maintenances);
        }
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

  const handleCreateMaintenance = async (data: MaintenanceFormData) => {
    setIsCreatingMaintenance(true);
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
            isCustom: true,
            customData: data,
          }),
        }
      );

      if (response.ok) {
        onSuccess();
      } else {
        const result = await response.json();
        setError(result.error || "Erreur lors de la création");
      }
    } catch (error) {
      setError("Erreur lors de la création");
    } finally {
      setIsCreatingMaintenance(false);
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
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200 flex-shrink-0">
          <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0 pr-2">
            {/* Equipment Photo */}
            {equipmentPhoto ? (
              <div className="relative w-12 h-12 sm:w-16 sm:h-16 bg-gray-100 rounded-xl overflow-hidden flex-shrink-0">
                <Image
                  src={equipmentPhoto}
                  alt={equipmentName}
                  fill
                  className="object-cover"
                />
              </div>
            ) : (
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-orange-100 to-orange-200 rounded-xl flex items-center justify-center flex-shrink-0">
                <span className="text-2xl sm:text-3xl">🔧</span>
              </div>
            )}

            {/* Title */}
            <div className="flex-1 min-w-0">
              <h2 className="text-lg sm:text-2xl font-bold text-black">
                Ajouter entretiens
              </h2>
              <p className="text-xs sm:text-sm text-gray truncate">Pour: {equipmentName}</p>
            </div>
          </div>

          {/* Close Button */}
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors flex-shrink-0"
          >
            <svg
              className="w-5 h-5 sm:w-6 sm:h-6"
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
        <div className="flex gap-2 p-4 sm:p-6 border-b border-gray-200">
          <button
            onClick={() => setActiveTab("custom")}
            className={`flex-1 px-3 sm:px-6 py-2.5 sm:py-3 text-sm sm:text-base font-semibold rounded-2xl transition-all duration-300 whitespace-nowrap ${
              activeTab === "custom"
                ? "bg-gradient-to-r from-orange to-orange-light text-white shadow-lg"
                : "bg-gray-100 text-gray hover:bg-gray-200"
            }`}
          >
            <span className="hidden sm:inline">✏️ </span>Créer le mien
          </button>
          <button
            onClick={() => setActiveTab("recommended")}
            className={`flex-1 px-3 sm:px-6 py-2.5 sm:py-3 text-sm sm:text-base font-semibold rounded-2xl transition-all duration-300 whitespace-nowrap ${
              activeTab === "recommended"
                ? "bg-gradient-to-r from-orange to-orange-light text-white shadow-lg"
                : "bg-gray-100 text-gray hover:bg-gray-200"
            }`}
          >
            <span className="hidden sm:inline">⭐ </span>Recommandés
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
                  <div className="p-3 sm:p-6 border-b border-gray-200 bg-gray-50 flex-shrink-0">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                      <div className="text-xs sm:text-sm">
                        <span className="font-bold text-black">
                          {selectedMaintenances.size}
                        </span>
                        <span className="text-gray">
                          {" "}
                          / {maintenances.length} sélectionné
                          {selectedMaintenances.size > 1 ? "s" : ""}
                        </span>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={selectAll}
                          className="flex-1 sm:flex-none px-3 sm:px-4 py-2 bg-white text-black text-xs sm:text-sm font-semibold rounded-xl hover:bg-gray-100 transition-colors border border-gray-200"
                        >
                          Tout sélectionner
                        </button>
                        {selectedMaintenances.size > 0 && (
                          <button
                            onClick={deselectAll}
                            className="flex-1 sm:flex-none px-3 sm:px-4 py-2 bg-white text-black text-xs sm:text-sm font-semibold rounded-xl hover:bg-gray-100 transition-colors border border-gray-200"
                          >
                            Désélectionner
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {/* Maintenances List */}
                <div className="p-3 sm:p-6">
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
                            className={`border-2 rounded-2xl p-3 sm:p-4 transition-all cursor-pointer ${
                              isSelected
                                ? "border-orange bg-orange/5"
                                : "border-gray-200 bg-white hover:border-orange/50"
                            }`}
                          >
                            <div className="flex items-start gap-2 sm:gap-4">
                              {/* Checkbox */}
                              <div className="pt-1 flex-shrink-0">
                                <input
                                  type="checkbox"
                                  checked={isSelected}
                                  onChange={() => toggleSelection(maintenance._id)}
                                  className="w-4 h-4 sm:w-5 sm:h-5 text-orange rounded"
                                />
                              </div>

                              {/* Priority Icon */}
                              <div
                                className={`w-10 h-10 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center text-xl sm:text-2xl border-2 flex-shrink-0 ${
                                  PRIORITY_COLORS[maintenance.priority]
                                }`}
                              >
                                {PRIORITY_ICONS[maintenance.priority]}
                              </div>

                              {/* Content */}
                              <div className="flex-1 min-w-0">
                                <div className="flex items-start justify-between gap-2 sm:gap-4 mb-2">
                                  <h4 className="font-bold text-black text-sm sm:text-lg">
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
                {/* Info box */}
                <div className="mb-8 bg-gradient-to-br from-orange-50 to-orange-100 border-2 border-orange-200 rounded-3xl p-6 shadow-md">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-orange to-orange-light rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg">
                      {maintenances.length > 0 ? (
                        <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                      ) : (
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      )}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-black mb-2">
                        {maintenances.length > 0 
                          ? "Créez vos propres entretiens ou découvrez nos recommandations"
                          : "Créez vos entretiens personnalisés"
                        }
                      </h3>
                      <p className="text-sm text-gray-700 mb-4">
                        {maintenances.length > 0 
                          ? `Vous pouvez créer les entretiens et contrôles que vous souhaitez pour cet équipement. Nous avons aussi ${maintenances.length} entretien${maintenances.length > 1 ? 's' : ''} recommandé${maintenances.length > 1 ? 's' : ''} ou proposé${maintenances.length > 1 ? 's' : ''} par la communauté avec des récurrences et instructions détaillées.`
                          : "Créez les entretiens et contrôles que vous souhaitez pour cet équipement. Vous définissez les récurrences, priorités et instructions selon vos besoins."
                        }
                      </p>
                      {maintenances.length > 0 && (
                        <button
                          onClick={() => setActiveTab("recommended")}
                          className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-orange to-orange-light text-white font-semibold rounded-xl hover:shadow-lg hover:scale-105 transition-all duration-300"
                        >
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                          Voir les {maintenances.length} recommandé{maintenances.length > 1 ? 's' : ''}
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Séparateur avec texte */}
                {maintenances.length > 0 && (
                  <div className="relative mb-8">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t-2 border-gray-200"></div>
                    </div>
                    <div className="relative flex justify-center">
                      <span className="px-4 bg-white text-sm font-semibold text-gray">
                        Créer votre propre entretien
                      </span>
                    </div>
                  </div>
                )}

                <MaintenanceForm
                  equipmentId={equipmentIdForCustom || ""}
                  equipmentName={equipmentName}
                  onSubmit={handleCreateMaintenance}
                  isSubmitting={isCreatingMaintenance}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer Actions */}
        {activeTab === "recommended" && (
          <div className="flex gap-2 sm:gap-4 p-3 sm:p-6 border-t border-gray-200 flex-shrink-0">
            <button
              onClick={onClose}
              disabled={isAdding}
              className="flex-1 px-4 sm:px-6 py-2.5 sm:py-3 bg-gray-100 text-black text-sm sm:text-base font-semibold rounded-2xl hover:bg-gray-200 transition-all duration-300 disabled:opacity-50"
            >
              Ajouter plus tard
            </button>
            {maintenances.length > 0 && (
              <button
                onClick={handleAdd}
                disabled={isAdding || selectedMaintenances.size === 0}
                className="flex-1 px-4 sm:px-6 py-2.5 sm:py-3 bg-gradient-to-r from-orange to-orange-light text-white text-sm sm:text-base font-bold rounded-2xl hover:shadow-lg hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:hover:scale-100"
              >
                {isAdding
                  ? "Ajout..."
                  : `Ajouter ${selectedMaintenances.size > 0 ? selectedMaintenances.size : ""}`}
              </button>
            )}
          </div>
        )}

        {/* Footer Actions for Custom Tab */}
        {activeTab === "custom" && (
          <div className="flex gap-2 sm:gap-4 p-3 sm:p-6 border-t border-gray-200 flex-shrink-0">
            <button
              onClick={onClose}
              disabled={isCreatingMaintenance}
              className="px-4 sm:px-6 py-2.5 sm:py-3 bg-gray-100 text-black text-sm sm:text-base font-semibold rounded-2xl hover:bg-gray-200 transition-all duration-300 disabled:opacity-50"
            >
              Ajouter plus tard
            </button>
          </div>
        )}
      </motion.div>
    </div>
  );
}

