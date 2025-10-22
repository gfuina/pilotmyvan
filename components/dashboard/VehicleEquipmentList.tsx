"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { AnimatePresence } from "framer-motion";
import EquipmentMaintenanceHistoryModal from "./EquipmentMaintenanceHistoryModal";
import EquipmentChatbot from "./EquipmentChatbot";

interface VehicleEquipment {
  _id: string;
  equipmentId?: {
    _id: string;
    name: string;
    description?: string;
    categoryId: {
      name: string;
    };
    equipmentBrands: Array<{
      name: string;
    }>;
    photos: string[];
    manuals: Array<{
      title: string;
      url: string;
      isExternal: boolean;
    }>;
  };
  isCustom: boolean;
  customData?: {
    name: string;
    description?: string;
    brand?: string;
    model?: string;
    photos?: string[];
  };
  installDate?: string;
  notes?: string;
  createdAt: string;
}

interface MaintenanceSchedule {
  _id: string;
  nextDueDate?: string;
  nextDueKilometers?: number;
}

interface EquipmentMaintenanceStatus {
  equipmentId: string;
  maintenancesCount: number;
  urgencyState: "overdue" | "urgent" | "warning" | "ok" | "none";
  nextDueText?: string;
}

interface VehicleEquipmentListProps {
  vehicleId: string;
  equipments: VehicleEquipment[];
  onRefresh: () => void;
  onAddMaintenanceForEquipment?: (equipmentId: string) => void;
}

export default function VehicleEquipmentList({
  vehicleId,
  equipments,
  onRefresh,
  onAddMaintenanceForEquipment,
}: VehicleEquipmentListProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [historyEquipment, setHistoryEquipment] = useState<{
    id: string;
    name: string;
  } | null>(null);
  const [chatbotEquipment, setChatbotEquipment] = useState<{
    id: string;
    name: string;
    manuals: Array<{ title: string; url: string }>;
  } | null>(null);
  const [maintenanceStatuses, setMaintenanceStatuses] = useState<Record<string, EquipmentMaintenanceStatus>>({});
  const [vehicle, setVehicle] = useState<{ currentMileage: number } | null>(null);

  // Récupérer les informations du véhicule
  useEffect(() => {
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
    fetchVehicle();
  }, [vehicleId]);

  // Récupérer les maintenances pour chaque équipement
  useEffect(() => {
    const fetchMaintenances = async () => {
      try {
        const response = await fetch(`/api/vehicles/${vehicleId}/maintenances`);
        if (response.ok) {
          const data = await response.json();
          const maintenances = data.maintenances;

          // Calculer le statut pour chaque équipement
          const statuses: Record<string, EquipmentMaintenanceStatus> = {};

          equipments.forEach((equipment) => {
            const equipmentMaintenances = maintenances.filter(
              (m: any) => m.vehicleEquipmentId?._id === equipment._id
            );

            if (equipmentMaintenances.length === 0) {
              statuses[equipment._id] = {
                equipmentId: equipment._id,
                maintenancesCount: 0,
                urgencyState: "none",
              };
              return;
            }

            // Trouver la maintenance la plus urgente
            let mostUrgent: any = null;
            let highestUrgency = -1;

            equipmentMaintenances.forEach((m: any) => {
              const urgency = calculateUrgency(m);
              if (urgency > highestUrgency) {
                highestUrgency = urgency;
                mostUrgent = m;
              }
            });

            const urgencyState = getUrgencyState(mostUrgent);
            const nextDueText = formatNextDue(mostUrgent);

            statuses[equipment._id] = {
              equipmentId: equipment._id,
              maintenancesCount: equipmentMaintenances.length,
              urgencyState,
              nextDueText,
            };
          });

          setMaintenanceStatuses(statuses);
        }
      } catch (error) {
        console.error("Error fetching maintenances:", error);
      }
    };

    if (equipments.length > 0) {
      fetchMaintenances();
    }
  }, [vehicleId, equipments]);

  const calculateDaysRemaining = (schedule: MaintenanceSchedule): number | null => {
    if (!schedule.nextDueDate) return null;
    const now = new Date().getTime();
    const dueDate = new Date(schedule.nextDueDate).getTime();
    return Math.ceil((dueDate - now) / (1000 * 60 * 60 * 24));
  };

  const calculateKmRemaining = (schedule: MaintenanceSchedule): number | null => {
    if (!schedule.nextDueKilometers || !vehicle?.currentMileage) return null;
    return schedule.nextDueKilometers - vehicle.currentMileage;
  };

  const calculateUrgency = (schedule: any): number => {
    const daysRemaining = calculateDaysRemaining(schedule);
    const kmRemaining = calculateKmRemaining(schedule);

    let urgency = 0;

    if (daysRemaining !== null) {
      if (daysRemaining < 0) urgency += 50;
      else if (daysRemaining <= 7) urgency += 45;
      else if (daysRemaining <= 30) urgency += 35;
      else if (daysRemaining <= 90) urgency += 20;
      else urgency += 10;
    }

    if (kmRemaining !== null) {
      if (kmRemaining < 0) urgency += 50;
      else if (kmRemaining <= 500) urgency += 45;
      else if (kmRemaining <= 2000) urgency += 35;
      else if (kmRemaining <= 5000) urgency += 20;
      else urgency += 10;
    }

    return Math.min(urgency, 100);
  };

  const getUrgencyState = (schedule: any): "overdue" | "urgent" | "warning" | "ok" => {
    const daysRemaining = calculateDaysRemaining(schedule);
    const kmRemaining = calculateKmRemaining(schedule);

    if ((daysRemaining !== null && daysRemaining < 0) || (kmRemaining !== null && kmRemaining < 0)) {
      return "overdue";
    }

    if ((daysRemaining !== null && daysRemaining <= 7) || (kmRemaining !== null && kmRemaining <= 500)) {
      return "urgent";
    }

    if ((daysRemaining !== null && daysRemaining <= 30) || (kmRemaining !== null && kmRemaining <= 2000)) {
      return "warning";
    }

    return "ok";
  };

  const formatNextDue = (schedule: any): string => {
    const daysRemaining = calculateDaysRemaining(schedule);
    const kmRemaining = calculateKmRemaining(schedule);

    const parts = [];

    if (daysRemaining !== null) {
      if (daysRemaining < 0) {
        parts.push(`${Math.abs(daysRemaining)}j retard`);
      } else if (daysRemaining === 0) {
        parts.push("Aujourd'hui");
      } else if (daysRemaining <= 7) {
        parts.push(`${daysRemaining}j`);
      } else if (daysRemaining <= 30) {
        parts.push(`${Math.floor(daysRemaining / 7)}sem`);
      }
    }

    if (kmRemaining !== null) {
      if (kmRemaining < 0) {
        parts.push(`-${Math.abs(kmRemaining)}km`);
      } else if (kmRemaining <= 2000) {
        parts.push(`${kmRemaining}km`);
      }
    }

    return parts.length > 0 ? parts.join(" • ") : "OK";
  };

  const handleDelete = async (equipmentId: string) => {
    if (!confirm("Êtes-vous sûr de vouloir retirer cet équipement ?")) {
      return;
    }

    setDeletingId(equipmentId);
    try {
      const response = await fetch(
        `/api/vehicles/${vehicleId}/equipments/${equipmentId}`,
        {
          method: "DELETE",
        }
      );

      if (response.ok) {
        onRefresh();
      } else {
        alert("Erreur lors de la suppression");
      }
    } catch (error) {
      alert("Erreur lors de la suppression");
    } finally {
      setDeletingId(null);
    }
  };

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  if (equipments.length === 0) {
    return null;
  }

  // Récupérer les couleurs d'urgence
  const getUrgencyColors = (state: string) => {
    switch (state) {
      case "overdue":
        return {
          bg: "bg-red-100",
          text: "text-red-700",
          border: "border-red-300",
          dot: "bg-red-600",
          label: "EN RETARD",
          animate: true,
        };
      case "urgent":
        return {
          bg: "bg-orange-100",
          text: "text-orange-700",
          border: "border-orange-300",
          dot: "bg-orange-600",
          label: "URGENT",
          animate: true,
        };
      case "warning":
        return {
          bg: "bg-yellow-100",
          text: "text-yellow-700",
          border: "border-yellow-300",
          dot: "bg-yellow-600",
          label: "BIENTÔT",
          animate: false,
        };
      case "ok":
        return {
          bg: "bg-green-100",
          text: "text-green-700",
          border: "border-green-300",
          dot: "bg-green-600",
          label: "OK",
          animate: false,
        };
      default:
        return null;
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
      {equipments.map((item) => {
        const equipment = item.isCustom ? item.customData : item.equipmentId;
        const isExpanded = expandedId === item._id;
        const maintenanceStatus = maintenanceStatuses[item._id];
        const urgencyColors = maintenanceStatus ? getUrgencyColors(maintenanceStatus.urgencyState) : null;

        if (!equipment) return null;

        return (
          <div
            key={item._id}
            className={`bg-white rounded-2xl border-2 overflow-hidden transition-all hover:shadow-lg ${
              urgencyColors && maintenanceStatus.urgencyState !== "none" && maintenanceStatus.urgencyState !== "ok"
                ? urgencyColors.border
                : "border-gray-200 hover:border-orange"
            }`}
          >
            {/* Equipment Card */}
            <div className="flex flex-col h-full">
              {/* Main Content Row */}
              <div className="flex flex-1">
                {/* Photo Side */}
                <div className="relative w-24 flex-shrink-0 bg-white overflow-hidden border-r border-gray-100">
                  {(equipment.photos?.[0] || item.customData?.photos?.[0]) ? (
                    <Image
                      src={equipment.photos?.[0] || item.customData?.photos?.[0] || ""}
                      alt={equipment.name}
                      fill
                      className="object-contain p-2"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-3xl bg-gradient-to-br from-gray-50 to-gray-100">
                      🔧
                    </div>
                  )}
                  
                  {/* Badge Urgence Maintenance */}
                  {maintenanceStatus && urgencyColors && (maintenanceStatus.urgencyState === "overdue" || maintenanceStatus.urgencyState === "urgent") && (
                    <div className={`absolute top-2 left-2 w-6 h-6 ${urgencyColors.bg} border-2 ${urgencyColors.border} rounded-full flex items-center justify-center shadow-lg z-10`}>
                      {maintenanceStatus.urgencyState === "overdue" && (
                        <span className="absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75 animate-ping" />
                      )}
                      <div className={`relative w-2.5 h-2.5 rounded-full ${urgencyColors.dot} ${urgencyColors.animate ? "animate-pulse" : ""}`} />
                    </div>
                  )}
                </div>

                {/* Card Content */}
                <div className="p-3 flex-1 flex flex-col min-w-0">
                {/* Title & Category */}
                <div className="mb-2">
                  <div className="flex items-start gap-2 mb-1">
                    <h4 className="font-bold text-black text-base leading-tight flex-1 line-clamp-1">
                      {equipment.name}
                    </h4>
                    {item.isCustom && (
                      <span className="px-1.5 py-0.5 bg-blue-600 text-white text-[10px] font-bold rounded flex-shrink-0">
                        Custom
                      </span>
                    )}
                  </div>
                  {!item.isCustom && item.equipmentId?.categoryId && (
                    <p className="text-xs text-gray">
                      {item.equipmentId.categoryId.name}
                    </p>
                  )}
                  {item.isCustom && item.customData?.brand && (
                    <p className="text-xs text-gray truncate">
                      {item.customData.brand}
                      {item.customData.model && ` - ${item.customData.model}`}
                    </p>
                  )}
                </div>

                {/* Badges */}
                <div className="flex flex-wrap gap-1 mb-2">
                  {/* Badge de maintenance urgent */}
                  {maintenanceStatus && urgencyColors && maintenanceStatus.urgencyState !== "none" && (
                    <span
                      className={`px-1.5 py-0.5 ${urgencyColors.bg} ${urgencyColors.text} border ${urgencyColors.border} text-[10px] font-bold rounded-full flex items-center gap-1 ${urgencyColors.animate ? "animate-pulse" : ""}`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${urgencyColors.dot}`} />
                      <span>{urgencyColors.label}</span>
                      {maintenanceStatus.nextDueText && (
                        <>
                          <span>•</span>
                          <span>{maintenanceStatus.nextDueText}</span>
                        </>
                      )}
                      <span>({maintenanceStatus.maintenancesCount})</span>
                    </span>
                  )}
                  
                  {!item.isCustom &&
                    item.equipmentId?.equipmentBrands.slice(0, 1).map((brand, idx) => (
                      <span
                        key={idx}
                        className="px-1.5 py-0.5 bg-purple-50 text-purple-700 text-[10px] font-semibold rounded-full"
                      >
                        {brand.name}
                      </span>
                    ))}
                  {!item.isCustom && item.equipmentId?.equipmentBrands && item.equipmentId.equipmentBrands.length > 1 && (
                    <span className="px-1.5 py-0.5 bg-purple-50 text-purple-700 text-[10px] font-semibold rounded-full">
                      +{item.equipmentId.equipmentBrands.length - 1}
                    </span>
                  )}
                  {!item.isCustom && item.equipmentId?.manuals && item.equipmentId.manuals.length > 0 && (
                    <span className="px-1.5 py-0.5 bg-green-50 text-green-700 text-[10px] font-semibold rounded-full">
                      📄 {item.equipmentId.manuals.length}
                    </span>
                  )}
                  {item.installDate && (
                    <span className="px-1.5 py-0.5 bg-blue-50 text-blue-700 text-[10px] font-semibold rounded-full">
                      📅 {new Date(item.installDate).toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit", year: "2-digit" })}
                    </span>
                  )}
                </div>

                {/* Description */}
                {equipment.description && (
                  <p className="text-xs text-gray line-clamp-2 mb-2">
                    {equipment.description}
                  </p>
                )}

                {/* Info: No maintenances */}
                {maintenanceStatus && maintenanceStatus.maintenancesCount === 0 && (
                  <div className="mb-2 p-1.5 bg-orange-50 border border-orange-200 rounded-lg">
                    <button
                      onClick={() => {
                        if (onAddMaintenanceForEquipment) {
                          onAddMaintenanceForEquipment(item._id);
                          // Scroll to maintenance section after a small delay
                          setTimeout(() => {
                            document.getElementById('maintenances-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                          }, 100);
                        }
                      }}
                      className="w-full flex items-center gap-1.5 text-[10px] text-orange-700 hover:text-orange-800 font-medium group text-left"
                    >
                      <svg className="w-3 h-3 text-orange-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                      <span>Aucun entretien • <span className="underline group-hover:no-underline">Ajouter →</span></span>
                    </button>
                  </div>
                )}

                {/* Actions */}
                <div className="mt-auto flex items-center gap-1.5 pt-2 border-t border-gray-100">
                  <button
                    onClick={() =>
                      setHistoryEquipment({ id: item._id, name: equipment.name })
                    }
                    className="flex-1 px-2 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-lg transition-colors font-semibold text-xs flex items-center justify-center gap-1.5"
                  >
                    <svg
                      className="w-3.5 h-3.5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                    <span className="hidden sm:inline">Historique</span>
                  </button>
                  {!item.isCustom && item.equipmentId?.manuals && item.equipmentId.manuals.length > 0 && (
                    <button
                      onClick={() =>
                        setChatbotEquipment({
                          id: item.equipmentId!._id,
                          name: equipment.name,
                          manuals: item.equipmentId!.manuals,
                        })
                      }
                      className="flex-1 px-2 py-1.5 bg-green-50 hover:bg-green-100 text-green-600 rounded-lg transition-colors font-semibold text-xs flex items-center justify-center gap-1.5"
                      title="Assistant IA - Posez vos questions sur les manuels"
                    >
                      <svg
                        className="w-3.5 h-3.5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
                        />
                      </svg>
                      <span className="hidden sm:inline">IA</span>
                    </button>
                  )}
                  <button
                    onClick={() => toggleExpand(item._id)}
                    className="px-2 py-1.5 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
                    title={isExpanded ? "Réduire" : "Voir détails"}
                  >
                    <svg
                      className={`w-3.5 h-3.5 transition-transform ${
                        isExpanded ? "rotate-180" : ""
                      }`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 9l-7 7-7-7"
                      />
                    </svg>
                  </button>
                  <button
                    onClick={() => handleDelete(item._id)}
                    disabled={deletingId === item._id}
                    className="px-2 py-1.5 hover:bg-red-50 text-red-600 rounded-lg transition-colors disabled:opacity-50"
                    title="Retirer"
                  >
                    <svg
                      className="w-3.5 h-3.5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                      />
                    </svg>
                  </button>
                </div>
                </div>
              </div>

              {/* Expanded Details */}
              {isExpanded && (
                <div className="border-t border-gray-200 p-4 bg-gray-50 space-y-4">
                  {/* Manuals */}
                  {!item.isCustom && item.equipmentId?.manuals && item.equipmentId.manuals.length > 0 && (
                    <div>
                      <h5 className="font-semibold text-black mb-2 text-sm">
                        Manuels & Documents
                      </h5>
                      <div className="space-y-2">
                        {item.equipmentId.manuals.map((manual, idx) => (
                          <a
                            key={idx}
                            href={manual.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 p-2 bg-white rounded-lg hover:shadow-md transition-shadow"
                          >
                            <svg
                              className="w-4 h-4 text-red-600 flex-shrink-0"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                              />
                            </svg>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-black text-xs truncate">
                                {manual.title}
                              </p>
                              <p className="text-xs text-gray">
                                {manual.isExternal ? "URL externe" : "Fichier"}
                              </p>
                            </div>
                            <svg
                              className="w-4 h-4 text-gray flex-shrink-0"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                              />
                            </svg>
                          </a>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Notes */}
                  {item.notes && (
                    <div>
                      <h5 className="font-semibold text-black mb-2 text-sm">Notes</h5>
                      <p className="text-gray text-xs whitespace-pre-wrap bg-white p-3 rounded-lg">
                        {item.notes}
                      </p>
                    </div>
                  )}

                  {/* Dates */}
                  <div className="flex flex-col gap-2 text-xs text-gray">
                    <div>
                      <span className="font-medium">Ajouté le:</span>{" "}
                      {new Date(item.createdAt).toLocaleDateString("fr-FR")}
                    </div>
                    {item.installDate && (
                      <div>
                        <span className="font-medium">Installé le:</span>{" "}
                        {new Date(item.installDate).toLocaleDateString("fr-FR")}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        );
      })}

      {/* Equipment Maintenance History Modal */}
      <AnimatePresence>
        {historyEquipment && (
          <EquipmentMaintenanceHistoryModal
            vehicleId={vehicleId}
            vehicleEquipmentId={historyEquipment.id}
            equipmentName={historyEquipment.name}
            onClose={() => setHistoryEquipment(null)}
          />
        )}
        {chatbotEquipment && (
          <EquipmentChatbot
            equipmentId={chatbotEquipment.id}
            equipmentName={chatbotEquipment.name}
            manuals={chatbotEquipment.manuals}
            onClose={() => setChatbotEquipment(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

