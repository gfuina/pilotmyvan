"use client";

import React, { useState, useEffect } from "react";
import MultiImageUpload from "./MultiImageUpload";

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

interface EquipmentFormProps {
  onSubmit: (data: EquipmentFormData) => Promise<void>;
  isSubmitting: boolean;
}

export interface EquipmentFormData {
  name: string;
  description: string;
  categoryId: string;
  vehicleBrands: string[];
  equipmentBrands: string[];
  photos: string[];
  manuals: Array<{
    title: string;
    url: string;
    isExternal: boolean;
  }>;
  notes: string;
}

export default function EquipmentForm({
  onSubmit,
  isSubmitting,
}: EquipmentFormProps) {
  const [formData, setFormData] = useState<EquipmentFormData>({
    name: "",
    description: "",
    categoryId: "",
    vehicleBrands: [],
    equipmentBrands: [],
    photos: [],
    manuals: [],
    notes: "",
  });

  const [categories, setCategories] = useState<Category[]>([]);
  const [vehicleBrands, setVehicleBrands] = useState<Brand[]>([]);
  const [equipmentBrands, setEquipmentBrands] = useState<Brand[]>([]);
  const [error, setError] = useState("");

  // Manual form
  const [manualTitle, setManualTitle] = useState("");
  const [manualUrl, setManualUrl] = useState("");
  const [isManualExternal, setIsManualExternal] = useState(true);
  const [isUploadingManual, setIsUploadingManual] = useState(false);
  const [isBrandSpecific, setIsBrandSpecific] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [catRes, vhRes, eqRes] = await Promise.all([
        fetch("/api/admin/categories"),
        fetch("/api/vehicle-brands"),
        fetch("/api/admin/equipment-brands"),
      ]);

      if (catRes.ok) {
        const data = await catRes.json();
        setCategories(data.categories);
      }

      if (vhRes.ok) {
        const data = await vhRes.json();
        setVehicleBrands(data.brands);
      }

      if (eqRes.ok) {
        const data = await eqRes.json();
        setEquipmentBrands(data.brands);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const renderCategoryOptions = (cats: Category[], level = 0): React.ReactElement[] => {
    const options: React.ReactElement[] = [];
    cats.forEach((cat) => {
      let prefix = "";
      if (level === 0) {
        prefix = "📁 ";
      } else if (level === 1) {
        prefix = "  └─ ";
      } else {
        prefix = "    " + "  ".repeat(level - 1) + "└─ ";
      }
      
      options.push(
        <option key={cat._id} value={cat._id}>
          {prefix}{cat.name}
        </option>
      );
      if (cat.children && cat.children.length > 0) {
        options.push(...renderCategoryOptions(cat.children, level + 1));
      }
    });
    return options;
  };

  const toggleBrand = (brandId: string, type: "vehicle" | "equipment") => {
    if (type === "vehicle") {
      setFormData((prev) => ({
        ...prev,
        vehicleBrands: prev.vehicleBrands.includes(brandId)
          ? prev.vehicleBrands.filter((id) => id !== brandId)
          : [...prev.vehicleBrands, brandId],
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        equipmentBrands: prev.equipmentBrands.includes(brandId)
          ? prev.equipmentBrands.filter((id) => id !== brandId)
          : [...prev.equipmentBrands, brandId],
      }));
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
        alert("Erreur lors de l'upload");
      }
    } catch (error) {
      alert("Erreur lors de l'upload");
    } finally {
      setIsUploadingManual(false);
    }
  };

  const addManual = () => {
    if (!manualTitle.trim() || !manualUrl.trim()) {
      alert("Veuillez remplir le titre et l'URL/fichier du manuel");
      return;
    }

    setFormData((prev) => ({
      ...prev,
      manuals: [
        ...prev.manuals,
        {
          title: manualTitle,
          url: manualUrl,
          isExternal: isManualExternal,
        },
      ],
    }));

    // Reset
    setManualTitle("");
    setManualUrl("");
    setIsManualExternal(true);
  };

  const removeManual = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      manuals: prev.manuals.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!formData.name.trim()) {
      setError("Le nom est requis");
      return;
    }

    if (!formData.categoryId) {
      setError("La catégorie est requise");
      return;
    }

    await onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-4xl mx-auto">
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-2xl">
          <p className="text-red-600 text-sm">{error}</p>
        </div>
      )}

      {/* Info Box */}
      <div className="bg-blue-50 border-2 border-blue-200 rounded-2xl p-6">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center flex-shrink-0">
            <svg
              className="w-5 h-5 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-bold text-blue-900 mb-2">
              Enrichissez la bibliothèque !
            </h3>
            <p className="text-blue-700 text-sm mb-2">
              Créez votre équipement et aidez la communauté en partageant vos informations.
            </p>
            <p className="text-blue-600 text-xs">
              💡 Plus vous fournissez d&apos;informations, plus c&apos;est utile pour les autres utilisateurs !
            </p>
          </div>
        </div>
      </div>

      {/* Basic Info */}
      <div>
        <label className="block text-sm font-medium text-black mb-2">
          Nom de l&apos;équipement <span className="text-orange">*</span>
        </label>
        <input
          type="text"
          value={formData.name}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, name: e.target.value }))
          }
          placeholder="Ex: Webasto Air Top 2000"
          className="w-full px-4 py-3 rounded-2xl border-2 border-gray-200 focus:border-orange focus:outline-none transition-colors"
          required
        />
      </div>

      {/* Category */}
      <div>
        <label className="block text-sm font-medium text-black mb-2">
          Catégorie <span className="text-orange">*</span>
        </label>
        <select
          value={formData.categoryId}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, categoryId: e.target.value }))
          }
          className="w-full px-4 py-3 rounded-2xl border-2 border-gray-200 focus:border-orange focus:outline-none transition-colors"
          required
        >
          <option value="">Sélectionner une catégorie</option>
          {renderCategoryOptions(categories)}
        </select>
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-medium text-black mb-2">
          Description
        </label>
        <textarea
          value={formData.description}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, description: e.target.value }))
          }
          rows={3}
          placeholder="Description de l&apos;équipement..."
          className="w-full px-4 py-3 rounded-2xl border-2 border-gray-200 focus:border-orange focus:outline-none resize-none transition-colors"
        />
      </div>

      {/* Vehicle Brands - Optional */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <input
            type="checkbox"
            id="isBrandSpecific"
            checked={isBrandSpecific}
            onChange={(e) => {
              setIsBrandSpecific(e.target.checked);
              if (!e.target.checked) {
                // Clear vehicle brands if unchecked
                setFormData((prev) => ({ ...prev, vehicleBrands: [] }));
              }
            }}
            className="w-5 h-5 text-orange rounded"
          />
          <label htmlFor="isBrandSpecific" className="text-sm font-medium text-black cursor-pointer">
            Mon équipement est spécifique à certaines marques de véhicule
          </label>
        </div>

        {isBrandSpecific && (
          <div>
            <label className="block text-sm font-medium text-black mb-3">
              Marques de véhicule compatibles
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 max-h-48 overflow-y-auto p-2 border-2 border-gray-200 rounded-2xl">
              {vehicleBrands.map((brand) => (
                <button
                  key={brand._id}
                  type="button"
                  onClick={() => toggleBrand(brand._id, "vehicle")}
                  className={`p-3 rounded-xl border-2 transition-all text-left ${
                    formData.vehicleBrands.includes(brand._id)
                      ? "border-orange bg-orange/10"
                      : "border-gray-200 hover:border-orange/50"
                  }`}
                >
                  <p className="font-semibold text-sm text-black">{brand.name}</p>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Equipment Brands */}
      <div>
        <label className="block text-sm font-medium text-black mb-3">
          Marques d&apos;équipement
        </label>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 max-h-48 overflow-y-auto p-2 border-2 border-gray-200 rounded-2xl">
          {equipmentBrands.map((brand) => (
            <button
              key={brand._id}
              type="button"
              onClick={() => toggleBrand(brand._id, "equipment")}
              className={`p-3 rounded-xl border-2 transition-all text-left ${
                formData.equipmentBrands.includes(brand._id)
                  ? "border-orange bg-orange/10"
                  : "border-gray-200 hover:border-orange/50"
              }`}
            >
              <p className="font-semibold text-sm text-black">{brand.name}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Photos */}
      <div>
        <label className="block text-sm font-medium text-black mb-3">
          Photos de l&apos;équipement
        </label>
        <MultiImageUpload
          images={formData.photos}
          onImagesChange={(photos) =>
            setFormData((prev) => ({ ...prev, photos }))
          }
          maxImages={5}
        />
      </div>

      {/* Manuals */}
      <div>
        <label className="block text-sm font-medium text-black mb-3">
          Manuels & Documents
        </label>

        {/* Existing manuals */}
        {formData.manuals.length > 0 && (
          <div className="space-y-2 mb-4">
            {formData.manuals.map((manual, index) => (
              <div
                key={index}
                className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl"
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
                  <p className="font-medium text-black text-sm">{manual.title}</p>
                  <p className="text-xs text-gray">
                    {manual.isExternal ? "Lien externe" : "Fichier"}
                  </p>
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
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Add manual form */}
        <div className="space-y-3 p-4 border-2 border-dashed border-gray-300 rounded-2xl">
          <input
            type="text"
            value={manualTitle}
            onChange={(e) => setManualTitle(e.target.value)}
            placeholder="Titre du manuel"
            className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:border-orange focus:outline-none text-sm"
          />

          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setIsManualExternal(true)}
              className={`flex-1 px-4 py-2 rounded-xl font-medium text-sm transition-colors ${
                isManualExternal
                  ? "bg-orange text-white"
                  : "bg-gray-100 text-gray hover:bg-gray-200"
              }`}
            >
              🔗 URL
            </button>
            <button
              type="button"
              onClick={() => setIsManualExternal(false)}
              className={`flex-1 px-4 py-2 rounded-xl font-medium text-sm transition-colors ${
                !isManualExternal
                  ? "bg-orange text-white"
                  : "bg-gray-100 text-gray hover:bg-gray-200"
              }`}
            >
              📁 Fichier
            </button>
          </div>

          {isManualExternal ? (
            <input
              type="url"
              value={manualUrl}
              onChange={(e) => setManualUrl(e.target.value)}
              placeholder="https://exemple.com/manuel.pdf"
              className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:border-orange focus:outline-none text-sm"
            />
          ) : (
            <div className="relative">
              <input
                type="file"
                accept=".pdf,.doc,.docx"
                onChange={handleManualFileUpload}
                disabled={isUploadingManual}
                className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:border-orange focus:outline-none text-sm disabled:opacity-50"
              />
              {isUploadingManual && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <div className="w-4 h-4 border-2 border-orange border-t-transparent rounded-full animate-spin" />
                </div>
              )}
            </div>
          )}

          <button
            type="button"
            onClick={addManual}
            className="w-full px-4 py-2 bg-gray-800 text-white font-medium rounded-xl hover:bg-gray-900 transition-colors text-sm"
          >
            + Ajouter le manuel
          </button>
        </div>
      </div>

      {/* Notes */}
      <div>
        <label className="block text-sm font-medium text-black mb-2">
          Notes additionnelles
        </label>
        <textarea
          value={formData.notes}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, notes: e.target.value }))
          }
          rows={3}
          placeholder="Informations complémentaires, spécifications techniques, etc."
          className="w-full px-4 py-3 rounded-2xl border-2 border-gray-200 focus:border-orange focus:outline-none resize-none transition-colors"
        />
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full px-6 py-4 bg-gradient-to-r from-orange to-orange-light text-white font-bold rounded-2xl hover:shadow-lg hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:hover:scale-100"
      >
        {isSubmitting
          ? "Création en cours..."
          : "Créer et ajouter à mon véhicule"}
      </button>
    </form>
  );
}

