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
  preSelectedEquipmentId?: string | null;
  onEquipmentModalClose?: () => void;
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
    equipmentId?: { name?: string; photos?: string[] };
    customData?: { name?: string; photos?: string[] };
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

const URGENCY_LABELS: Record<string, string> = {
  overdue: "EN RETARD",
  critical: "CRITIQUE",
  veryUrgent: "TRÈS URGENT",
  urgent: "URGENT",
  soon: "BIENTÔT",
  warning: "ATTENTION",
  moderate: "MODÉRÉ",
  good: "BON",
  veryGood: "TRÈS BON",
  excellent: "EXCELLENT",
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
  preSelectedEquipmentId,
  onEquipmentModalClose,
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
  const [expandedRecommendations, setExpandedRecommendations] = useState<Set<string>>(new Set());

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
    return "Contrôle/Équipement";
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

  const handleMaintenanceSuccess = () => {
    setSelectedEquipmentId(null);
    setShowEquipmentSelector(false);
    if (onEquipmentModalClose) {
      onEquipmentModalClose();
    }
    fetchMaintenances();
    fetchRecommendations();
  };

  // Effect to handle pre-selected equipment
  useEffect(() => {
    if (preSelectedEquipmentId) {
      setSelectedEquipmentId(preSelectedEquipmentId);
    }
  }, [preSelectedEquipmentId]);

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
    if (!equipment) return "Contrôle/Équipement";
    return equipment.isCustom
      ? equipment.customData?.name || "Contrôle/Équipement"
      : equipment.equipmentId?.name || "Contrôle/Équipement";
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
    const maintenance = schedule.isCustom ? schedule.customData : schedule.maintenanceId;
    const hasTimeRecurrence = !!maintenance?.recurrence?.time;
    const hasKmRecurrence = !!maintenance?.recurrence?.kilometers;
    
    const daysRemaining = hasTimeRecurrence ? calculateDaysRemaining(schedule) : null;
    const kmRemaining = hasKmRecurrence ? calculateKmRemaining(schedule) : null;

    // Prendre le critère le plus urgent entre jours et km (seulement si définis)
    const worstDays = daysRemaining ?? Infinity;
    const worstKm = kmRemaining ?? Infinity;

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

  // Ordre d'urgence pour le tri (plus urgent = plus petit nombre)
  const URGENCY_ORDER: Record<string, number> = {
    overdue: 1,
    critical: 2,
    veryUrgent: 3,
    urgent: 4,
    soon: 5,
    warning: 6,
    moderate: 7,
    good: 8,
    veryGood: 9,
    excellent: 10,
  };

  // Trier les maintenances par ordre d'urgence (couleur de la card)
  const getSortedMaintenances = () => {
    return [...maintenances].sort((a, b) => {
      const urgencyA = getUrgencyState(a);
      const urgencyB = getUrgencyState(b);
      const urgencyOrderA = URGENCY_ORDER[urgencyA];
      const urgencyOrderB = URGENCY_ORDER[urgencyB];

      // Trier par urgence d'abord
      if (urgencyOrderA !== urgencyOrderB) {
        return urgencyOrderA - urgencyOrderB;
      }

      // Si même urgence, trier par priorité
      const maintenance1 = a.isCustom ? a.customData : a.maintenanceId;
      const maintenance2 = b.isCustom ? b.customData : b.maintenanceId;
      const priorityA = PRIORITY_ORDER[maintenance1?.priority || "optional"];
      const priorityB = PRIORITY_ORDER[maintenance2?.priority || "optional"];
      return priorityB - priorityA;
    });
  };

  const formatDaysRemaining = (days: number): string => {
    if (days < 0) return `En retard de ${Math.abs(days)}j`;
    if (days === 0) return "Aujourd'hui";
    if (days === 1) return "Demain";
    if (days <= 7) return `Dans ${days}j`;
    if (days <= 30) return `Dans ${Math.floor(days / 7)} sem`;
    if (days <= 90) return `Dans ${Math.floor(days / 30)} mois`;
    if (days <= 365) return `Dans ${Math.floor(days / 30)} mois`;
    const years = Math.floor(days / 365);
    return `Dans ${years} an${years > 1 ? 's' : ''}`;
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
          <h2 className="text-xl sm:text-2xl font-bold text-black">Entretiens & Rappels 📋</h2>
          <p className="text-gray text-sm sm:text-base">Ne manquez aucune échéance</p>
        </div>
        <button
          onClick={handleAddMaintenance}
          disabled={equipments.length === 0}
          className="inline-flex items-center justify-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 bg-gradient-to-r from-orange to-orange-light text-white font-bold text-sm sm:text-base rounded-2xl hover:shadow-lg hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
          title={
            equipments.length === 0
              ? "Ajoutez d'abord un contrôle ou équipement"
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
            Ajoutez d&apos;abord un contrôle ou équipement
          </h3>
          <p className="text-gray text-sm mb-4">
            Pour créer des entretiens, vous devez d&apos;abord ajouter au moins un contrôle ou équipement à suivre
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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 mb-8">
              {getSortedMaintenances().map((schedule, index) => {
                const maintenance = schedule.isCustom
                  ? schedule.customData
                  : schedule.maintenanceId;
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
                      {/* En-tête avec priorité et équipement */}
                      <div className="flex items-start gap-2 sm:gap-3 mb-3">
                        {/* Equipment Photo */}
                        {getEquipmentPhoto(schedule) ? (
                          <div className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-xl overflow-hidden flex-shrink-0 bg-gray-100">
                            <Image
                              src={getEquipmentPhoto(schedule)!}
                              alt={getEquipmentName(schedule) || "Équipement"}
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
                          {(urgencyState === "overdue" || urgencyState === "critical") && (
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
                        {/* Equipment - aligné à gauche sur toute la largeur */}
                        <div className="flex items-center gap-1.5 text-xs sm:text-sm text-gray-600 mb-3">
                          <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          <span className="truncate font-medium">{getEquipmentName(schedule)}</span>
                        </div>

                        {/* Échéances - grille responsive avec dégradé de couleurs */}
                        <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-1.5 sm:gap-2 mb-3">
                        {daysRemaining !== null && (schedule.isCustom ? schedule.customData?.recurrence?.time : schedule.maintenanceId?.recurrence?.time) && (
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
                            {formatDaysRemaining(daysRemaining)}
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

                      {/* Actions - Tous sur la même ligne en mobile */}
                      <div className="flex gap-2 mt-auto">
                        {/* Bouton principal - Valider */}
                        <button
                          onClick={() =>
                            setCompleteMaintenanceData({
                              scheduleId: schedule._id,
                              name: maintenance.name,
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

                        {/* Instructions */}
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
                            className="group relative overflow-hidden px-3 py-2.5 bg-white border-2 border-indigo-200 hover:border-indigo-400 text-indigo-600 hover:text-indigo-700 font-medium rounded-xl transition-all duration-300 flex items-center justify-center gap-1.5"
                            title="Voir les instructions"
                          >
                            <svg className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            <span className="text-xs hidden sm:inline">Info</span>
                          </button>
                        )}
                        
                        {/* Supprimer */}
                        <button
                          onClick={() =>
                            setDeleteMaintenanceData({
                              scheduleId: schedule._id,
                              name: maintenance.name,
                            })
                          }
                          className="group relative overflow-hidden px-3 py-2.5 bg-white border-2 border-gray-200 hover:border-red-300 hover:bg-red-50 text-gray-500 hover:text-red-600 font-medium rounded-xl transition-all duration-300 flex items-center justify-center"
                          title="Supprimer l'entretien"
                        >
                          <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </motion.div>
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
                  Entretiens proposés ({recommendations.reduce((acc, r) => acc + r.maintenances.length, 0)})
                </h3>
              </div>
              <p className="text-sm text-gray mb-4">
                Basés sur vos contrôles et équipements, ajoutez-les en un clic !
              </p>

              <div className="space-y-3">
                {recommendations.map((rec) => {
                  const isExpanded = expandedRecommendations.has(rec.equipment._id);
                  const toggleExpanded = () => {
                    setExpandedRecommendations(prev => {
                      const next = new Set(prev);
                      if (next.has(rec.equipment._id)) {
                        next.delete(rec.equipment._id);
                      } else {
                        next.add(rec.equipment._id);
                      }
                      return next;
                    });
                  };

                  return (
                    <div key={rec.equipment._id} className="border border-gray-200 rounded-xl overflow-hidden">
                      {/* Accordion Header */}
                      <button
                        onClick={toggleExpanded}
                        className="w-full flex items-center justify-between p-3 sm:p-4 bg-gray-50 hover:bg-gray-100 transition-colors text-left"
                      >
                        <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
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
                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold text-black text-sm sm:text-base truncate">
                              {rec.equipment.name}
                            </h4>
                            <p className="text-xs text-gray">
                              {rec.maintenances.length} entretien{rec.maintenances.length > 1 ? "s" : ""} proposé{rec.maintenances.length > 1 ? "s" : ""}
                            </p>
                          </div>
                        </div>
                        <svg
                          className={`w-5 h-5 text-gray-500 transition-transform flex-shrink-0 ${isExpanded ? "rotate-180" : ""}`}
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>

                      {/* Accordion Content */}
                      <AnimatePresence>
                        {isExpanded && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.3 }}
                            className="overflow-hidden"
                          >
                            <div className="p-3 sm:p-4 pt-0 space-y-2">
                              {rec.maintenances.map((maintenance) => (
                                <div
                                  key={maintenance._id}
                                  className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 p-2.5 sm:p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                                >
                                  <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                                    <div
                                      className={`w-8 h-8 sm:w-10 sm:h-10 rounded-lg flex items-center justify-center border flex-shrink-0 ${
                                        PRIORITY_COLORS[maintenance.priority].bg
                                      } ${PRIORITY_COLORS[maintenance.priority].text} ${PRIORITY_COLORS[maintenance.priority].border}`}
                                    >
                                      <div className={`w-3 h-3 sm:w-4 sm:h-4 rounded-full ${maintenance.priority === "critical" ? "bg-red-600" : maintenance.priority === "important" ? "bg-orange-600" : maintenance.priority === "recommended" ? "bg-yellow-600" : "bg-gray-600"}`} />
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
                                    className="group w-9 h-9 sm:w-10 sm:h-10 bg-orange hover:bg-orange-dark text-white rounded-lg transition-all duration-300 disabled:opacity-50 flex items-center justify-center flex-shrink-0 hover:scale-110"
                                    title="Ajouter cet entretien"
                                  >
                                    {addingMaintenanceId === maintenance._id ? (
                                      <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                      </svg>
                                    ) : (
                                      <svg className="w-5 h-5 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                                      </svg>
                                    )}
                                  </button>
                                </div>
                              ))}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : maintenances.length === 0 ? (
            <div className="text-center py-6 bg-blue-50 rounded-2xl">
              <p className="text-sm text-blue-700">
                💡 Ajoutez des contrôles ou équipements pour voir les entretiens proposés
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
                <div className="flex items-center justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-base sm:text-2xl font-bold text-black">
                      Sélectionner équipement
                    </h3>
                    <p className="text-gray text-xs sm:text-sm mt-1">
                      Pour ajouter un entretien
                    </p>
                  </div>
                  <button
                    onClick={() => setShowEquipmentSelector(false)}
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
                              alt={name || "Contrôle/Équipement"}
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
            onClose={() => {
              setSelectedEquipmentId(null);
              if (onEquipmentModalClose) {
                onEquipmentModalClose();
              }
            }}
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

