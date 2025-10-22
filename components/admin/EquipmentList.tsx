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
  const [indexingId, setIndexingId] = useState<string | null>(null);
  const [indexingAll, setIndexingAll] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  // Filtered equipments
  const filteredEquipments = equipments.filter((equipment) => {
    const searchLower = searchQuery.toLowerCase();
    return (
      equipment.name.toLowerCase().includes(searchLower) ||
      equipment.description?.toLowerCase().includes(searchLower) ||
      equipment.categoryId.name.toLowerCase().includes(searchLower) ||
      equipment.vehicleBrands.some((brand) =>
        brand.name.toLowerCase().includes(searchLower)
      ) ||
      equipment.equipmentBrands.some((brand) =>
        brand.name.toLowerCase().includes(searchLower)
      )
    );
  });

  // Pagination
  const totalPages = Math.ceil(filteredEquipments.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedEquipments = filteredEquipments.slice(
    startIndex,
    startIndex + itemsPerPage
  );

  // Reset to page 1 when search changes
  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    setCurrentPage(1);
  };

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

  const handleIndexManuals = async (equipmentId: string) => {
    if (!confirm("Indexer les manuels de cet équipement pour le chatbot IA ?")) {
      return;
    }

    setIndexingId(equipmentId);
    try {
      const response = await fetch(`/api/equipment/${equipmentId}/index-manuals`, {
        method: "POST",
      });

      if (response.ok) {
        const data = await response.json();
        alert(data.message || "Manuels indexés avec succès !");
      } else {
        const data = await response.json();
        alert(data.error || "Erreur lors de l'indexation");
      }
    } catch (error) {
      console.error("Error indexing manuals:", error);
      alert("Erreur lors de l'indexation");
    } finally {
      setIndexingId(null);
    }
  };

  const handleIndexAllManuals = async () => {
    const equipmentsWithManuals = equipments.filter(
      (eq) => eq.manuals && eq.manuals.length > 0
    );

    if (equipmentsWithManuals.length === 0) {
      alert("Aucun équipement avec manuels trouvé");
      return;
    }

    if (
      !confirm(
        `Indexer tous les manuels de ${equipmentsWithManuals.length} équipement(s) ?\n\nCela peut prendre plusieurs minutes.`
      )
    ) {
      return;
    }

    setIndexingAll(true);
    try {
      const response = await fetch("/api/admin/equipments/index-all-manuals", {
        method: "POST",
      });

      if (response.ok) {
        const data = await response.json();
        const message = [
          data.message,
          `Total: ${data.totalChunks} chunks créés`,
          data.errors && data.errors.length > 0
            ? `\n\nErreurs:\n${data.errors.map((e: any) => `- ${e.equipmentName}: ${e.error}`).join("\n")}`
            : "",
        ]
          .filter(Boolean)
          .join("\n");
        alert(message);
      } else {
        const data = await response.json();
        alert(data.error || "Erreur lors de l'indexation globale");
      }
    } catch (error) {
      console.error("Error indexing all manuals:", error);
      alert("Erreur lors de l'indexation globale");
    } finally {
      setIndexingAll(false);
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
            {filteredEquipments.length !== equipments.length && (
              <span>{filteredEquipments.length} résultat(s) • </span>
            )}
            Gérez les équipements et leurs manuels
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleIndexAllManuals}
            disabled={indexingAll}
            className="px-4 py-3 bg-green-600 hover:bg-green-700 text-white font-bold rounded-2xl hover:shadow-lg transition-all duration-300 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            title="Indexer tous les manuels pour le chatbot IA"
          >
            {indexingAll ? (
              <>
                <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                <span className="hidden sm:inline">Indexation...</span>
              </>
            ) : (
              <>
                <span className="text-lg">🤖</span>
                <span className="hidden sm:inline">Tout indexer</span>
              </>
            )}
          </button>
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
      </div>

      {/* Search Bar */}
      <div className="mb-6">
        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder="Rechercher par nom, description, catégorie ou marque..."
            className="w-full px-5 py-3 pl-12 border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-orange transition-all"
          />
          <svg
            className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          {searchQuery && (
            <button
              onClick={() => handleSearchChange("")}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
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
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Equipment Grid */}
      {filteredEquipments.length === 0 ? (
        <div className="bg-white rounded-3xl shadow-lg p-12 text-center">
          <p className="text-gray text-lg mb-4">
            {searchQuery ? "Aucun équipement trouvé" : "Aucun équipement"}
          </p>
          {!searchQuery && (
            <button
              onClick={onAdd}
              className="px-6 py-3 bg-orange text-white font-semibold rounded-2xl hover:bg-orange-dark transition-colors"
            >
              Créer le premier équipement
            </button>
          )}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {paginatedEquipments.map((equipment) => {
              const isExpanded = expandedId === equipment._id;
              return (
                <div
                  key={equipment._id}
                  className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-shadow overflow-hidden flex flex-col"
                >
                  {/* Photo */}
                  <div className="relative w-full aspect-square bg-gray-100">
                    {equipment.photos[0] ? (
                      <Image
                        src={equipment.photos[0]}
                        alt={equipment.name}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center text-5xl">
                        🔧
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="p-4 flex-1 flex flex-col">
                    <h3 className="font-bold text-black mb-1 line-clamp-2 text-sm">
                      {equipment.name}
                    </h3>
                    <p className="text-xs text-gray mb-3">
                      {equipment.categoryId.name}
                    </p>

                    {/* Badges */}
                    <div className="flex flex-wrap gap-1 mb-3">
                      {equipment.vehicleBrands.length > 0 && (
                        <span className="px-2 py-0.5 bg-blue-50 text-blue-700 text-xs rounded-full">
                          🚐 {equipment.vehicleBrands.length}
                        </span>
                      )}
                      {equipment.equipmentBrands.length > 0 && (
                        <span className="px-2 py-0.5 bg-purple-50 text-purple-700 text-xs rounded-full">
                          🔧 {equipment.equipmentBrands.length}
                        </span>
                      )}
                      {equipment.manuals.length > 0 && (
                        <span className="px-2 py-0.5 bg-green-50 text-green-700 text-xs rounded-full">
                          📄 {equipment.manuals.length}
                        </span>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="grid grid-cols-2 gap-2 mt-auto">
                      <button
                        onClick={() => setMaintenancesEquipment(equipment)}
                        className="px-3 py-2 bg-orange text-white font-semibold rounded-xl hover:bg-orange-dark transition-colors text-xs"
                        title="Gérer les entretiens"
                      >
                        🔧 Entretiens
                      </button>
                      <button
                        onClick={() => toggleExpand(equipment._id)}
                        className="px-3 py-2 bg-gray-100 text-gray-700 font-semibold rounded-xl hover:bg-gray-200 transition-colors text-xs"
                        title="Plus d'infos"
                      >
                        {isExpanded ? "Moins" : "Plus"}
                      </button>
                    </div>

                    <div className="flex gap-2 mt-2">
                      <button
                        onClick={() => onEdit(equipment)}
                        className="flex-1 p-2 hover:bg-blue-50 text-blue-600 rounded-lg transition-colors"
                        title="Modifier"
                      >
                        <svg
                          className="w-4 h-4 mx-auto"
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
                        className="flex-1 p-2 hover:bg-red-50 text-red-600 rounded-lg transition-colors disabled:opacity-50"
                        title="Supprimer"
                      >
                        <svg
                          className="w-4 h-4 mx-auto"
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

                  {/* Expanded Details */}
                  {isExpanded && (
                    <div className="border-t border-gray-200 p-4 bg-gray-50 space-y-3 text-xs">
                      {equipment.description && (
                        <div>
                          <p className="text-gray">{equipment.description}</p>
                        </div>
                      )}

                      {equipment.vehicleBrands.length > 0 && (
                        <div>
                          <p className="font-semibold text-black mb-1">
                            Marques véhicules:
                          </p>
                          <div className="flex flex-wrap gap-1">
                            {equipment.vehicleBrands.map((brand) => (
                              <span
                                key={brand._id}
                                className="px-2 py-1 bg-blue-50 text-blue-700 rounded-full"
                              >
                                {brand.name}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {equipment.equipmentBrands.length > 0 && (
                        <div>
                          <p className="font-semibold text-black mb-1">
                            Marques équipement:
                          </p>
                          <div className="flex flex-wrap gap-1">
                            {equipment.equipmentBrands.map((brand) => (
                              <span
                                key={brand._id}
                                className="px-2 py-1 bg-purple-50 text-purple-700 rounded-full"
                              >
                                {brand.name}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {equipment.manuals.length > 0 && (
                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <p className="font-semibold text-black">
                              Manuels:
                            </p>
                            <button
                              onClick={() => handleIndexManuals(equipment._id)}
                              disabled={indexingId === equipment._id}
                              className="px-3 py-1 bg-green-50 hover:bg-green-100 text-green-600 rounded-lg transition-colors text-xs font-semibold disabled:opacity-50"
                              title="Indexer les manuels pour le chatbot IA"
                            >
                              {indexingId === equipment._id ? "⏳ Indexation..." : "🤖 Indexer"}
                            </button>
                          </div>
                          {equipment.manuals.map((manual, index) => (
                            <a
                              key={index}
                              href={manual.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="block text-blue-600 hover:underline truncate"
                            >
                              📄 {manual.title}
                            </a>
                          ))}
                        </div>
                      )}

                      {equipment.notes && (
                        <div>
                          <p className="font-semibold text-black mb-1">Notes:</p>
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

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-2 mt-8">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
              </button>

              <div className="flex gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                  (page) => {
                    // Show first, last, current, and adjacent pages
                    if (
                      page === 1 ||
                      page === totalPages ||
                      (page >= currentPage - 1 && page <= currentPage + 1)
                    ) {
                      return (
                        <button
                          key={page}
                          onClick={() => setCurrentPage(page)}
                          className={`px-4 py-2 rounded-xl font-semibold transition-colors ${
                            currentPage === page
                              ? "bg-orange text-white"
                              : "bg-white border border-gray-300 hover:bg-gray-50"
                          }`}
                        >
                          {page}
                        </button>
                      );
                    } else if (
                      page === currentPage - 2 ||
                      page === currentPage + 2
                    ) {
                      return (
                        <span key={page} className="px-2 py-2">
                          ...
                        </span>
                      );
                    }
                    return null;
                  }
                )}
              </div>

              <button
                onClick={() =>
                  setCurrentPage((p) => Math.min(totalPages, p + 1))
                }
                disabled={currentPage === totalPages}
                className="px-4 py-2 bg-white border border-gray-300 rounded-xl hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </button>
            </div>
          )}
        </>
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

