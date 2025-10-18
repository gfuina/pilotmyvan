"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import CompleteMaintenanceModal from "./CompleteMaintenanceModal";

interface VehicleInfo {
  _id: string;
  name: string;
  make: string;
  model: string;
  currentMileage: number;
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
  description?: string;
}

interface MaintenanceSchedule {
  _id: string;
  vehicleInfo: VehicleInfo;
  maintenanceData: MaintenanceData;
  status: "pending" | "due_soon" | "overdue" | "completed";
  nextDueDate?: string;
  nextDueKilometers?: number;
  lastCompletedAt?: string;
  lastCompletedMileage?: number;
  isCustom?: boolean;
  customData?: MaintenanceData;
  vehicleEquipmentId?: {
    equipmentId?: { name?: string; photos?: string[] };
    customData?: { name?: string; photos?: string[] };
  };
}

const PRIORITY_ORDER: Record<string, number> = {
  critical: 4,
  important: 3,
  recommended: 2,
  optional: 1,
};

const PRIORITY_COLORS: Record<string, { bg: string; text: string; border: string; gradient: string }> = {
  critical: {
    bg: "bg-red-50",
    text: "text-red-700",
    border: "border-red-300",
    gradient: "from-red-500 to-red-600",
  },
  important: {
    bg: "bg-orange-50",
    text: "text-orange-700",
    border: "border-orange-300",
    gradient: "from-orange-500 to-orange-600",
  },
  recommended: {
    bg: "bg-yellow-50",
    text: "text-yellow-700",
    border: "border-yellow-300",
    gradient: "from-yellow-500 to-yellow-600",
  },
  optional: {
    bg: "bg-gray-50",
    text: "text-gray-700",
    border: "border-gray-300",
    gradient: "from-gray-500 to-gray-600",
  },
};

const PRIORITY_ICONS: Record<string, string> = {
  critical: "🔴",
  important: "🟠",
  recommended: "🟡",
  optional: "⚪",
};

const PRIORITY_LABELS: Record<string, string> = {
  critical: "Critique",
  important: "Important",
  recommended: "Recommandé",
  optional: "Optionnel",
};

export default function MaintenancesOverviewCard() {
  const [maintenances, setMaintenances] = useState<MaintenanceSchedule[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [completeMaintenanceData, setCompleteMaintenanceData] = useState<{
    vehicleId: string;
    scheduleId: string;
    name: string;
    currentMileage?: number;
  } | null>(null);

  const fetchMaintenances = async () => {
    try {
      const response = await fetch("/api/user/maintenances");
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

  useEffect(() => {
    fetchMaintenances();
  }, []);

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
    if (!schedule.nextDueKilometers || !schedule.vehicleInfo?.currentMileage) return null;
    return schedule.nextDueKilometers - schedule.vehicleInfo.currentMileage;
  };

  // Calcul du pourcentage d'urgence (0-100, 100 = le plus urgent)
  const calculateUrgencyPercentage = (schedule: MaintenanceSchedule): number => {
    const daysRemaining = calculateDaysRemaining(schedule);
    const kmRemaining = calculateKmRemaining(schedule);

    let urgency = 0;

    // Urgence basée sur le temps (sur 50%)
    if (daysRemaining !== null) {
      if (daysRemaining < 0) urgency += 50;
      else if (daysRemaining <= 7) urgency += 45;
      else if (daysRemaining <= 30) urgency += 35;
      else if (daysRemaining <= 90) urgency += 20;
      else urgency += 10;
    }

    // Urgence basée sur le kilométrage (sur 50%)
    if (kmRemaining !== null) {
      if (kmRemaining < 0) urgency += 50;
      else if (kmRemaining <= 500) urgency += 45;
      else if (kmRemaining <= 2000) urgency += 35;
      else if (kmRemaining <= 5000) urgency += 20;
      else urgency += 10;
    }

    return Math.min(urgency, 100);
  };

  // Filtrer et trier les maintenances
  const getFilteredMaintenances = () => {
    const urgentMaintenances = maintenances.filter(m => {
      const daysRemaining = calculateDaysRemaining(m);
      // Afficher les entretiens < 15 jours ou en retard
      return daysRemaining !== null && daysRemaining < 15;
    });

    return urgentMaintenances.sort((a, b) => {
      const urgencyA = calculateUrgencyPercentage(a);
      const urgencyB = calculateUrgencyPercentage(b);

      // D'abord par urgence (les plus urgents en premier)
      if (urgencyA !== urgencyB) {
        return urgencyB - urgencyA;
      }

      // En cas d'égalité, par priorité
      const priorityA = PRIORITY_ORDER[a.maintenanceData?.priority || "optional"];
      const priorityB = PRIORITY_ORDER[b.maintenanceData?.priority || "optional"];
      return priorityB - priorityA;
    });
  };

  // Compter les maintenances non urgentes
  const getNonUrgentCount = () => {
    return maintenances.filter(m => {
      const daysRemaining = calculateDaysRemaining(m);
      return daysRemaining !== null && daysRemaining >= 15;
    }).length;
  };

  const formatDaysRemaining = (days: number): { text: string; label?: string } => {
    if (days < 0) {
      return {
        text: `En retard de ${Math.abs(days)}j`,
      };
    }
    if (days === 0) return { text: "Aujourd'hui" };
    if (days === 1) return { text: "Demain" };
    if (days <= 7) return { text: `Dans ${days}j` };
    if (days <= 30) return { text: `Dans ${Math.floor(days / 7)} sem` };
    if (days <= 90) return { text: `Dans ${Math.floor(days / 30)} mois` };
    if (days <= 365) return { text: `Dans ${Math.floor(days / 30)} mois` };
    return { text: `Dans ${Math.floor(days / 365)} an` };
  };

  const formatKmRemaining = (km: number): string => {
    if (km < 0) return `Dépassé de ${Math.abs(km).toLocaleString()} km`;
    return `Dans ${km.toLocaleString()} km`;
  };

  const getEquipmentName = (schedule: MaintenanceSchedule): string => {
    if (schedule.isCustom && schedule.customData) {
      return schedule.customData.name;
    }
    if (schedule.vehicleEquipmentId?.equipmentId) {
      return schedule.vehicleEquipmentId.equipmentId.name || "Équipement";
    }
    if (schedule.vehicleEquipmentId?.customData) {
      return schedule.vehicleEquipmentId.customData.name || "Équipement";
    }
    return "Équipement";
  };

  const getEquipmentPhoto = (schedule: MaintenanceSchedule): string | null => {
    if (schedule.vehicleEquipmentId?.equipmentId?.photos?.[0]) {
      return schedule.vehicleEquipmentId.equipmentId.photos[0];
    }
    if (schedule.vehicleEquipmentId?.customData?.photos?.[0]) {
      return schedule.vehicleEquipmentId.customData.photos[0];
    }
    return null;
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl sm:rounded-3xl shadow-lg p-4 sm:p-6 mb-6 sm:mb-8">
        <div className="flex justify-center items-center py-8 sm:py-12">
          <div className="w-10 h-10 sm:w-12 sm:h-12 border-4 border-orange border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  const urgentMaintenances = getFilteredMaintenances();
  const nonUrgentCount = getNonUrgentCount();

  if (maintenances.length === 0) {
    return (
      <div className="bg-white rounded-2xl sm:rounded-3xl shadow-lg p-4 sm:p-6 mb-6 sm:mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl sm:text-2xl font-bold text-black">
            <span className="hidden sm:inline">Entretiens prioritaires 🔧</span>
            <span className="sm:hidden">Entretiens 🔧</span>
          </h2>
        </div>
        <div className="text-center py-6 sm:py-8 bg-gray-50 rounded-xl sm:rounded-2xl">
          <div className="w-12 h-12 sm:w-16 sm:h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
            <svg
              className="w-6 h-6 sm:w-8 sm:h-8 text-green-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h3 className="text-base sm:text-lg font-semibold text-black mb-1 sm:mb-2">
            Aucun entretien à faire
          </h3>
          <p className="text-gray text-xs sm:text-sm">
            Tout est en ordre ! 🎉
          </p>
        </div>
      </div>
    );
  }

  if (urgentMaintenances.length === 0 && nonUrgentCount > 0) {
    return (
      <div className="bg-white rounded-2xl sm:rounded-3xl shadow-lg p-4 sm:p-6 mb-6 sm:mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl sm:text-2xl font-bold text-black">
            <span className="hidden sm:inline">Entretiens prioritaires 🔧</span>
            <span className="sm:hidden">Entretiens 🔧</span>
          </h2>
        </div>
        <div className="text-center py-6 sm:py-8 bg-orange-50 rounded-xl sm:rounded-2xl border border-orange-200">
          <div className="w-12 h-12 sm:w-16 sm:h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
            <svg
              className="w-6 h-6 sm:w-8 sm:h-8 text-orange-600"
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
          <h3 className="text-base sm:text-lg font-semibold text-black mb-1 sm:mb-2">
            Aucun entretien urgent
          </h3>
          <p className="text-gray text-xs sm:text-sm mb-4">
            {nonUrgentCount} entretien{nonUrgentCount > 1 ? "s" : ""} planifié{nonUrgentCount > 1 ? "s" : ""} dans plus de 15 jours
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white rounded-2xl sm:rounded-3xl shadow-lg p-4 sm:p-6 mb-6 sm:mb-8"
      >
        <div className="flex items-center justify-between mb-4 sm:mb-6">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-black flex items-center gap-2">
              <span className="hidden sm:inline">Entretiens prioritaires 🔧</span>
              <span className="sm:hidden">Entretiens 🔧</span>
            </h2>
            <p className="text-gray text-xs sm:text-sm mt-0.5">
              {urgentMaintenances.length} entretien{urgentMaintenances.length > 1 ? "s" : ""} urgent{urgentMaintenances.length > 1 ? "s" : ""} (moins de 15 jours)
            </p>
          </div>
        </div>

        <div className="space-y-3 sm:space-y-4">
          {urgentMaintenances.map((schedule, index) => {
            const maintenance = schedule.maintenanceData;
            const daysRemaining = calculateDaysRemaining(schedule);
            const kmRemaining = calculateKmRemaining(schedule);
            const urgencyPercentage = calculateUrgencyPercentage(schedule);
            const priorityColors = PRIORITY_COLORS[maintenance?.priority || "optional"];

            if (!maintenance) return null;

            return (
              <motion.div
                key={schedule._id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                className={`border-2 ${priorityColors.border} rounded-2xl sm:rounded-3xl overflow-hidden bg-gradient-to-br ${priorityColors.bg} hover:shadow-lg transition-shadow`}
              >
                <div className="p-3 sm:p-4 md:p-5">
                  {/* En-tête avec priorité et véhicule */}
                  <div className="flex items-start gap-2 sm:gap-3 mb-3">
                    {/* Equipment Photo */}
                    {getEquipmentPhoto(schedule) ? (
                      <div className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-xl overflow-hidden flex-shrink-0 bg-gray-100">
                        <Image
                          src={getEquipmentPhoto(schedule)!}
                          alt={getEquipmentName(schedule)}
                          fill
                          className="object-cover"
                        />
                      </div>
                    ) : (
                      <div
                        className={`w-14 h-14 sm:w-16 sm:h-16 rounded-lg sm:rounded-xl flex items-center justify-center text-2xl sm:text-3xl border-2 ${priorityColors.border} bg-white flex-shrink-0`}
                      >
                        {PRIORITY_ICONS[maintenance.priority]}
                      </div>
                    )}

                    {/* Info - flex-1 occupe l'espace restant */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="flex-1 min-w-0">
                          <span
                            className={`inline-block px-2 py-0.5 ${priorityColors.bg} ${priorityColors.text} text-[10px] sm:text-xs font-bold rounded-full border ${priorityColors.border} whitespace-nowrap mb-2`}
                          >
                            {PRIORITY_LABELS[maintenance.priority]}
                          </span>
                          
                          <h3 className="font-bold text-black text-sm sm:text-base md:text-lg leading-tight">
                            {maintenance.name}
                          </h3>
                        </div>
                        
                        {/* Urgency score */}
                        <div className="flex flex-col items-center gap-0.5 flex-shrink-0">
                          <div className="relative w-12 h-12 sm:w-14 sm:h-14">
                            <svg className="w-12 h-12 sm:w-14 sm:h-14 transform -rotate-90" viewBox="0 0 48 48">
                              <circle
                                cx="24"
                                cy="24"
                                r="20"
                                stroke="currentColor"
                                strokeWidth="4"
                                fill="none"
                                className="text-gray-200"
                              />
                              <circle
                                cx="24"
                                cy="24"
                                r="20"
                                stroke="currentColor"
                                strokeWidth="4"
                                fill="none"
                                strokeDasharray={`${2 * Math.PI * 20}`}
                                strokeDashoffset={`${2 * Math.PI * 20 * (1 - urgencyPercentage / 100)}`}
                                className={`${
                                  urgencyPercentage >= 70
                                    ? "text-red-500"
                                    : urgencyPercentage >= 40
                                    ? "text-orange-500"
                                    : "text-green-500"
                                }`}
                                strokeLinecap="round"
                              />
                            </svg>
                            <div className="absolute inset-0 flex items-center justify-center">
                              <span className="text-[10px] sm:text-xs font-bold text-black">
                                {urgencyPercentage}%
                              </span>
                            </div>
                          </div>
                          <span className="text-[9px] sm:text-xs text-gray-500 font-medium text-center">Urgence</span>
                        </div>
                      </div>
                      
                      {/* Equipment et véhicule */}
                      <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs sm:text-sm text-gray-600 mt-1.5">
                        <span className="flex items-center gap-1 truncate max-w-[calc(100%-100px)]">
                          <span className="flex-shrink-0">🔧</span>
                          <span className="truncate">{getEquipmentName(schedule)}</span>
                        </span>
                        <span className="text-gray-400">•</span>
                        <Link
                          href={`/dashboard/vehicles/${schedule.vehicleInfo._id}`}
                          className="flex items-center gap-1 hover:text-orange transition-colors truncate"
                        >
                          <span className="flex-shrink-0">🚐</span>
                          <span className="truncate">{schedule.vehicleInfo.name}</span>
                        </Link>
                      </div>
                    </div>
                  </div>

                  {/* Échéances - grille responsive */}
                  <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-1.5 sm:gap-2 mb-3">
                    {daysRemaining !== null && (
                      <div
                        className={`px-3 py-1.5 rounded-xl font-semibold text-xs sm:text-sm ${
                          daysRemaining < 0
                            ? "bg-red-50 text-red-700 border border-red-200"
                            : daysRemaining <= 7
                            ? "bg-orange-50 text-orange-700 border border-orange-200"
                            : daysRemaining <= 30
                            ? "bg-yellow-50 text-yellow-700 border border-yellow-200"
                            : "bg-blue-50 text-blue-700 border border-blue-200"
                        }`}
                      >
                        📅 {formatDaysRemaining(daysRemaining).text}
                      </div>
                    )}
                    {kmRemaining !== null && (
                      <div
                        className={`px-3 py-1.5 rounded-xl font-semibold text-xs sm:text-sm ${
                          kmRemaining < 0
                            ? "bg-red-50 text-red-700 border border-red-200"
                            : kmRemaining <= 500
                            ? "bg-orange-50 text-orange-700 border border-orange-200"
                            : kmRemaining <= 2000
                            ? "bg-yellow-50 text-yellow-700 border border-yellow-200"
                            : "bg-blue-50 text-blue-700 border border-blue-200"
                        }`}
                      >
                        🛣️ {formatKmRemaining(kmRemaining)}
                      </div>
                    )}
                    {maintenance.estimatedDuration && (
                      <div className="px-3 py-1.5 bg-gray-50 text-gray-700 border border-gray-200 rounded-xl text-xs sm:text-sm font-semibold col-span-2 sm:col-span-1">
                        ⏱️ {maintenance.estimatedDuration}min
                      </div>
                    )}
                  </div>

                  {/* Actions - stack sur mobile, row sur desktop */}
                  <div className="flex flex-col sm:flex-row gap-2">
                    <button
                      onClick={() =>
                        setCompleteMaintenanceData({
                          vehicleId: schedule.vehicleInfo._id,
                          scheduleId: schedule._id,
                          name: maintenance.name,
                          currentMileage: schedule.vehicleInfo.currentMileage,
                        })
                      }
                      className={`flex-1 px-3 sm:px-4 py-2 sm:py-2.5 bg-gradient-to-r from-green-500 to-green-600 text-white text-xs sm:text-sm font-bold rounded-xl hover:shadow-lg transition-all`}
                    >
                      {!schedule.lastCompletedAt ? (
                        <>
                          <span className="sm:hidden">📝 Définir dernière exécution</span>
                          <span className="hidden sm:inline">📝 Définir</span>
                        </>
                      ) : (
                        <>
                          <span className="sm:hidden">✅ Marquer comme fait</span>
                          <span className="hidden sm:inline">✅ Marquer fait</span>
                        </>
                      )}
                    </button>
                    <Link
                      href={`/dashboard/vehicles/${schedule.vehicleInfo._id}`}
                      className="flex-1 sm:flex-none px-3 sm:px-4 py-2 sm:py-2.5 bg-white border-2 border-gray-300 text-gray-700 text-xs sm:text-sm font-semibold rounded-xl hover:bg-gray-50 transition-all flex items-center justify-center gap-1.5 sm:gap-2"
                    >
                      <span className="hidden sm:inline">Voir détails</span>
                      <span className="sm:hidden">Détails</span>
                      <svg
                        className="w-3.5 h-3.5 sm:w-4 sm:h-4"
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
                    </Link>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Autres maintenances non urgentes */}
        {nonUrgentCount > 0 && (
          <div className="mt-4 sm:mt-6 p-4 bg-orange-50 border border-orange-200 rounded-2xl">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <svg
                    className="w-5 h-5 text-orange-600"
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
                <div>
                  <p className="text-sm font-semibold text-orange-900">
                    {nonUrgentCount} autre{nonUrgentCount > 1 ? "s" : ""} entretien{nonUrgentCount > 1 ? "s" : ""}
                  </p>
                  <p className="text-xs text-orange-700">
                    Planifié{nonUrgentCount > 1 ? "s" : ""} dans plus de 15 jours
                  </p>
                </div>
              </div>
              <svg
                className="w-5 h-5 text-orange-600 flex-shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 7l5 5m0 0l-5 5m5-5H6"
                />
              </svg>
            </div>
          </div>
        )}
      </motion.div>

      {/* Complete Maintenance Modal */}
      <AnimatePresence>
        {completeMaintenanceData && (
          <CompleteMaintenanceModal
            vehicleId={completeMaintenanceData.vehicleId}
            maintenanceScheduleId={completeMaintenanceData.scheduleId}
            maintenanceName={completeMaintenanceData.name}
            currentMileage={completeMaintenanceData.currentMileage}
            onClose={() => setCompleteMaintenanceData(null)}
            onSuccess={() => {
              setCompleteMaintenanceData(null);
              fetchMaintenances();
            }}
          />
        )}
      </AnimatePresence>
    </>
  );
}

