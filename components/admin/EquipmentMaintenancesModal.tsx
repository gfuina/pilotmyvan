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

  const hasManuals = fullEquipment?.manuals && fullEquipment.manuals.length > 0;

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
            {hasManuals && (
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
            )}
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
        {isAIExtractorOpen && fullEquipment && (
          <AIMaintenanceExtractor
            equipmentId={equipment._id}
            equipmentName={equipment.name}
            manuals={fullEquipment.manuals || []}
            onExtracted={handleAIExtracted}
            onClose={() => setIsAIExtractorOpen(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

