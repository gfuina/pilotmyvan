"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface HistoryEntry {
  _id: string;
  completedAt: Date | string;
  mileageAtCompletion?: number;
  cost?: number;
  notes?: string;
  location?: string;
  attachments?: Array<{
    url: string;
    filename: string;
    contentType: string;
    size: number;
    uploadedAt: Date;
  }>;
}

interface MaintenanceHistoryModalProps {
  vehicleId: string;
  scheduleId: string;
  maintenanceName: string;
  onClose: () => void;
  onUpdate: () => void;
}

export default function MaintenanceHistoryModal({
  vehicleId,
  scheduleId,
  maintenanceName,
  onClose,
  onUpdate,
}: MaintenanceHistoryModalProps) {
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingEntry, setEditingEntry] = useState<HistoryEntry | null>(null);
  const [deletingEntryId, setDeletingEntryId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchHistory();
  }, [scheduleId]);

  const fetchHistory = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(
        `/api/vehicles/${vehicleId}/maintenances/${scheduleId}/history`
      );
      if (response.ok) {
        const data = await response.json();
        setHistory(data.records || []);
      }
    } catch (error) {
      console.error("Error fetching history:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteEntry = async (recordId: string) => {
    setDeletingEntryId(recordId);
    try {
      const response = await fetch(
        `/api/vehicles/${vehicleId}/maintenances/${scheduleId}/history/${recordId}`,
        {
          method: "DELETE",
        }
      );

      if (response.ok) {
        await fetchHistory();
        onUpdate();
      } else {
        alert("Erreur lors de la suppression");
      }
    } catch (error) {
      alert("Erreur lors de la suppression");
    } finally {
      setDeletingEntryId(null);
    }
  };

  const handleUpdateEntry = async (entry: HistoryEntry) => {
    setIsSaving(true);
    try {
      const response = await fetch(
        `/api/vehicles/${vehicleId}/maintenances/${scheduleId}/history/${entry._id}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            completedAt: entry.completedAt,
            mileageAtCompletion: entry.mileageAtCompletion,
            cost: entry.cost,
            notes: entry.notes,
            location: entry.location,
          }),
        }
      );

      if (response.ok) {
        await fetchHistory();
        setEditingEntry(null);
        onUpdate();
      } else {
        alert("Erreur lors de la modification");
      }
    } catch (error) {
      alert("Erreur lors de la modification");
    } finally {
      setIsSaving(false);
    }
  };

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const formatTime = (date: Date | string) => {
    return new Date(date).toLocaleTimeString("fr-FR", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
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
        className="bg-white rounded-3xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-orange/10 to-orange-light/10">
          <div className="flex items-center justify-between gap-4">
            <div className="flex-1">
              <h3 className="text-2xl font-bold text-black">
                📋 Historique
              </h3>
              <p className="text-gray text-sm mt-1">{maintenanceName}</p>
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
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          {isLoading ? (
            <div className="flex justify-center items-center py-12">
              <div className="w-10 h-10 border-4 border-orange border-t-transparent rounded-full animate-spin" />
            </div>
          ) : history.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-2xl">
              <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
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
                Validez un entretien pour commencer l&apos;historique
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {history.map((entry, index) => {
                const isEditing = editingEntry && editingEntry._id === entry._id;
                const isDeleting = deletingEntryId === entry._id;

                if (isEditing) {
                  return (
                    <div
                      key={entry._id}
                      className="border-2 border-orange rounded-2xl p-4 bg-orange/5"
                    >
                      <div className="space-y-3">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="block text-sm font-semibold text-black mb-1">
                              Date *
                            </label>
                            <input
                              type="datetime-local"
                              value={
                                editingEntry.completedAt
                                  ? new Date(editingEntry.completedAt).toISOString().slice(0, 16)
                                  : ""
                              }
                              onChange={(e) =>
                                setEditingEntry({
                                  ...editingEntry,
                                  completedAt: e.target.value,
                                })
                              }
                              className="w-full px-3 py-2 border-2 border-gray-300 rounded-xl focus:border-orange focus:ring-2 focus:ring-orange/20 outline-none transition-all"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-semibold text-black mb-1">
                              Kilométrage
                            </label>
                            <input
                              type="number"
                              value={editingEntry.mileageAtCompletion || ""}
                              onChange={(e) =>
                                setEditingEntry({
                                  ...editingEntry,
                                  mileageAtCompletion: e.target.value ? parseInt(e.target.value) : undefined,
                                })
                              }
                              placeholder="Ex: 45000"
                              className="w-full px-3 py-2 border-2 border-gray-300 rounded-xl focus:border-orange focus:ring-2 focus:ring-orange/20 outline-none transition-all"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="block text-sm font-semibold text-black mb-1">
                              Coût (€)
                            </label>
                            <input
                              type="number"
                              step="0.01"
                              value={editingEntry.cost || ""}
                              onChange={(e) =>
                                setEditingEntry({
                                  ...editingEntry,
                                  cost: e.target.value ? parseFloat(e.target.value) : undefined,
                                })
                              }
                              placeholder="Ex: 150.00"
                              className="w-full px-3 py-2 border-2 border-gray-300 rounded-xl focus:border-orange focus:ring-2 focus:ring-orange/20 outline-none transition-all"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-semibold text-black mb-1">
                              Lieu
                            </label>
                            <input
                              type="text"
                              value={editingEntry.location || ""}
                              onChange={(e) =>
                                setEditingEntry({
                                  ...editingEntry,
                                  location: e.target.value,
                                })
                              }
                              placeholder="Ex: Garage XYZ"
                              className="w-full px-3 py-2 border-2 border-gray-300 rounded-xl focus:border-orange focus:ring-2 focus:ring-orange/20 outline-none transition-all"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-semibold text-black mb-1">
                            Notes
                          </label>
                          <textarea
                            value={editingEntry.notes || ""}
                            onChange={(e) =>
                              setEditingEntry({
                                ...editingEntry,
                                notes: e.target.value,
                              })
                            }
                            rows={2}
                            placeholder="Remarques, observations..."
                            className="w-full px-3 py-2 border-2 border-gray-300 rounded-xl focus:border-orange focus:ring-2 focus:ring-orange/20 outline-none transition-all resize-none"
                          />
                        </div>

                        <div className="flex gap-2 pt-2">
                          <button
                            onClick={() => handleUpdateEntry(editingEntry)}
                            disabled={isSaving}
                            className="flex-1 px-4 py-2 bg-gradient-to-r from-orange to-orange-light text-white font-bold rounded-xl hover:shadow-lg transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                          >
                            {isSaving ? (
                              <>
                                <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                                </svg>
                                Enregistrement...
                              </>
                            ) : (
                              "Enregistrer"
                            )}
                          </button>
                          <button
                            onClick={() => setEditingEntry(null)}
                            disabled={isSaving}
                            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-xl transition-colors disabled:opacity-50"
                          >
                            Annuler
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                }

                return (
                  <div
                    key={entry._id}
                    className="border-2 border-gray-200 rounded-2xl p-4 hover:border-gray-300 transition-all bg-white"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <div className="w-2 h-2 rounded-full bg-green-500" />
                          <span className="font-bold text-black">
                            {formatDate(entry.completedAt)}
                          </span>
                          <span className="text-sm text-gray-500">
                            {formatTime(entry.completedAt)}
                          </span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-sm">
                          {entry.mileageAtCompletion && (
                            <div className="flex items-center gap-1.5 text-gray-600">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                              </svg>
                              <span>{entry.mileageAtCompletion.toLocaleString()} km</span>
                            </div>
                          )}
                          {entry.cost && (
                            <div className="flex items-center gap-1.5 text-gray-600">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                              </svg>
                              <span>{entry.cost.toFixed(2)} €</span>
                            </div>
                          )}
                          {entry.location && (
                            <div className="flex items-center gap-1.5 text-gray-600">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                              </svg>
                              <span className="truncate">{entry.location}</span>
                            </div>
                          )}
                        </div>

                        {entry.notes && (
                          <p className="mt-2 text-sm text-gray-600 italic">
                            &quot;{entry.notes}&quot;
                          </p>
                        )}

                        {entry.attachments && entry.attachments.length > 0 && (
                          <div className="mt-2 flex items-center gap-1.5 text-xs text-blue-600">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                            </svg>
                            <span>{entry.attachments.length} pièce{entry.attachments.length > 1 ? 's' : ''} jointe{entry.attachments.length > 1 ? 's' : ''}</span>
                          </div>
                        )}
                      </div>

                      <div className="flex gap-1 flex-shrink-0">
                        <button
                          onClick={() => setEditingEntry(entry)}
                          className="p-2 hover:bg-blue-50 text-blue-600 rounded-lg transition-colors"
                          title="Modifier"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleDeleteEntry(entry._id)}
                          disabled={isDeleting}
                          className="p-2 hover:bg-red-50 text-red-600 rounded-lg transition-colors disabled:opacity-50"
                          title="Supprimer"
                        >
                          {isDeleting ? (
                            <svg className="w-5 h-5 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
                          ) : (
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}
