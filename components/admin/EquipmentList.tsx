"use client";

import { useState } from "react";
import Image from "next/image";
import { AnimatePresence } from "framer-motion";
import EquipmentMaintenancesModal from "./EquipmentMaintenancesModal";

interface Equipment {
  _id: string;
  name: string;
  description?: string;
  categoryId: {
    _id: string;
    name: string;
    level: number;
  };
  vehicleBrands: Array<{
    _id: string;
    name: string;
    logo?: string;
  }>;
  equipmentBrands: Array<{
    _id: string;
    name: string;
    logo?: string;
  }>;
  photos: string[];
  manuals: Array<{
    title: string;
    url: string;
    isExternal: boolean;
  }>;
  notes?: string;
}

interface EquipmentListProps {
  equipments: Equipment[];
  onRefresh: () => void;
  onAdd: () => void;
  onEdit: (equipment: Equipment) => void;
}

export default function EquipmentList({
  equipments,
  onRefresh,
  onAdd,
  onEdit,
}: EquipmentListProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [maintenancesEquipment, setMaintenancesEquipment] = useState<Equipment | null>(null);

  const handleDelete = async (id: string) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer cet équipement ?")) {
      return;
    }

    setDeletingId(id);
    try {
      const response = await fetch(`/api/admin/equipments/${id}`, {
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

  return (
    <div>
      {/* Header with Add Button */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-black">
            Équipements ({equipments.length})
          </h2>
          <p className="text-gray text-sm">
            Gérez les équipements et leurs manuels
          </p>
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
          Nouvel équipement
        </button>
      </div>

      {/* Equipment List */}
      {equipments.length === 0 ? (
        <div className="bg-white rounded-3xl shadow-lg p-12 text-center">
          <p className="text-gray text-lg mb-4">Aucun équipement</p>
          <button
            onClick={onAdd}
            className="px-6 py-3 bg-orange text-white font-semibold rounded-2xl hover:bg-orange-dark transition-colors"
          >
            Créer le premier équipement
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {equipments.map((equipment) => {
            const isExpanded = expandedId === equipment._id;
            return (
              <div
                key={equipment._id}
                className="bg-white rounded-3xl shadow-lg overflow-hidden"
              >
                {/* Equipment Header */}
                <div className="p-6">
                  <div className="flex items-start gap-4">
                    {/* Photo */}
                    <div className="relative w-24 h-24 bg-gray-100 rounded-2xl overflow-hidden flex-shrink-0">
                      {equipment.photos[0] ? (
                        <Image
                          src={equipment.photos[0]}
                          alt={equipment.name}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center text-4xl">
                          🔧
                        </div>
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4 mb-2">
                        <div className="flex-1">
                          <h3 className="text-xl font-bold text-black mb-1">
                            {equipment.name}
                          </h3>
                          <p className="text-sm text-gray">
                            Catégorie: {equipment.categoryId.name}
                          </p>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setMaintenancesEquipment(equipment)}
                            className="px-4 py-2 bg-orange text-white font-semibold rounded-xl hover:bg-orange-dark transition-colors text-sm"
                            title="Gérer les entretiens"
                          >
                            🔧 Entretiens
                          </button>
                          <button
                            onClick={() => toggleExpand(equipment._id)}
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
                            onClick={() => onEdit(equipment)}
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
                            onClick={() => handleDelete(equipment._id)}
                            disabled={deletingId === equipment._id}
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

                      {equipment.description && (
                        <p className="text-sm text-gray mb-3 line-clamp-2">
                          {equipment.description}
                        </p>
                      )}

                      {/* Brands */}
                      <div className="flex flex-wrap gap-2">
                        {equipment.vehicleBrands.map((brand) => (
                          <span
                            key={brand._id}
                            className="px-3 py-1 bg-blue-50 text-blue-700 text-xs font-semibold rounded-full"
                          >
                            🚐 {brand.name}
                          </span>
                        ))}
                        {equipment.equipmentBrands.map((brand) => (
                          <span
                            key={brand._id}
                            className="px-3 py-1 bg-purple-50 text-purple-700 text-xs font-semibold rounded-full"
                          >
                            🔧 {brand.name}
                          </span>
                        ))}
                        {equipment.manuals.length > 0 && (
                          <span className="px-3 py-1 bg-green-50 text-green-700 text-xs font-semibold rounded-full">
                            📄 {equipment.manuals.length} manuel
                            {equipment.manuals.length > 1 ? "s" : ""}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Expanded Details */}
                {isExpanded && (
                  <div className="border-t border-gray-200 p-6 bg-gray-50 space-y-6">
                    {/* Photos */}
                    {equipment.photos.length > 0 && (
                      <div>
                        <h4 className="font-semibold text-black mb-3">
                          Photos ({equipment.photos.length})
                        </h4>
                        <div className="grid grid-cols-4 md:grid-cols-6 gap-3">
                          {equipment.photos.map((photo, index) => (
                            <div
                              key={index}
                              className="relative aspect-square rounded-xl overflow-hidden"
                            >
                              <Image
                                src={photo}
                                alt={`${equipment.name} ${index + 1}`}
                                fill
                                className="object-cover"
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Manuals */}
                    {equipment.manuals.length > 0 && (
                      <div>
                        <h4 className="font-semibold text-black mb-3">
                          Manuels & Documents
                        </h4>
                        <div className="space-y-2">
                          {equipment.manuals.map((manual, index) => (
                            <a
                              key={index}
                              href={manual.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-3 p-3 bg-white rounded-2xl hover:shadow-md transition-shadow"
                            >
                              <svg
                                className="w-6 h-6 text-red-600 flex-shrink-0"
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
                                <p className="font-medium text-black">
                                  {manual.title}
                                </p>
                                <p className="text-xs text-gray">
                                  {manual.isExternal
                                    ? "URL externe"
                                    : "Fichier uploadé"}
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
                    {equipment.notes && (
                      <div>
                        <h4 className="font-semibold text-black mb-2">Notes</h4>
                        <p className="text-gray whitespace-pre-wrap">
                          {equipment.notes}
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Maintenances Modal */}
      <AnimatePresence>
        {maintenancesEquipment && (
          <EquipmentMaintenancesModal
            equipment={maintenancesEquipment}
            onClose={() => setMaintenancesEquipment(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

