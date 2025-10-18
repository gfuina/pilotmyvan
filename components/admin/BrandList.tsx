"use client";

import { useState } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";

interface Brand {
  _id: string;
  name: string;
  logo?: string;
}

interface BrandListProps {
  brands: Brand[];
  type: "vehicle" | "equipment";
  onRefresh: () => void;
  onAdd: () => void;
  onEdit: (brand: Brand) => void;
}

export default function BrandList({
  brands,
  type,
  onRefresh,
  onAdd,
  onEdit,
}: BrandListProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      const endpoint =
        type === "vehicle"
          ? `/api/admin/vehicle-brands/${id}`
          : `/api/admin/equipment-brands/${id}`;

      const response = await fetch(endpoint, {
        method: "DELETE",
      });

      if (response.ok) {
        onRefresh();
        setConfirmDeleteId(null);
      } else {
        alert("Erreur lors de la suppression");
      }
    } catch (error) {
      alert("Erreur lors de la suppression");
    } finally {
      setDeletingId(null);
    }
  };

  const title =
    type === "vehicle" ? "Marques de véhicules" : "Marques d&apos;équipements";
  const emptyText =
    type === "vehicle"
      ? "Aucune marque de véhicule"
      : "Aucune marque d&apos;équipement";

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-black">{title}</h2>
        <button
          onClick={onAdd}
          className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-orange to-orange-light text-white font-bold rounded-2xl hover:shadow-lg hover:scale-105 transition-all duration-300"
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
          Ajouter
        </button>
      </div>

      {brands.length === 0 ? (
        <div className="bg-white rounded-3xl shadow-lg p-12 text-center">
          <p className="text-gray">{emptyText}</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {brands.map((brand) => (
            <motion.div
              key={brand._id}
              layout
              className="bg-white rounded-3xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 group relative"
            >
              {/* Logo */}
              <div className="aspect-square w-full mb-4 rounded-2xl bg-gray-50 flex items-center justify-center overflow-hidden">
                {brand.logo ? (
                  <div className="relative w-full h-full">
                    <Image
                      src={brand.logo}
                      alt={brand.name}
                      fill
                      className="object-contain p-4"
                    />
                  </div>
                ) : (
                  <span className="text-4xl text-gray-300">🏷️</span>
                )}
              </div>

              {/* Name */}
              <h3 className="text-center font-semibold text-black mb-4 line-clamp-2">
                {brand.name}
              </h3>

              {/* Actions */}
              <div className="flex gap-2">
                <button
                  onClick={() => onEdit(brand)}
                  className="flex-1 px-3 py-2 bg-gray-100 hover:bg-gray-200 text-black text-sm font-semibold rounded-2xl transition-all duration-300"
                >
                  Modifier
                </button>
                <button
                  onClick={() => setConfirmDeleteId(brand._id)}
                  disabled={deletingId === brand._id}
                  className="px-3 py-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-2xl transition-all duration-300 disabled:opacity-50"
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

              {/* Delete Confirmation Modal */}
              <AnimatePresence>
                {confirmDeleteId === brand._id && (
                  <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="bg-white rounded-3xl p-6 max-w-sm w-full"
                    >
                      <h3 className="text-xl font-bold text-black mb-4">
                        Supprimer {brand.name} ?
                      </h3>
                      <p className="text-gray mb-6">
                        Cette action est irréversible.
                      </p>
                      <div className="flex gap-3">
                        <button
                          onClick={() => setConfirmDeleteId(null)}
                          disabled={deletingId === brand._id}
                          className="flex-1 px-4 py-2 bg-gray-100 text-black font-semibold rounded-2xl hover:bg-gray-200 transition-all duration-300 disabled:opacity-50"
                        >
                          Annuler
                        </button>
                        <button
                          onClick={() => handleDelete(brand._id)}
                          disabled={deletingId === brand._id}
                          className="flex-1 px-4 py-2 bg-red-600 text-white font-semibold rounded-2xl hover:bg-red-700 transition-all duration-300 disabled:opacity-50"
                        >
                          {deletingId === brand._id
                            ? "Suppression..."
                            : "Supprimer"}
                        </button>
                      </div>
                    </motion.div>
                  </div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}

