"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import EditVehicleModal from "@/components/dashboard/EditVehicleModal";
import AddEquipmentModal from "@/components/dashboard/AddEquipmentModal";
import VehicleEquipmentList from "@/components/dashboard/VehicleEquipmentList";
import VehicleMaintenancesCard from "@/components/dashboard/VehicleMaintenancesCard";
import MileageTrackerCard from "@/components/dashboard/MileageTrackerCard";

interface Vehicle {
  _id: string;
  name: string;
  make: string;
  model: string;
  year: number;
  vehicleType: "van" | "camping-car" | "fourgon" | "camion aménagé";
  currentMileage: number;
  mileageHistory: Array<{
    mileage: number;
    date: string;
    note?: string;
  }>;
  coverImage?: string;
  gallery: string[];
  vin?: string;
  licensePlate?: string;
  purchaseDate?: string;
  notes?: string;
  createdAt: string;
}

interface VehicleEquipment {
  _id: string;
  equipmentId?: {
    _id: string;
    name: string;
    description?: string;
    categoryId: {
      name: string;
    };
    equipmentBrands: Array<{
      name: string;
    }>;
    photos: string[];
    manuals: Array<{
      title: string;
      url: string;
      isExternal: boolean;
    }>;
  };
  isCustom: boolean;
  customData?: {
    name: string;
    description?: string;
    brand?: string;
    model?: string;
    photos?: string[];
  };
  installDate?: string;
  notes?: string;
  createdAt: string;
}

export default function VehicleDetailClient({ vehicleId }: { vehicleId: string }) {
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAddEquipmentModalOpen, setIsAddEquipmentModalOpen] = useState(false);
  const [equipments, setEquipments] = useState<VehicleEquipment[]>([]);
  const [isLoadingEquipments, setIsLoadingEquipments] = useState(true);

  const fetchVehicle = async () => {
    try {
      const response = await fetch(`/api/vehicles/${vehicleId}`);
      if (response.ok) {
        const data = await response.json();
        setVehicle(data.vehicle);
      } else if (response.status === 404) {
        setError("Véhicule non trouvé");
      } else {
        setError("Erreur lors du chargement");
      }
    } catch (error) {
      console.error("Error fetching vehicle:", error);
      setError("Erreur lors du chargement");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchEquipments = async () => {
    setIsLoadingEquipments(true);
    try {
      const response = await fetch(`/api/vehicles/${vehicleId}/equipments`);
      if (response.ok) {
        const data = await response.json();
        setEquipments(data.equipments);
      }
    } catch (error) {
      console.error("Error fetching equipments:", error);
    } finally {
      setIsLoadingEquipments(false);
    }
  };

  useEffect(() => {
    fetchVehicle();
    fetchEquipments();
  }, [vehicleId]);

  const handleEditSuccess = () => {
    setIsEditModalOpen(false);
    fetchVehicle();
  };

  const handleEquipmentSuccess = () => {
    setIsAddEquipmentModalOpen(false);
    fetchEquipments();
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-20">
        <div className="w-12 h-12 border-4 border-orange border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !vehicle) {
    return (
      <div className="bg-white rounded-3xl shadow-lg p-12 text-center max-w-2xl mx-auto">
        <p className="text-red-600">{error || "Véhicule non trouvé"}</p>
        <Link
          href="/dashboard"
          className="inline-block mt-6 px-6 py-3 bg-gradient-to-r from-orange to-orange-light text-white font-bold rounded-2xl hover:shadow-lg transition-all duration-300"
        >
          Retour au dashboard
        </Link>
      </div>
    );
  }

  const vehicleTypeEmojis: { [key: string]: string } = {
    van: "🚐",
    "camping-car": "🚙",
    fourgon: "🚚",
    "camion aménagé": "🚛",
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Header Card */}
        <div className="bg-white rounded-3xl shadow-lg overflow-hidden mb-6">
          {/* Cover Image */}
          <div className="relative h-64 md:h-80 bg-gradient-to-br from-gray-200 to-gray-300">
            {vehicle.coverImage ? (
              <Image
                src={vehicle.coverImage}
                alt={vehicle.name}
                fill
                className="object-cover"
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-8xl">
                  {vehicleTypeEmojis[vehicle.vehicleType] || "🚐"}
                </span>
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />

            {/* Vehicle Type Badge */}
            <div className="absolute top-6 left-6">
              <span className="px-4 py-2 bg-white/90 backdrop-blur-sm text-black font-semibold rounded-full">
                {vehicle.vehicleType}
              </span>
            </div>

            {/* Actions */}
            <div className="absolute top-6 right-6 flex gap-2">
              <button
                onClick={() => setIsEditModalOpen(true)}
                className="px-4 py-2 bg-white/90 backdrop-blur-sm text-black font-semibold rounded-full hover:bg-white transition-all duration-300 inline-flex items-center gap-2"
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
                Modifier
              </button>
            </div>

            {/* Title */}
            <div className="absolute bottom-6 left-6 right-6">
              <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
                {vehicle.name}
              </h1>
              <p className="text-xl text-white/90">
                {vehicle.make} {vehicle.model} • {vehicle.year}
              </p>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="p-6 grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <p className="text-sm text-gray mb-1">Kilométrage</p>
              <p className="text-2xl font-bold text-black">
                {vehicle.currentMileage.toLocaleString()} km
              </p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray mb-1">Année</p>
              <p className="text-2xl font-bold text-black">{vehicle.year}</p>
            </div>
            {vehicle.licensePlate && (
              <div className="text-center">
                <p className="text-sm text-gray mb-1">Immatriculation</p>
                <p className="text-lg font-bold text-black">
                  {vehicle.licensePlate}
                </p>
              </div>
            )}
            {vehicle.purchaseDate && (
              <div className="text-center">
                <p className="text-sm text-gray mb-1">Date d&apos;achat</p>
                <p className="text-lg font-bold text-black">
                  {new Date(vehicle.purchaseDate).toLocaleDateString("fr-FR")}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Gallery */}
        {vehicle.gallery && vehicle.gallery.length > 0 && (
          <div className="bg-white rounded-3xl shadow-lg p-6 mb-6">
            <h2 className="text-xl font-bold text-black mb-4">Galerie photos</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {vehicle.gallery.map((url, index) => (
                <div key={index} className="relative aspect-square rounded-2xl overflow-hidden">
                  <Image
                    src={url}
                    alt={`${vehicle.name} ${index + 1}`}
                    fill
                    className="object-cover hover:scale-105 transition-transform duration-300"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Details & Mileage Tracker */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Details */}
          {/* {(vehicle.vin || vehicle.notes || vehicle.createdAt) && (
            <div className="bg-white rounded-3xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-black mb-4">Détails</h2>
              <div className="space-y-3">
                {vehicle.vin && (
                  <div>
                    <p className="text-sm text-gray">N° de série (VIN)</p>
                    <p className="font-semibold text-black">{vehicle.vin}</p>
                  </div>
                )}
                {vehicle.notes && (
                  <div>
                    <p className="text-sm text-gray">Notes</p>
                    <p className="text-black whitespace-pre-wrap">{vehicle.notes}</p>
                  </div>
                )}
                <div>
                  <p className="text-sm text-gray">Créé le</p>
                  <p className="font-semibold text-black">
                    {new Date(vehicle.createdAt).toLocaleDateString("fr-FR")}
                  </p>
                </div>
              </div>
            </div>
          )} */}

          {/* Mileage Tracker */}
          <div className={vehicle.vin || vehicle.notes ? "" : "lg:col-span-2"}>
            <MileageTrackerCard
              vehicleId={vehicleId}
              vehicleName={vehicle.name}
            />
          </div>
        </div>

        {/* Equipments Section */}
        <div className="mt-6 bg-white rounded-3xl shadow-lg p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-black">
                Équipements & Mécanique 🔧
              </h2>
              <p className="text-gray text-sm sm:text-base">
                Choisissez ce que vous souhaitez contrôler : mécanique (freins, pneus...) ou équipements (chauffage, frigo...)
              </p>
            </div>
            <button
              onClick={() => setIsAddEquipmentModalOpen(true)}
              className="inline-flex items-center justify-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 bg-gradient-to-r from-orange to-orange-light text-white font-bold text-sm sm:text-base rounded-2xl hover:shadow-lg hover:scale-105 transition-all duration-300"
            >
              <svg
                className="w-4 h-4 sm:w-5 sm:h-5"
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
              <span className="hidden sm:inline">Ajouter un équipement</span>
              <span className="sm:hidden">Ajouter</span>
            </button>
          </div>

          {isLoadingEquipments ? (
            <div className="flex justify-center items-center py-12">
              <div className="w-10 h-10 border-4 border-orange border-t-transparent rounded-full animate-spin" />
            </div>
          ) : equipments.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-2xl">
              <div className="w-16 h-16 bg-orange/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-8 h-8 text-orange"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-black mb-2">
                Commencez à suivre vos éléments prioritaires
              </h3>
              <p className="text-gray text-sm mb-2">
                Ajoutez uniquement ce que <span className="font-semibold">vous</span> souhaitez contrôler et entretenir :
              </p>
              <p className="text-gray text-xs mb-4">
                🔩 Mécanique : pneus, freins, filtres, batterie, courroie...
                <br />
                🏠 Équipements : chauffage, frigo, pompe à eau, panneau solaire...
                <br />
                <span className="text-orange text-xs mt-1 block">💡 Vous choisissez ce qui est important pour vous !</span>
              </p>
              <button
                onClick={() => setIsAddEquipmentModalOpen(true)}
                className="inline-flex items-center justify-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 bg-gradient-to-r from-orange to-orange-light text-white font-bold text-sm sm:text-base rounded-2xl hover:shadow-lg transition-all duration-300"
              >
                <svg
                  className="w-4 h-4 sm:w-5 sm:h-5"
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
                <span className="hidden sm:inline">Commencer le suivi</span>
                <span className="sm:hidden">Ajouter</span>
              </button>
            </div>
          ) : (
            <VehicleEquipmentList
              vehicleId={vehicleId}
              equipments={equipments}
              onRefresh={fetchEquipments}
            />
          )}
        </div>

        {/* Maintenances Section */}
        <div className="mt-6">
          <VehicleMaintenancesCard vehicleId={vehicleId} equipments={equipments} />
        </div>
      </motion.div>

      {/* Edit Modal */}
      <AnimatePresence>
        {isEditModalOpen && (
          <EditVehicleModal
            vehicle={vehicle}
            onClose={() => setIsEditModalOpen(false)}
            onSuccess={handleEditSuccess}
          />
        )}
      </AnimatePresence>

      {/* Add Equipment Modal */}
      <AnimatePresence>
        {isAddEquipmentModalOpen && (
          <AddEquipmentModal
            vehicleId={vehicleId}
            vehicleMake={`${vehicle.make} ${vehicle.model}`}
            onClose={() => setIsAddEquipmentModalOpen(false)}
            onSuccess={handleEquipmentSuccess}
          />
        )}
      </AnimatePresence>
    </>
  );
}

