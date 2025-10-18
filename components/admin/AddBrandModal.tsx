"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import ImageUpload from "@/components/dashboard/ImageUpload";

interface Brand {
  _id: string;
  name: string;
  logo?: string;
}

interface AddBrandModalProps {
  type: "vehicle" | "equipment";
  existingBrand?: Brand | null;
  onClose: () => void;
  onSuccess: () => void;
}

export default function AddBrandModal({
  type,
  existingBrand,
  onClose,
  onSuccess,
}: AddBrandModalProps) {
  const [mode, setMode] = useState<"single" | "bulk">(
    existingBrand ? "single" : "single"
  );
  const [name, setName] = useState(existingBrand?.name || "");
  const [logo, setLogo] = useState(existingBrand?.logo || "");
  const [bulkNames, setBulkNames] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const isEdit = !!existingBrand;
  const title =
    type === "vehicle"
      ? isEdit
        ? "Modifier la marque de véhicule"
        : "Ajouter une marque de véhicule"
      : isEdit
      ? "Modifier la marque d&apos;équipement"
      : "Ajouter une marque d&apos;équipement";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      if (mode === "bulk") {
        // Bulk add mode
        const names = bulkNames
          .split("\n")
          .map((n) => n.trim())
          .filter((n) => n.length > 0);

        if (names.length === 0) {
          setError("Veuillez entrer au moins une marque");
          setIsSubmitting(false);
          return;
        }

        const endpoint =
          type === "vehicle"
            ? "/api/admin/vehicle-brands/bulk"
            : "/api/admin/equipment-brands/bulk";

        const response = await fetch(endpoint, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ names }),
        });

        if (response.ok) {
          const data = await response.json();
          if (data.failed && data.failed.length > 0) {
            setError(
              `${data.added} ajoutée(s), ${data.failed.length} échouée(s): ${data.failed.join(", ")}`
            );
            setTimeout(() => {
              onSuccess();
            }, 2000);
          } else {
            onSuccess();
          }
        } else {
          const data = await response.json();
          setError(data.error || "Erreur lors de l'enregistrement");
        }
      } else {
        // Single add/edit mode
        const endpoint =
          type === "vehicle"
            ? existingBrand
              ? `/api/admin/vehicle-brands/${existingBrand._id}`
              : "/api/admin/vehicle-brands"
            : existingBrand
            ? `/api/admin/equipment-brands/${existingBrand._id}`
            : "/api/admin/equipment-brands";

        const method = existingBrand ? "PATCH" : "POST";

        const response = await fetch(endpoint, {
          method,
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name,
            logo: logo || null,
          }),
        });

        if (response.ok) {
          onSuccess();
        } else {
          const data = await response.json();
          setError(data.error || "Erreur lors de l'enregistrement");
        }
      }
    } catch (error) {
      setError("Erreur lors de l'enregistrement");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.2 }}
        className="bg-white rounded-3xl w-full max-w-lg"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-black">{title}</h2>
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

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-2xl">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          {/* Mode Selector (only for add, not edit) */}
          {!existingBrand && (
            <div className="flex gap-2 p-1 bg-gray-100 rounded-2xl">
              <button
                type="button"
                onClick={() => setMode("single")}
                className={`flex-1 px-4 py-2 rounded-xl font-semibold transition-all ${
                  mode === "single"
                    ? "bg-white text-black shadow-sm"
                    : "text-gray hover:text-black"
                }`}
              >
                Une marque
              </button>
              <button
                type="button"
                onClick={() => setMode("bulk")}
                className={`flex-1 px-4 py-2 rounded-xl font-semibold transition-all ${
                  mode === "bulk"
                    ? "bg-white text-black shadow-sm"
                    : "text-gray hover:text-black"
                }`}
              >
                Plusieurs marques
              </button>
            </div>
          )}

          {mode === "bulk" ? (
            // Bulk mode
            <div>
              <label className="block text-sm font-medium text-black mb-2">
                Noms des marques <span className="text-orange">*</span>
              </label>
              <textarea
                value={bulkNames}
                onChange={(e) => setBulkNames(e.target.value)}
                required
                rows={10}
                placeholder="Une marque par ligne&#10;Ex:&#10;Mercedes-Benz&#10;Volkswagen&#10;Ford&#10;Renault"
                className="w-full px-4 py-3 rounded-2xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange focus:border-transparent resize-none font-mono text-sm"
              />
              <p className="text-xs text-gray mt-2">
                Entrez une marque par ligne. Les doublons et lignes vides seront
                ignorés.
              </p>
            </div>
          ) : (
            // Single mode
            <>
              <div>
                <label className="block text-sm font-medium text-black mb-2">
                  Nom de la marque <span className="text-orange">*</span>
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  placeholder="Ex: Mercedes-Benz"
                  className="w-full px-4 py-3 rounded-2xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-black mb-2">
                  Logo / Icône
                </label>
                <ImageUpload
                  onUploadComplete={(url) => setLogo(url)}
                  existingImage={logo}
                  onRemove={() => setLogo("")}
                />
                <p className="text-xs text-gray mt-2">
                  Format recommandé : PNG ou SVG transparent • Max 5MB
                </p>
              </div>
            </>
          )}

          {/* Actions */}
          <div className="flex gap-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="flex-1 px-6 py-3 bg-gray-100 text-black font-semibold rounded-2xl hover:bg-gray-200 transition-all duration-300 disabled:opacity-50"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-orange to-orange-light text-white font-bold rounded-2xl hover:shadow-lg hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:hover:scale-100"
            >
              {isSubmitting
                ? "Enregistrement..."
                : isEdit
                ? "Modifier"
                : "Ajouter"}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

