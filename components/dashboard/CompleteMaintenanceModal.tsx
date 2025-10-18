"use client";

import { useState } from "react";
import { motion } from "framer-motion";

interface Attachment {
  url: string;
  filename: string;
  contentType: string;
  size: number;
}

interface CompleteMaintenanceModalProps {
  vehicleId: string;
  maintenanceScheduleId: string;
  maintenanceName: string;
  currentMileage?: number;
  onClose: () => void;
  onSuccess: () => void;
}

export default function CompleteMaintenanceModal({
  vehicleId,
  maintenanceScheduleId,
  maintenanceName,
  currentMileage,
  onClose,
  onSuccess,
}: CompleteMaintenanceModalProps) {
  const [completedAt, setCompletedAt] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [mileageAtCompletion, setMileageAtCompletion] = useState(
    currentMileage?.toString() || ""
  );
  const [notes, setNotes] = useState("");
  const [cost, setCost] = useState("");
  const [location, setLocation] = useState("");
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    setError("");

    try {
      const uploadPromises = Array.from(files).map(async (file) => {
        const formData = new FormData();
        formData.append("file", file);

        const response = await fetch("/api/upload/maintenance-attachment", {
          method: "POST",
          body: formData,
        });

        if (!response.ok) {
          throw new Error("Erreur lors de l'upload");
        }

        return response.json();
      });

      const uploadedFiles = await Promise.all(uploadPromises);
      setAttachments([...attachments, ...uploadedFiles]);
    } catch (error) {
      setError("Erreur lors de l'upload des fichiers");
    } finally {
      setIsUploading(false);
    }
  };

  const removeAttachment = (index: number) => {
    setAttachments(attachments.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setError("");

    try {
      const response = await fetch(
        `/api/vehicles/${vehicleId}/maintenances/${maintenanceScheduleId}/complete`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            completedAt,
            mileageAtCompletion: mileageAtCompletion
              ? parseInt(mileageAtCompletion)
              : undefined,
            notes: notes || undefined,
            cost: cost ? parseFloat(cost) : undefined,
            location: location || undefined,
            attachments,
          }),
        }
      );

      if (response.ok) {
        onSuccess();
      } else {
        const data = await response.json();
        setError(data.error || "Erreur lors de l'enregistrement");
      }
    } catch (error) {
      setError("Erreur lors de l'enregistrement");
    } finally {
      setIsSaving(false);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
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
        className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[95vh] sm:max-h-[90vh] overflow-hidden mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-6 border-b border-gray-200">
          <div className="flex items-center justify-between gap-3">
            <div className="flex-1 min-w-0">
              <h3 className="text-lg sm:text-2xl font-bold text-black">
                Marquer comme effectué
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

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 overflow-y-auto max-h-[calc(95vh-200px)] sm:max-h-[calc(90vh-180px)]">
          <div className="space-y-5">
            {/* Date */}
            <div>
              <label className="block text-sm font-semibold text-black mb-2">
                Date d&apos;exécution <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={completedAt}
                onChange={(e) => setCompletedAt(e.target.value)}
                required
                max={new Date().toISOString().split("T")[0]}
                className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange focus:border-transparent outline-none"
              />
            </div>

            {/* Kilométrage */}
            <div>
              <label className="block text-sm font-semibold text-black mb-2">
                Kilométrage
                <span className="text-gray-500 font-normal ml-1">
                  (recommandé)
                </span>
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={mileageAtCompletion}
                  onChange={(e) => setMileageAtCompletion(e.target.value)}
                  placeholder="Ex: 45000"
                  min="0"
                  className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange focus:border-transparent outline-none"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-500">
                  km
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                💡 Le kilométrage sera ajouté à l&apos;historique de votre
                véhicule
              </p>
            </div>

            {/* Coût */}
            <div>
              <label className="block text-sm font-semibold text-black mb-2">
                Coût
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={cost}
                  onChange={(e) => setCost(e.target.value)}
                  placeholder="Ex: 150"
                  min="0"
                  step="0.01"
                  className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange focus:border-transparent outline-none"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-500">
                  €
                </span>
              </div>
            </div>

            {/* Lieu */}
            <div>
              <label className="block text-sm font-semibold text-black mb-2">
                Lieu
              </label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Ex: Garage Martin, Domicile..."
                className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange focus:border-transparent outline-none"
              />
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm font-semibold text-black mb-2">
                Notes
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Détails de l'intervention, pièces remplacées, observations..."
                rows={4}
                className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange focus:border-transparent outline-none resize-none"
              />
            </div>

            {/* Pièces jointes */}
            <div>
              <label className="block text-sm font-semibold text-black mb-2">
                Pièces jointes
              </label>
              <div className="space-y-3">
                {/* Upload button */}
                <label className="flex items-center justify-center gap-2 px-4 py-3 bg-gray-50 border-2 border-dashed border-gray-300 rounded-xl hover:bg-gray-100 hover:border-orange transition-all cursor-pointer">
                  <svg
                    className="w-5 h-5 text-gray-500"
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
                  <span className="text-sm font-medium text-gray-700">
                    {isUploading ? "Upload en cours..." : "Ajouter des fichiers"}
                  </span>
                  <input
                    type="file"
                    multiple
                    accept="image/*,.pdf"
                    onChange={handleFileUpload}
                    disabled={isUploading}
                    className="hidden"
                  />
                </label>

                {/* Attached files */}
                {attachments.length > 0 && (
                  <div className="space-y-2">
                    {attachments.map((attachment, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl"
                      >
                        <div className="w-10 h-10 bg-orange/10 rounded-lg flex items-center justify-center flex-shrink-0">
                          {attachment.contentType.startsWith("image/") ? (
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
                                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                              />
                            </svg>
                          ) : (
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
                                d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                              />
                            </svg>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-black truncate">
                            {attachment.filename}
                          </p>
                          <p className="text-xs text-gray-500">
                            {formatFileSize(attachment.size)}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeAttachment(index)}
                          className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <svg
                            className="w-4 h-4 text-red-500"
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
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-xl">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}
        </form>

        {/* Footer */}
        <div className="p-4 sm:p-6 border-t border-gray-200 flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2 sm:gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isSaving}
            className="px-4 sm:px-6 py-2 text-gray-700 hover:bg-gray-100 font-semibold rounded-xl transition-colors disabled:opacity-50 text-sm sm:text-base"
          >
            Annuler
          </button>
          <button
            onClick={handleSubmit}
            disabled={isSaving || isUploading}
            className="px-4 sm:px-6 py-2 bg-gradient-to-r from-orange to-orange-light text-white font-bold rounded-xl hover:shadow-lg transition-all disabled:opacity-50 text-sm sm:text-base"
          >
            {isSaving ? "Enregistrement..." : "Valider"}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

