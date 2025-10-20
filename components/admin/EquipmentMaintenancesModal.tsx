"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import MaintenanceList from "./MaintenanceList";
import AddMaintenanceModal from "./AddMaintenanceModal";
import AIMaintenanceExtractor from "./AIMaintenanceExtractor";

interface Equipment {
  _id: string;
  name: string;
  manuals?: Array<{
    title: string;
    url: string;
    isExternal: boolean;
  }>;
}

interface EquipmentMaintenancesModalProps {
  equipment: Equipment;
  onClose: () => void;
}

// Type for MaintenanceList
interface MaintenanceListItem {
  _id: string;
  equipmentId?: string;
  name: string;
  type: string;
  priority: string;
  difficulty: string;
  recurrence: {
    time?: { value: number; unit: string };
    kilometers?: number;
  };
  conditions?: string[];
  description?: string;
  instructions?: string;
  photos?: string[];
  videos?: string[];
  parts?: Array<{
    name: string;
    reference?: string;
    quantity: number;
    estimatedCost?: number;
    purchaseLink?: string;
  }>;
  estimatedDuration?: number;
  estimatedCost?: number;
  tags?: string[];
  isOfficial?: boolean;
  source?: string;
}

// Type for AddMaintenanceModal (equipmentId is required)
interface MaintenanceForEdit extends MaintenanceListItem {
  equipmentId: string;
}

// Type for AI Extractor
interface AIExtractedMaintenance {
  name: string;
  type: string;
  priority: string;
  difficulty: string;
  description?: string;
  instructions?: string;
  recurrence?: {
    time?: { value: number; unit: string };
    kilometers?: number;
  };
  estimatedDuration?: number;
}

interface FullEquipment extends Equipment {
  [key: string]: unknown;
}

export default function EquipmentMaintenancesModal({
  equipment,
  onClose,
}: EquipmentMaintenancesModalProps) {
  const [maintenances, setMaintenances] = useState<MaintenanceListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingMaintenance, setEditingMaintenance] = useState<MaintenanceForEdit | null>(null);
  const [isAIExtractorOpen, setIsAIExtractorOpen] = useState(false);
  const [fullEquipment, setFullEquipment] = useState<FullEquipment | null>(null);
  const [isCopyMode, setIsCopyMode] = useState(false);
  const [equipmentsList, setEquipmentsList] = useState<Equipment[]>([]);
  const [selectedEquipmentId, setSelectedEquipmentId] = useState<string>("");
  const [equipmentSearch, setEquipmentSearch] = useState("");
  const [isCopying, setIsCopying] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const fetchEquipmentDetails = async () => {
    try {
      const response = await fetch(`/api/admin/equipments/${equipment._id}`);
      if (response.ok) {
        const data = await response.json();
        setFullEquipment(data.equipment);
      }
    } catch (error) {
      console.error("Error fetching equipment:", error);
    }
  };

  const fetchAllEquipments = async () => {
    try {
      const response = await fetch("/api/admin/equipments");
      if (response.ok) {
        const data = await response.json();
        // Filter out current equipment
        setEquipmentsList(data.equipments.filter((e: Equipment) => e._id !== equipment._id));
      }
    } catch (error) {
      console.error("Error fetching equipments:", error);
    }
  };

  const fetchMaintenances = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(
        `/api/admin/maintenances?equipmentId=${equipment._id}`
      );
      if (response.ok) {
        const data = await response.json();
        setMaintenances(data.maintenances);
      }
    } catch (error) {
      console.error("Error fetching maintenances:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEquipmentDetails();
    fetchMaintenances();
  }, [equipment._id]);

  const handleAddMaintenance = () => {
    setEditingMaintenance(null);
    setIsAddModalOpen(true);
  };

  const handleEditMaintenance = (maintenance: MaintenanceListItem) => {
    // Ensure equipmentId is present before editing
    if (maintenance.equipmentId) {
      setEditingMaintenance(maintenance as MaintenanceForEdit);
      setIsAddModalOpen(true);
    }
  };

  const handleMaintenanceSuccess = () => {
    setIsAddModalOpen(false);
    setEditingMaintenance(null);
    fetchMaintenances();
  };

  const handleAIExtracted = async (extractedMaintenances: AIExtractedMaintenance[]) => {
    // Create all extracted maintenances
    for (const maintenance of extractedMaintenances) {
      try {
        await fetch("/api/admin/maintenances", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            equipmentId: equipment._id,
            ...maintenance,
          }),
        });
      } catch (error) {
        console.error("Error creating maintenance:", error);
      }
    }

    setIsAIExtractorOpen(false);
    fetchMaintenances();
  };

  const handleCopyMaintenances = async () => {
    if (!selectedEquipmentId) return;

    setIsCopying(true);
    try {
      // Fetch maintenances from selected equipment
      const response = await fetch(
        `/api/admin/maintenances?equipmentId=${selectedEquipmentId}`
      );
      if (!response.ok) throw new Error("Failed to fetch maintenances");

      const data = await response.json();
      const sourceMaintenances = data.maintenances;

      // Copy each maintenance
      for (const maintenance of sourceMaintenances) {
        try {
          const { _id, equipmentId, createdAt, updatedAt, ...maintenanceData } = maintenance;
          await fetch("/api/admin/maintenances", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              ...maintenanceData,
              equipmentId: equipment._id,
            }),
          });
        } catch (error) {
          console.error("Error copying maintenance:", error);
        }
      }

      // Reset state and refresh
      setIsCopyMode(false);
      setSelectedEquipmentId("");
      setEquipmentSearch("");
      setIsDropdownOpen(false);
      fetchMaintenances();
    } catch (error) {
      console.error("Error copying maintenances:", error);
    } finally {
      setIsCopying(false);
    }
  };

  const handleOpenCopyMode = () => {
    setIsCopyMode(true);
    fetchAllEquipments();
  };

  const filteredEquipments = equipmentsList.filter((eq) =>
    eq.name.toLowerCase().includes(equipmentSearch.toLowerCase())
  );

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.2 }}
        className="bg-gradient-to-br from-gray-50 to-white rounded-3xl w-full max-w-7xl my-8 max-h-[90vh] flex flex-col overflow-hidden shadow-2xl"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 flex-shrink-0 bg-white">
          <div>
            <h2 className="text-2xl font-bold text-black">
              Entretiens proposés
            </h2>
            <p className="text-gray">Pour: {equipment.name}</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleOpenCopyMode}
              className="px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-xl hover:shadow-lg transition-all duration-300 flex items-center gap-2"
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
                  d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                />
              </svg>
              Copier depuis
            </button>
            <button
              onClick={() => setIsAIExtractorOpen(true)}
              className="px-4 py-2 bg-gradient-to-r from-purple-600 to-purple-700 text-white font-semibold rounded-xl hover:shadow-lg transition-all duration-300 flex items-center gap-2"
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
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                />
              </svg>
              Extraction IA
            </button>
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
        </div>

        {/* Copy Mode Panel */}
        <AnimatePresence>
          {isCopyMode && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="border-b border-gray-200 bg-blue-50 overflow-hidden"
            >
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Copier les maintenances de :
                </h3>
                <div className="flex flex-col gap-4">
                  <div className="relative">
                    <input
                      type="text"
                      value={equipmentSearch}
                      onChange={(e) => {
                        setEquipmentSearch(e.target.value);
                        setIsDropdownOpen(true);
                      }}
                      onFocus={() => setIsDropdownOpen(true)}
                      placeholder="Rechercher un équipement..."
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    {equipmentSearch && isDropdownOpen && (
                      <div className="absolute z-10 w-full mt-2 bg-white border border-gray-200 rounded-xl shadow-lg max-h-60 overflow-y-auto">
                        {filteredEquipments.length > 0 ? (
                          filteredEquipments.map((eq) => (
                            <button
                              key={eq._id}
                              onClick={() => {
                                setSelectedEquipmentId(eq._id);
                                setEquipmentSearch(eq.name);
                                setIsDropdownOpen(false);
                              }}
                              className="w-full px-4 py-3 text-left hover:bg-blue-50 transition-colors"
                            >
                              <div className="font-medium text-gray-900">
                                {eq.name}
                              </div>
                            </button>
                          ))
                        ) : (
                          <div className="px-4 py-3 text-gray-500 text-center">
                            Aucun équipement trouvé
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={handleCopyMaintenances}
                      disabled={!selectedEquipmentId || isCopying}
                      className="flex-1 px-6 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-all duration-300 flex items-center justify-center gap-2"
                    >
                      {isCopying ? (
                        <>
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          Copie en cours...
                        </>
                      ) : (
                        <>
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
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                          Copier les maintenances
                        </>
                      )}
                    </button>
                    <button
                      onClick={() => {
                        setIsCopyMode(false);
                        setSelectedEquipmentId("");
                        setEquipmentSearch("");
                        setIsDropdownOpen(false);
                      }}
                      className="px-6 py-3 bg-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-300 transition-all duration-300"
                    >
                      Annuler
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1">
          {isLoading ? (
            <div className="flex justify-center items-center py-20">
              <div className="w-12 h-12 border-4 border-orange border-t-transparent rounded-full animate-spin" />
            </div>
          ) : (
            <MaintenanceList
              equipmentName={equipment.name}
              maintenances={maintenances}
              onRefresh={fetchMaintenances}
              onAdd={handleAddMaintenance}
              onEdit={handleEditMaintenance}
            />
          )}
        </div>
      </motion.div>

      {/* Add/Edit Maintenance Modal */}
      <AnimatePresence>
        {isAddModalOpen && (
          <AddMaintenanceModal
            equipmentId={equipment._id}
            equipmentName={equipment.name}
            onClose={() => {
              setIsAddModalOpen(false);
              setEditingMaintenance(null);
            }}
            onSuccess={handleMaintenanceSuccess}
            maintenance={editingMaintenance}
          />
        )}
      </AnimatePresence>

      {/* AI Maintenance Extractor */}
      <AnimatePresence>
        {isAIExtractorOpen && (
          <AIMaintenanceExtractor
            equipmentId={equipment._id}
            equipmentName={equipment.name}
            manuals={fullEquipment?.manuals}
            onExtracted={handleAIExtracted}
            onClose={() => setIsAIExtractorOpen(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

