"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

interface UserData {
  _id: string;
  name: string;
  email: string;
  isAdmin: boolean;
  emailVerified: string | null;
  createdAt: string;
}

interface Vehicle {
  _id: string;
  name: string;
  make: string;
  model: string;
  vehicleType: string;
  currentMileage: number;
}

interface VehicleEquipment {
  _id: string;
  equipmentId?: {
    _id: string;
    name: string;
  };
  vehicleId: {
    _id: string;
    name: string;
  };
  isCustom: boolean;
  customData?: {
    name: string;
  };
}

interface MaintenanceRecord {
  _id: string;
  vehicleMaintenanceScheduleId: {
    _id: string;
    maintenanceId?: {
      _id: string;
      name: string;
    };
    isCustom: boolean;
    customData?: {
      name: string;
    };
  };
  vehicleId: {
    _id: string;
    name: string;
  };
  completedAt: string;
  cost?: number;
}

interface UserAccordionProps {
  user: UserData;
}

export default function UserAccordion({ user }: UserAccordionProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [activeSection, setActiveSection] = useState<"vehicles" | "equipments" | "maintenances">("vehicles");
  const [vehicles, setVehicles] = useState<Vehicle[] | null>(null);
  const [equipments, setEquipments] = useState<VehicleEquipment[] | null>(null);
  const [maintenances, setMaintenances] = useState<MaintenanceRecord[] | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const fetchUserData = async () => {
    if (vehicles !== null && equipments !== null && maintenances !== null) {
      return; // Already fetched
    }

    setIsLoading(true);
    try {
      const [vehiclesRes, equipmentsRes, maintenancesRes] = await Promise.all([
        fetch(`/api/admin/users/${user._id}/vehicles`),
        fetch(`/api/admin/users/${user._id}/equipments`),
        fetch(`/api/admin/users/${user._id}/maintenances`),
      ]);

      if (vehiclesRes.ok) {
        const data = await vehiclesRes.json();
        setVehicles(data.vehicles);
      }

      if (equipmentsRes.ok) {
        const data = await equipmentsRes.json();
        setEquipments(data.equipments);
      }

      if (maintenancesRes.ok) {
        const data = await maintenancesRes.json();
        setMaintenances(data.maintenances);
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggle = () => {
    if (!isOpen) {
      fetchUserData();
    }
    setIsOpen(!isOpen);
  };

  return (
    <div className="border-b border-gray-200 last:border-b-0">
      {/* Mobile View */}
      <div className="sm:hidden">
        <button
          onClick={handleToggle}
          className="w-full p-4 hover:bg-gray-50 transition-colors text-left"
        >
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="font-medium text-black mb-1">{user.name}</div>
              <div className="text-sm text-gray mb-2 break-all">{user.email}</div>
              <div className="flex flex-wrap gap-2">
                {user.isAdmin && (
                  <span className="px-2 py-1 text-xs font-semibold text-orange bg-orange/10 rounded-full">
                    Admin
                  </span>
                )}
                {user.emailVerified ? (
                  <span className="px-2 py-1 text-xs font-semibold text-green-600 bg-green-100 rounded-full">
                    Vérifié
                  </span>
                ) : (
                  <span className="px-2 py-1 text-xs font-semibold text-yellow-600 bg-yellow-100 rounded-full">
                    Non vérifié
                  </span>
                )}
              </div>
            </div>
            <motion.div
              animate={{ rotate: isOpen ? 180 : 0 }}
              transition={{ duration: 0.3 }}
              className="ml-2"
            >
              <svg className="w-5 h-5 text-gray" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </motion.div>
          </div>
        </button>
      </div>

      {/* Desktop View */}
      <div className="hidden sm:block">
        <button
          onClick={handleToggle}
          className="w-full px-4 lg:px-6 py-3 lg:py-4 hover:bg-gray-50 transition-colors"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4 flex-1">
              <div className="w-1/4 text-left">
                <div className="text-sm font-medium text-black">{user.name}</div>
              </div>
              <div className="w-1/3 text-left">
                <div className="text-sm text-gray break-all">{user.email}</div>
              </div>
              <div className="w-1/4 text-left">
                <div className="flex flex-wrap gap-2">
                  {user.isAdmin && (
                    <span className="px-2 py-1 text-xs font-semibold text-orange bg-orange/10 rounded-full">
                      Admin
                    </span>
                  )}
                  {user.emailVerified ? (
                    <span className="px-2 py-1 text-xs font-semibold text-green-600 bg-green-100 rounded-full">
                      Vérifié
                    </span>
                  ) : (
                    <span className="px-2 py-1 text-xs font-semibold text-yellow-600 bg-yellow-100 rounded-full">
                      Non vérifié
                    </span>
                  )}
                </div>
              </div>
              <div className="w-1/6 text-left">
                <div className="text-sm text-gray">
                  {new Date(user.createdAt).toLocaleDateString("fr-FR")}
                </div>
              </div>
            </div>
            <motion.div
              animate={{ rotate: isOpen ? 180 : 0 }}
              transition={{ duration: 0.3 }}
            >
              <svg className="w-5 h-5 text-gray" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </motion.div>
          </div>
        </button>
      </div>

      {/* Accordion Content */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden bg-gray-50"
          >
            <div className="p-4 lg:px-6 lg:py-4">
              {/* Sub-tabs */}
              <div className="flex gap-2 mb-4 flex-wrap">
                <button
                  onClick={() => setActiveSection("vehicles")}
                  className={`px-3 py-1.5 text-sm font-semibold rounded-lg transition-colors ${
                    activeSection === "vehicles"
                      ? "bg-orange text-white"
                      : "bg-white text-gray hover:bg-gray-100"
                  }`}
                >
                  🚐 Véhicules {vehicles && `(${vehicles.length})`}
                </button>
                <button
                  onClick={() => setActiveSection("equipments")}
                  className={`px-3 py-1.5 text-sm font-semibold rounded-lg transition-colors ${
                    activeSection === "equipments"
                      ? "bg-orange text-white"
                      : "bg-white text-gray hover:bg-gray-100"
                  }`}
                >
                  ⚙️ Équipements {equipments && `(${equipments.length})`}
                </button>
                <button
                  onClick={() => setActiveSection("maintenances")}
                  className={`px-3 py-1.5 text-sm font-semibold rounded-lg transition-colors ${
                    activeSection === "maintenances"
                      ? "bg-orange text-white"
                      : "bg-white text-gray hover:bg-gray-100"
                  }`}
                >
                  🔧 Entretiens {maintenances && `(${maintenances.length})`}
                </button>
              </div>

              {/* Content */}
              {isLoading ? (
                <div className="flex justify-center py-8">
                  <div className="w-8 h-8 border-3 border-orange border-t-transparent rounded-full animate-spin" />
                </div>
              ) : (
                <>
                  {/* Vehicles */}
                  {activeSection === "vehicles" && (
                    <div className="bg-white rounded-xl p-4">
                      {vehicles && vehicles.length > 0 ? (
                        <div className="space-y-3">
                          {vehicles.map((vehicle) => (
                            <div
                              key={vehicle._id}
                              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                            >
                              <div className="flex-1">
                                <div className="font-medium text-black">{vehicle.name}</div>
                                <div className="text-sm text-gray">
                                  {vehicle.make} {vehicle.model} • {vehicle.vehicleType}
                                </div>
                                <div className="text-xs text-gray mt-1">
                                  {vehicle.currentMileage.toLocaleString()} km
                                </div>
                              </div>
                              <Link
                                href={`/dashboard/vehicles/${vehicle._id}`}
                                className="px-3 py-1.5 bg-orange text-white text-sm font-semibold rounded-lg hover:bg-orange-dark transition-colors"
                              >
                                Voir
                              </Link>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="text-center py-8 text-gray">
                          Aucun véhicule enregistré
                        </div>
                      )}
                    </div>
                  )}

                  {/* Equipments */}
                  {activeSection === "equipments" && (
                    <div className="bg-white rounded-xl p-4">
                      {equipments && equipments.length > 0 ? (
                        <div className="space-y-3">
                          {equipments.map((equipment) => {
                            const equipmentName =
                              equipment.customData?.name ||
                              equipment.equipmentId?.name ||
                              "Équipement";
                            
                            return (
                              <div
                                key={equipment._id}
                                className="p-3 bg-gray-50 rounded-lg"
                              >
                                <div className="flex items-center gap-2">
                                  <div className="font-medium text-black">
                                    {equipmentName}
                                  </div>
                                  {equipment.isCustom && (
                                    <span className="px-2 py-0.5 text-xs font-semibold text-blue-600 bg-blue-100 rounded-full">
                                      Custom
                                    </span>
                                  )}
                                </div>
                                <div className="text-sm text-gray mt-1">
                                  Véhicule: {equipment.vehicleId?.name || "N/A"}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <div className="text-center py-8 text-gray">
                          Aucun équipement enregistré
                        </div>
                      )}
                    </div>
                  )}

                  {/* Maintenances */}
                  {activeSection === "maintenances" && (
                    <div className="bg-white rounded-xl p-4">
                      {maintenances && maintenances.length > 0 ? (
                        <div className="space-y-3">
                          {maintenances.map((maintenance) => {
                            const maintenanceName =
                              maintenance.vehicleMaintenanceScheduleId?.maintenanceId?.name ||
                              maintenance.vehicleMaintenanceScheduleId?.customData?.name ||
                              "Entretien";
                            
                            return (
                              <div
                                key={maintenance._id}
                                className="p-3 bg-gray-50 rounded-lg"
                              >
                                <div className="font-medium text-black">
                                  {maintenanceName}
                                </div>
                                <div className="text-sm text-gray mt-1">
                                  Véhicule: {maintenance.vehicleId?.name || "N/A"}
                                </div>
                                <div className="text-xs text-gray mt-1">
                                  Effectué le:{" "}
                                  {new Date(maintenance.completedAt).toLocaleDateString("fr-FR")}
                                  {maintenance.cost && ` • ${maintenance.cost}€`}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <div className="text-center py-8 text-gray">
                          Aucun entretien effectué
                        </div>
                      )}
                    </div>
                  )}
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

