"use client";

import { useState } from "react";
import { motion } from "framer-motion";

interface Maintenance {
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

interface AIMaintenanceExtractorProps {
  equipmentId: string;
  equipmentName: string;
  manuals?: Array<{
    title: string;
    url: string;
    isExternal: boolean;
  }>;
  onExtracted: (maintenances: Maintenance[]) => void;
  onClose: () => void;
}

export default function AIMaintenanceExtractor({
  equipmentName,
  manuals,
  onExtracted,
  onClose,
}: AIMaintenanceExtractorProps) {
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractedMaintenances, setExtractedMaintenances] = useState<Maintenance[]>([]);
  const [selectedMaintenances, setSelectedMaintenances] = useState<Set<number>>(
    new Set()
  );
  const [error, setError] = useState("");
  const [manualText, setManualText] = useState("");

  const handleExtract = async () => {
    setIsExtracting(true);
    setError("");

    try {
      const response = await fetch("/api/admin/ai/extract-maintenances", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          equipmentName,
          manuals: manuals || [],
          manualText: manualText.trim(),
        }),
      });

      if (response.ok) {
        const data = await response.json();
        
        if (!data.maintenances || data.maintenances.length === 0) {
          setError("Aucun entretien n'a pu être généré. Essayez de fournir plus de détails dans le texte du manuel.");
          return;
        }
        
        setExtractedMaintenances(data.maintenances);
        // Pre-select all by default
        setSelectedMaintenances(
          new Set(data.maintenances.map((_: Maintenance, i: number) => i))
        );
      } else {
        const data = await response.json();
        setError(data.error || "Erreur lors de l'extraction");
        console.error("Extraction error:", data);
      }
    } catch (error) {
      setError("Erreur lors de l'extraction");
    } finally {
      setIsExtracting(false);
    }
  };

  const toggleSelection = (index: number) => {
    const newSelected = new Set(selectedMaintenances);
    if (newSelected.has(index)) {
      newSelected.delete(index);
    } else {
      newSelected.add(index);
    }
    setSelectedMaintenances(newSelected);
  };

  const handleValidate = () => {
    const selected = extractedMaintenances.filter((_, i) =>
      selectedMaintenances.has(i)
    );
    onExtracted(selected);
  };

  const translateType = (type: string) => {
    const types: Record<string, string> = {
      inspection: "Inspection",
      cleaning: "Nettoyage",
      replacement: "Remplacement",
      service: "Révision",
      lubrication: "Lubrification",
      adjustment: "Réglage",
      drain: "Vidange",
      test: "Test",
      calibration: "Calibration",
      other: "Autre",
    };
    return types[type] || type;
  };

  const translateDifficulty = (difficulty: string) => {
    const difficulties: Record<string, string> = {
      easy: "Facile",
      intermediate: "Intermédiaire",
      advanced: "Avancé",
      professional: "Professionnel",
    };
    return difficulties[difficulty] || difficulty;
  };

  const translatePriority = (priority: string) => {
    const priorities: Record<string, string> = {
      critical: "Critique",
      important: "Important",
      recommended: "Recommandé",
      optional: "Optionnel",
    };
    return priorities[priority] || priority;
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "critical":
        return "bg-red-100 text-red-700 border-red-300";
      case "important":
        return "bg-orange-100 text-orange-700 border-orange-300";
      case "recommended":
        return "bg-yellow-100 text-yellow-700 border-yellow-300";
      case "optional":
        return "bg-gray-100 text-gray-700 border-gray-300";
      default:
        return "bg-gray-100 text-gray-700 border-gray-300";
    }
  };

  const formatRecurrence = (recurrence?: { time?: { value: number; unit: string }; kilometers?: number }) => {
    const parts = [];
    if (recurrence?.time) {
      const unitLabels: Record<string, string> = { days: "jour", months: "mois", years: "an" };
      const unit = unitLabels[recurrence.time.unit] || recurrence.time.unit;
      
      // "mois" et "fois" ne prennent pas de "s" au pluriel
      const plural = (recurrence.time.value > 1 && unit !== "mois" && !unit.endsWith("s")) ? "s" : "";
      
      parts.push(`Tous les ${recurrence.time.value} ${unit}${plural}`);
    }
    if (recurrence?.kilometers) {
      parts.push(`Tous les ${recurrence.kilometers.toLocaleString()} km`);
    }
    return parts.join(" • ") || "Aucune récurrence définie";
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[60] p-4 overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.2 }}
        className="bg-white rounded-3xl w-full max-w-6xl my-8 max-h-[90vh] flex flex-col overflow-hidden shadow-2xl"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 flex-shrink-0 bg-gradient-to-r from-purple-600 to-purple-700 text-white">
          <div>
            <h2 className="text-2xl font-bold flex items-center gap-3">
              <svg
                className="w-8 h-8"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                />
              </svg>
              Extraction IA des entretiens
            </h2>
            <p className="text-purple-100 text-sm mt-1">
              Pour: {equipmentName}
              {manuals && manuals.length > 0 && (
                <> • {manuals.length} manuel{manuals.length > 1 ? "s" : ""}</>
              )}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-full transition-colors"
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

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1">
          {error && (
            <div className="p-6 bg-red-50 border-2 border-red-200 rounded-2xl mb-6">
              <div className="flex items-start gap-3">
                <svg
                  className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <div className="flex-1">
                  <h4 className="font-semibold text-red-900 mb-2">
                    Erreur d&apos;extraction
                  </h4>
                  <p className="text-red-700 text-sm whitespace-pre-wrap">{error}</p>
                  
                  <div className="mt-4 p-3 bg-white/50 rounded-lg">
                    <p className="text-xs text-red-800 font-medium mb-2">
                      💡 Que faire ?
                    </p>
                    <ul className="text-xs text-red-700 space-y-1 list-disc list-inside">
                      <li>Collez du texte du manuel dans la zone ci-dessous</li>
                      <li>Vérifiez que le nom de l&apos;équipement est précis</li>
                      <li>Sinon, ajoutez les entretiens manuellement</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Initial State */}
          {extractedMaintenances.length === 0 && !isExtracting && (
            <div className="text-center py-12">
              <div className="w-20 h-20 bg-gradient-to-br from-purple-100 to-purple-200 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg
                  className="w-10 h-10 text-purple-600"
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
              </div>

              <h3 className="text-2xl font-bold text-black mb-4">
                Prêt à générer les entretiens
              </h3>
              <p className="text-gray mb-6 max-w-2xl mx-auto">
                L&apos;IA va analyser le texte du manuel si vous en collez un, ou générer des entretiens
                standards pour ce type d&apos;équipement ({equipmentName}).
              </p>
              <p className="text-sm text-orange-600 mb-6 max-w-2xl mx-auto bg-orange-50 p-3 rounded-xl">
                💡 Pour des entretiens précis: Copiez-collez le texte du manuel ci-dessous<br/>
                💡 Pour des entretiens standards: Laissez vide et cliquez sur Générer
              </p>

              {manuals && manuals.length > 0 && (
                <div className="bg-purple-50 rounded-2xl p-6 mb-8 max-w-2xl mx-auto text-left">
                  <h4 className="font-semibold text-black mb-3 flex items-center gap-2">
                    <svg
                      className="w-5 h-5 text-purple-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                    Manuels disponibles:
                  </h4>
                  <ul className="space-y-2">
                    {manuals.map((manual, index) => (
                      <li
                        key={index}
                        className="flex items-center gap-2 text-sm text-gray-700"
                      >
                        <svg
                          className="w-4 h-4 text-purple-600 flex-shrink-0"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                            clipRule="evenodd"
                          />
                        </svg>
                        {manual.title}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Zone de texte pour copier-coller le manuel */}
              <div className="bg-blue-50 rounded-2xl p-6 mb-8 max-w-2xl mx-auto">
                <div className="flex items-start gap-2 mb-3">
                  <svg
                    className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                  <div className="flex-1">
                    <h4 className="font-semibold text-blue-900 mb-1">
                      Contenu du manuel (optionnel)
                    </h4>
                    <p className="text-xs text-blue-700 mb-3">
                      Copiez-collez ici le texte de votre manuel pour une analyse précise. L&apos;IA traduit automatiquement en français si le manuel est en anglais.
                    </p>
                  </div>
                </div>
                <textarea
                  value={manualText}
                  onChange={(e) => setManualText(e.target.value)}
                  placeholder="Exemple: Pour assurer un fonctionnement fiable de l'appareil de chauffage, allumez-le une fois par mois pendant 20 minutes à pleine puissance..."
                  className="w-full h-40 px-4 py-3 border-2 border-blue-200 rounded-xl focus:border-blue-500 focus:outline-none resize-none text-sm font-mono"
                />
                <p className="text-xs text-blue-600 mt-2">
                  💡 Astuce: Ouvrez votre PDF et copiez tout le texte (Ctrl+A puis Ctrl+C)
                </p>
              </div>

              <button
                onClick={handleExtract}
                className="px-8 py-4 bg-gradient-to-r from-purple-600 to-purple-700 text-white font-bold rounded-2xl hover:shadow-lg hover:scale-105 transition-all duration-300 flex items-center gap-3 mx-auto"
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
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
                Générer les entretiens recommandés
              </button>
            </div>
          )}

          {/* Loading State */}
          {isExtracting && (
            <div className="text-center py-12">
              <div className="w-20 h-20 border-4 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-6" />
              <h3 className="text-2xl font-bold text-black mb-4">
                Génération en cours...
              </h3>
              <p className="text-gray mb-2">
                L&apos;IA génère les entretiens recommandés pour votre équipement
              </p>
              <p className="text-sm text-gray-500">
                Cela peut prendre quelques secondes
              </p>
            </div>
          )}

          {/* Results */}
          {extractedMaintenances.length > 0 && !isExtracting && (
            <div>
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-bold text-black">
                    {extractedMaintenances.length} entretien
                    {extractedMaintenances.length > 1 ? "s" : ""} trouvé
                    {extractedMaintenances.length > 1 ? "s" : ""}
                  </h3>
                  <p className="text-sm text-gray">
                    {selectedMaintenances.size} sélectionné
                    {selectedMaintenances.size > 1 ? "s" : ""}
                  </p>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() =>
                      setSelectedMaintenances(
                        new Set(
                          extractedMaintenances.map((_, i) => i)
                        )
                      )
                    }
                    className="px-4 py-2 bg-gray-100 text-black font-semibold rounded-xl hover:bg-gray-200 transition-colors"
                  >
                    Tout sélectionner
                  </button>
                  <button
                    onClick={() => setSelectedMaintenances(new Set())}
                    className="px-4 py-2 bg-gray-100 text-black font-semibold rounded-xl hover:bg-gray-200 transition-colors"
                  >
                    Tout désélectionner
                  </button>
                </div>
              </div>

              <div className="space-y-4 mb-6">
                {extractedMaintenances.map((maintenance, index) => {
                  const isSelected = selectedMaintenances.has(index);
                  return (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className={`border-2 rounded-2xl p-4 transition-all cursor-pointer ${
                        isSelected
                          ? "border-purple-600 bg-purple-50"
                          : "border-gray-200 bg-white hover:border-purple-300"
                      }`}
                      onClick={() => toggleSelection(index)}
                    >
                      <div className="flex items-start gap-4">
                        {/* Checkbox */}
                        <div className="pt-1">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => toggleSelection(index)}
                            className="w-5 h-5 text-purple-600 rounded"
                          />
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-4 mb-2">
                            <h4 className="font-bold text-black text-lg">
                              {maintenance.name}
                            </h4>
                            <span
                              className={`px-3 py-1 text-xs font-semibold rounded-full border ${getPriorityColor(
                                maintenance.priority
                              )}`}
                            >
                              {translatePriority(maintenance.priority)}
                            </span>
                          </div>

                          <p className="text-sm text-gray mb-3">
                            {maintenance.description}
                          </p>

                          <div className="flex flex-wrap gap-2 mb-3">
                            <span className="px-3 py-1 bg-blue-50 text-blue-700 text-xs font-semibold rounded-full">
                              {translateType(maintenance.type)}
                            </span>
                            <span className="px-3 py-1 bg-green-50 text-green-700 text-xs font-semibold rounded-full">
                              {translateDifficulty(maintenance.difficulty)}
                            </span>
                            <span className="px-3 py-1 bg-purple-100 text-purple-700 text-xs font-semibold rounded-full">
                              {formatRecurrence(maintenance.recurrence)}
                            </span>
                            {maintenance.estimatedDuration && (
                              <span className="px-3 py-1 bg-orange-50 text-orange-700 text-xs font-semibold rounded-full">
                                ⏱️ {maintenance.estimatedDuration} min
                              </span>
                            )}
                          </div>

                          {maintenance.instructions && (
                            <p className="text-xs text-gray bg-gray-50 p-3 rounded-xl line-clamp-3">
                              {maintenance.instructions}
                            </p>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        {extractedMaintenances.length > 0 && !isExtracting && (
          <div className="flex gap-4 p-6 border-t border-gray-200 flex-shrink-0">
            <button
              onClick={onClose}
              className="flex-1 px-6 py-3 bg-gray-100 text-black font-semibold rounded-2xl hover:bg-gray-200 transition-all duration-300"
            >
              Annuler
            </button>
            <button
              onClick={handleValidate}
              disabled={selectedMaintenances.size === 0}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-600 to-purple-700 text-white font-bold rounded-2xl hover:shadow-lg hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:hover:scale-100"
            >
              Valider {selectedMaintenances.size} entretien
              {selectedMaintenances.size > 1 ? "s" : ""}
            </button>
          </div>
        )}
      </motion.div>
    </div>
  );
}

