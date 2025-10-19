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

// Couleurs basées sur l'urgence de l'échéance - Large gamme de dégradés
const URGENCY_COLORS: Record<string, { bg: string; text: string; border: string; shadow: string; badgeBg: string; dotBg: string }> = {
  overdue: {
    bg: "bg-red-100",
    text: "text-red-950",
    border: "border-red-500",
    shadow: "shadow-red-300",
    badgeBg: "bg-red-600",
    dotBg: "bg-red-700",
  },
  critical: {
    bg: "bg-red-50",
    text: "text-red-900",
    border: "border-red-400",
    shadow: "shadow-red-200",
    badgeBg: "bg-red-500",
    dotBg: "bg-red-600",
  },
  veryUrgent: {
    bg: "bg-orange-100",
    text: "text-orange-950",
    border: "border-orange-500",
    shadow: "shadow-orange-300",
    badgeBg: "bg-orange-600",
    dotBg: "bg-orange-700",
  },
  urgent: {
    bg: "bg-orange-50",
    text: "text-orange-900",
    border: "border-orange-400",
    shadow: "shadow-orange-200",
    badgeBg: "bg-orange-500",
    dotBg: "bg-orange-600",
  },
  soon: {
    bg: "bg-yellow-100",
    text: "text-yellow-950",
    border: "border-yellow-500",
    shadow: "shadow-yellow-300",
    badgeBg: "bg-yellow-600",
    dotBg: "bg-yellow-700",
  },
  warning: {
    bg: "bg-yellow-50",
    text: "text-yellow-900",
    border: "border-yellow-400",
    shadow: "shadow-yellow-200",
    badgeBg: "bg-yellow-500",
    dotBg: "bg-yellow-600",
  },
  moderate: {
    bg: "bg-lime-50",
    text: "text-lime-900",
    border: "border-lime-400",
    shadow: "shadow-lime-200",
    badgeBg: "bg-lime-600",
    dotBg: "bg-lime-700",
  },
  good: {
    bg: "bg-green-50",
    text: "text-green-900",
    border: "border-green-400",
    shadow: "shadow-green-200",
    badgeBg: "bg-green-500",
    dotBg: "bg-green-600",
  },
  veryGood: {
    bg: "bg-emerald-50",
    text: "text-emerald-900",
    border: "border-emerald-400",
    shadow: "shadow-emerald-200",
    badgeBg: "bg-emerald-500",
    dotBg: "bg-emerald-600",
  },
  excellent: {
    bg: "bg-cyan-50",
    text: "text-cyan-900",
    border: "border-cyan-400",
    shadow: "shadow-cyan-200",
    badgeBg: "bg-cyan-500",
    dotBg: "bg-cyan-600",
  },
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

  // Détermine l'état d'urgence pour les couleurs de la card avec dégradé granulaire
  const getUrgencyState = (schedule: MaintenanceSchedule): string => {
    const daysRemaining = calculateDaysRemaining(schedule);
    const kmRemaining = calculateKmRemaining(schedule);

    // Prendre le critère le plus urgent entre jours et km
    let worstDays = daysRemaining ?? Infinity;
    let worstKm = kmRemaining ?? Infinity;

    // En retard
    if (worstDays < 0 || worstKm < 0) {
      return "overdue";
    }

    // Critique : moins de 3 jours OU moins de 200km
    if (worstDays <= 3 || worstKm <= 200) {
      return "critical";
    }

    // Très urgent : moins de 7 jours OU moins de 500km
    if (worstDays <= 7 || worstKm <= 500) {
      return "veryUrgent";
    }

    // Urgent : moins de 14 jours OU moins de 1000km
    if (worstDays <= 14 || worstKm <= 1000) {
      return "urgent";
    }

    // Bientôt : moins de 30 jours OU moins de 2000km
    if (worstDays <= 30 || worstKm <= 2000) {
      return "soon";
    }

    // Attention : moins de 60 jours OU moins de 4000km
    if (worstDays <= 60 || worstKm <= 4000) {
      return "warning";
    }

    // Modéré : moins de 90 jours OU moins de 6000km
    if (worstDays <= 90 || worstKm <= 6000) {
      return "moderate";
    }

    // Bon : moins de 180 jours OU moins de 10000km
    if (worstDays <= 180 || worstKm <= 10000) {
      return "good";
    }

    // Très bon : moins de 365 jours OU moins de 20000km
    if (worstDays <= 365 || worstKm <= 20000) {
      return "veryGood";
    }

    // Excellent : plus d'un an
    return "excellent";
  };

  // Filtrer et trier les maintenances par ordre de date d'échéance
  const getFilteredMaintenances = () => {
    const urgentMaintenances = maintenances.filter(m => {
      const daysRemaining = calculateDaysRemaining(m);
      // Afficher les entretiens < 1 mois ou en retard
      return daysRemaining !== null && daysRemaining < 30;
    });

    return urgentMaintenances.sort((a, b) => {
      const daysRemainingA = calculateDaysRemaining(a);
      const daysRemainingB = calculateDaysRemaining(b);
      const kmRemainingA = calculateKmRemaining(a);
      const kmRemainingB = calculateKmRemaining(b);

      // Si les deux ont une date d'échéance, trier par date
      if (daysRemainingA !== null && daysRemainingB !== null) {
        return daysRemainingA - daysRemainingB;
      }

      // Si seulement A a une date, A vient en premier
      if (daysRemainingA !== null) return -1;
      if (daysRemainingB !== null) return 1;

      // Si ni l'un ni l'autre n'a de date, trier par kilométrage restant
      if (kmRemainingA !== null && kmRemainingB !== null) {
        return kmRemainingA - kmRemainingB;
      }

      // Si seulement A a un kilométrage, A vient en premier
      if (kmRemainingA !== null) return -1;
      if (kmRemainingB !== null) return 1;

      // En dernier recours, trier par priorité
      const priorityA = PRIORITY_ORDER[a.maintenanceData?.priority || "optional"];
      const priorityB = PRIORITY_ORDER[b.maintenanceData?.priority || "optional"];
      return priorityB - priorityA;
    });
  };

  // Compter les maintenances non urgentes
  const getNonUrgentCount = () => {
    return maintenances.filter(m => {
      const daysRemaining = calculateDaysRemaining(m);
      return daysRemaining !== null && daysRemaining >= 30;
    }).length;
  };

  // Grouper les maintenances non urgentes par véhicule
  const getNonUrgentByVehicle = () => {
    const nonUrgent = maintenances.filter(m => {
      const daysRemaining = calculateDaysRemaining(m);
      return daysRemaining !== null && daysRemaining >= 30;
    });

    const grouped = nonUrgent.reduce((acc, m) => {
      const vehicleId = m.vehicleInfo._id;
      if (!acc[vehicleId]) {
        acc[vehicleId] = {
          vehicleInfo: m.vehicleInfo,
          count: 0,
        };
      }
      acc[vehicleId].count++;
      return acc;
    }, {} as Record<string, { vehicleInfo: VehicleInfo; count: number }>);

    return Object.values(grouped);
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
            {nonUrgentCount} entretien{nonUrgentCount > 1 ? "s" : ""} planifié{nonUrgentCount > 1 ? "s" : ""} dans plus d'1 mois
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
              {urgentMaintenances.length} entretien{urgentMaintenances.length > 1 ? "s" : ""} urgent{urgentMaintenances.length > 1 ? "s" : ""} (moins d'1 mois)
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          {urgentMaintenances.map((schedule, index) => {
            const maintenance = schedule.maintenanceData;
            const daysRemaining = calculateDaysRemaining(schedule);
            const kmRemaining = calculateKmRemaining(schedule);
            const urgencyPercentage = calculateUrgencyPercentage(schedule);
            const urgencyState = getUrgencyState(schedule);
            const urgencyColors = URGENCY_COLORS[urgencyState];
            const priorityColors = PRIORITY_COLORS[maintenance?.priority || "optional"];

            if (!maintenance) return null;

            return (
              <motion.div
                key={schedule._id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                className={`border-3 ${urgencyColors.border} rounded-2xl sm:rounded-3xl overflow-hidden bg-gradient-to-br ${urgencyColors.bg} hover:shadow-xl hover:${urgencyColors.shadow} transition-all duration-300 flex flex-col`}
              >
                <div className="p-3 sm:p-4 md:p-5 flex flex-col flex-1">
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
                        className={`relative w-14 h-14 sm:w-16 sm:h-16 rounded-lg sm:rounded-xl flex items-center justify-center border-2 ${urgencyColors.border} bg-white flex-shrink-0`}
                      >
                        {/* Cercle d'urgence avec animation ping pour overdue/critical */}
                        {(urgencyState === "overdue" || urgencyState === "critical") && (
                          <span className="absolute inline-flex h-full w-full rounded-lg bg-red-400 opacity-75 animate-ping" />
                        )}
                        
                        {/* Cercle principal */}
                        <div className={`relative w-6 h-6 sm:w-8 sm:h-8 rounded-full ${["overdue", "critical", "veryUrgent", "urgent"].includes(urgencyState) ? "animate-pulse" : ""}`}>
                          <div className={`absolute inset-0 rounded-full ${urgencyColors.badgeBg} shadow-lg`} />
                        </div>
                      </div>
                    )}

                    {/* Info - flex-1 occupe l'espace restant */}
                    <div className="flex-1 min-w-0">
                      {((daysRemaining !== null && daysRemaining <= 0) || (kmRemaining !== null && kmRemaining <= 0)) && (
                        <div className="flex items-center gap-1.5 mb-2 flex-wrap">
                          <span
                            className={`inline-flex items-center gap-1 px-2 py-0.5 ${priorityColors.bg} ${priorityColors.text} text-[9px] sm:text-[10px] font-semibold rounded-full border ${priorityColors.border} whitespace-nowrap`}
                          >
                            <span className={`w-1.5 h-1.5 rounded-full ${maintenance.priority === "critical" ? "bg-red-600" : maintenance.priority === "important" ? "bg-orange-600" : maintenance.priority === "recommended" ? "bg-yellow-600" : "bg-gray-600"}`} />
                            {PRIORITY_LABELS[maintenance.priority]}
                          </span>
                        </div>
                      )}
                      
                      <h3 className={`font-bold text-sm sm:text-base md:text-lg leading-tight ${urgencyColors.text}`}>
                        {maintenance.name}
                      </h3>
                    </div>
                  </div>

                  {/* Contenu flexible qui pousse les boutons vers le bas */}
                  <div className="flex-1 flex flex-col">
                    {/* Equipment et véhicule - alignés à gauche sur toute la largeur */}
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs sm:text-sm text-gray-600 mb-3">
                      <span className="flex items-center gap-1.5 truncate">
                        <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <span className="truncate font-medium">{getEquipmentName(schedule)}</span>
                      </span>
                      <span className="text-gray-400">•</span>
                      <Link
                        href={`/dashboard/vehicles/${schedule.vehicleInfo._id}`}
                        className="flex items-center gap-1.5 hover:text-orange transition-colors truncate"
                      >
                        <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0h.01M15 17a2 2 0 104 0m-4 0h.01M17 16h-1" />
                        </svg>
                        <span className="truncate">{schedule.vehicleInfo.name}</span>
                      </Link>
                    </div>

                  {/* Échéances - grille responsive avec dégradé de couleurs */}
                  <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-1.5 sm:gap-2 mb-3">
                    {daysRemaining !== null && (
                      <div
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-semibold text-xs sm:text-sm ${
                          daysRemaining < 0
                            ? "bg-red-100 text-red-800 border-2 border-red-400"
                            : daysRemaining <= 3
                            ? "bg-red-50 text-red-700 border-2 border-red-300"
                            : daysRemaining <= 7
                            ? "bg-orange-100 text-orange-800 border border-orange-400"
                            : daysRemaining <= 14
                            ? "bg-orange-50 text-orange-700 border border-orange-300"
                            : daysRemaining <= 30
                            ? "bg-yellow-100 text-yellow-800 border border-yellow-400"
                            : daysRemaining <= 60
                            ? "bg-yellow-50 text-yellow-700 border border-yellow-300"
                            : daysRemaining <= 90
                            ? "bg-lime-50 text-lime-700 border border-lime-300"
                            : daysRemaining <= 180
                            ? "bg-green-50 text-green-700 border border-green-300"
                            : daysRemaining <= 365
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-300"
                            : "bg-cyan-50 text-cyan-700 border border-cyan-300"
                        }`}
                      >
                        <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        {formatDaysRemaining(daysRemaining).text}
                      </div>
                    )}
                    {kmRemaining !== null && (
                      <div
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-semibold text-xs sm:text-sm ${
                          kmRemaining < 0
                            ? "bg-red-100 text-red-800 border-2 border-red-400"
                            : kmRemaining <= 200
                            ? "bg-red-50 text-red-700 border-2 border-red-300"
                            : kmRemaining <= 500
                            ? "bg-orange-100 text-orange-800 border border-orange-400"
                            : kmRemaining <= 1000
                            ? "bg-orange-50 text-orange-700 border border-orange-300"
                            : kmRemaining <= 2000
                            ? "bg-yellow-100 text-yellow-800 border border-yellow-400"
                            : kmRemaining <= 4000
                            ? "bg-yellow-50 text-yellow-700 border border-yellow-300"
                            : kmRemaining <= 6000
                            ? "bg-lime-50 text-lime-700 border border-lime-300"
                            : kmRemaining <= 10000
                            ? "bg-green-50 text-green-700 border border-green-300"
                            : kmRemaining <= 20000
                            ? "bg-emerald-50 text-emerald-700 border border-emerald-300"
                            : "bg-cyan-50 text-cyan-700 border border-cyan-300"
                        }`}
                      >
                        <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                        </svg>
                        {formatKmRemaining(kmRemaining)}
                      </div>
                    )}
                    {maintenance.estimatedDuration && (
                      <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 text-gray-700 border border-gray-200 rounded-xl text-xs sm:text-sm font-semibold col-span-2 sm:col-span-1">
                        <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {maintenance.estimatedDuration}min
                      </div>
                    )}
                    </div>
                  </div>

                  {/* Actions - Tous sur la même ligne en mobile - alignées en bas */}
                  <div className="flex gap-2 mt-auto">
                    {/* Bouton principal - Valider */}
                    <button
                      onClick={() =>
                        setCompleteMaintenanceData({
                          vehicleId: schedule.vehicleInfo._id,
                          scheduleId: schedule._id,
                          name: maintenance.name,
                          currentMileage: schedule.vehicleInfo.currentMileage,
                        })
                      }
                      className="flex-1 group relative overflow-hidden px-3 py-2.5 sm:px-4 sm:py-3 bg-gradient-to-r from-orange to-orange-light hover:from-orange-dark hover:to-orange text-white font-semibold rounded-xl shadow-sm hover:shadow-md transition-all duration-300 flex items-center justify-center gap-1.5 sm:gap-2"
                      title={!schedule.lastCompletedAt ? "Définir dernière exécution" : "Marquer comme fait"}
                    >
                      <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                      <svg className="w-4 h-4 sm:w-5 sm:h-5 relative z-10 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="relative z-10 text-xs sm:text-sm hidden sm:inline">
                        {!schedule.lastCompletedAt ? "Définir" : "Valider"}
                      </span>
                    </button>

                    {/* Action secondaire - Voir détails */}
                    <Link
                      href={`/dashboard/vehicles/${schedule.vehicleInfo._id}`}
                      className="group relative overflow-hidden px-3 py-2.5 bg-white border-2 border-gray-200 hover:border-orange hover:bg-orange-50 text-gray-600 hover:text-orange font-medium rounded-xl transition-all duration-300 flex items-center justify-center gap-1.5"
                      title="Voir tous les détails"
                    >
                      <span className="text-xs hidden sm:inline">Détails</span>
                      <svg className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
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
          <div className="mt-4 sm:mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {getNonUrgentByVehicle().map(({ vehicleInfo, count }) => (
              <Link
                key={vehicleInfo._id}
                href={`/dashboard/vehicles/${vehicleInfo._id}`}
                className="p-4 bg-orange-50 border border-orange-200 rounded-2xl hover:shadow-lg hover:bg-orange-100 transition-all"
              >
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
                        {count} autre{count > 1 ? "s" : ""} entretien{count > 1 ? "s" : ""}
                      </p>
                      <p className="text-xs text-orange-700 flex items-center gap-1">
                        <span>🚐</span>
                        <span className="truncate">{vehicleInfo.name}</span>
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
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </div>
              </Link>
            ))}
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

