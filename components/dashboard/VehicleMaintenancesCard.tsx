"use client";

import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import AddMaintenanceScheduleModal from "./AddMaintenanceScheduleModal";

interface VehicleEquipment {
  _id: string;
  equipmentId?: {
    _id: string;
    name: string;
    photos?: string[];
  };
  isCustom: boolean;
  customData?: {
    name: string;
    photos?: string[];
  };
}

interface VehicleMaintenancesCardProps {
  vehicleId: string;
  equipments: VehicleEquipment[];
}

interface MaintenanceData {
  name: string;
  priority: "critical" | "important" | "recommended" | "optional";
  recurrence: {
    time?: { value: number; unit: string };
    kilometers?: number;
  };
  estimatedDuration?: number;
  [key: string]: unknown;
}

interface MaintenanceSchedule {
  _id: string;
  status: "pending" | "due_soon" | "overdue" | "completed";
  isCustom?: boolean;
  customData?: MaintenanceData;
  maintenanceId?: MaintenanceData;
  nextDueDate?: string;
  nextDueKilometers?: number;
  vehicleEquipmentId?: {
    equipmentId?: { name?: string };
    customData?: { name?: string };
  };
  [key: string]: unknown;
}

interface Recommendation {
  _id: string;
  equipment: {
    _id: string;
    name: string;
    photos?: string[];
  };
  vehicleEquipmentId: string;
  maintenances: Array<{
    _id: string;
    name: string;
    priority: "critical" | "important" | "recommended" | "optional";
    recurrence: {
      time?: { value: number; unit: string };
      kilometers?: number;
    };
    [key: string]: unknown;
  }>;
}

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

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-blue-50 text-blue-700 border-blue-200",
  due_soon: "bg-yellow-50 text-yellow-700 border-yellow-200",
  overdue: "bg-red-50 text-red-700 border-red-200",
  completed: "bg-green-50 text-green-700 border-green-200",
};

export default function VehicleMaintenancesCard({
  vehicleId,
  equipments,
}: VehicleMaintenancesCardProps) {
  const [maintenances, setMaintenances] = useState<MaintenanceSchedule[]>([]);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingRecommendations, setIsLoadingRecommendations] = useState(false);
  const [expandedId] = useState<string | null>(null);
  const [addingMaintenanceId, setAddingMaintenanceId] = useState<string | null>(null);
  const [showEquipmentSelector, setShowEquipmentSelector] = useState(false);
  const [selectedEquipmentId, setSelectedEquipmentId] = useState<string | null>(null);

  const fetchMaintenances = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/vehicles/${vehicleId}/maintenances`);
      if (response.ok) {
        const data = await response.json();
        setMaintenances(data.maintenances);
      }
    } catch (error) {
      console.error("Error fetching maintenances:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchRecommendations = async () => {
    setIsLoadingRecommendations(true);
    try {
      const response = await fetch(`/api/vehicles/${vehicleId}/maintenances/recommended`);
      if (response.ok) {
        const data = await response.json();
        setRecommendations(data.recommendations);
      }
    } catch (error) {
      console.error("Error fetching recommendations:", error);
    } finally {
      setIsLoadingRecommendations(false);
    }
  };

  useEffect(() => {
    fetchMaintenances();
    fetchRecommendations();
  }, [vehicleId]);

  const handleQuickAdd = async (
    vehicleEquipmentId: string,
    maintenanceId: string
  ) => {
    setAddingMaintenanceId(maintenanceId);
    try {
      const response = await fetch(
        `/api/vehicles/${vehicleId}/equipments/${vehicleEquipmentId}/maintenances`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            maintenanceIds: [maintenanceId],
            isCustom: false,
          }),
        }
      );

      if (response.ok) {
        // Refresh both lists
        fetchMaintenances();
        fetchRecommendations();
      } else {
        alert("Erreur lors de l'ajout");
      }
    } catch (error) {
      alert("Erreur lors de l'ajout");
    } finally {
      setAddingMaintenanceId(null);
    }
  };

  const formatRecurrence = (recurrence: { time?: { value: number; unit: string }; kilometers?: number }) => {
    const parts = [];
    if (recurrence?.time) {
      const unitLabels: Record<string, string> = { days: "jour", months: "mois", years: "an" };
      const unit = unitLabels[recurrence.time.unit] || recurrence.time.unit;
      const plural =
        recurrence.time.value > 1 && unit !== "mois" && !unit.endsWith("s")
          ? "s"
          : "";
      parts.push(`${recurrence.time.value} ${unit}${plural}`);
    }
    if (recurrence?.kilometers) {
      parts.push(`${recurrence.kilometers.toLocaleString()} km`);
    }
    return parts.join(" • ");
  };

  const getEquipmentName = (schedule: { isCustom?: boolean; customData?: { name?: string }; vehicleEquipmentId?: { equipmentId?: { name?: string }; customData?: { name?: string } } }) => {
    if (schedule.isCustom && schedule.customData) {
      return schedule.customData.name;
    }
    if (schedule.vehicleEquipmentId?.equipmentId) {
      return schedule.vehicleEquipmentId.equipmentId.name;
    }
    if (schedule.vehicleEquipmentId?.customData) {
      return schedule.vehicleEquipmentId.customData.name;
    }
    return "Équipement";
  };

  const handleMaintenanceSuccess = () => {
    setSelectedEquipmentId(null);
    setShowEquipmentSelector(false);
    fetchMaintenances();
    fetchRecommendations();
  };

  const handleAddMaintenance = () => {
    if (equipments.length === 0) {
      return; // Button should be disabled anyway
    }
    setShowEquipmentSelector(true);
  };

  const handleSelectEquipment = (equipmentId: string) => {
    setSelectedEquipmentId(equipmentId);
    setShowEquipmentSelector(false);
  };

  const getEquipmentNameById = (id: string) => {
    const equipment = equipments.find((e) => e._id === id);
    if (!equipment) return "Équipement";
    return equipment.isCustom
      ? equipment.customData?.name || "Équipement"
      : equipment.equipmentId?.name || "Équipement";
  };

  return (
    <div className="bg-white rounded-3xl shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-black">Entretiens 📋</h2>
          <p className="text-gray">Planification et recommandations</p>
        </div>
        <button
          onClick={handleAddMaintenance}
          disabled={equipments.length === 0}
          className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-orange to-orange-light text-white font-bold rounded-2xl hover:shadow-lg hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
          title={
            equipments.length === 0
              ? "Ajoutez d'abord un équipement"
              : "Ajouter un entretien"
          }
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
          Ajouter un entretien
        </button>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center py-12">
          <div className="w-10 h-10 border-4 border-orange border-t-transparent rounded-full animate-spin" />
        </div>
      ) : equipments.length === 0 ? (
        <div className="text-center py-12 bg-blue-50 rounded-2xl">
          <div className="w-16 h-16 bg-blue-600/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-8 h-8 text-blue-600"
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
          <h3 className="text-lg font-semibold text-black mb-2">
            Ajoutez d&apos;abord un équipement
          </h3>
          <p className="text-gray text-sm mb-4">
            Pour créer des entretiens, vous devez d&apos;abord ajouter au moins un équipement à votre véhicule
          </p>
        </div>
      ) : (
        <>
          {/* Current Maintenances */}
          {maintenances.length === 0 ? (
            <div className="text-center py-8 bg-gray-50 rounded-2xl mb-6">
              <div className="w-16 h-16 bg-orange/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-8 h-8 text-orange"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-black mb-2">
                Aucun entretien planifié
              </h3>
              <p className="text-gray text-sm">
                Cliquez sur &quot;Ajouter un entretien&quot; pour commencer
              </p>
            </div>
          ) : (
            <div className="space-y-3 mb-8">
              {maintenances.map((schedule) => {
            const maintenance = schedule.isCustom
              ? schedule.customData
              : schedule.maintenanceId;
            const isExpanded = expandedId === schedule._id;

            if (!maintenance) return null;

            return (
              <div
                key={schedule._id}
                className="border border-gray-200 rounded-xl overflow-hidden bg-white"
              >
                <div className="p-4">
                  <div className="flex items-start gap-3">
                    {/* Priority Icon */}
                    <div
                      className={`w-12 h-12 rounded-lg flex items-center justify-center text-xl border-2 flex-shrink-0 ${
                        PRIORITY_COLORS[maintenance.priority]
                      }`}
                    >
                      {PRIORITY_ICONS[maintenance.priority]}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <div>
                          <h4 className="font-bold text-black">
                            {maintenance.name}
                          </h4>
                          <p className="text-xs text-gray">
                            {getEquipmentName(schedule)}
                          </p>
                        </div>
                        <span
                          className={`px-3 py-1 text-xs font-semibold rounded-full border-2 flex-shrink-0 ${
                            STATUS_COLORS[schedule.status]
                          }`}
                        >
                          {schedule.status === "pending" && "En attente"}
                          {schedule.status === "due_soon" && "Bientôt"}
                          {schedule.status === "overdue" && "En retard"}
                          {schedule.status === "completed" && "Fait"}
                        </span>
                      </div>

                      <div className="flex flex-wrap gap-2 mb-2">
                        <span className="px-2 py-1 bg-purple-50 text-purple-700 text-xs font-medium rounded-full">
                          Tous les {formatRecurrence(maintenance.recurrence)}
                        </span>
                        {maintenance.estimatedDuration && (
                          <span className="px-2 py-1 bg-orange-50 text-orange-700 text-xs font-medium rounded-full">
                            {maintenance.estimatedDuration} min
                          </span>
                        )}
                      </div>

                      {/* Next due */}
                      {(schedule.nextDueDate || schedule.nextDueKilometers) && (
                        <div className="flex flex-wrap gap-3 text-xs text-gray">
                          {schedule.nextDueDate && (
                            <div className="flex items-center gap-1">
                              <svg
                                className="w-4 h-4"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                                />
                              </svg>
                              <span>
                                Prochain:{" "}
                                {new Date(schedule.nextDueDate).toLocaleDateString(
                                  "fr-FR"
                                )}
                              </span>
                            </div>
                          )}
                          {schedule.nextDueKilometers && (
                            <div className="flex items-center gap-1">
                              <svg
                                className="w-4 h-4"
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
                              <span>
                                {schedule.nextDueKilometers.toLocaleString()} km
                              </span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
            </div>
          )}

          {/* Recommendations - Always show if available */}
          {isLoadingRecommendations ? (
            <div className="flex justify-center items-center py-8">
              <div className="w-8 h-8 border-4 border-orange border-t-transparent rounded-full animate-spin" />
            </div>
          ) : recommendations.length > 0 ? (
            <div className="mt-8 pt-8 border-t border-gray-200">
              <div className="flex items-center gap-2 mb-4">
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
                    d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                  />
                </svg>
                <h3 className="text-lg font-bold text-black">
                  Entretiens recommandés ({recommendations.reduce((acc, r) => acc + r.maintenances.length, 0)})
                </h3>
              </div>
              <p className="text-sm text-gray mb-4">
                Basés sur vos équipements, ajoutez-les en un clic !
              </p>

              <div className="space-y-6">
                {recommendations.map((rec) => (
                  <div key={rec.equipment._id} className="border-l-4 border-orange pl-4">
                    <div className="flex items-center gap-3 mb-3">
                      {rec.equipment.photos?.[0] && (
                        <div className="relative w-12 h-12 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                          <Image
                            src={rec.equipment.photos[0]}
                            alt={rec.equipment.name}
                            fill
                            className="object-cover"
                          />
                        </div>
                      )}
                      <h4 className="font-semibold text-black">
                        {rec.equipment.name}
                      </h4>
                      <span className="text-xs text-gray">
                        {rec.maintenances.length} entretien
                        {rec.maintenances.length > 1 ? "s" : ""}
                      </span>
                    </div>

                    <div className="space-y-2">
                      {rec.maintenances.map((maintenance) => (
                        <div
                          key={maintenance._id}
                          className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                        >
                          <div
                            className={`w-10 h-10 rounded-lg flex items-center justify-center text-lg border flex-shrink-0 ${
                              PRIORITY_COLORS[maintenance.priority]
                            }`}
                          >
                            {PRIORITY_ICONS[maintenance.priority]}
                          </div>

                          <div className="flex-1 min-w-0">
                            <h5 className="font-semibold text-black text-sm">
                              {maintenance.name}
                            </h5>
                            <p className="text-xs text-gray">
                              Tous les {formatRecurrence(maintenance.recurrence)}
                            </p>
                          </div>

                          <button
                            onClick={() =>
                              handleQuickAdd(
                                rec.vehicleEquipmentId,
                                maintenance._id
                              )
                            }
                            disabled={addingMaintenanceId === maintenance._id}
                            className="px-4 py-2 bg-orange text-white text-sm font-semibold rounded-lg hover:bg-orange-dark transition-colors disabled:opacity-50 flex-shrink-0"
                          >
                            {addingMaintenanceId === maintenance._id
                              ? "..."
                              : "Ajouter"}
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : maintenances.length === 0 ? (
            <div className="text-center py-6 bg-blue-50 rounded-2xl">
              <p className="text-sm text-blue-700">
                💡 Ajoutez des équipements pour voir les entretiens recommandés
              </p>
            </div>
          ) : null}
        </>
      )}
      

      {/* Equipment Selector Modal */}
      <AnimatePresence>
        {showEquipmentSelector && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowEquipmentSelector(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-2xl font-bold text-black">
                    Sélectionner un équipement
                  </h3>
                  <button
                    onClick={() => setShowEquipmentSelector(false)}
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
                <p className="text-gray text-sm mt-2">
                  Choisissez l&apos;équipement pour lequel vous souhaitez ajouter un entretien
                </p>
              </div>

              <div className="p-6 overflow-y-auto max-h-[calc(80vh-140px)]">
                <div className="space-y-3">
                  {equipments.map((equipment) => {
                    const name = equipment.isCustom
                      ? equipment.customData?.name
                      : equipment.equipmentId?.name;
                    const photo = equipment.isCustom
                      ? equipment.customData?.photos?.[0]
                      : equipment.equipmentId?.photos?.[0];

                    return (
                      <button
                        key={equipment._id}
                        onClick={() => handleSelectEquipment(equipment._id)}
                        className="w-full flex items-center gap-4 p-4 bg-gray-50 hover:bg-orange/10 border-2 border-transparent hover:border-orange rounded-2xl transition-all"
                      >
                        <div className="relative w-16 h-16 bg-gray-200 rounded-xl overflow-hidden flex-shrink-0">
                          {photo ? (
                            <Image
                              src={photo}
                              alt={name || "Équipement"}
                              fill
                              className="object-cover"
                            />
                          ) : (
                            <div className="absolute inset-0 flex items-center justify-center text-2xl">
                              🔧
                            </div>
                          )}
                        </div>
                        <div className="flex-1 text-left">
                          <h4 className="font-bold text-black">{name}</h4>
                          {equipment.isCustom && (
                            <span className="text-xs text-blue-600 font-semibold">
                              Personnalisé
                            </span>
                          )}
                        </div>
                        <svg
                          className="w-5 h-5 text-gray"
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
                    );
                  })}
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Add Maintenance Modal */}
      <AnimatePresence>
        {selectedEquipmentId && (
          <AddMaintenanceScheduleModal
            vehicleId={vehicleId}
            vehicleEquipmentId={selectedEquipmentId}
            equipmentName={getEquipmentNameById(selectedEquipmentId)}
            onClose={() => setSelectedEquipmentId(null)}
            onSuccess={handleMaintenanceSuccess}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

