"use client";

import { motion } from "framer-motion";

interface MaintenanceInstructionsModalProps {
  maintenanceName: string;
  instructions: string;
  description?: string;
  estimatedDuration?: number;
  difficulty?: string;
  conditions?: string[];
  onClose: () => void;
}

const difficultyColors: Record<string, string> = {
  easy: "bg-green-100 text-green-700",
  intermediate: "bg-yellow-100 text-yellow-700",
  advanced: "bg-orange-100 text-orange-700",
  professional: "bg-red-100 text-red-700",
};

const difficultyLabels: Record<string, string> = {
  easy: "Facile",
  intermediate: "Intermédiaire",
  advanced: "Avancé",
  professional: "Professionnel",
};

export default function MaintenanceInstructionsModal({
  maintenanceName,
  instructions,
  description,
  estimatedDuration,
  difficulty,
  conditions,
  onClose,
}: MaintenanceInstructionsModalProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-2 sm:p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-6 bg-gradient-to-r from-indigo-600 to-blue-600 border-b border-indigo-100">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
                <svg
                  className="w-5 h-5 sm:w-6 sm:h-6 text-white"
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
              </div>
              <div>
                <h3 className="text-base sm:text-xl font-bold text-white">
                  Instructions
                </h3>
                <p className="text-xs sm:text-sm text-indigo-100 truncate max-w-[200px] sm:max-w-md">
                  {maintenanceName}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-xl transition-colors flex-shrink-0"
            >
              <svg
                className="w-5 h-5 sm:w-6 sm:h-6 text-white"
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
        <div className="flex-1 overflow-y-auto p-4 sm:p-6">
          {/* Info badges */}
          <div className="flex flex-wrap gap-2 mb-4">
            {difficulty && (
              <span
                className={`px-3 py-1.5 rounded-lg text-xs sm:text-sm font-medium ${
                  difficultyColors[difficulty] || "bg-gray-100 text-gray-700"
                }`}
              >
                🎯 {difficultyLabels[difficulty] || difficulty}
              </span>
            )}
            {estimatedDuration && (
              <span className="px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg text-xs sm:text-sm font-medium">
                ⏱️ ~{estimatedDuration} min
              </span>
            )}
          </div>

          {/* Description */}
          {description && (
            <div className="mb-6">
              <h4 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
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
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                Description
              </h4>
              <p className="text-sm text-gray-600 bg-gray-50 rounded-xl p-3 sm:p-4">
                {description}
              </p>
            </div>
          )}

          {/* Conditions */}
          {conditions && conditions.length > 0 && (
            <div className="mb-6">
              <h4 className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
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
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                Quand effectuer cet entretien ?
              </h4>
              <div className="space-y-2">
                {conditions.map((condition, idx) => (
                  <div
                    key={idx}
                    className="flex items-start gap-2 text-sm text-gray-600 bg-amber-50 rounded-lg p-2 sm:p-3"
                  >
                    <span className="text-amber-600 mt-0.5">⚠️</span>
                    <span>{condition}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Instructions */}
          <div>
            <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
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
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                />
              </svg>
              Étapes à suivre
            </h4>
            <div className="bg-gradient-to-br from-indigo-50 to-blue-50 rounded-xl p-4 sm:p-5 border border-indigo-100">
              <div className="space-y-3 text-sm text-gray-700 whitespace-pre-wrap leading-relaxed">
                {instructions.split("\n").map((line, idx) => {
                  const trimmedLine = line.trim();
                  if (!trimmedLine) return null;
                  
                  // Détecte les lignes numérotées (1. 2. etc.)
                  const isNumberedStep = /^\d+\./.test(trimmedLine);
                  
                  return (
                    <div
                      key={idx}
                      className={`flex gap-3 ${
                        isNumberedStep ? "items-start" : "items-center"
                      }`}
                    >
                      {isNumberedStep ? (
                        <>
                          <div className="flex-shrink-0 w-6 h-6 bg-indigo-600 text-white rounded-full flex items-center justify-center text-xs font-bold mt-0.5">
                            {trimmedLine.match(/^\d+/)?.[0]}
                          </div>
                          <p className="flex-1">
                            {trimmedLine.replace(/^\d+\.\s*/, "")}
                          </p>
                        </>
                      ) : (
                        <>
                          <span className="text-indigo-600">•</span>
                          <p className="flex-1">{trimmedLine}</p>
                        </>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Safety warning */}
          <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-xl p-3 sm:p-4">
            <div className="flex items-start gap-2">
              <svg
                className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                />
              </svg>
              <div>
                <p className="text-xs sm:text-sm font-semibold text-yellow-800">
                  Rappel de sécurité
                </p>
                <p className="text-xs text-yellow-700 mt-1">
                  Suivez toujours les consignes du fabricant et prenez les précautions
                  nécessaires. En cas de doute, consultez un professionnel.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 sm:p-6 border-t border-gray-200">
          <button
            onClick={onClose}
            className="w-full px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white font-semibold rounded-xl transition-all shadow-md hover:shadow-lg"
          >
            Fermer
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

