"use client";

import { useState } from "react";
import Image from "next/image";

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

interface VehicleEquipmentListProps {
  vehicleId: string;
  equipments: VehicleEquipment[];
  onRefresh: () => void;
}

export default function VehicleEquipmentList({
  vehicleId,
  equipments,
  onRefresh,
}: VehicleEquipmentListProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

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

  return (
    <div className="space-y-4">
      {equipments.map((item) => {
        const equipment = item.isCustom ? item.customData : item.equipmentId;
        const isExpanded = expandedId === item._id;

        if (!equipment) return null;

        return (
          <div
            key={item._id}
            className="bg-white rounded-2xl border-2 border-gray-200 overflow-hidden hover:border-orange transition-colors"
          >
            {/* Equipment Header */}
            <div className="p-4">
              <div className="flex items-start gap-4">
                {/* Photo */}
                <div className="relative w-20 h-20 bg-gray-100 rounded-xl overflow-hidden flex-shrink-0">
                  {(equipment.photos?.[0] || item.customData?.photos?.[0]) ? (
                    <Image
                      src={equipment.photos?.[0] || item.customData?.photos?.[0] || ""}
                      alt={equipment.name}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-3xl">
                      🔧
                    </div>
                  )}
                  {item.isCustom && (
                    <div className="absolute top-1 right-1 px-1.5 py-0.5 bg-blue-600 text-white text-xs font-bold rounded">
                      Custom
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-black text-lg mb-1">
                    {equipment.name}
                  </h4>
                  {!item.isCustom && item.equipmentId?.categoryId && (
                    <p className="text-sm text-gray mb-2">
                      {item.equipmentId.categoryId.name}
                    </p>
                  )}
                  {item.isCustom && item.customData?.brand && (
                    <p className="text-sm text-gray mb-2">
                      {item.customData.brand}
                      {item.customData.model && ` - ${item.customData.model}`}
                    </p>
                  )}
                  {equipment.description && (
                    <p className="text-sm text-gray line-clamp-2 mb-2">
                      {equipment.description}
                    </p>
                  )}
                  <div className="flex flex-wrap gap-2">
                    {!item.isCustom &&
                      item.equipmentId?.equipmentBrands.map((brand, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-1 bg-purple-50 text-purple-700 text-xs font-semibold rounded-full"
                        >
                          {brand.name}
                        </span>
                      ))}
                    {!item.isCustom && item.equipmentId?.manuals && item.equipmentId.manuals.length > 0 && (
                      <span className="px-2 py-1 bg-green-50 text-green-700 text-xs font-semibold rounded-full">
                        📄 {item.equipmentId.manuals.length} manuel
                        {item.equipmentId.manuals.length > 1 ? "s" : ""}
                      </span>
                    )}
                    {item.installDate && (
                      <span className="px-2 py-1 bg-blue-50 text-blue-700 text-xs font-semibold rounded-full">
                        📅 {new Date(item.installDate).toLocaleDateString("fr-FR")}
                      </span>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => toggleExpand(item._id)}
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
                    onClick={() => handleDelete(item._id)}
                    disabled={deletingId === item._id}
                    className="p-2 hover:bg-red-50 text-red-600 rounded-lg transition-colors disabled:opacity-50"
                    title="Retirer"
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
            </div>

            {/* Expanded Details */}
            {isExpanded && (
              <div className="border-t border-gray-200 p-4 bg-gray-50 space-y-4">
                {/* Manuals */}
                {!item.isCustom && item.equipmentId?.manuals && item.equipmentId.manuals.length > 0 && (
                  <div>
                    <h5 className="font-semibold text-black mb-2">
                      Manuels & Documents
                    </h5>
                    <div className="space-y-2">
                      {item.equipmentId.manuals.map((manual, idx) => (
                        <a
                          key={idx}
                          href={manual.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-3 p-3 bg-white rounded-xl hover:shadow-md transition-shadow"
                        >
                          <svg
                            className="w-5 h-5 text-red-600 flex-shrink-0"
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
                          <div className="flex-1">
                            <p className="font-medium text-black text-sm">
                              {manual.title}
                            </p>
                            <p className="text-xs text-gray">
                              {manual.isExternal ? "URL externe" : "Fichier"}
                            </p>
                          </div>
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

                {/* Notes */}
                {item.notes && (
                  <div>
                    <h5 className="font-semibold text-black mb-2">Notes</h5>
                    <p className="text-gray text-sm whitespace-pre-wrap bg-white p-3 rounded-xl">
                      {item.notes}
                    </p>
                  </div>
                )}

                {/* Dates */}
                <div className="flex gap-4 text-xs text-gray">
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
        );
      })}
    </div>
  );
}

