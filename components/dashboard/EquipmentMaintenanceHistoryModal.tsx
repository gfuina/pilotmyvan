"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";

interface MaintenanceRecord {
  _id: string;
  completedAt: string;
  mileageAtCompletion?: number;
  cost?: number;
  location?: string;
  notes?: string;
  attachments?: string[];
  maintenanceName: string;
  maintenanceType?: string;
  maintenancePriority?: string;
}

interface Stats {
  totalRecords: number;
  totalCost: number;
  averageCost: number;
  lastMaintenanceDate: string | null;
  maintenanceTypes: Record<string, number>;
}

interface ScheduleInfo {
  _id: string;
  name: string;
  type: string;
}

interface EquipmentMaintenanceHistoryModalProps {
  vehicleId: string;
  vehicleEquipmentId: string;
  equipmentName: string;
  onClose: () => void;
}

const typeColors: Record<string, string> = {
  inspection: "bg-blue-100 text-blue-700",
  replacement: "bg-red-100 text-red-700",
  cleaning: "bg-green-100 text-green-700",
  adjustment: "bg-yellow-100 text-yellow-700",
  test: "bg-purple-100 text-purple-700",
  other: "bg-gray-100 text-gray-700",
};

const typeLabels: Record<string, string> = {
  inspection: "Inspection",
  replacement: "Remplacement",
  cleaning: "Nettoyage",
  adjustment: "Réglage",
  test: "Test",
  other: "Autre",
};

export default function EquipmentMaintenanceHistoryModal({
  vehicleId,
  vehicleEquipmentId,
  equipmentName,
  onClose,
}: EquipmentMaintenanceHistoryModalProps) {
  const [records, setRecords] = useState<MaintenanceRecord[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [schedules, setSchedules] = useState<ScheduleInfo[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedRecordId, setExpandedRecordId] = useState<string | null>(null);
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);
  const [selectedFilter, setSelectedFilter] = useState<string | null>(null);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(
        `/api/vehicles/${vehicleId}/equipments/${vehicleEquipmentId}/history`
      );
      if (response.ok) {
        const data = await response.json();
        setRecords(data.records);
        setStats(data.stats);
        setSchedules(data.schedules);
      }
    } catch (error) {
      console.error("Erreur lors du chargement de l'historique:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredRecords = selectedFilter
    ? records.filter((r) => r.maintenanceType === selectedFilter)
    : records;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-2 sm:p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-6 bg-gradient-to-r from-blue-600 to-purple-600 border-b border-blue-100">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
                <svg
                  className="w-5 h-5 sm:w-6 sm:h-6 text-white"
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
              </div>
              <div>
                <h3 className="text-base sm:text-xl font-bold text-white">
                  Historique complet
                </h3>
                <p className="text-xs sm:text-sm text-blue-100 truncate max-w-[200px] sm:max-w-none">
                  {equipmentName}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-xl transition-colors flex-shrink-0"
            >
              <svg
                className="w-5 h-5 sm:w-6 sm:h-6 text-white"
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

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : records.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-8 h-8 text-gray-400"
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
              </div>
              <p className="text-gray-600 font-medium">
                Aucun entretien enregistré
              </p>
              <p className="text-sm text-gray-500 mt-2">
                Les interventions effectuées apparaîtront ici
              </p>
            </div>
          ) : (
            <>
              {/* Statistiques */}
              {stats && (
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl sm:rounded-2xl p-3 sm:p-4">
                    <div className="text-xs sm:text-sm text-blue-600 font-medium mb-1">
                      Total interventions
                    </div>
                    <div className="text-xl sm:text-2xl font-bold text-blue-900">
                      {stats.totalRecords}
                    </div>
                  </div>
                  <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl sm:rounded-2xl p-3 sm:p-4">
                    <div className="text-xs sm:text-sm text-green-600 font-medium mb-1">
                      Coût total
                    </div>
                    <div className="text-xl sm:text-2xl font-bold text-green-900">
                      {stats.totalCost.toFixed(0)}€
                    </div>
                  </div>
                  <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl sm:rounded-2xl p-3 sm:p-4">
                    <div className="text-xs sm:text-sm text-purple-600 font-medium mb-1">
                      Coût moyen
                    </div>
                    <div className="text-xl sm:text-2xl font-bold text-purple-900">
                      {stats.averageCost > 0 ? `${stats.averageCost.toFixed(0)}€` : "N/A"}
                    </div>
                  </div>
                  <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl sm:rounded-2xl p-3 sm:p-4">
                    <div className="text-xs sm:text-sm text-orange-600 font-medium mb-1">
                      Dernier entretien
                    </div>
                    <div className="text-xs sm:text-sm font-bold text-orange-900">
                      {stats.lastMaintenanceDate
                        ? formatDate(stats.lastMaintenanceDate)
                        : "N/A"}
                    </div>
                  </div>
                </div>
              )}

              {/* Filtres par type */}
              <div className="flex flex-wrap gap-2 mb-4">
                <button
                  onClick={() => setSelectedFilter(null)}
                  className={`px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all ${
                    selectedFilter === null
                      ? "bg-blue-600 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  Tous ({records.length})
                </button>
                {Object.entries(stats?.maintenanceTypes || {}).map(([type, count]) => (
                  <button
                    key={type}
                    onClick={() => setSelectedFilter(type)}
                    className={`px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all ${
                      selectedFilter === type
                        ? typeColors[type] || "bg-gray-200 text-gray-800"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    }`}
                  >
                    {typeLabels[type] || type} ({count})
                  </button>
                ))}
              </div>

              {/* Timeline des entretiens */}
              <div className="space-y-4">
                {filteredRecords.map((record, index) => (
                  <motion.div
                    key={record._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="relative bg-white border-2 border-gray-200 rounded-xl sm:rounded-2xl p-3 sm:p-4 hover:shadow-lg transition-all"
                  >
                    <div className="flex items-start gap-3 sm:gap-4">
                      {/* Timeline dot */}
                      <div className="flex-shrink-0 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-xs sm:text-sm">
                        {index + 1}
                      </div>

                      <div className="flex-1 min-w-0">
                        {/* Header */}
                        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 mb-2">
                          <div className="flex-1 min-w-0">
                            <h4 className="font-bold text-sm sm:text-base text-gray-900 truncate">
                              {record.maintenanceName}
                            </h4>
                            <p className="text-xs sm:text-sm text-gray-600">
                              {formatDate(record.completedAt)}
                            </p>
                          </div>
                          {record.maintenanceType && (
                            <span
                              className={`px-2 py-1 rounded-lg text-xs font-medium ${
                                typeColors[record.maintenanceType] || "bg-gray-100 text-gray-700"
                              }`}
                            >
                              {typeLabels[record.maintenanceType] || record.maintenanceType}
                            </span>
                          )}
                        </div>

                        {/* Info badges */}
                        <div className="flex flex-wrap gap-2 mb-2">
                          {record.mileageAtCompletion && (
                            <span className="px-2 py-1 bg-blue-50 text-blue-700 rounded-lg text-xs font-medium">
                              🛣️ {record.mileageAtCompletion.toLocaleString()} km
                            </span>
                          )}
                          {record.cost !== undefined && record.cost > 0 && (
                            <span className="px-2 py-1 bg-green-50 text-green-700 rounded-lg text-xs font-medium">
                              💰 {record.cost.toFixed(2)}€
                            </span>
                          )}
                          {record.location && (
                            <span className="px-2 py-1 bg-purple-50 text-purple-700 rounded-lg text-xs font-medium truncate max-w-[150px] sm:max-w-none">
                              📍 {record.location}
                            </span>
                          )}
                        </div>

                        {/* Expandable details */}
                        {(record.notes || record.attachments?.length) && (
                          <>
                            <button
                              onClick={() =>
                                setExpandedRecordId(
                                  expandedRecordId === record._id ? null : record._id
                                )
                              }
                              className="text-xs sm:text-sm text-blue-600 hover:text-blue-700 font-medium flex items-center gap-1"
                            >
                              {expandedRecordId === record._id ? "Masquer" : "Voir"} les détails
                              <svg
                                className={`w-4 h-4 transition-transform ${
                                  expandedRecordId === record._id ? "rotate-180" : ""
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

                            <AnimatePresence>
                              {expandedRecordId === record._id && (
                                <motion.div
                                  initial={{ height: 0, opacity: 0 }}
                                  animate={{ height: "auto", opacity: 1 }}
                                  exit={{ height: 0, opacity: 0 }}
                                  className="overflow-hidden"
                                >
                                  <div className="mt-3 pt-3 border-t border-gray-200 space-y-3">
                                    {record.notes && (
                                      <div>
                                        <p className="text-xs font-semibold text-gray-700 mb-1">
                                          Notes :
                                        </p>
                                        <p className="text-xs sm:text-sm text-gray-600 bg-gray-50 rounded-lg p-2 sm:p-3">
                                          {record.notes}
                                        </p>
                                      </div>
                                    )}

                                    {record.attachments && record.attachments.length > 0 && (
                                      <div>
                                        <p className="text-xs font-semibold text-gray-700 mb-2">
                                          Pièces jointes ({record.attachments.length}) :
                                        </p>
                                        <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                                          {record.attachments.map((url, idx) => (
                                            <button
                                              key={idx}
                                              onClick={() => setLightboxImage(url)}
                                              className="relative aspect-square rounded-lg overflow-hidden hover:ring-2 hover:ring-blue-500 transition-all"
                                            >
                                              <Image
                                                src={url}
                                                alt={`Pièce jointe ${idx + 1}`}
                                                fill
                                                className="object-cover"
                                              />
                                            </button>
                                          ))}
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </>
          )}
        </div>
      </motion.div>

      {/* Lightbox for images */}
      <AnimatePresence>
        {lightboxImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/90 z-[60] flex items-center justify-center p-4"
            onClick={() => setLightboxImage(null)}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="relative max-w-4xl w-full h-full flex items-center justify-center"
            >
              <Image
                src={lightboxImage}
                alt="Aperçu"
                width={1200}
                height={1200}
                className="object-contain max-h-full"
              />
              <button
                onClick={() => setLightboxImage(null)}
                className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors"
              >
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
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

