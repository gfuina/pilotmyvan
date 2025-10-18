"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";

interface Attachment {
  url: string;
  filename: string;
  contentType: string;
  size: number;
  uploadedAt: string;
}

interface MaintenanceRecord {
  _id: string;
  completedAt: string;
  mileageAtCompletion?: number;
  notes?: string;
  attachments: Attachment[];
  cost?: number;
  location?: string;
}

interface Statistics {
  totalRecords: number;
  totalCost: number;
  averageCost: number;
  averageInterval: number; // en jours
}

interface MaintenanceHistoryModalProps {
  vehicleId: string;
  maintenanceScheduleId: string;
  maintenanceName: string;
  onClose: () => void;
}

export default function MaintenanceHistoryModal({
  vehicleId,
  maintenanceScheduleId,
  maintenanceName,
  onClose,
}: MaintenanceHistoryModalProps) {
  const [records, setRecords] = useState<MaintenanceRecord[]>([]);
  const [statistics, setStatistics] = useState<Statistics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedRecordId, setExpandedRecordId] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const response = await fetch(
        `/api/vehicles/${vehicleId}/maintenances/${maintenanceScheduleId}/history`
      );
      if (response.ok) {
        const data = await response.json();
        setRecords(data.records);
        setStatistics(data.statistics);
      }
    } catch (error) {
      console.error("Erreur lors du chargement de l'historique:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full max-h-[95vh] sm:max-h-[90vh] overflow-hidden mx-4"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="p-4 sm:p-6 border-b border-gray-200">
            <div className="flex items-center justify-between gap-3">
              <div className="flex-1 min-w-0">
                <h3 className="text-lg sm:text-2xl font-bold text-black">
                  Historique d&apos;entretien
                </h3>
                <p className="text-xs sm:text-sm text-gray mt-1 truncate">{maintenanceName}</p>
              </div>
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
          </div>

          {/* Content */}
          <div className="overflow-y-auto max-h-[calc(95vh-100px)] sm:max-h-[calc(90vh-120px)]">
            {isLoading ? (
              <div className="flex justify-center items-center py-12">
                <div className="w-10 h-10 border-4 border-orange border-t-transparent rounded-full animate-spin" />
              </div>
            ) : records.length === 0 ? (
              <div className="text-center py-12 px-6">
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
                <h4 className="text-lg font-semibold text-black mb-2">
                  Aucun historique
                </h4>
                <p className="text-gray text-sm">
                  Cet entretien n&apos;a pas encore été effectué
                </p>
              </div>
            ) : (
              <>
                {/* Statistics */}
                {statistics && statistics.totalRecords > 0 && (
                  <div className="p-4 sm:p-6 bg-gradient-to-br from-orange/5 to-orange-light/5 border-b border-gray-200">
                    <h4 className="text-xs sm:text-sm font-semibold text-gray-700 mb-3 sm:mb-4">
                      📊 Statistiques
                    </h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
                      <div className="bg-white rounded-xl p-4 shadow-sm">
                        <p className="text-xs text-gray-500 mb-1">Total effectué</p>
                        <p className="text-2xl font-bold text-black">
                          {statistics.totalRecords}
                        </p>
                      </div>
                      <div className="bg-white rounded-xl p-4 shadow-sm">
                        <p className="text-xs text-gray-500 mb-1">Coût total</p>
                        <p className="text-2xl font-bold text-black">
                          {statistics.totalCost.toFixed(0)} €
                        </p>
                      </div>
                      <div className="bg-white rounded-xl p-4 shadow-sm">
                        <p className="text-xs text-gray-500 mb-1">Coût moyen</p>
                        <p className="text-2xl font-bold text-black">
                          {statistics.averageCost.toFixed(0)} €
                        </p>
                      </div>
                      {statistics.averageInterval > 0 && (
                        <div className="bg-white rounded-xl p-4 shadow-sm">
                          <p className="text-xs text-gray-500 mb-1">Intervalle moyen</p>
                          <p className="text-2xl font-bold text-black">
                            {statistics.averageInterval}j
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Records */}
                <div className="p-4 sm:p-6 space-y-3 sm:space-y-4">
                  {records.map((record, index) => {
                    const isExpanded = expandedRecordId === record._id;
                    const hasDetails =
                      record.notes ||
                      record.attachments.length > 0 ||
                      record.location;

                    return (
                      <div
                        key={record._id}
                        className="border border-gray-200 rounded-xl sm:rounded-2xl overflow-hidden bg-white hover:shadow-md transition-shadow"
                      >
                        <div className="p-3 sm:p-4">
                          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 sm:gap-4">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 sm:gap-3 mb-2">
                                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                                  <svg
                                    className="w-4 h-4 sm:w-5 sm:h-5 text-green-600"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M5 13l4 4L19 7"
                                    />
                                  </svg>
                                </div>
                                <div>
                                  <p className="font-bold text-black text-sm sm:text-base">
                                    {new Date(record.completedAt).toLocaleDateString(
                                      "fr-FR",
                                      {
                                        day: "numeric",
                                        month: "long",
                                        year: "numeric",
                                      }
                                    )}
                                  </p>
                                  <p className="text-xs text-gray-500">
                                    {index === 0 ? "Dernière intervention" : `Il y a ${Math.floor((Date.now() - new Date(record.completedAt).getTime()) / (1000 * 60 * 60 * 24))} jours`}
                                  </p>
                                </div>
                              </div>

                              <div className="flex flex-wrap gap-1.5 sm:gap-2">
                                {record.mileageAtCompletion && (
                                  <span className="px-3 py-1 bg-blue-50 text-blue-700 text-xs font-medium rounded-full">
                                    {record.mileageAtCompletion.toLocaleString()} km
                                  </span>
                                )}
                                {record.cost !== undefined && (
                                  <span className="px-3 py-1 bg-green-50 text-green-700 text-xs font-medium rounded-full">
                                    {record.cost.toFixed(2)} €
                                  </span>
                                )}
                                {record.location && (
                                  <span className="px-3 py-1 bg-purple-50 text-purple-700 text-xs font-medium rounded-full">
                                    📍 {record.location}
                                  </span>
                                )}
                                {record.attachments.length > 0 && (
                                  <span className="px-3 py-1 bg-orange-50 text-orange-700 text-xs font-medium rounded-full">
                                    📎 {record.attachments.length}
                                  </span>
                                )}
                              </div>
                            </div>

                            {hasDetails && (
                              <button
                                onClick={() =>
                                  setExpandedRecordId(
                                    isExpanded ? null : record._id
                                  )
                                }
                                className="p-1.5 sm:p-2 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0 self-start sm:self-auto"
                              >
                                <svg
                                  className={`w-4 h-4 sm:w-5 sm:h-5 text-gray-500 transition-transform ${
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
                            )}
                          </div>

                          {/* Expanded details */}
                          <AnimatePresence>
                            {isExpanded && (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: "auto", opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                className="overflow-hidden"
                              >
                                <div className="mt-4 pt-4 border-t border-gray-200 space-y-4">
                                  {/* Notes */}
                                  {record.notes && (
                                    <div>
                                      <p className="text-xs font-semibold text-gray-700 mb-2">
                                        Notes :
                                      </p>
                                      <p className="text-sm text-gray-800 whitespace-pre-wrap bg-gray-50 rounded-xl p-3">
                                        {record.notes}
                                      </p>
                                    </div>
                                  )}

                                  {/* Attachments */}
                                  {record.attachments.length > 0 && (
                                    <div>
                                      <p className="text-xs font-semibold text-gray-700 mb-2">
                                        Pièces jointes :
                                      </p>
                                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                        {record.attachments.map((attachment, i) => (
                                          <div
                                            key={i}
                                            className="group relative aspect-square bg-gray-100 rounded-xl overflow-hidden cursor-pointer"
                                            onClick={() =>
                                              attachment.contentType.startsWith(
                                                "image/"
                                              )
                                                ? setSelectedImage(attachment.url)
                                                : window.open(
                                                    attachment.url,
                                                    "_blank"
                                                  )
                                            }
                                          >
                                            {attachment.contentType.startsWith(
                                              "image/"
                                            ) ? (
                                              <Image
                                                src={attachment.url}
                                                alt={attachment.filename}
                                                fill
                                                className="object-cover group-hover:scale-105 transition-transform"
                                              />
                                            ) : (
                                              <div className="absolute inset-0 flex flex-col items-center justify-center">
                                                <svg
                                                  className="w-10 h-10 text-gray-400"
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
                                                <p className="text-xs text-gray-500 mt-2 px-2 text-center truncate w-full">
                                                  {attachment.filename}
                                                </p>
                                              </div>
                                            )}
                                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                                              <svg
                                                className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                                                fill="none"
                                                stroke="currentColor"
                                                viewBox="0 0 24 24"
                                              >
                                                <path
                                                  strokeLinecap="round"
                                                  strokeLinejoin="round"
                                                  strokeWidth={2}
                                                  d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7"
                                                />
                                              </svg>
                                            </div>
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  )}
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        </motion.div>
      </motion.div>

      {/* Image Lightbox */}
      <AnimatePresence>
        {selectedImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/90 z-[60] flex items-center justify-center p-4"
            onClick={() => setSelectedImage(null)}
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="relative max-w-5xl max-h-[90vh] w-full h-full"
              onClick={(e) => e.stopPropagation()}
            >
              <Image
                src={selectedImage}
                alt="Attachment"
                fill
                className="object-contain"
              />
              <button
                onClick={() => setSelectedImage(null)}
                className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 rounded-full backdrop-blur-sm transition-colors"
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
    </>
  );
}

