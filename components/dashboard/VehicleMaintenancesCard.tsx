"use client";

import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import AddMaintenanceScheduleModal from "./AddMaintenanceScheduleModal";
import CompleteMaintenanceModal from "./CompleteMaintenanceModal";
import MaintenanceInstructionsModal from "./MaintenanceInstructionsModal";

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
  type?: string;
  priority: "critical" | "important" | "recommended" | "optional";
  recurrence: {
    time?: { value: number; unit: string };
    kilometers?: number;
  };
  estimatedDuration?: number;
  instructions?: string;
  description?: string;
  difficulty?: string;
  conditions?: string[];
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
  lastCompletedAt?: string;
  lastCompletedMileage?: number;
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
  const [vehicle, setVehicle] = useState<{ currentMileage: number } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingRecommendations, setIsLoadingRecommendations] = useState(false);
  const [expandedId] = useState<string | null>(null);
  const [addingMaintenanceId, setAddingMaintenanceId] = useState<string | null>(null);
  const [showEquipmentSelector, setShowEquipmentSelector] = useState(false);
  const [selectedEquipmentId, setSelectedEquipmentId] = useState<string | null>(null);
  const [completeMaintenanceData, setCompleteMaintenanceData] = useState<{
    scheduleId: string;
    name: string;
  } | null>(null);
  const [deleteMaintenanceData, setDeleteMaintenanceData] = useState<{
    scheduleId: string;
    name: string;
  } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [instructionsData, setInstructionsData] = useState<{
    name: string;
    instructions: string;
    description?: string;
    estimatedDuration?: number;
    difficulty?: string;
    conditions?: string[];
  } | null>(null);

  const fetchMaintenances = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/vehicles/${vehicleId}/maintenances`);
      if (response.ok) {
        const data = await response.json();
        console.log("Maintenances data:", data.maintenances); // Debug
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
    fetchVehicle();
    fetchMaintenances();
    fetchRecommendations();
  }, [vehicleId]);

  const fetchVehicle = async () => {
    try {
      const response = await fetch(`/api/vehicles/${vehicleId}`);
      if (response.ok) {
        const data = await response.json();
        setVehicle(data.vehicle);
      }
    } catch (error) {
      console.error("Error fetching vehicle:", error);
    }
  };

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

  // Calcul du temps restant avant l'échéance
  const calculateDaysRemaining = (schedule: MaintenanceSchedule): number | null => {
    if (!schedule.nextDueDate) return null;
    const now = new Date().getTime();
    const dueDate = new Date(schedule.nextDueDate).getTime();
    const diffDays = Math.ceil((dueDate - now) / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  // Calcul du kilométrage restant
  const calculateKmRemaining = (schedule: MaintenanceSchedule): number | null => {
    if (!schedule.nextDueKilometers || !vehicle?.currentMileage) return null;
    return schedule.nextDueKilometers - vehicle.currentMileage;
  };

  // Trier les maintenances par urgence (le plus proche en premier)
  const getSortedMaintenances = () => {
    return [...maintenances].sort((a, b) => {
      const aDays = calculateDaysRemaining(a);
      const aKm = calculateKmRemaining(a);
      const bDays = calculateDaysRemaining(b);
      const bKm = calculateKmRemaining(b);

      // Si les deux ont une date, comparer par date
      if (aDays !== null && bDays !== null) {
        if (aDays !== bDays) return aDays - bDays;
      }

      // Sinon, comparer par kilométrage
      if (aKm !== null && bKm !== null) {
        return aKm - bKm;
      }

      // Si un a une date et pas l'autre, celui avec date en premier
      if (aDays !== null && bDays === null) return -1;
      if (aDays === null && bDays !== null) return 1;

      return 0;
    });
  };

  const formatDaysRemaining = (days: number): string => {
    if (days < 0) return `En retard de ${Math.abs(days)}j`;
    if (days === 0) return "Aujourd'hui !";
    if (days === 1) return "Demain";
    if (days <= 7) return `Dans ${days}j`;
    if (days <= 30) return `Dans ${Math.floor(days / 7)} semaines`;
    if (days <= 365) return `Dans ${Math.floor(days / 30)} mois`;
    return `Dans ${Math.floor(days / 365)} an${days >= 730 ? "s" : ""}`;
  };

  const formatKmRemaining = (km: number): string => {
    if (km < 0) return `Dépassé de ${Math.abs(km).toLocaleString()} km`;
    if (km === 0) return "Maintenant !";
    return `Dans ${km.toLocaleString()} km`;
  };

  const handleDeleteMaintenance = async () => {
    if (!deleteMaintenanceData) return;

    setIsDeleting(true);
    try {
      const response = await fetch(
        `/api/vehicles/${vehicleId}/maintenances/${deleteMaintenanceData.scheduleId}`,
        {
          method: "DELETE",
        }
      );

      if (response.ok) {
        setDeleteMaintenanceData(null);
        fetchMaintenances();
      } else {
        const data = await response.json();
        alert(data.error || "Erreur lors de la suppression");
      }
    } catch (error) {
      alert("Erreur lors de la suppression");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="bg-white rounded-3xl shadow-lg p-4 sm:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-black">Entretiens 📋</h2>
          <p className="text-gray text-sm sm:text-base">Planification et recommandations</p>
        </div>
        <button
          onClick={handleAddMaintenance}
          disabled={equipments.length === 0}
          className="inline-flex items-center justify-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 bg-gradient-to-r from-orange to-orange-light text-white font-bold text-sm sm:text-base rounded-2xl hover:shadow-lg hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
          title={
            equipments.length === 0
              ? "Ajoutez d'abord un équipement"
              : "Ajouter un entretien"
          }
        >
          <svg
            className="w-4 h-4 sm:w-5 sm:h-5"
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
          <span className="hidden sm:inline">Ajouter un entretien</span>
          <span className="sm:hidden">Ajouter</span>
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
              {getSortedMaintenances().map((schedule) => {
            const maintenance = schedule.isCustom
              ? schedule.customData
              : schedule.maintenanceId;
            const isExpanded = expandedId === schedule._id;
            const daysRemaining = calculateDaysRemaining(schedule);
            const kmRemaining = calculateKmRemaining(schedule);

            if (!maintenance) return null;

            return (
              <div
                key={schedule._id}
                className="border-2 border-gray-200 rounded-2xl overflow-hidden bg-white hover:shadow-md transition-shadow"
              >
                <div className="p-3 sm:p-4">
                  <div className="flex items-start gap-2 sm:gap-3 mb-3">
                    {/* Priority Icon */}
                    <div
                      className={`w-10 h-10 sm:w-12 sm:h-12 rounded-lg flex items-center justify-center text-lg sm:text-xl border-2 flex-shrink-0 ${
                        PRIORITY_COLORS[maintenance.priority]
                      }`}
                    >
                      {PRIORITY_ICONS[maintenance.priority]}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="mb-2">
                        <h4 className="font-bold text-black text-base sm:text-lg leading-tight">
                          {maintenance.name}
                        </h4>
                        <p className="text-xs text-gray-500 mt-0.5">
                          {getEquipmentName(schedule)}
                        </p>
                      </div>

                      {/* Time/Distance remaining - RESPONSIVE */}
                      <div className="flex flex-wrap gap-1.5 sm:gap-2 mb-2 sm:mb-3">
                        {daysRemaining !== null && (
                          <div className={`px-2 sm:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-xl font-bold text-xs sm:text-sm ${
                            daysRemaining < 0
                              ? "bg-red-100 text-red-700"
                              : daysRemaining <= 7
                              ? "bg-orange-100 text-orange-700"
                              : "bg-blue-100 text-blue-700"
                          }`}>
                            <span className="hidden sm:inline">📅 </span>
                            {formatDaysRemaining(daysRemaining)}
                          </div>
                        )}
                        {kmRemaining !== null && (
                          <div className={`px-2 sm:px-4 py-1.5 sm:py-2 rounded-lg sm:rounded-xl font-bold text-xs sm:text-sm ${
                            kmRemaining < 0
                              ? "bg-red-100 text-red-700"
                              : kmRemaining <= 1000
                              ? "bg-orange-100 text-orange-700"
                              : "bg-blue-100 text-blue-700"
                          }`}>
                            <span className="hidden sm:inline">🛣️ </span>
                            {formatKmRemaining(kmRemaining)}
                          </div>
                        )}
                      </div>

                      {/* Recurrence info - RESPONSIVE */}
                      <div className="flex flex-wrap gap-1.5 sm:gap-2">
                        <span className="px-2 py-1 bg-purple-50 text-purple-700 text-xs font-medium rounded-lg">
                          <span className="hidden sm:inline">Tous les </span>
                          {formatRecurrence(maintenance.recurrence)}
                        </span>
                        {maintenance.estimatedDuration && (
                          <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded-lg">
                            ⏱️ {maintenance.estimatedDuration}min
                          </span>
                        )}
                        {schedule.lastCompletedAt && (
                          <span className="px-2 py-1 bg-green-50 text-green-700 text-xs font-medium rounded-lg">
                            ✓ <span className="hidden sm:inline">Dernier: </span>
                            {new Date(schedule.lastCompletedAt).toLocaleDateString("fr-FR", {
                              day: "2-digit",
                              month: "2-digit"
                            })}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Action buttons - RESPONSIVE */}
                  <div className="flex flex-col sm:flex-row gap-2 pt-3 border-t border-gray-100">
                    <button
                      onClick={() =>
                        setCompleteMaintenanceData({
                          scheduleId: schedule._id,
                          name: maintenance.name,
                        })
                      }
                      className="flex-1 px-3 sm:px-4 py-2 bg-gradient-to-r from-green-500 to-green-600 text-white text-xs sm:text-sm font-semibold rounded-xl hover:shadow-lg transition-all"
                    >
                      {!schedule.lastCompletedAt ? (
                        <>
                          <span className="sm:hidden">📝 Définir</span>
                          <span className="hidden sm:inline">📝 Définir la dernière exécution</span>
                        </>
                      ) : (
                        <>
                          <span className="sm:hidden">✓ Fait</span>
                          <span className="hidden sm:inline">✓ Marquer comme fait</span>
                        </>
                      )}
                    </button>
                    {maintenance.instructions && typeof maintenance.instructions === 'string' && (
                      <button
                        onClick={() =>
                          setInstructionsData({
                            name: maintenance.name,
                            instructions: maintenance.instructions as string,
                            description: maintenance.description as string | undefined,
                            estimatedDuration: maintenance.estimatedDuration,
                            difficulty: maintenance.difficulty as string | undefined,
                            conditions: maintenance.conditions as string[] | undefined,
                          })
                        }
                        className="flex-1 px-3 sm:px-4 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs sm:text-sm font-semibold rounded-xl transition-all"
                      >
                        <span className="sm:hidden">📋</span>
                        <span className="hidden sm:inline">📋 Instructions</span>
                      </button>
                    )}
                    <button
                      onClick={() =>
                        setDeleteMaintenanceData({
                          scheduleId: schedule._id,
                          name: maintenance.name,
                        })
                      }
                      className="flex-1 sm:w-auto px-3 sm:px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 text-xs sm:text-sm font-semibold rounded-xl transition-all"
                    >
                      <span className="sm:hidden">🗑️</span>
                      <span className="hidden sm:inline">🗑️ Supprimer</span>
                    </button>
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

              <div className="space-y-4 sm:space-y-6">
                {recommendations.map((rec) => (
                  <div key={rec.equipment._id} className="border-l-4 border-orange pl-3 sm:pl-4">
                    <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-3">
                      {rec.equipment.photos?.[0] && (
                        <div className="relative w-10 h-10 sm:w-12 sm:h-12 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0">
                          <Image
                            src={rec.equipment.photos[0]}
                            alt={rec.equipment.name}
                            fill
                            className="object-cover"
                          />
                        </div>
                      )}
                      <h4 className="font-semibold text-black text-sm sm:text-base">
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
                          className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 p-2.5 sm:p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                        >
                          <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                            <div
                              className={`w-8 h-8 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center text-base sm:text-lg border flex-shrink-0 ${
                                PRIORITY_COLORS[maintenance.priority]
                              }`}
                            >
                              {PRIORITY_ICONS[maintenance.priority]}
                            </div>

                            <div className="flex-1 min-w-0">
                              <h5 className="font-semibold text-black text-xs sm:text-sm">
                                {maintenance.name}
                              </h5>
                              <p className="text-xs text-gray truncate">
                                Tous les {formatRecurrence(maintenance.recurrence)}
                              </p>
                            </div>
                          </div>

                          <button
                            onClick={() =>
                              handleQuickAdd(
                                rec.vehicleEquipmentId,
                                maintenance._id
                              )
                            }
                            disabled={addingMaintenanceId === maintenance._id}
                            className="w-full sm:w-auto px-3 sm:px-4 py-2 bg-orange text-white text-xs sm:text-sm font-semibold rounded-lg hover:bg-orange-dark transition-colors disabled:opacity-50 flex-shrink-0"
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
              className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] sm:max-h-[80vh] overflow-hidden mx-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="p-4 sm:p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg sm:text-2xl font-bold text-black">
                    Sélectionner un équipement
                  </h3>
                  <button
                    onClick={() => setShowEquipmentSelector(false)}
                    className="p-2 hover:bg-gray-100 rounded-full transition-colors"
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
                <p className="text-gray text-xs sm:text-sm mt-2">
                  Choisissez l&apos;équipement pour lequel vous souhaitez ajouter un entretien
                </p>
              </div>

              <div className="p-4 sm:p-6 overflow-y-auto max-h-[calc(90vh-120px)] sm:max-h-[calc(80vh-140px)]">
                <div className="space-y-2 sm:space-y-3">
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
                        className="w-full flex items-center gap-3 sm:gap-4 p-3 sm:p-4 bg-gray-50 hover:bg-orange/10 border-2 border-transparent hover:border-orange rounded-xl sm:rounded-2xl transition-all"
                      >
                        <div className="relative w-12 h-12 sm:w-16 sm:h-16 bg-gray-200 rounded-lg sm:rounded-xl overflow-hidden flex-shrink-0">
                          {photo ? (
                            <Image
                              src={photo}
                              alt={name || "Équipement"}
                              fill
                              className="object-cover"
                            />
                          ) : (
                            <div className="absolute inset-0 flex items-center justify-center text-xl sm:text-2xl">
                              🔧
                            </div>
                          )}
                        </div>
                        <div className="flex-1 text-left min-w-0">
                          <h4 className="font-bold text-black text-sm sm:text-base truncate">{name}</h4>
                          {equipment.isCustom && (
                            <span className="text-xs text-blue-600 font-semibold">
                              Personnalisé
                            </span>
                          )}
                        </div>
                        <svg
                          className="w-4 h-4 sm:w-5 sm:h-5 text-gray flex-shrink-0"
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

      {/* Complete Maintenance Modal */}
      <AnimatePresence>
        {completeMaintenanceData && (
          <CompleteMaintenanceModal
            vehicleId={vehicleId}
            maintenanceScheduleId={completeMaintenanceData.scheduleId}
            maintenanceName={completeMaintenanceData.name}
            currentMileage={vehicle?.currentMileage}
            onClose={() => setCompleteMaintenanceData(null)}
            onSuccess={() => {
              setCompleteMaintenanceData(null);
              fetchVehicle();
              fetchMaintenances();
            }}
          />
        )}
      </AnimatePresence>

      {/* Instructions Modal */}
      <AnimatePresence>
        {instructionsData && (
          <MaintenanceInstructionsModal
            maintenanceName={instructionsData.name}
            instructions={instructionsData.instructions}
            description={instructionsData.description}
            estimatedDuration={instructionsData.estimatedDuration}
            difficulty={instructionsData.difficulty}
            conditions={instructionsData.conditions}
            onClose={() => setInstructionsData(null)}
          />
        )}
      </AnimatePresence>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {deleteMaintenanceData && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => !isDeleting && setDeleteMaintenanceData(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden mx-4"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              <div className="p-4 sm:p-6 bg-red-50 border-b border-red-100">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <svg
                      className="w-6 h-6 text-red-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                      />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg sm:text-xl font-bold text-red-900">
                      Supprimer l&apos;entretien ?
                    </h3>
                    <p className="text-sm text-red-700 mt-0.5">
                      Action irréversible
                    </p>
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="p-4 sm:p-6">
                <p className="text-gray-700 mb-2">
                  <span className="font-semibold text-black">
                    {deleteMaintenanceData.name}
                  </span>
                </p>
                <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-3 mb-4">
                  <p className="text-sm text-yellow-800">
                    ⚠️ <strong>Attention :</strong> Cette action supprimera définitivement :
                  </p>
                  <ul className="text-xs text-yellow-700 mt-2 ml-4 space-y-1">
                    <li>• L&apos;entretien planifié</li>
                    <li>• Tout l&apos;historique des interventions passées</li>
                    <li>• Toutes les pièces jointes associées</li>
                  </ul>
                </div>
              </div>

              {/* Footer */}
              <div className="p-4 sm:p-6 border-t border-gray-200 flex flex-col-reverse sm:flex-row gap-2 sm:gap-3">
                <button
                  onClick={() => setDeleteMaintenanceData(null)}
                  disabled={isDeleting}
                  className="flex-1 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl transition-colors disabled:opacity-50 text-sm sm:text-base"
                >
                  Annuler
                </button>
                <button
                  onClick={handleDeleteMaintenance}
                  disabled={isDeleting}
                  className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl transition-colors disabled:opacity-50 text-sm sm:text-base"
                >
                  {isDeleting ? "Suppression..." : "Oui, supprimer"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

