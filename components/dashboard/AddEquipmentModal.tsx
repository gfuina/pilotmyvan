"use client";

import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import EquipmentForm, { EquipmentFormData } from "./EquipmentForm";

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
}

interface VehicleEquipment {
  _id: string;
  equipmentId?: {
    _id: string;
  };
  isCustom: boolean;
}

interface AddEquipmentModalProps {
  vehicleId: string;
  vehicleMake: string;
  onClose: () => void;
  onSuccess: () => void;
  existingEquipments: VehicleEquipment[];
}

export default function AddEquipmentModal({
  vehicleId,
  vehicleMake,
  onClose,
  onSuccess,
  existingEquipments,
}: AddEquipmentModalProps) {
  const [activeTab, setActiveTab] = useState<"library" | "custom">("library");
  
  // Library state
  const [equipments, setEquipments] = useState<Equipment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchText, setSearchText] = useState("");
  const [selectedVehicleBrand, setSelectedVehicleBrand] = useState<string>("");
  const [selectedEquipmentBrand, setSelectedEquipmentBrand] = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [vehicleBrands, setVehicleBrands] = useState<Array<{ _id: string; name: string }>>([]);
  const [equipmentBrands, setEquipmentBrands] = useState<Array<{ _id: string; name: string }>>([]);
  const [categories, setCategories] = useState<Array<{ _id: string; name: string; level: number; parentId?: string; children?: unknown[] }>>([]);
  
  // Add equipment state
  const [isAdding, setIsAdding] = useState(false);
  const [error, setError] = useState("");
  const [isCreatingEquipment, setIsCreatingEquipment] = useState(false);

  useEffect(() => {
    // Force fetch à chaque ouverture de la modal
    setIsLoading(true);
    setError("");
    fetchEquipments();
    fetchFilters();
  }, [vehicleId]); // Re-fetch quand le vehicleId change (nouvelle modal)

  const fetchEquipments = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/equipments");
      if (response.ok) {
        const data = await response.json();
        setEquipments(data.equipments);
      }
    } catch (error) {
      console.error("Error fetching equipments:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchFilters = async () => {
    try {
      const [vbRes, ebRes, catRes] = await Promise.all([
        fetch("/api/vehicle-brands"),
        fetch("/api/admin/equipment-brands"),
        fetch("/api/admin/categories"),
      ]);

      if (vbRes.ok) {
        const data = await vbRes.json();
        setVehicleBrands(data.brands);
      }

      if (ebRes.ok) {
        const data = await ebRes.json();
        setEquipmentBrands(data.brands);
      }

      if (catRes.ok) {
        const data = await catRes.json();
        // Flatten categories with parent info
        type CategoryItem = { _id: string; name: string; level: number; parentId?: string; children?: CategoryItem[] };
        const flattenCategories = (cats: CategoryItem[], level = 1, parentId?: string): CategoryItem[] => {
          let result: CategoryItem[] = [];
          for (const cat of cats) {
            result.push({ ...cat, level, parentId });
            if (cat.children && cat.children.length > 0) {
              result = result.concat(flattenCategories(cat.children, level + 1, cat._id));
            }
          }
          return result;
        };
        setCategories(flattenCategories(data.categories));
      }
    } catch (error) {
      console.error("Error fetching filters:", error);
    }
  };

  // IDs of recommended equipments
  const RECOMMENDED_IDS = [
    "68f4b9c00aa02e3df6a8c75f", // Contrôle technique périodique
    "68f4b9c00aa02e3df6a8c75b", // Révision complète du véhicule
  ];

  // Real-time client-side filtering for ultra-smooth UX
  const filteredEquipments = useMemo(() => {
    let filtered = [...equipments];

    // Exclude already added equipments - handle empty case
    const existingEquipmentIds = (existingEquipments || [])
      .filter(eq => !eq.isCustom && eq.equipmentId?._id)
      .map(eq => eq.equipmentId!._id);
    
    if (existingEquipmentIds.length > 0) {
      filtered = filtered.filter(eq => !existingEquipmentIds.includes(eq._id));
    }

    // Text search
    if (searchText.trim()) {
      const search = searchText.toLowerCase();
      filtered = filtered.filter(
        (eq) =>
          eq.name.toLowerCase().includes(search) ||
          eq.description?.toLowerCase().includes(search) ||
          eq.categoryId?.name?.toLowerCase().includes(search)
      );
    }

    // Vehicle brand filter
    if (selectedVehicleBrand) {
      filtered = filtered.filter((eq) =>
        eq.vehicleBrands.some((vb) => vb._id === selectedVehicleBrand)
      );
    }

    // Equipment brand filter
    if (selectedEquipmentBrand) {
      filtered = filtered.filter((eq) =>
        eq.equipmentBrands.some((eb) => eb._id === selectedEquipmentBrand)
      );
    }

    // Category filter - recursively get ALL descendants
    if (selectedCategory) {
      // Recursive function to get all descendant IDs
      const getAllDescendants = (catId: string): string[] => {
        const children = categories.filter(c => c.parentId === catId);
        const childIds = children.map(c => c._id);
        const grandChildIds = children.flatMap(c => getAllDescendants(c._id));
        return [...childIds, ...grandChildIds];
      };

      const allIds = [selectedCategory, ...getAllDescendants(selectedCategory)];
      filtered = filtered.filter((eq) => allIds.includes(eq.categoryId?._id));
    }

    return filtered;
  }, [equipments, searchText, selectedVehicleBrand, selectedEquipmentBrand, selectedCategory, categories, existingEquipments]);

  // Separate recommended and regular equipments
  const { recommendedEquipments, regularEquipments } = useMemo(() => {
    const recommended = filteredEquipments.filter(eq => RECOMMENDED_IDS.includes(eq._id));
    const regular = filteredEquipments.filter(eq => !RECOMMENDED_IDS.includes(eq._id));
    return { recommendedEquipments: recommended, regularEquipments: regular };
  }, [filteredEquipments]);

  const handleAddEquipment = async (equipmentId: string) => {
    setIsAdding(true);
    setError("");

    try {
      const response = await fetch(`/api/vehicles/${vehicleId}/equipments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          equipmentId,
          isCustom: false,
        }),
      });

      if (response.ok) {
        setIsAdding(false);
        onSuccess(); // Hors du try/catch pour éviter faux message d'erreur
        return;
      } else {
        const data = await response.json();
        setError(data.error || "Erreur lors de l'ajout");
      }
    } catch (error) {
      setError("Erreur lors de l'ajout");
    } finally {
      setIsAdding(false);
    }
  };

  const handleCreateEquipment = async (data: EquipmentFormData) => {
    setIsCreatingEquipment(true);
    setError("");

    try {
      const response = await fetch("/api/user/equipments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...data,
          vehicleId,
        }),
      });

      if (response.ok) {
        setIsCreatingEquipment(false);
        onSuccess(); // Hors du try/catch pour éviter faux message d'erreur
        return;
      } else {
        const result = await response.json();
        setError(result.error || "Erreur lors de la création");
      }
    } catch (error) {
      setError("Erreur lors de la création");
    } finally {
      setIsCreatingEquipment(false);
    }
  };

  const resetFilters = () => {
    setSearchText("");
    setSelectedVehicleBrand("");
    setSelectedEquipmentBrand("");
    setSelectedCategory("");
  };

  const activeFiltersCount = [
    searchText,
    selectedVehicleBrand,
    selectedEquipmentBrand,
    selectedCategory,
  ].filter(Boolean).length;

  // Organize categories for better display - handle all levels
  const organizedCategories = useMemo(() => {
    const level1 = categories.filter(cat => cat.level === 1);
    return level1.map(parent => {
      const level2Children = categories.filter(cat => cat.parentId === parent._id);
      const allChildren = level2Children.flatMap(l2 => {
        const level3Children = categories.filter(cat => cat.parentId === l2._id);
        return [l2, ...level3Children];
      });
      return {
        ...parent,
        subcategories: allChildren
      };
    });
  }, [categories]);

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.2 }}
        className="bg-white rounded-3xl w-full max-w-6xl my-8 max-h-[90vh] flex flex-col shadow-2xl"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200 flex-shrink-0">
          <div className="flex-1 min-w-0 pr-2">
            <h2 className="text-lg sm:text-2xl font-bold text-black">
              Ajouter contrôle ou équipement
            </h2>
            <p className="text-xs sm:text-sm text-gray">Pour votre {vehicleMake}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors flex-shrink-0"
          >
            <svg
              className="w-5 h-5 sm:w-6 sm:h-6"
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

        {/* Tabs */}
        <div className="flex gap-2 p-4 sm:p-6 border-b border-gray-200">
          <button
            onClick={() => setActiveTab("library")}
            className={`flex-1 px-3 sm:px-6 py-2.5 sm:py-3 text-sm sm:text-base font-semibold rounded-2xl transition-all duration-300 whitespace-nowrap ${
              activeTab === "library"
                ? "bg-gradient-to-r from-orange to-orange-light text-white shadow-lg"
                : "bg-gray-100 text-gray hover:bg-gray-200"
            }`}
          >
            <span className="hidden sm:inline">📚 </span>Bibliothèque
          </button>
          <button
            onClick={() => setActiveTab("custom")}
            className={`flex-1 px-3 sm:px-6 py-2.5 sm:py-3 text-sm sm:text-base font-semibold rounded-2xl transition-all duration-300 whitespace-nowrap ${
              activeTab === "custom"
                ? "bg-gradient-to-r from-orange to-orange-light text-white shadow-lg"
                : "bg-gray-100 text-gray hover:bg-gray-200"
            }`}
          >
            <span className="hidden sm:inline">✏️ </span>Créer le mien
          </button>
        </div>

        {error && (
          <div className="mx-6 mt-6 p-4 bg-red-50 border border-red-200 rounded-2xl">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}

        {/* Content */}
        <div className="flex-1 overflow-y-auto min-h-0">
          <AnimatePresence mode="wait">
            {activeTab === "library" ? (
              <motion.div
                key="library"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.2 }}
                className="flex flex-col min-h-full"
              >
                {/* Filters */}
                <div className="p-6 border-b border-gray-200 space-y-4">
                  {/* Search Bar */}
                  <div className="relative">
                    <input
                      type="text"
                      value={searchText}
                      onChange={(e) => setSearchText(e.target.value)}
                      placeholder="Rechercher un contrôle ou équipement..."
                      className="w-full px-12 py-3 rounded-2xl border-2 border-gray-200 focus:border-orange focus:outline-none transition-colors"
                    />
                    <svg
                      className="w-5 h-5 text-gray absolute left-4 top-1/2 -translate-y-1/2"
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
                    {searchText && (
                      <button
                        onClick={() => setSearchText("")}
                        className="absolute right-4 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-100 rounded-full"
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

                  {/* Filter Pills */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
                    {/* Vehicle Brand */}
                    <select
                      value={selectedVehicleBrand}
                      onChange={(e) => setSelectedVehicleBrand(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-gray-200 focus:border-orange focus:outline-none text-sm"
                    >
                      <option value="">🚐 Toutes marques véhicule</option>
                      {vehicleBrands.map((brand) => (
                        <option key={brand._id} value={brand._id}>
                          {brand.name}
                        </option>
                      ))}
                    </select>

                    {/* Equipment Brand */}
                    <select
                      value={selectedEquipmentBrand}
                      onChange={(e) => setSelectedEquipmentBrand(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-gray-200 focus:border-orange focus:outline-none text-sm"
                    >
                      <option value="">🔧 Toutes marques équipement</option>
                      {equipmentBrands.map((brand) => (
                        <option key={brand._id} value={brand._id}>
                          {brand.name}
                        </option>
                      ))}
                    </select>

                    {/* Category */}
                    <select
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-gray-200 focus:border-orange focus:outline-none text-sm"
                    >
                      <option value="">📂 Toutes catégories</option>
                      {organizedCategories.map((parent) => (
                        <optgroup key={parent._id} label={parent.name}>
                          <option value={parent._id}>
                            Tous les {parent.name.toLowerCase()}
                          </option>
                          {parent.subcategories.map((sub) => (
                            <option key={sub._id} value={sub._id}>
                              {sub.level === 3 ? "    " : ""}
                              {sub.name}
                            </option>
                          ))}
                        </optgroup>
                      ))}
                    </select>

                    {/* Reset Button */}
                    {activeFiltersCount > 0 && (
                      <button
                        onClick={resetFilters}
                        className="w-full px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray text-sm font-medium rounded-xl transition-colors"
                      >
                        ✕ Réinitialiser ({activeFiltersCount})
                      </button>
                    )}
                  </div>
                </div>

                {/* Equipment List */}
                <div className="flex-1 overflow-y-auto p-6">
                  {isLoading ? (
                    <div className="flex justify-center items-center py-20">
                      <div className="w-12 h-12 border-4 border-orange border-t-transparent rounded-full animate-spin" />
                    </div>
                  ) : filteredEquipments.length === 0 ? (
                    <div className="text-center py-12">
                      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg
                          className="w-8 h-8 text-gray"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                      </div>
                      <h3 className="text-lg font-semibold text-black mb-2">
                        Aucun élément trouvé
                      </h3>
                      <p className="text-gray text-sm">
                        Essayez de modifier vos filtres ou créez votre propre
                        équipement
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {/* Recommended Section */}
                      {recommendedEquipments.length > 0 && (
                        <div>
                          <div className="flex items-center gap-2 mb-4">
                            <div className="flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-orange to-orange-light text-white font-bold text-sm rounded-full">
                              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                              </svg>
                              Recommandé pour tous
                            </div>
                          </div>
                          <div className="grid grid-cols-1 gap-3">
                            {recommendedEquipments.map((equipment, index) => (
                              <motion.div
                                key={equipment._id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05 }}
                                className="bg-gradient-to-br from-orange-50 to-orange-100 border-2 border-orange-300 rounded-2xl p-3 sm:p-4 shadow-md"
                              >
                                <div className="flex gap-3 items-start">
                                  {/* Photo */}
                                  <div className="relative w-16 h-16 sm:w-20 sm:h-20 bg-white rounded-xl overflow-hidden flex-shrink-0">
                                    {equipment.photos[0] ? (
                                      <Image
                                        src={equipment.photos[0]}
                                        alt={equipment.name}
                                        fill
                                        className="object-cover"
                                      />
                                    ) : (
                                      <div className="absolute inset-0 flex items-center justify-center text-2xl sm:text-3xl">
                                        📋
                                      </div>
                                    )}
                                  </div>

                                  {/* Info */}
                                  <div className="flex-1 min-w-0">
                                    <h4 className="font-bold text-black mb-1 line-clamp-2">
                                      {equipment.name}
                                    </h4>
                                    <p className="text-xs text-gray-700 mb-1">
                                      {equipment.categoryId?.name}
                                    </p>
                                    {equipment.description && (
                                      <p className="text-sm text-gray-700 line-clamp-2 hidden sm:block">
                                        {equipment.description}
                                      </p>
                                    )}
                                  </div>

                                  {/* Add Button */}
                                  <button
                                    onClick={() => handleAddEquipment(equipment._id)}
                                    disabled={isAdding}
                                    className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-orange to-orange-light text-white font-semibold rounded-xl hover:shadow-lg transition-all duration-300 disabled:opacity-50 flex items-center justify-center flex-shrink-0"
                                    title="Ajouter à mon véhicule"
                                  >
                                    <svg
                                      className="w-5 h-5 sm:w-6 sm:h-6"
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
                                  </button>
                                </div>
                              </motion.div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Regular Equipment Section */}
                      {regularEquipments.length > 0 && (
                        <div>
                          {recommendedEquipments.length > 0 && (
                            <div className="flex items-center gap-2 mb-4">
                              <h3 className="text-sm font-semibold text-gray-700">Tous les contrôles & équipements</h3>
                              <div className="flex-1 h-px bg-gray-200"></div>
                            </div>
                          )}
                          <div className="grid grid-cols-1 gap-3">
                            {regularEquipments.map((equipment, index) => (
                              <motion.div
                                key={equipment._id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: (index + recommendedEquipments.length) * 0.05 }}
                                className="bg-white border-2 border-gray-200 hover:border-orange rounded-2xl p-3 sm:p-4 transition-all duration-300 hover:shadow-lg"
                              >
                                <div className="flex gap-3 items-start">
                                  {/* Photo */}
                                  <div className="relative w-16 h-16 sm:w-20 sm:h-20 bg-gray-100 rounded-xl overflow-hidden flex-shrink-0">
                                    {equipment.photos[0] ? (
                                      <Image
                                        src={equipment.photos[0]}
                                        alt={equipment.name}
                                        fill
                                        className="object-cover"
                                      />
                                    ) : (
                                      <div className="absolute inset-0 flex items-center justify-center text-2xl sm:text-3xl">
                                        🔧
                                      </div>
                                    )}
                                  </div>

                                  {/* Info */}
                                  <div className="flex-1 min-w-0">
                                    <h4 className="font-bold text-black mb-1 line-clamp-2">
                                      {equipment.name}
                                    </h4>
                                    <p className="text-xs text-gray mb-2">
                                      {equipment.categoryId?.name}
                                    </p>
                                    {equipment.description && (
                                      <p className="text-sm text-gray line-clamp-2 mb-2 hidden sm:block">
                                        {equipment.description}
                                      </p>
                                    )}
                                    <div className="flex flex-wrap gap-1">
                                      {equipment.equipmentBrands.slice(0, 2).map((brand) => (
                                        <span
                                          key={brand._id}
                                          className="px-2 py-0.5 bg-purple-50 text-purple-700 text-xs font-medium rounded-full"
                                        >
                                          {brand.name}
                                        </span>
                                      ))}
                                      {equipment.manuals.length > 0 && (
                                        <span className="px-2 py-0.5 bg-green-50 text-green-700 text-xs font-medium rounded-full">
                                          📄 {equipment.manuals.length}
                                        </span>
                                      )}
                                    </div>
                                  </div>

                                  {/* Add Button */}
                                  <button
                                    onClick={() => handleAddEquipment(equipment._id)}
                                    disabled={isAdding}
                                    className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-orange to-orange-light text-white font-semibold rounded-xl hover:shadow-lg transition-all duration-300 disabled:opacity-50 flex items-center justify-center flex-shrink-0"
                                    title="Ajouter à mon véhicule"
                                  >
                                    <svg
                                      className="w-5 h-5 sm:w-6 sm:h-6"
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
                                  </button>
                                </div>
                              </motion.div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Results Count */}
                <div className="p-4 border-t border-gray-200 bg-gray-50">
                  <p className="text-sm text-gray text-center">
                    {filteredEquipments.length} élément
                    {filteredEquipments.length > 1 ? "s" : ""} trouvé
                    {filteredEquipments.length > 1 ? "s" : ""}
                    {activeFiltersCount > 0 && ` (${equipments.length} au total)`}
                  </p>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="custom"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.2 }}
                className="p-6"
              >
                <EquipmentForm
                  onSubmit={handleCreateEquipment}
                  isSubmitting={isCreatingEquipment}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}

