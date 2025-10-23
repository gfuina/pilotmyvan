"use client";

import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import MultiImageUpload from "./MultiImageUpload";

interface Category {
  _id: string;
  name: string;
  level: number;
  parentId?: string;
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
  customEquipmentBrands?: string[]; // Custom brand names not in the reference
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
    customEquipmentBrands: [],
    photos: [],
    manuals: [],
    notes: "",
  });

  const [categories, setCategories] = useState<Category[]>([]);
  const [flatCategories, setFlatCategories] = useState<Category[]>([]);
  const [vehicleBrands, setVehicleBrands] = useState<Brand[]>([]);
  const [equipmentBrands, setEquipmentBrands] = useState<Brand[]>([]);
  const [error, setError] = useState("");

  // Manual form
  const [manualTitle, setManualTitle] = useState("");
  const [manualUrl, setManualUrl] = useState("");
  const [isManualExternal, setIsManualExternal] = useState(true);
  const [isUploadingManual, setIsUploadingManual] = useState(false);
  const [isBrandSpecific, setIsBrandSpecific] = useState(false);

  // Equipment brand search and custom
  const [equipmentBrandSearch, setEquipmentBrandSearch] = useState("");
  const [customBrandInput, setCustomBrandInput] = useState("");

  // Category cascade navigation
  const [selectedCategoryL1, setSelectedCategoryL1] = useState<string>("");
  const [selectedCategoryL2, setSelectedCategoryL2] = useState<string>("");
  const [selectedCategoryL3, setSelectedCategoryL3] = useState<string>("");

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
        
        // Flatten categories with parent info for cascade selection
        const flattenCategories = (cats: Category[], level = 1, parentId?: string): Category[] => {
          let result: Category[] = [];
          for (const cat of cats) {
            result.push({ ...cat, level, parentId });
            if (cat.children && cat.children.length > 0) {
              result = result.concat(flattenCategories(cat.children, level + 1, cat._id));
            }
          }
          return result;
        };
        setFlatCategories(flattenCategories(data.categories));
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

  // Filter categories by level for cascade navigation
  const categoriesL1 = useMemo(() => {
    return flatCategories.filter(cat => cat.level === 1);
  }, [flatCategories]);

  const categoriesL2 = useMemo(() => {
    if (!selectedCategoryL1) return [];
    return flatCategories.filter(cat => cat.level === 2 && cat.parentId === selectedCategoryL1);
  }, [flatCategories, selectedCategoryL1]);

  const categoriesL3 = useMemo(() => {
    if (!selectedCategoryL2) return [];
    return flatCategories.filter(cat => cat.level === 3 && cat.parentId === selectedCategoryL2);
  }, [flatCategories, selectedCategoryL2]);

  // Handle category level changes with cascade reset
  const handleCategoryL1Change = (value: string) => {
    setSelectedCategoryL1(value);
    setSelectedCategoryL2("");
    setSelectedCategoryL3("");
  };

  const handleCategoryL2Change = (value: string) => {
    setSelectedCategoryL2(value);
    setSelectedCategoryL3("");
  };

  // Update categoryId in formData based on cascade selection
  useEffect(() => {
    // Use the most specific level selected
    const categoryId = selectedCategoryL3 || selectedCategoryL2 || selectedCategoryL1 || "";
    setFormData((prev) => ({ ...prev, categoryId }));
  }, [selectedCategoryL1, selectedCategoryL2, selectedCategoryL3]);

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

      {/* Category - Cascade Selection */}
      <div>
        <label className="block text-sm font-medium text-black mb-3">
          Catégorie <span className="text-orange">*</span>
        </label>
        
        <div className="space-y-3">
          {/* Category cascade navigation */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Level 1 Categories */}
            <select
              value={selectedCategoryL1}
              onChange={(e) => handleCategoryL1Change(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-orange focus:outline-none transition-colors text-sm"
            >
              <option value="">📂 Catégorie principale</option>
              {categoriesL1.map((cat) => (
                <option key={cat._id} value={cat._id}>
                  {cat.name}
                </option>
              ))}
            </select>

            {/* Level 2 Categories - Only show if L1 is selected */}
            <AnimatePresence mode="wait">
              {selectedCategoryL1 && (
                <motion.select
                  key="category-l2"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.2 }}
                  value={selectedCategoryL2}
                  onChange={(e) => handleCategoryL2Change(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-orange focus:outline-none transition-colors text-sm"
                >
                  <option value="">📁 Sous-catégorie</option>
                  {categoriesL2.map((cat) => (
                    <option key={cat._id} value={cat._id}>
                      {cat.name}
                    </option>
                  ))}
                </motion.select>
              )}
            </AnimatePresence>

            {/* Level 3 Categories - Only show if L2 is selected */}
            <AnimatePresence mode="wait">
              {selectedCategoryL2 && categoriesL3.length > 0 && (
                <motion.select
                  key="category-l3"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.2 }}
                  value={selectedCategoryL3}
                  onChange={(e) => setSelectedCategoryL3(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-orange focus:outline-none transition-colors text-sm"
                >
                  <option value="">📄 Détail</option>
                  {categoriesL3.map((cat) => (
                    <option key={cat._id} value={cat._id}>
                      {cat.name}
                    </option>
                  ))}
                </motion.select>
              )}
            </AnimatePresence>
          </div>

          {/* Breadcrumb display */}
          <AnimatePresence>
            {selectedCategoryL1 && (
              <motion.div
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -5 }}
                transition={{ duration: 0.2 }}
                className="flex items-center gap-2 text-sm p-3 bg-orange-50 border border-orange-200 rounded-xl"
              >
                <svg className="w-4 h-4 text-orange flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M3 3a1 1 0 011-1h12a1 1 0 011 1v3a1 1 0 01-.293.707L12 11.414V15a1 1 0 01-.293.707l-2 2A1 1 0 018 17v-5.586L3.293 6.707A1 1 0 013 6V3z" clipRule="evenodd" />
                </svg>
                <span className="font-semibold text-orange-700">
                  {flatCategories.find(c => c._id === selectedCategoryL1)?.name}
                </span>
                {selectedCategoryL2 && (
                  <>
                    <span className="text-orange-400">›</span>
                    <span className="font-semibold text-orange-700">
                      {flatCategories.find(c => c._id === selectedCategoryL2)?.name}
                    </span>
                  </>
                )}
                {selectedCategoryL3 && (
                  <>
                    <span className="text-orange-400">›</span>
                    <span className="font-bold text-orange">
                      {flatCategories.find(c => c._id === selectedCategoryL3)?.name}
                    </span>
                  </>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
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
          placeholder="Description de l'équipement..."
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
          <label
            htmlFor="isBrandSpecific"
            className="text-sm font-medium text-black cursor-pointer"
          >
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
                  <p className="font-semibold text-sm text-black">
                    {brand.name}
                  </p>
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

        {/* Search bar */}
        <div className="relative mb-4">
          <input
            type="text"
            value={equipmentBrandSearch}
            onChange={(e) => setEquipmentBrandSearch(e.target.value)}
            placeholder="Rechercher une marque..."
            className="w-full px-10 py-2.5 rounded-xl border-2 border-gray-200 focus:border-orange focus:outline-none transition-colors text-sm"
          />
          <svg
            className="w-4 h-4 text-gray absolute left-3 top-1/2 -translate-y-1/2"
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
          {equipmentBrandSearch && (
            <button
              type="button"
              onClick={() => setEquipmentBrandSearch("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-100 rounded-full"
            >
              <svg
                className="w-4 h-4 text-gray"
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

        {/* Selected brands display */}
        {(formData.equipmentBrands.length > 0 || (formData.customEquipmentBrands && formData.customEquipmentBrands.length > 0)) && (
          <div className="mb-4 p-3 bg-orange-50 border-2 border-orange-200 rounded-xl">
            <p className="text-xs font-semibold text-orange-700 mb-2">Marques sélectionnées :</p>
            <div className="flex flex-wrap gap-2">
              {formData.equipmentBrands.map((brandId) => {
                const brand = equipmentBrands.find((b) => b._id === brandId);
                return brand ? (
                  <span
                    key={brandId}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-orange-300 text-orange-700 text-sm font-medium rounded-lg"
                  >
                    {brand.name}
                    <button
                      type="button"
                      onClick={() => toggleBrand(brandId, "equipment")}
                      className="hover:bg-orange-100 rounded-full p-0.5"
                    >
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </span>
                ) : null;
              })}
              {formData.customEquipmentBrands?.map((brandName, index) => (
                <span
                  key={`custom-${index}`}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-purple-100 border border-purple-300 text-purple-700 text-sm font-medium rounded-lg"
                >
                  {brandName}
                  <button
                    type="button"
                    onClick={() => {
                      setFormData((prev) => ({
                        ...prev,
                        customEquipmentBrands: prev.customEquipmentBrands?.filter((_, i) => i !== index),
                      }));
                    }}
                    className="hover:bg-purple-200 rounded-full p-0.5"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Brand selection grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 max-h-48 overflow-y-auto p-2 border-2 border-gray-200 rounded-2xl mb-4">
          {equipmentBrands
            .filter((brand) =>
              brand.name.toLowerCase().includes(equipmentBrandSearch.toLowerCase())
            )
            .map((brand) => (
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
          {equipmentBrands.filter((brand) =>
            brand.name.toLowerCase().includes(equipmentBrandSearch.toLowerCase())
          ).length === 0 && (
            <div className="col-span-full text-center py-6 text-sm text-gray">
              Aucune marque trouvée
            </div>
          )}
        </div>

        {/* Add custom brand */}
        <div className="space-y-2 p-3 bg-purple-50 border-2 border-dashed border-purple-300 rounded-xl">
          <p className="text-xs font-medium text-purple-700">
            Marque introuvable ? Ajoutez-la manuellement :
          </p>
          <div className="flex gap-2">
            <input
              type="text"
              value={customBrandInput}
              onChange={(e) => setCustomBrandInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  if (customBrandInput.trim()) {
                    setFormData((prev) => ({
                      ...prev,
                      customEquipmentBrands: [
                        ...(prev.customEquipmentBrands || []),
                        customBrandInput.trim(),
                      ],
                    }));
                    setCustomBrandInput("");
                  }
                }
              }}
              placeholder="Nom de la marque..."
              className="flex-1 px-3 py-2 rounded-lg border border-purple-200 focus:border-purple-500 focus:outline-none text-sm"
            />
            <button
              type="button"
              onClick={() => {
                if (customBrandInput.trim()) {
                  setFormData((prev) => ({
                    ...prev,
                    customEquipmentBrands: [
                      ...(prev.customEquipmentBrands || []),
                      customBrandInput.trim(),
                    ],
                  }));
                  setCustomBrandInput("");
                }
              }}
              disabled={!customBrandInput.trim()}
              className="px-4 py-2 bg-purple-600 text-white font-medium rounded-lg hover:bg-purple-700 transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              + Ajouter
            </button>
          </div>
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
                  <p className="font-medium text-black text-sm">
                    {manual.title}
                  </p>
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
