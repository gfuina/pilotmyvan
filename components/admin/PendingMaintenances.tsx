"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { motion } from "framer-motion";

interface PendingMaintenance {
  _id: string;
  name: string;
  type: string;
  priority: string;
  difficulty: string;
  recurrence: {
    time?: {
      value: number;
      unit: string;
    };
    kilometers?: number;
  };
  conditions?: string[];
  description?: string;
  instructions?: string;
  photos?: string[];
  parts?: Array<{
    name: string;
    reference?: string;
    quantity: number;
    estimatedCost?: number;
    purchaseLink?: string;
  }>;
  estimatedDuration?: number;
  estimatedCost?: number;
  tags?: string[];
  equipmentId: {
    _id: string;
    name: string;
  };
  contributedBy: {
    _id: string;
    name: string;
    email: string;
  };
  createdAt: string;
}

const TYPE_LABELS: Record<string, string> = {
  inspection: "🔍 Inspection",
  cleaning: "🧼 Nettoyage",
  replacement: "🔄 Remplacement",
  service: "🔧 Révision",
  lubrication: "💧 Lubrification",
  adjustment: "⚙️ Réglage",
  drain: "🛢️ Vidange",
  test: "🧪 Test",
  calibration: "📏 Calibration",
  other: "📋 Autre",
};

const PRIORITY_LABELS: Record<string, { label: string; color: string }> = {
  critical: { label: "🔴 Critique", color: "bg-red-100 text-red-700" },
  important: { label: "🟠 Important", color: "bg-orange-100 text-orange-700" },
  recommended: { label: "🟡 Recommandé", color: "bg-yellow-100 text-yellow-700" },
  optional: { label: "⚪ Optionnel", color: "bg-gray-100 text-gray-700" },
};

const DIFFICULTY_LABELS: Record<string, string> = {
  easy: "😊 Facile",
  intermediate: "🤔 Intermédiaire",
  advanced: "😰 Avancé",
  professional: "👨‍🔧 Professionnel",
};

export default function PendingMaintenances() {
  const [maintenances, setMaintenances] = useState<PendingMaintenance[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [processingId, setProcessingId] = useState<string | null>(null);

  useEffect(() => {
    fetchPendingMaintenances();
  }, []);

  const fetchPendingMaintenances = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/admin/maintenances/pending");
      if (response.ok) {
        const data = await response.json();
        setMaintenances(data.maintenances);
      }
    } catch (error) {
      console.error("Error fetching pending maintenances:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleApprove = async (maintenanceId: string) => {
    if (!confirm("Approuver cet entretien ? Il sera visible pour tous les utilisateurs.")) {
      return;
    }

    setProcessingId(maintenanceId);
    try {
      const response = await fetch(`/api/admin/maintenances/${maintenanceId}/approve`, {
        method: "POST",
      });

      if (response.ok) {
        alert("Entretien approuvé avec succès !");
        fetchPendingMaintenances();
      } else {
        const data = await response.json();
        alert(data.error || "Erreur lors de l'approbation");
      }
    } catch (error) {
      alert("Erreur lors de l'approbation");
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (maintenanceId: string) => {
    if (!confirm("Rejeter cet entretien ? Il restera visible uniquement pour son créateur.")) {
      return;
    }

    setProcessingId(maintenanceId);
    try {
      const response = await fetch(`/api/admin/maintenances/${maintenanceId}/reject`, {
        method: "POST",
      });

      if (response.ok) {
        alert("Entretien rejeté");
        fetchPendingMaintenances();
      } else {
        const data = await response.json();
        alert(data.error || "Erreur lors du rejet");
      }
    } catch (error) {
      alert("Erreur lors du rejet");
    } finally {
      setProcessingId(null);
    }
  };

  const formatRecurrence = (recurrence: { time?: { value: number; unit: string }; kilometers?: number }) => {
    const parts = [];
    if (recurrence?.time) {
      const unitLabels: Record<string, string> = { days: "jour", months: "mois", years: "an" };
      const unit = unitLabels[recurrence.time.unit] || recurrence.time.unit;
      const plural =
        recurrence.time.value > 1 && unit !== "mois" && !unit.endsWith("s") ? "s" : "";
      parts.push(`Tous les ${recurrence.time.value} ${unit}${plural}`);
    }
    if (recurrence?.kilometers) {
      parts.push(`Tous les ${recurrence.kilometers.toLocaleString()} km`);
    }
    return parts.join(" • ") || "Aucune récurrence";
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-3xl shadow-lg p-8">
        <h2 className="text-2xl font-bold text-black mb-6">
          Contributions entretiens en attente
        </h2>
        <div className="flex justify-center items-center py-12">
          <div className="w-10 h-10 border-4 border-orange border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  if (maintenances.length === 0) {
    return (
      <div className="bg-white rounded-3xl shadow-lg p-8">
        <h2 className="text-2xl font-bold text-black mb-6">
          Contributions entretiens en attente
        </h2>
        <div className="text-center py-12 bg-gray-50 rounded-2xl">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-8 h-8 text-green-600"
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
          <h3 className="text-lg font-semibold text-black mb-2">
            Aucune contribution en attente
          </h3>
          <p className="text-gray text-sm">
            Toutes les contributions d&apos;entretiens ont été traitées
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-3xl shadow-lg p-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-black">
            Contributions entretiens en attente
          </h2>
          <p className="text-gray text-sm">
            {maintenances.length} entretien{maintenances.length > 1 ? "s" : ""} à valider
          </p>
        </div>
        <button
          onClick={fetchPendingMaintenances}
          className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-black font-semibold rounded-xl transition-colors"
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
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
        </button>
      </div>

      <div className="space-y-4">
        {maintenances.map((maintenance) => {
          const isExpanded = expandedId === maintenance._id;
          const isProcessing = processingId === maintenance._id;

          return (
            <motion.div
              key={maintenance._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="border-2 border-orange/30 rounded-2xl overflow-hidden bg-orange/5"
            >
              {/* Header */}
              <div className="p-6">
                <div className="flex items-start gap-4">
                  {/* Priority Icon */}
                  <div
                    className={`w-16 h-16 rounded-xl flex items-center justify-center text-3xl flex-shrink-0 border-2 ${
                      PRIORITY_LABELS[maintenance.priority]?.color || "bg-gray-100"
                    }`}
                  >
                    {PRIORITY_LABELS[maintenance.priority]?.label.split(" ")[0] || "⚪"}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-xl font-bold text-black mb-2">
                      {maintenance.name}
                    </h3>
                    <p className="text-sm text-gray mb-3">
                      Pour: <strong>{maintenance.equipmentId.name}</strong>
                    </p>
                    <div className="flex flex-wrap gap-2 mb-3">
                      <span className="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-semibold rounded-full">
                        {TYPE_LABELS[maintenance.type] || maintenance.type}
                      </span>
                      <span
                        className={`px-3 py-1 text-xs font-semibold rounded-full ${
                          PRIORITY_LABELS[maintenance.priority]?.color || "bg-gray-100"
                        }`}
                      >
                        {PRIORITY_LABELS[maintenance.priority]?.label || maintenance.priority}
                      </span>
                      <span className="px-3 py-1 bg-purple-100 text-purple-700 text-xs font-semibold rounded-full">
                        {DIFFICULTY_LABELS[maintenance.difficulty] || maintenance.difficulty}
                      </span>
                      <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full">
                        {formatRecurrence(maintenance.recurrence)}
                      </span>
                      {maintenance.photos && maintenance.photos.length > 0 && (
                        <span className="px-3 py-1 bg-pink-100 text-pink-700 text-xs font-semibold rounded-full">
                          {maintenance.photos.length} photo{maintenance.photos.length > 1 ? "s" : ""}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray">
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
                          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                        />
                      </svg>
                      <span>
                        Créé par <strong>{maintenance.contributedBy.name}</strong> ({maintenance.contributedBy.email})
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col gap-2">
                    <button
                      onClick={() => setExpandedId(isExpanded ? null : maintenance._id)}
                      className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-black font-semibold rounded-xl transition-colors"
                    >
                      {isExpanded ? "Masquer" : "Voir détails"}
                    </button>
                    <button
                      onClick={() => handleApprove(maintenance._id)}
                      disabled={isProcessing}
                      className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-xl transition-colors disabled:opacity-50"
                    >
                      ✅ Approuver
                    </button>
                    <button
                      onClick={() => handleReject(maintenance._id)}
                      disabled={isProcessing}
                      className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-xl transition-colors disabled:opacity-50"
                    >
                      ❌ Rejeter
                    </button>
                  </div>
                </div>
              </div>

              {/* Expanded Details */}
              {isExpanded && (
                <div className="border-t border-orange/30 p-6 bg-white space-y-6">
                  {/* Description */}
                  {maintenance.description && (
                    <div>
                      <h4 className="text-sm font-bold text-black mb-2">Description</h4>
                      <p className="text-gray text-sm">{maintenance.description}</p>
                    </div>
                  )}

                  {/* Instructions */}
                  {maintenance.instructions && (
                    <div>
                      <h4 className="text-sm font-bold text-black mb-2">Instructions</h4>
                      <p className="text-gray text-sm whitespace-pre-wrap">{maintenance.instructions}</p>
                    </div>
                  )}

                  {/* Photos */}
                  {maintenance.photos && maintenance.photos.length > 0 && (
                    <div>
                      <h4 className="text-sm font-bold text-black mb-2">Photos ({maintenance.photos.length})</h4>
                      <div className="grid grid-cols-4 gap-3">
                        {maintenance.photos.map((photo, idx) => (
                          <div key={idx} className="relative aspect-square rounded-lg overflow-hidden bg-gray-100">
                            <Image src={photo} alt={`Photo ${idx + 1}`} fill className="object-cover" />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Conditions */}
                  {maintenance.conditions && maintenance.conditions.length > 0 && (
                    <div>
                      <h4 className="text-sm font-bold text-black mb-2">Conditions spéciales</h4>
                      <div className="flex flex-wrap gap-2">
                        {maintenance.conditions.map((cond, idx) => (
                          <span key={idx} className="px-3 py-1 bg-purple-50 text-purple-700 text-sm font-medium rounded-full">
                            {cond}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Parts */}
                  {maintenance.parts && maintenance.parts.length > 0 && (
                    <div>
                      <h4 className="text-sm font-bold text-black mb-2">Pièces & Consommables ({maintenance.parts.length})</h4>
                      <div className="space-y-2">
                        {maintenance.parts.map((part, idx) => (
                          <div key={idx} className="p-3 bg-gray-50 rounded-xl">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <p className="font-medium text-black text-sm">{part.name}</p>
                                <div className="text-xs text-gray mt-1">
                                  {part.reference && <span className="mr-2">Réf: {part.reference}</span>}
                                  <span className="mr-2">Qté: {part.quantity}</span>
                                  {part.estimatedCost !== undefined && <span>~{part.estimatedCost}€</span>}
                                </div>
                              </div>
                              {part.purchaseLink && (
                                <a
                                  href={part.purchaseLink}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-blue-600 hover:text-blue-700 text-xs underline"
                                >
                                  Lien d&apos;achat
                                </a>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Estimations */}
                  {(maintenance.estimatedDuration || maintenance.estimatedCost !== undefined) && (
                    <div>
                      <h4 className="text-sm font-bold text-black mb-2">Estimations</h4>
                      <div className="flex gap-4">
                        {maintenance.estimatedDuration && (
                          <span className="px-3 py-1 bg-orange-50 text-orange-700 text-sm font-medium rounded-full">
                            ⏱️ {maintenance.estimatedDuration} min
                          </span>
                        )}
                        {maintenance.estimatedCost !== undefined && (
                          <span className="px-3 py-1 bg-green-50 text-green-700 text-sm font-medium rounded-full">
                            💰 {maintenance.estimatedCost === 0 ? "Gratuit" : `${maintenance.estimatedCost}€`}
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Tags */}
                  {maintenance.tags && maintenance.tags.length > 0 && (
                    <div>
                      <h4 className="text-sm font-bold text-black mb-2">Tags</h4>
                      <div className="flex flex-wrap gap-2">
                        {maintenance.tags.map((tag, idx) => (
                          <span key={idx} className="px-3 py-1 bg-blue-50 text-blue-700 text-sm font-medium rounded-full">
                            #{tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Metadata */}
                  <div className="pt-4 border-t border-gray-200">
                    <p className="text-xs text-gray">
                      Créé le {new Date(maintenance.createdAt).toLocaleDateString("fr-FR")} à{" "}
                      {new Date(maintenance.createdAt).toLocaleTimeString("fr-FR")}
                    </p>
                  </div>
                </div>
              )}
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

