"use client";

import { useState } from "react";
import Image from "next/image";

interface Maintenance {
  _id: string;
  equipmentId?: string;
  name: string;
  type: string;
  priority: string;
  difficulty: string;
  recurrence: {
    time?: { value: number; unit: string };
    kilometers?: number;
  };
  conditions?: string[];
  description?: string;
  instructions?: string;
  photos?: string[];
  videos?: string[];
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
  isOfficial?: boolean;
  source?: string;
}

interface MaintenanceListProps {
  equipmentName: string;
  maintenances: Maintenance[];
  onRefresh: () => void;
  onAdd: () => void;
  onEdit: (maintenance: Maintenance) => void;
}

const TYPE_LABELS: Record<string, string> = {
  inspection: "Inspection",
  cleaning: "Nettoyage",
  replacement: "Remplacement",
  service: "Révision",
  lubrification: "Lubrification",
  adjustment: "Réglage",
  drain: "Vidange",
  test: "Test",
  calibration: "Calibration",
  other: "Autre",
};

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

export default function MaintenanceList({
  equipmentName,
  maintenances,
  onRefresh,
  onAdd,
  onEdit,
}: MaintenanceListProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer cet entretien ?")) {
      return;
    }

    setDeletingId(id);
    try {
      const response = await fetch(`/api/admin/maintenances/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        onRefresh();
      } else {
        const data = await response.json();
        alert(data.error || "Erreur lors de la suppression");
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

  const formatRecurrence = (recurrence: { time?: { value: number; unit: string }; kilometers?: number }) => {
    const parts = [];
    if (recurrence.time) {
      const unitLabels: Record<string, string> = { days: "jour", months: "mois", years: "an" };
      const unit = unitLabels[recurrence.time.unit] || recurrence.time.unit;
      
      // "mois" ne prend pas de "s" au pluriel
      const plural = (recurrence.time.value > 1 && unit !== "mois" && !unit.endsWith("s")) ? "s" : "";
      
      parts.push(`Tous les ${recurrence.time.value} ${unit}${plural}`);
    }
    if (recurrence.kilometers) {
      parts.push(`Tous les ${recurrence.kilometers.toLocaleString()} km`);
    }
    return parts.join(" • ");
  };

  return (
    <div>
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-xl font-bold text-black">
            Entretiens recommandés ({maintenances.length})
          </h3>
          <p className="text-sm text-gray">Pour: {equipmentName}</p>
        </div>
        <button
          onClick={onAdd}
          className="px-6 py-3 bg-gradient-to-r from-orange to-orange-light text-white font-bold rounded-2xl hover:shadow-lg transition-all duration-300 flex items-center gap-2"
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
              d="M12 4v16m8-8H4"
            />
          </svg>
          Nouvel entretien
        </button>
      </div>

      {/* Maintenance List */}
      {maintenances.length === 0 ? (
        <div className="bg-white rounded-3xl shadow-lg p-12 text-center">
          <p className="text-gray text-lg mb-4">Aucun entretien recommandé</p>
          <button
            onClick={onAdd}
            className="px-6 py-3 bg-orange text-white font-semibold rounded-2xl hover:bg-orange-dark transition-colors"
          >
            Créer le premier entretien
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {maintenances.map((maintenance) => {
            const isExpanded = expandedId === maintenance._id;
            return (
              <div
                key={maintenance._id}
                className="bg-white rounded-3xl shadow-lg overflow-hidden"
              >
                {/* Maintenance Header */}
                <div className="p-6">
                  <div className="flex items-start gap-4">
                    {/* Icon */}
                    <div
                      className={`w-16 h-16 rounded-2xl flex items-center justify-center text-2xl border-2 ${
                        PRIORITY_COLORS[maintenance.priority]
                      }`}
                    >
                      {PRIORITY_ICONS[maintenance.priority]}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4 mb-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="text-xl font-bold text-black">
                              {maintenance.name}
                            </h3>
                            {maintenance.isOfficial && (
                              <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-semibold rounded-full">
                                Officiel
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray mb-2">
                            {TYPE_LABELS[maintenance.type] || maintenance.type}
                          </p>
                          <p className="text-sm font-semibold text-orange">
                            {formatRecurrence(maintenance.recurrence)}
                          </p>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => toggleExpand(maintenance._id)}
                            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                            title={isExpanded ? "Réduire" : "Voir détails"}
                          >
                            <svg
                              className={`w-5 h-5 transition-transform ${
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
                            onClick={() => onEdit(maintenance)}
                            className="p-2 hover:bg-blue-50 text-blue-600 rounded-lg transition-colors"
                            title="Modifier"
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
                                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                              />
                            </svg>
                          </button>
                          <button
                            onClick={() => handleDelete(maintenance._id)}
                            disabled={deletingId === maintenance._id}
                            className="p-2 hover:bg-red-50 text-red-600 rounded-lg transition-colors disabled:opacity-50"
                            title="Supprimer"
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
                                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                              />
                            </svg>
                          </button>
                        </div>
                      </div>

                      {maintenance.description && (
                        <p className="text-sm text-gray mb-3 line-clamp-2">
                          {maintenance.description}
                        </p>
                      )}

                      {/* Quick info */}
                      <div className="flex flex-wrap gap-2">
                        {maintenance.estimatedDuration && maintenance.estimatedDuration > 0 && (
                          <span className="px-3 py-1 bg-blue-50 text-blue-700 text-xs font-semibold rounded-full">
                            ⏱️ {maintenance.estimatedDuration} min
                          </span>
                        )}
                        {maintenance.estimatedCost !== undefined && maintenance.estimatedCost !== null && (
                          <span className="px-3 py-1 bg-green-50 text-green-700 text-xs font-semibold rounded-full">
                            💰 {maintenance.estimatedCost === 0 ? "Gratuit" : `${maintenance.estimatedCost}€`}
                          </span>
                        )}
                        {maintenance.tags && maintenance.tags.map((tag) => (
                          <span
                            key={tag}
                            className="px-3 py-1 bg-purple-50 text-purple-700 text-xs font-semibold rounded-full"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Expanded Details */}
                {isExpanded && (
                  <div className="border-t border-gray-200 p-6 bg-gray-50 space-y-6">
                    {/* Instructions */}
                    {maintenance.instructions && (
                      <div>
                        <h4 className="font-semibold text-black mb-2 flex items-center gap-2">
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
                              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                            />
                          </svg>
                          Instructions
                        </h4>
                        <div className="prose prose-sm max-w-none bg-white p-4 rounded-2xl">
                          <pre className="whitespace-pre-wrap font-sans text-gray-700">
                            {maintenance.instructions}
                          </pre>
                        </div>
                      </div>
                    )}

                    {/* Conditions */}
                    {maintenance.conditions && maintenance.conditions.length > 0 && (
                      <div>
                        <h4 className="font-semibold text-black mb-2">
                          Conditions spéciales
                        </h4>
                        <div className="flex flex-wrap gap-2">
                          {maintenance.conditions.map((condition, idx) => (
                            <span
                              key={idx}
                              className="px-3 py-1 bg-yellow-50 text-yellow-700 text-sm rounded-full border border-yellow-200"
                            >
                              {condition}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Photos */}
                    {maintenance.photos && maintenance.photos.length > 0 && (
                      <div>
                        <h4 className="font-semibold text-black mb-3">
                          Photos ({maintenance.photos.length})
                        </h4>
                        <div className="grid grid-cols-4 md:grid-cols-6 gap-3">
                          {maintenance.photos.map((photo, index) => (
                            <div
                              key={index}
                              className="relative aspect-square rounded-xl overflow-hidden"
                            >
                              <Image
                                src={photo}
                                alt={`${maintenance.name} ${index + 1}`}
                                fill
                                className="object-cover"
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Videos */}
                    {maintenance.videos && maintenance.videos.length > 0 && (
                      <div>
                        <h4 className="font-semibold text-black mb-3">Vidéos</h4>
                        <div className="space-y-2">
                          {maintenance.videos.map((url, index) => (
                            <a
                              key={index}
                              href={url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-3 p-3 bg-white rounded-2xl hover:shadow-md transition-shadow"
                            >
                              <svg
                                className="w-6 h-6 text-red-600 flex-shrink-0"
                                fill="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path d="M10 16.5l6-4.5-6-4.5v9zM12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z" />
                              </svg>
                              <span className="flex-1 text-sm text-blue-600 truncate">
                                {url}
                              </span>
                              <svg
                                className="w-5 h-5 text-gray"
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

                    {/* Parts */}
                    {maintenance.parts && maintenance.parts.length > 0 && (
                      <div>
                        <h4 className="font-semibold text-black mb-3">
                          Pièces & Consommables
                        </h4>
                        <div className="space-y-2">
                          {maintenance.parts.map((part, index) => (
                            <div
                              key={index}
                              className="flex items-center justify-between p-3 bg-white rounded-2xl"
                            >
                              <div className="flex-1">
                                <p className="font-semibold text-black">{part.name}</p>
                                {part.reference && (
                                  <p className="text-xs text-gray">Réf: {part.reference}</p>
                                )}
                              </div>
                              <div className="text-right">
                                <p className="text-sm">Qté: {part.quantity}</p>
                                {part.estimatedCost && part.estimatedCost > 0 && (
                                  <p className="text-xs text-green-600 font-semibold">
                                    {part.estimatedCost}€
                                  </p>
                                )}
                              </div>
                              {part.purchaseLink && (
                                <a
                                  href={part.purchaseLink}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="ml-3 p-2 hover:bg-blue-50 text-blue-600 rounded-lg"
                                >
                                  🛒
                                </a>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Source */}
                    {maintenance.source && (
                      <div>
                        <h4 className="font-semibold text-black mb-2">Source</h4>
                        <a
                          href={maintenance.source}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline text-sm"
                        >
                          {maintenance.source}
                        </a>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

