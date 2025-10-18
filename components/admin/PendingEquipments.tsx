"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { motion } from "framer-motion";

interface PendingEquipment {
  _id: string;
  name: string;
  description?: string;
  categoryId: {
    _id: string;
    name: string;
  };
  vehicleBrands: Array<{
    _id: string;
    name: string;
  }>;
  equipmentBrands: Array<{
    _id: string;
    name: string;
  }>;
  photos: string[];
  manuals: Array<{
    title: string;
    url: string;
    isExternal: boolean;
  }>;
  notes?: string;
  contributedBy: {
    _id: string;
    name: string;
    email: string;
  };
  createdAt: string;
}

export default function PendingEquipments() {
  const [equipments, setEquipments] = useState<PendingEquipment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [processingId, setProcessingId] = useState<string | null>(null);

  useEffect(() => {
    fetchPendingEquipments();
  }, []);

  const fetchPendingEquipments = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/admin/equipments/pending");
      if (response.ok) {
        const data = await response.json();
        setEquipments(data.equipments);
      }
    } catch (error) {
      console.error("Error fetching pending equipments:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleApprove = async (equipmentId: string) => {
    if (!confirm("Approuver cet équipement ? Il sera visible pour tous les utilisateurs.")) {
      return;
    }

    setProcessingId(equipmentId);
    try {
      const response = await fetch(`/api/admin/equipments/${equipmentId}/approve`, {
        method: "POST",
      });

      if (response.ok) {
        alert("Équipement approuvé avec succès !");
        fetchPendingEquipments();
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

  const handleReject = async (equipmentId: string) => {
    const reason = prompt("Raison du rejet (optionnel, usage interne) :");
    
    if (!confirm("Rejeter cet équipement ? Il restera visible uniquement pour son créateur.")) {
      return;
    }

    setProcessingId(equipmentId);
    try {
      const response = await fetch(`/api/admin/equipments/${equipmentId}/reject`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ reason }),
      });

      if (response.ok) {
        alert("Équipement rejeté");
        fetchPendingEquipments();
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

  if (isLoading) {
    return (
      <div className="bg-white rounded-3xl shadow-lg p-8">
        <h2 className="text-2xl font-bold text-black mb-6">
          Contributions utilisateurs en attente
        </h2>
        <div className="flex justify-center items-center py-12">
          <div className="w-10 h-10 border-4 border-orange border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  if (equipments.length === 0) {
    return (
      <div className="bg-white rounded-3xl shadow-lg p-8">
        <h2 className="text-2xl font-bold text-black mb-6">
          Contributions utilisateurs en attente
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
            Toutes les contributions utilisateurs ont été traitées
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
            Contributions utilisateurs en attente
          </h2>
          <p className="text-gray text-sm">
            {equipments.length} équipement{equipments.length > 1 ? "s" : ""} à valider
          </p>
        </div>
        <button
          onClick={fetchPendingEquipments}
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
        {equipments.map((equipment) => {
          const isExpanded = expandedId === equipment._id;
          const isProcessing = processingId === equipment._id;

          return (
            <motion.div
              key={equipment._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="border-2 border-orange/30 rounded-2xl overflow-hidden bg-orange/5"
            >
              {/* Header */}
              <div className="p-6">
                <div className="flex items-start gap-4">
                  {/* Photo */}
                  <div className="relative w-24 h-24 bg-gray-200 rounded-xl overflow-hidden flex-shrink-0">
                    {equipment.photos[0] ? (
                      <Image
                        src={equipment.photos[0]}
                        alt={equipment.name}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center text-3xl">
                        🔧
                      </div>
                    )}
                    <div className="absolute top-2 right-2 px-2 py-0.5 bg-orange text-white text-xs font-bold rounded">
                      NEW
                    </div>
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-xl font-bold text-black mb-2">
                      {equipment.name}
                    </h3>
                    <div className="flex flex-wrap gap-2 mb-3">
                      <span className="px-3 py-1 bg-purple-100 text-purple-700 text-xs font-semibold rounded-full">
                        {equipment.categoryId.name}
                      </span>
                      {equipment.vehicleBrands.length > 0 && (
                        <span className="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-semibold rounded-full">
                          {equipment.vehicleBrands.length} marque{equipment.vehicleBrands.length > 1 ? "s" : ""} véhicule
                        </span>
                      )}
                      {equipment.equipmentBrands.length > 0 && (
                        <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full">
                          {equipment.equipmentBrands.length} marque{equipment.equipmentBrands.length > 1 ? "s" : ""}
                        </span>
                      )}
                      {equipment.photos.length > 0 && (
                        <span className="px-3 py-1 bg-pink-100 text-pink-700 text-xs font-semibold rounded-full">
                          {equipment.photos.length} photo{equipment.photos.length > 1 ? "s" : ""}
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
                        Créé par <strong>{equipment.contributedBy.name}</strong> ({equipment.contributedBy.email})
                      </span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col gap-2">
                    <button
                      onClick={() => setExpandedId(isExpanded ? null : equipment._id)}
                      className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-black font-semibold rounded-xl transition-colors"
                    >
                      {isExpanded ? "Masquer" : "Voir détails"}
                    </button>
                    <button
                      onClick={() => handleApprove(equipment._id)}
                      disabled={isProcessing}
                      className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-xl transition-colors disabled:opacity-50"
                    >
                      ✅ Approuver
                    </button>
                    <button
                      onClick={() => handleReject(equipment._id)}
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
                  {equipment.description && (
                    <div>
                      <h4 className="text-sm font-bold text-black mb-2">Description</h4>
                      <p className="text-gray text-sm">{equipment.description}</p>
                    </div>
                  )}

                  {/* Photos */}
                  {equipment.photos.length > 0 && (
                    <div>
                      <h4 className="text-sm font-bold text-black mb-2">Photos ({equipment.photos.length})</h4>
                      <div className="grid grid-cols-4 gap-3">
                        {equipment.photos.map((photo, idx) => (
                          <div key={idx} className="relative aspect-square rounded-lg overflow-hidden bg-gray-100">
                            <Image src={photo} alt={`Photo ${idx + 1}`} fill className="object-cover" />
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Vehicle Brands */}
                  {equipment.vehicleBrands.length > 0 && (
                    <div>
                      <h4 className="text-sm font-bold text-black mb-2">Marques de véhicule compatibles</h4>
                      <div className="flex flex-wrap gap-2">
                        {equipment.vehicleBrands.map((brand) => (
                          <span key={brand._id} className="px-3 py-1 bg-blue-50 text-blue-700 text-sm font-medium rounded-full">
                            {brand.name}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Equipment Brands */}
                  {equipment.equipmentBrands.length > 0 && (
                    <div>
                      <h4 className="text-sm font-bold text-black mb-2">Marques d&apos;équipement</h4>
                      <div className="flex flex-wrap gap-2">
                        {equipment.equipmentBrands.map((brand) => (
                          <span key={brand._id} className="px-3 py-1 bg-green-50 text-green-700 text-sm font-medium rounded-full">
                            {brand.name}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Manuals */}
                  {equipment.manuals.length > 0 && (
                    <div>
                      <h4 className="text-sm font-bold text-black mb-2">Manuels & Documents ({equipment.manuals.length})</h4>
                      <div className="space-y-2">
                        {equipment.manuals.map((manual, idx) => (
                          <a
                            key={idx}
                            href={manual.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors"
                          >
                            <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                            </svg>
                            <div className="flex-1">
                              <p className="font-medium text-black text-sm">{manual.title}</p>
                              <p className="text-xs text-gray">{manual.isExternal ? "Lien externe" : "Fichier"}</p>
                            </div>
                            <svg className="w-5 h-5 text-gray" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                            </svg>
                          </a>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Notes */}
                  {equipment.notes && (
                    <div>
                      <h4 className="text-sm font-bold text-black mb-2">Notes additionnelles</h4>
                      <p className="text-gray text-sm whitespace-pre-wrap">{equipment.notes}</p>
                    </div>
                  )}

                  {/* Metadata */}
                  <div className="pt-4 border-t border-gray-200">
                    <p className="text-xs text-gray">
                      Créé le {new Date(equipment.createdAt).toLocaleDateString("fr-FR")} à{" "}
                      {new Date(equipment.createdAt).toLocaleTimeString("fr-FR")}
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

