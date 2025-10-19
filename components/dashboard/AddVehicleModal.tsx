"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import ImageUpload from "./ImageUpload";

interface VehicleBrand {
  _id: string;
  name: string;
  logo?: string;
}

interface AddVehicleModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

export default function AddVehicleModal({
  onClose,
  onSuccess,
}: AddVehicleModalProps) {
  const [formData, setFormData] = useState({
    name: "",
    make: "",
    model: "",
    year: new Date().getFullYear(),
    vehicleType: "van" as "van" | "camping-car" | "fourgon" | "camion aménagé",
    currentMileage: 0,
    vin: "",
    licensePlate: "",
    purchaseDate: "",
    notes: "",
    fuelType: "",
    fuelTankCapacity: 0,
  });

  const [coverImage, setCoverImage] = useState<string>("");
  const [gallery, setGallery] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [vehicleBrands, setVehicleBrands] = useState<VehicleBrand[]>([]);
  const [isLoadingBrands, setIsLoadingBrands] = useState(true);

  useEffect(() => {
    const fetchBrands = async () => {
      try {
        const response = await fetch("/api/vehicle-brands");
        if (response.ok) {
          const data = await response.json();
          setVehicleBrands(data.brands);
        }
      } catch (error) {
        console.error("Error fetching brands:", error);
      } finally {
        setIsLoadingBrands(false);
      }
    };

    fetchBrands();
  }, []);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "year" || name === "currentMileage" || name === "fuelTankCapacity" ? Number(value) : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/vehicles", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          coverImage,
          gallery,
          purchaseDate: formData.purchaseDate || undefined,
        }),
      });

      if (response.ok) {
        onSuccess();
      } else {
        const data = await response.json();
        setError(data.error || "Erreur lors de l'ajout du véhicule");
      }
    } catch (error) {
      setError("Erreur lors de l'ajout du véhicule");
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
        className="bg-white rounded-3xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 flex-shrink-0">
          <h2 className="text-2xl font-bold text-black">
            Ajouter un véhicule
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
          <div>
            <h3 className="text-lg font-bold text-black mb-4">
              Informations de base
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-black mb-2">
                  Nom du véhicule <span className="text-orange">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  placeholder="Ex: Mon Sprinter"
                  className="w-full px-4 py-3 rounded-2xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-black mb-2">
                  Type de véhicule <span className="text-orange">*</span>
                </label>
                <select
                  name="vehicleType"
                  value={formData.vehicleType}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 rounded-2xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange focus:border-transparent"
                >
                  <option value="van">Van</option>
                  <option value="camping-car">Camping-car</option>
                  <option value="fourgon">Fourgon</option>
                  <option value="camion aménagé">Camion aménagé</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-black mb-2">
                  Marque <span className="text-orange">*</span>
                </label>
                {isLoadingBrands ? (
                  <div className="w-full px-4 py-3 rounded-2xl border border-gray-200 bg-gray-50 text-gray">
                    Chargement des marques...
                  </div>
                ) : vehicleBrands.length > 0 ? (
                  <select
                    name="make"
                    value={formData.make}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 rounded-2xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange focus:border-transparent"
                  >
                    <option value="">Sélectionner une marque</option>
                    {vehicleBrands.map((brand) => (
                      <option key={brand._id} value={brand.name}>
                        {brand.name}
                      </option>
                    ))}
                  </select>
                ) : (
                  <div>
                    <input
                      type="text"
                      name="make"
                      value={formData.make}
                      onChange={handleChange}
                      required
                      placeholder="Ex: Mercedes"
                      className="w-full px-4 py-3 rounded-2xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange focus:border-transparent"
                    />
                    <p className="text-xs text-gray mt-1">
                      Aucune marque dans le référentiel
                    </p>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-black mb-2">
                  Modèle <span className="text-orange">*</span>
                </label>
                <input
                  type="text"
                  name="model"
                  value={formData.model}
                  onChange={handleChange}
                  required
                  placeholder="Ex: Sprinter 313 CDI"
                  className="w-full px-4 py-3 rounded-2xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-black mb-2">
                  Année <span className="text-orange">*</span>
                </label>
                <input
                  type="number"
                  name="year"
                  value={formData.year}
                  onChange={handleChange}
                  required
                  min="1900"
                  max={new Date().getFullYear() + 1}
                  className="w-full px-4 py-3 rounded-2xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-black mb-2">
                  Kilométrage actuel <span className="text-orange">*</span>
                </label>
                <div className="relative">
                  <input
                    type="number"
                    name="currentMileage"
                    value={formData.currentMileage}
                    onChange={handleChange}
                    required
                    min="0"
                    placeholder="150000"
                    className="w-full px-4 py-3 rounded-2xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange focus:border-transparent"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray text-sm">
                    km
                  </span>
                </div>
                <p className="text-xs text-gray mt-1">
                  Il vous sera redemandé à chaque mise à jour pour le suivi
                </p>
              </div>
            </div>
          </div>

          {/* Optional Info */}
          <div>
            <h3 className="text-lg font-bold text-black mb-4">
              Informations complémentaires
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-black mb-2">
                  N° de série (VIN)
                </label>
                <input
                  type="text"
                  name="vin"
                  value={formData.vin}
                  onChange={handleChange}
                  placeholder="Ex: WDB9063451K123456"
                  className="w-full px-4 py-3 rounded-2xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-black mb-2">
                  Plaque d&apos;immatriculation
                </label>
                <input
                  type="text"
                  name="licensePlate"
                  value={formData.licensePlate}
                  onChange={handleChange}
                  placeholder="Ex: AB-123-CD"
                  className="w-full px-4 py-3 rounded-2xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-black mb-2">
                  Date d&apos;achat
                </label>
                <input
                  type="date"
                  name="purchaseDate"
                  value={formData.purchaseDate}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-2xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-black mb-2">
                  Type de carburant
                </label>
                <select
                  name="fuelType"
                  value={formData.fuelType}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-2xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange focus:border-transparent"
                >
                  <option value="">Non spécifié</option>
                  <option value="essence">Essence</option>
                  <option value="diesel">Diesel</option>
                  <option value="électrique">Électrique</option>
                  <option value="hybride">Hybride</option>
                  <option value="gpl">GPL</option>
                  <option value="autre">Autre</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-black mb-2">
                  Capacité du réservoir
                </label>
                <div className="relative">
                  <input
                    type="number"
                    name="fuelTankCapacity"
                    value={formData.fuelTankCapacity || ""}
                    onChange={handleChange}
                    min="0"
                    placeholder="Ex: 60"
                    className="w-full px-4 py-3 rounded-2xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange focus:border-transparent"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray text-sm">
                    L
                  </span>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Pour activer le suivi de carburant
                </p>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-black mb-2">
                  Notes
                </label>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  rows={3}
                  placeholder="Ajoutez des notes sur votre véhicule..."
                  className="w-full px-4 py-3 rounded-2xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange focus:border-transparent resize-none"
                />
              </div>
            </div>
          </div>

          {/* Images */}
          <div>
            <h3 className="text-lg font-bold text-black mb-4">Photos</h3>
            
            {/* Cover Image */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-black mb-2">
                Photo de couverture
              </label>
              <ImageUpload
                onUploadComplete={(url) => setCoverImage(url)}
                existingImage={coverImage}
                onRemove={() => setCoverImage("")}
              />
            </div>

            {/* Gallery */}
            <div>
              <label className="block text-sm font-medium text-black mb-2">
                Galerie photos
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {gallery.map((url, index) => (
                  <div key={index} className="relative aspect-square">
                    <img
                      src={url}
                      alt={`Gallery ${index + 1}`}
                      className="w-full h-full object-cover rounded-2xl"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setGallery(gallery.filter((_, i) => i !== index))
                      }
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
                {gallery.length < 10 && (
                  <ImageUpload
                    onUploadComplete={(url) =>
                      setGallery([...gallery, url])
                    }
                    compact
                  />
                )}
              </div>
              {gallery.length >= 10 && (
                <p className="text-xs text-gray mt-2">
                  Maximum 10 photos dans la galerie
                </p>
              )}
            </div>
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
              {isSubmitting ? "Ajout en cours..." : "Ajouter le véhicule"}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

