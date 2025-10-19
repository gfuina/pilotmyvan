"use client";

import React, { useState } from "react";
import MultiImageUpload from "./MultiImageUpload";

interface MaintenanceFormProps {
  equipmentId: string;
  equipmentName: string;
  onSubmit: (data: MaintenanceFormData) => Promise<void>;
  isSubmitting: boolean;
}

export interface MaintenanceFormData {
  name: string;
  type: string;
  priority: string;
  difficulty: string;
  recurrence: {
    time?: {
      value: number;
      unit: string;
    };
    kilometers?: number;
  };
  conditions: string[];
  description: string;
  instructions: string;
  photos: string[];
  parts: Array<{
    name: string;
    reference: string;
    quantity: number;
    estimatedCost?: number;
    purchaseLink: string;
  }>;
  estimatedDuration?: number;
  estimatedCost?: number;
  tags: string[];
}

const TYPE_OPTIONS = [
  { value: "inspection", label: "🔍 Inspection" },
  { value: "cleaning", label: "🧼 Nettoyage" },
  { value: "replacement", label: "🔄 Remplacement" },
  { value: "service", label: "🔧 Révision" },
  { value: "lubrication", label: "💧 Lubrification" },
  { value: "adjustment", label: "⚙️ Réglage" },
  { value: "drain", label: "🛢️ Vidange" },
  { value: "test", label: "🧪 Test" },
  { value: "calibration", label: "📏 Calibration" },
  { value: "other", label: "📋 Autre" },
];

const PRIORITY_OPTIONS = [
  { value: "critical", label: "🔴 Critique", color: "text-red-700" },
  { value: "important", label: "🟠 Important", color: "text-orange-700" },
  { value: "recommended", label: "🟡 Recommandé", color: "text-yellow-700" },
  { value: "optional", label: "⚪ Optionnel", color: "text-gray-700" },
];

const DIFFICULTY_OPTIONS = [
  { value: "easy", label: "😊 Facile" },
  { value: "intermediate", label: "🤔 Intermédiaire" },
  { value: "advanced", label: "😰 Avancé" },
  { value: "professional", label: "👨‍🔧 Professionnel" },
];

export default function MaintenanceForm({
  equipmentId,
  equipmentName,
  onSubmit,
  isSubmitting,
}: MaintenanceFormProps) {
  const [formData, setFormData] = useState<MaintenanceFormData>({
    name: "",
    type: "inspection",
    priority: "recommended",
    difficulty: "intermediate",
    recurrence: {},
    conditions: [],
    description: "",
    instructions: "",
    photos: [],
    parts: [],
    estimatedDuration: undefined,
    estimatedCost: undefined,
    tags: [],
  });

  const [error, setError] = useState("");
  const [conditionInput, setConditionInput] = useState("");
  const [tagInput, setTagInput] = useState("");

  // Part form
  const [partName, setPartName] = useState("");
  const [partReference, setPartReference] = useState("");
  const [partQuantity, setPartQuantity] = useState(1);
  const [partCost, setPartCost] = useState<number | undefined>(undefined);
  const [partLink, setPartLink] = useState("");

  // Recurrence
  const [hasTimeRecurrence, setHasTimeRecurrence] = useState(false);
  const [timeValue, setTimeValue] = useState(6);
  const [timeUnit, setTimeUnit] = useState("months");
  const [hasKmRecurrence, setHasKmRecurrence] = useState(false);
  const [kmValue, setKmValue] = useState(10000);

  const addCondition = () => {
    if (conditionInput.trim()) {
      setFormData((prev) => ({
        ...prev,
        conditions: [...prev.conditions, conditionInput.trim()],
      }));
      setConditionInput("");
    }
  };

  const removeCondition = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      conditions: prev.conditions.filter((_, i) => i !== index),
    }));
  };

  const addTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData((prev) => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()],
      }));
      setTagInput("");
    }
  };

  const removeTag = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((_, i) => i !== index),
    }));
  };

  const addPart = () => {
    if (!partName.trim()) {
      alert("Le nom de la pièce est requis");
      return;
    }

    if (partQuantity < 1) {
      alert("La quantité doit être d'au moins 1");
      return;
    }

    setFormData((prev) => ({
      ...prev,
      parts: [
        ...prev.parts,
        {
          name: partName.trim(),
          reference: partReference.trim(),
          quantity: partQuantity,
          estimatedCost: partCost,
          purchaseLink: partLink.trim(),
        },
      ],
    }));

    // Reset
    setPartName("");
    setPartReference("");
    setPartQuantity(1);
    setPartCost(undefined);
    setPartLink("");
  };

  const removePart = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      parts: prev.parts.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!formData.name.trim()) {
      setError("Le nom est requis");
      return;
    }

    // Build recurrence
    const recurrence: MaintenanceFormData["recurrence"] = {};
    if (hasTimeRecurrence) {
      recurrence.time = {
        value: timeValue,
        unit: timeUnit,
      };
    }
    if (hasKmRecurrence) {
      recurrence.kilometers = kmValue;
    }

    if (!recurrence.time && !recurrence.kilometers) {
      setError("Au moins une récurrence (temporelle ou kilométrique) est requise");
      return;
    }

    await onSubmit({
      ...formData,
      recurrence,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-4xl mx-auto">
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-2xl">
          <p className="text-red-600 text-sm">{error}</p>
        </div>
      )}

      {/* Info Box */}
      <div className="bg-blue-50 border-2 border-blue-200 rounded-2xl p-6">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center flex-shrink-0">
            <svg
              className="w-5 h-5 text-white"
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
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-bold text-blue-900 mb-2">
              Enrichissez la bibliothèque !
            </h3>
            <p className="text-blue-700 text-sm mb-2">
              Créez un entretien pour <strong>{equipmentName}</strong> et aidez la communauté.
            </p>
            <p className="text-blue-600 text-xs">
              💡 Plus vous fournissez d&apos;informations (instructions, photos, pièces), plus c&apos;est utile !
            </p>
          </div>
        </div>
      </div>

      {/* Basic Info */}
      <div>
        <label className="block text-sm font-medium text-black mb-2">
          Nom de l&apos;entretien <span className="text-orange">*</span>
        </label>
        <input
          type="text"
          value={formData.name}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, name: e.target.value }))
          }
          placeholder="Ex: Vérification des connexions électriques"
          className="w-full px-4 py-3 rounded-2xl border-2 border-gray-200 focus:border-orange focus:outline-none transition-colors"
          required
        />
      </div>

      {/* Type, Priority, Difficulty */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-black mb-2">
            Type <span className="text-orange">*</span>
          </label>
          <select
            value={formData.type}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, type: e.target.value }))
            }
            className="w-full px-4 py-3 rounded-2xl border-2 border-gray-200 focus:border-orange focus:outline-none transition-colors"
            required
          >
            {TYPE_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-black mb-2">
            Priorité <span className="text-orange">*</span>
          </label>
          <select
            value={formData.priority}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, priority: e.target.value }))
            }
            className="w-full px-4 py-3 rounded-2xl border-2 border-gray-200 focus:border-orange focus:outline-none transition-colors"
            required
          >
            {PRIORITY_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-black mb-2">
            Difficulté <span className="text-orange">*</span>
          </label>
          <select
            value={formData.difficulty}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, difficulty: e.target.value }))
            }
            className="w-full px-4 py-3 rounded-2xl border-2 border-gray-200 focus:border-orange focus:outline-none transition-colors"
            required
          >
            {DIFFICULTY_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Recurrence */}
      <div className="space-y-4">
        <label className="block text-sm font-medium text-black">
          Récurrence <span className="text-orange">*</span>
        </label>

        {/* Time-based recurrence */}
        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            id="hasTimeRecurrence"
            checked={hasTimeRecurrence}
            onChange={(e) => setHasTimeRecurrence(e.target.checked)}
            className="w-5 h-5 text-orange rounded"
          />
          <label
            htmlFor="hasTimeRecurrence"
            className="text-sm font-medium text-black cursor-pointer"
          >
            Récurrence temporelle
          </label>
        </div>

        {hasTimeRecurrence && (
          <div className="flex gap-3 pl-8">
            <div className="flex-1">
              <input
                type="number"
                min="1"
                value={timeValue}
                onChange={(e) => setTimeValue(parseInt(e.target.value) || 1)}
                placeholder="6"
                className="w-full px-4 py-3 rounded-2xl border-2 border-gray-200 focus:border-orange focus:outline-none"
              />
            </div>
            <div className="flex-1">
              <select
                value={timeUnit}
                onChange={(e) => setTimeUnit(e.target.value)}
                className="w-full px-4 py-3 rounded-2xl border-2 border-gray-200 focus:border-orange focus:outline-none"
              >
                <option value="days">Jour(s)</option>
                <option value="months">Mois</option>
                <option value="years">An(s)</option>
              </select>
            </div>
          </div>
        )}

        {/* Kilometer-based recurrence */}
        <div className="flex items-center gap-3">
          <input
            type="checkbox"
            id="hasKmRecurrence"
            checked={hasKmRecurrence}
            onChange={(e) => setHasKmRecurrence(e.target.checked)}
            className="w-5 h-5 text-orange rounded"
          />
          <label
            htmlFor="hasKmRecurrence"
            className="text-sm font-medium text-black cursor-pointer"
          >
            Récurrence kilométrique
          </label>
        </div>

        {hasKmRecurrence && (
          <div className="pl-8">
            <input
              type="number"
              min="1"
              value={kmValue}
              onChange={(e) => setKmValue(parseInt(e.target.value) || 1)}
              placeholder="10000"
              className="w-full px-4 py-3 rounded-2xl border-2 border-gray-200 focus:border-orange focus:outline-none"
            />
            <p className="text-xs text-gray mt-1">Tous les X kilomètres</p>
          </div>
        )}
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
          placeholder="Décrivez brièvement cet entretien..."
          className="w-full px-4 py-3 rounded-2xl border-2 border-gray-200 focus:border-orange focus:outline-none resize-none transition-colors"
        />
      </div>

      {/* Instructions */}
      <div>
        <label className="block text-sm font-medium text-black mb-2">
          Instructions détaillées
        </label>
        <textarea
          value={formData.instructions}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, instructions: e.target.value }))
          }
          rows={6}
          placeholder="Étapes détaillées pour effectuer cet entretien..."
          className="w-full px-4 py-3 rounded-2xl border-2 border-gray-200 focus:border-orange focus:outline-none resize-none transition-colors"
        />
      </div>

      {/* Conditions */}
      <div>
        <label className="block text-sm font-medium text-black mb-3">
          Conditions spéciales
        </label>
        <p className="text-xs text-gray mb-3">
          Ex: &quot;Par temps froid&quot;, &quot;Avant l&apos;hiver&quot;, etc.
        </p>

        {formData.conditions.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-3">
            {formData.conditions.map((cond, index) => (
              <div
                key={index}
                className="inline-flex items-center gap-2 px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm"
              >
                {cond}
                <button
                  type="button"
                  onClick={() => removeCondition(index)}
                  className="hover:text-purple-900"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="flex gap-2">
          <input
            type="text"
            value={conditionInput}
            onChange={(e) => setConditionInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addCondition();
              }
            }}
            placeholder="Ajouter une condition"
            className="flex-1 px-4 py-2 rounded-xl border border-gray-200 focus:border-orange focus:outline-none text-sm"
          />
          <button
            type="button"
            onClick={addCondition}
            className="px-4 py-2 bg-purple-600 text-white font-medium rounded-xl hover:bg-purple-700 transition-colors text-sm"
          >
            + Ajouter
          </button>
        </div>
      </div>

      {/* Photos */}
      <div>
        <label className="block text-sm font-medium text-black mb-3">
          Photos explicatives
        </label>
        <MultiImageUpload
          images={formData.photos}
          onImagesChange={(photos) =>
            setFormData((prev) => ({ ...prev, photos }))
          }
          maxImages={5}
        />
      </div>

      {/* Parts */}
      <div>
        <label className="block text-sm font-medium text-black mb-3">
          Pièces & Consommables nécessaires
        </label>

        {formData.parts.length > 0 && (
          <div className="space-y-2 mb-4">
            {formData.parts.map((part, index) => (
              <div
                key={index}
                className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl"
              >
                <div className="flex-1">
                  <p className="font-medium text-black text-sm">{part.name}</p>
                  <div className="text-xs text-gray space-x-2">
                    {part.reference && <span>Réf: {part.reference}</span>}
                    <span>Qté: {part.quantity}</span>
                    {part.estimatedCost !== undefined && (
                      <span>~{part.estimatedCost}€</span>
                    )}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => removePart(index)}
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

        {/* Add part form */}
        <div className="space-y-3 p-4 border-2 border-dashed border-gray-300 rounded-2xl">
          <input
            type="text"
            value={partName}
            onChange={(e) => setPartName(e.target.value)}
            placeholder="Nom de la pièce *"
            className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:border-orange focus:outline-none text-sm"
          />

          <div className="grid grid-cols-2 gap-3">
            <input
              type="text"
              value={partReference}
              onChange={(e) => setPartReference(e.target.value)}
              placeholder="Référence (optionnel)"
              className="px-4 py-2 rounded-xl border border-gray-200 focus:border-orange focus:outline-none text-sm"
            />
            <input
              type="number"
              min="1"
              value={partQuantity}
              onChange={(e) => setPartQuantity(parseInt(e.target.value) || 1)}
              placeholder="Quantité"
              className="px-4 py-2 rounded-xl border border-gray-200 focus:border-orange focus:outline-none text-sm"
            />
          </div>

          <input
            type="number"
            min="0"
            step="0.01"
            value={partCost ?? ""}
            onChange={(e) =>
              setPartCost(e.target.value ? parseFloat(e.target.value) : undefined)
            }
            placeholder="Coût estimé (€) (optionnel)"
            className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:border-orange focus:outline-none text-sm"
          />

          <input
            type="url"
            value={partLink}
            onChange={(e) => setPartLink(e.target.value)}
            placeholder="Lien d'achat (optionnel)"
            className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:border-orange focus:outline-none text-sm"
          />

          <button
            type="button"
            onClick={addPart}
            className="w-full px-4 py-2 bg-gray-800 text-white font-medium rounded-xl hover:bg-gray-900 transition-colors text-sm"
          >
            + Ajouter la pièce
          </button>
        </div>
      </div>

      {/* Estimations */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-black mb-2">
            Durée estimée (minutes)
          </label>
          <input
            type="number"
            min="1"
            value={formData.estimatedDuration ?? ""}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                estimatedDuration: e.target.value
                  ? parseInt(e.target.value)
                  : undefined,
              }))
            }
            placeholder="Ex: 30"
            className="w-full px-4 py-3 rounded-2xl border-2 border-gray-200 focus:border-orange focus:outline-none transition-colors"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-black mb-2">
            Coût estimé total (€)
          </label>
          <input
            type="number"
            min="0"
            step="0.01"
            value={formData.estimatedCost ?? ""}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                estimatedCost: e.target.value
                  ? parseFloat(e.target.value)
                  : undefined,
              }))
            }
            placeholder="Ex: 50"
            className="w-full px-4 py-3 rounded-2xl border-2 border-gray-200 focus:border-orange focus:outline-none transition-colors"
          />
        </div>
      </div>

      {/* Tags */}
      <div>
        <label className="block text-sm font-medium text-black mb-3">
          Tags
        </label>
        <p className="text-xs text-gray mb-3">
          Ex: &quot;électrique&quot;, &quot;sécurité&quot;, &quot;hiver&quot;, etc.
        </p>

        {formData.tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-3">
            {formData.tags.map((tag, index) => (
              <div
                key={index}
                className="inline-flex items-center gap-2 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm"
              >
                #{tag}
                <button
                  type="button"
                  onClick={() => removeTag(index)}
                  className="hover:text-blue-900"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="flex gap-2">
          <input
            type="text"
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addTag();
              }
            }}
            placeholder="Ajouter un tag"
            className="flex-1 px-4 py-2 rounded-xl border border-gray-200 focus:border-orange focus:outline-none text-sm"
          />
          <button
            type="button"
            onClick={addTag}
            className="px-4 py-2 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 transition-colors text-sm"
          >
            + Ajouter
          </button>
        </div>
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full px-6 py-4 bg-gradient-to-r from-orange to-orange-light text-white font-bold rounded-2xl hover:shadow-lg hover:scale-105 transition-all duration-300 disabled:opacity-50 disabled:hover:scale-100"
      >
        {isSubmitting
          ? "Création en cours..."
          : "Créer et ajouter à mon équipement"}
      </button>
    </form>
  );
}


