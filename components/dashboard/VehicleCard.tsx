"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";

interface Vehicle {
  _id: string;
  name: string;
  make: string;
  model: string;
  year: number;
  vehicleType: string;
  currentMileage: number;
  coverImage?: string;
}

interface VehicleCardProps {
  vehicle: Vehicle;
  onDeleted: () => void;
}

export default function VehicleCard({ vehicle, onDeleted }: VehicleCardProps) {
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const response = await fetch(`/api/vehicles/${vehicle._id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        onDeleted();
      } else {
        alert("Erreur lors de la suppression");
        setIsDeleting(false);
      }
    } catch (error) {
      alert("Erreur lors de la suppression");
      setIsDeleting(false);
    }
  };

  const vehicleTypeEmojis: { [key: string]: string } = {
    van: "🚐",
    "camping-car": "🚙",
    fourgon: "🚚",
    "camion aménagé": "🚛",
  };

  return (
    <div className="bg-white rounded-3xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 group">
      {/* Cover Image */}
      <div className="relative h-48 bg-gradient-to-br from-gray-200 to-gray-300 overflow-hidden">
        {vehicle.coverImage ? (
          <Image
            src={vehicle.coverImage}
            alt={vehicle.name}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-6xl">
              {vehicleTypeEmojis[vehicle.vehicleType] || "🚐"}
            </span>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />

        {/* Vehicle Type Badge */}
        <div className="absolute top-4 left-4">
          <span className="px-3 py-1 bg-white/90 backdrop-blur-sm text-black text-xs font-semibold rounded-full">
            {vehicle.vehicleType}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        <h3 className="text-xl font-bold text-black mb-2 line-clamp-1">
          {vehicle.name}
        </h3>
        <p className="text-gray mb-4">
          {vehicle.make} {vehicle.model} • {vehicle.year}
        </p>

        {/* Mileage */}
        <div className="flex items-center gap-2 mb-6 p-3 bg-orange/5 rounded-2xl">
          <svg
            className="w-5 h-5 text-orange flex-shrink-0"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 10V3L4 14h7v7l9-11h-7z"
            />
          </svg>
          <div>
            <p className="text-xs text-gray">Kilométrage actuel</p>
            <p className="text-sm font-bold text-black">
              {vehicle.currentMileage.toLocaleString()} km
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <Link
            href={`/dashboard/vehicles/${vehicle._id}`}
            className="flex-1 px-4 py-2 bg-gradient-to-r from-orange to-orange-light text-white font-semibold rounded-2xl hover:shadow-lg transition-all duration-300 text-center"
          >
            Gérer
          </Link>
          <button
            onClick={() => setShowDeleteConfirm(true)}
            disabled={isDeleting}
            className="px-4 py-2 bg-gray-100 hover:bg-red-50 text-gray-700 hover:text-red-600 rounded-2xl transition-all duration-300 disabled:opacity-50"
            title="Supprimer"
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
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full">
            <h3 className="text-xl font-bold text-black mb-4">
              Supprimer ce véhicule ?
            </h3>
            <p className="text-gray mb-6">
              Cette action est irréversible. Toutes les données associées à ce
              véhicule seront supprimées.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                disabled={isDeleting}
                className="flex-1 px-4 py-2 bg-gray-100 text-black font-semibold rounded-2xl hover:bg-gray-200 transition-all duration-300 disabled:opacity-50"
              >
                Annuler
              </button>
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="flex-1 px-4 py-2 bg-red-600 text-white font-semibold rounded-2xl hover:bg-red-700 transition-all duration-300 disabled:opacity-50"
              >
                {isDeleting ? "Suppression..." : "Supprimer"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

