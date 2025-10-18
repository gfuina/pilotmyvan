"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import ImageUpload from "@/components/dashboard/ImageUpload";

interface Category {
  _id: string;
  name: string;
  level: number;
  children?: Category[];
}

interface Brand {
  _id: string;
  name: string;
  logo?: string;
}

interface Equipment {
  _id: string;
  name: string;
  description?: string;
  categoryId: string | { _id: string; name: string };
  vehicleBrands: Array<string | { _id: string; name: string }>;
  equipmentBrands: Array<string | { _id: string; name: string }>;
  photos: string[];
  manuals: Array<{
    title: string;
    url: string;
    isExternal: boolean;
  }>;
  notes?: string;
}

interface AddEquipmentModalProps {
  onClose: () => void;
  onSuccess: () => void;
  equipment?: Equipment | null;
  categories: Category[];
}

export default function AddEquipmentModal({
  onClose,
  onSuccess,
  equipment,
  categories,
}: AddEquipmentModalProps) {
  // Helper to extract IDs from brands (handle both populated and non-populated)
  const extractBrandIds = (brands: Array<string | { _id: string }> | undefined): string[] => {
    if (!brands) return [];
    return brands.map(brand => typeof brand === 'string' ? brand : brand._id);
  };

  // Helper to extract category ID (handle string, populated, or MongoDB native format)
  const extractCategoryId = (categoryId: string | { _id: string } | { $oid: string } | undefined): string => {
    if (!categoryId) return "";
    if (typeof categoryId === 'string') return categoryId;
    if ('_id' in categoryId) return categoryId._id;
    if ('$oid' in categoryId) return (categoryId as { $oid: string }).$oid;
    return "";
  };

  const [formData, setFormData] = useState({
    name: equipment?.name || "",
    description: equipment?.description || "",
    categoryId: extractCategoryId(equipment?.categoryId),
    notes: equipment?.notes || "",
  });

  const [selectedVehicleBrands, setSelectedVehicleBrands] = useState<string[]>(
    extractBrandIds(equipment?.vehicleBrands)
  );
  const [selectedEquipmentBrands, setSelectedEquipmentBrands] = useState<string[]>(
    extractBrandIds(equipment?.equipmentBrands)
  );
  const [photos, setPhotos] = useState<string[]>(equipment?.photos || []);
  const [manuals, setManuals] = useState<
    Array<{ title: string; url: string; isExternal: boolean }>
  >(equipment?.manuals || []);

  const [vehicleBrands, setVehicleBrands] = useState<Brand[]>([]);
  const [equipmentBrands, setEquipmentBrands] = useState<Brand[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  // Manual form
  const [manualTitle, setManualTitle] = useState("");
  const [manualUrl, setManualUrl] = useState("");
  const [isManualExternal, setIsManualExternal] = useState(true);
  const [isUploadingManual, setIsUploadingManual] = useState(false);

  useEffect(() => {
    fetchBrands();
  }, []);

  const fetchBrands = async () => {
    try {
      const [vehicleRes, equipmentRes] = await Promise.all([
        fetch("/api/admin/vehicle-brands"),
        fetch("/api/admin/equipment-brands"),
      ]);

      if (vehicleRes.ok) {
        const data = await vehicleRes.json();
        setVehicleBrands(data.brands);
      }

      if (equipmentRes.ok) {
        const data = await equipmentRes.json();
        setEquipmentBrands(data.brands);
      }
    } catch (error) {
      console.error("Error fetching brands:", error);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const toggleBrand = (brandId: string, type: "vehicle" | "equipment") => {
    if (type === "vehicle") {
      setSelectedVehicleBrands((prev) =>
        prev.includes(brandId)
          ? prev.filter((id) => id !== brandId)
          : [...prev, brandId]
      );
    } else {
      setSelectedEquipmentBrands((prev) =>
        prev.includes(brandId)
          ? prev.filter((id) => id !== brandId)
          : [...prev, brandId]
      );
    }
  };

  const handleManualFileUpload = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingManual(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/upload/manual", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        setManualUrl(data.url);
        setIsManualExternal(false);
      } else {
        alert("Erreur lors du téléchargement du fichier");
      }
    } catch (error) {
      alert("Erreur lors du téléchargement du fichier");
    } finally {
      setIsUploadingManual(false);
    }
  };

  const addManual = () => {
    if (!manualTitle.trim() || !manualUrl.trim()) {
      alert("Titre et URL/fichier requis");
      return;
    }

    setManuals([
      ...manuals,
      {
        title: manualTitle.trim(),
        url: manualUrl.trim(),
        isExternal: isManualExternal,
      },
    ]);

    // Reset form
    setManualTitle("");
    setManualUrl("");
    setIsManualExternal(true);
  };

  const removeManual = (index: number) => {
    setManuals(manuals.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      const url = equipment
        ? `/api/admin/equipments/${equipment._id}`
        : "/api/admin/equipments";

      const method = equipment ? "PATCH" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          vehicleBrands: selectedVehicleBrands,
          equipmentBrands: selectedEquipmentBrands,
          photos,
          manuals,
        }),
      });

      if (response.ok) {
        onSuccess();
      } else {
        const data = await response.json();
        setError(data.error || "Erreur lors de l'enregistrement");
      }
    } catch (error) {
      setError("Erreur lors de l'enregistrement");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Flatten categories for select
  const flattenCategories = (cats: Category[], depth = 0): Array<Category & { depth: number }> => {
    let result: Array<Category & { depth: number }> = [];
    for (const cat of cats) {
      result.push({ ...cat, depth });
      if (cat.children && cat.children.length > 0) {
        result = result.concat(flattenCategories(cat.children, depth + 1));
      }
    }
    return result;
  };

  const flatCategories = flattenCategories(categories);

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.2 }}
        className="bg-white rounded-3xl w-full max-w-5xl my-8 max-h-[90vh] flex flex-col overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 flex-shrink-0">
          <h2 className="text-2xl font-bold text-black">
            {equipment ? "Modifier l&apos;équipement" : "Nouvel équipement"}
          </h2>
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
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
          <div className="p-6 space-y-6 overflow-y-auto flex-1">
            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-2xl">
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            )}

            {/* Basic Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-black mb-2">
                  Nom de l&apos;équipement <span className="text-orange">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  placeholder="Ex: Webasto Air Top 2000"
                  className="w-full px-4 py-3 rounded-2xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-black mb-2">
                  Catégorie <span className="text-orange">*</span>
                </label>
                <select
                  name="categoryId"
                  value={formData.categoryId}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 rounded-2xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange focus:border-transparent"
                >
                  <option value="">Sélectionner une catégorie</option>
                  {flatCategories.map((cat) => (
                    <option key={cat._id} value={cat._id}>
                      {"  ".repeat(cat.depth)}
                      {cat.depth > 0 ? "└─ " : ""}
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-black mb-2">
                  Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={3}
                  placeholder="Description de l&apos;équipement..."
                  className="w-full px-4 py-3 rounded-2xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange focus:border-transparent resize-none"
                />
              </div>
            </div>

            {/* Vehicle Brands Multi-Select */}
            <div>
              <label className="block text-sm font-medium text-black mb-2">
                Marques de véhicules compatibles
              </label>
              <div className="flex flex-wrap gap-2">
                {vehicleBrands.map((brand) => (
                  <button
                    key={brand._id}
                    type="button"
                    onClick={() => toggleBrand(brand._id, "vehicle")}
                    className={`px-4 py-2 rounded-2xl font-medium transition-all duration-200 ${
                      selectedVehicleBrands.includes(brand._id)
                        ? "bg-orange text-white"
                        : "bg-gray-100 text-black hover:bg-gray-200"
                    }`}
                  >
                    {brand.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Equipment Brands Multi-Select */}
              <div>
                <label className="block text-sm font-medium text-black mb-2">
                  Marques d&apos;équipement
                </label>
              <div className="flex flex-wrap gap-2">
                {equipmentBrands.map((brand) => (
                  <button
                    key={brand._id}
                    type="button"
                    onClick={() => toggleBrand(brand._id, "equipment")}
                    className={`px-4 py-2 rounded-2xl font-medium transition-all duration-200 ${
                      selectedEquipmentBrands.includes(brand._id)
                        ? "bg-orange text-white"
                        : "bg-gray-100 text-black hover:bg-gray-200"
                    }`}
                  >
                    {brand.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Photos */}
            <div>
              <label className="block text-sm font-medium text-black mb-2">
                Photos
              </label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {photos.map((url, index) => (
                  <div key={index} className="relative aspect-square">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={url}
                      alt={`Photo ${index + 1}`}
                      className="w-full h-full object-cover rounded-2xl"
                    />
                    <button
                      type="button"
                      onClick={() => setPhotos(photos.filter((_, i) => i !== index))}
                      className="absolute top-2 right-2 p-1 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors"
                    >
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
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </button>
                  </div>
                ))}
                {photos.length < 10 && (
                  <ImageUpload
                    onUploadComplete={(url) => setPhotos([...photos, url])}
                    compact
                  />
                )}
              </div>
            </div>

            {/* Manuals */}
            <div>
              <label className="block text-sm font-medium text-black mb-2">
                Manuels & Documents
              </label>

              {/* Existing manuals */}
              {manuals.length > 0 && (
                <div className="space-y-2 mb-4">
                  {manuals.map((manual, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-2xl"
                    >
                      <div className="flex items-center gap-3 flex-1">
                        <svg
                          className="w-5 h-5 text-red-600"
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
                          <p className="font-medium text-black">{manual.title}</p>
                          <p className="text-xs text-gray">
                            {manual.isExternal ? "URL externe" : "Fichier uploadé"}
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeManual(index)}
                        className="p-2 hover:bg-red-50 text-red-600 rounded-lg transition-colors"
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
                  ))}
                </div>
              )}

              {/* Add manual form */}
              <div className="p-4 bg-gray-50 rounded-2xl space-y-3">
                <input
                  type="text"
                  value={manualTitle}
                  onChange={(e) => setManualTitle(e.target.value)}
                  placeholder="Titre du manuel"
                  className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange"
                />

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setIsManualExternal(true)}
                    className={`flex-1 px-4 py-2 rounded-xl font-medium transition-colors ${
                      isManualExternal
                        ? "bg-orange text-white"
                        : "bg-white text-black"
                    }`}
                  >
                    URL externe
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsManualExternal(false)}
                    className={`flex-1 px-4 py-2 rounded-xl font-medium transition-colors ${
                      !isManualExternal
                        ? "bg-orange text-white"
                        : "bg-white text-black"
                    }`}
                  >
                    Upload fichier
                  </button>
                </div>

                {isManualExternal ? (
                  <input
                    type="url"
                    value={manualUrl}
                    onChange={(e) => setManualUrl(e.target.value)}
                    placeholder="https://..."
                    className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange"
                  />
                ) : (
                  <div>
                    <input
                      type="file"
                      onChange={handleManualFileUpload}
                      accept=".pdf,.doc,.docx"
                      disabled={isUploadingManual}
                      className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange"
                    />
                    {isUploadingManual && (
                      <p className="text-sm text-gray mt-2">Upload en cours...</p>
                    )}
                  </div>
                )}

                <button
                  type="button"
                  onClick={addManual}
                  disabled={!manualTitle.trim() || !manualUrl.trim()}
                  className="w-full px-4 py-2 bg-orange text-white font-semibold rounded-xl hover:bg-orange-dark transition-colors disabled:opacity-50"
                >
                  Ajouter le manuel
                </button>
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm font-medium text-black mb-2">
                Notes
              </label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                rows={3}
                placeholder="Notes supplémentaires..."
                className="w-full px-4 py-3 rounded-2xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange focus:border-transparent resize-none"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-4 p-6 border-t border-gray-200 flex-shrink-0">
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
                : equipment
                ? "Mettre à jour"
                : "Créer l&apos;équipement"}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

