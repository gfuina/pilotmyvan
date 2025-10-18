"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import ImageUpload from "@/components/dashboard/ImageUpload";

interface Maintenance {
  _id: string;
  equipmentId: string;
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

interface AddMaintenanceModalProps {
  equipmentId: string;
  equipmentName: string;
  onClose: () => void;
  onSuccess: () => void;
  maintenance?: Maintenance | null;
}

const MAINTENANCE_TYPES = [
  { value: "inspection", label: "Inspection / Contrôle" },
  { value: "cleaning", label: "Nettoyage / Décrassage" },
  { value: "replacement", label: "Remplacement" },
  { value: "service", label: "Révision" },
  { value: "lubrication", label: "Lubrification" },
  { value: "adjustment", label: "Réglage" },
  { value: "drain", label: "Vidange" },
  { value: "test", label: "Test / Diagnostic" },
  { value: "calibration", label: "Calibration" },
  { value: "other", label: "Autre" },
];

const PRIORITY_LEVELS = [
  { value: "critical", label: "🔴 Critique", desc: "Sécurité, légal" },
  { value: "important", label: "🟠 Important", desc: "Performance, durabilité" },
  { value: "recommended", label: "🟡 Recommandé", desc: "Préventif" },
  { value: "optional", label: "⚪ Optionnel", desc: "Confort" },
];

const DIFFICULTY_LEVELS = [
  { value: "easy", label: "✅ Facile", desc: "DIY, 15-30min" },
  { value: "intermediate", label: "🔨 Intermédiaire", desc: "Outillage basique, 1-2h" },
  { value: "advanced", label: "⚙️ Avancé", desc: "Outillage spécialisé" },
  { value: "professional", label: "🏭 Professionnel", desc: "Garage requis" },
];

const COMMON_CONDITIONS = [
  "Avant hivernage",
  "Après hivernage",
  "Début de saison",
  "Fin de saison",
  "Après longue inactivité",
  "Utilisation intensive",
  "Conditions extrêmes",
];

const COMMON_TAGS = [
  "Obligatoire",
  "Légal",
  "Sécurité",
  "Performance",
  "Économie",
  "Confort",
  "Environnement",
  "Garantie",
];

export default function AddMaintenanceModal({
  equipmentId,
  equipmentName,
  onClose,
  onSuccess,
  maintenance,
}: AddMaintenanceModalProps) {
  const [formData, setFormData] = useState({
    name: maintenance?.name || "",
    type: maintenance?.type || "",
    priority: maintenance?.priority || "recommended",
    difficulty: maintenance?.difficulty || "intermediate",
    description: maintenance?.description || "",
    instructions: maintenance?.instructions || "",
    estimatedDuration: maintenance?.estimatedDuration || 0,
    estimatedCost: maintenance?.estimatedCost || 0,
    isOfficial: maintenance?.isOfficial ?? true,
    source: maintenance?.source || "",
  });

  const [recurrenceTime, setRecurrenceTime] = useState({
    enabled: !!maintenance?.recurrence?.time,
    value: maintenance?.recurrence?.time?.value || 1,
    unit: maintenance?.recurrence?.time?.unit || "months",
  });

  const [recurrenceKm, setRecurrenceKm] = useState({
    enabled: !!maintenance?.recurrence?.kilometers,
    value: maintenance?.recurrence?.kilometers || 10000,
  });

  const [conditions, setConditions] = useState<string[]>(
    maintenance?.conditions || []
  );
  const [customCondition, setCustomCondition] = useState("");

  const [tags, setTags] = useState<string[]>(maintenance?.tags || []);
  const [customTag, setCustomTag] = useState("");

  const [photos, setPhotos] = useState<string[]>(maintenance?.photos || []);
  const [videos, setVideos] = useState<string[]>(maintenance?.videos || []);
  const [newVideo, setNewVideo] = useState("");

  interface Part {
    name: string;
    reference?: string;
    quantity: number;
    estimatedCost?: number;
    purchaseLink?: string;
  }

  const [parts, setParts] = useState<Part[]>(maintenance?.parts || []);
  const [newPart, setNewPart] = useState({
    name: "",
    reference: "",
    quantity: 1,
    estimatedCost: 0,
    purchaseLink: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        type === "number"
          ? value === ""
            ? 0
            : Number(value)
          : type === "checkbox"
          ? (e.target as HTMLInputElement).checked
          : value,
    }));
  };

  const toggleCondition = (condition: string) => {
    setConditions((prev) =>
      prev.includes(condition)
        ? prev.filter((c) => c !== condition)
        : [...prev, condition]
    );
  };

  const addCustomCondition = () => {
    if (customCondition.trim() && !conditions.includes(customCondition.trim())) {
      setConditions([...conditions, customCondition.trim()]);
      setCustomCondition("");
    }
  };

  const toggleTag = (tag: string) => {
    setTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const addCustomTag = () => {
    if (customTag.trim() && !tags.includes(customTag.trim())) {
      setTags([...tags, customTag.trim()]);
      setCustomTag("");
    }
  };

  const addVideo = () => {
    if (newVideo.trim()) {
      setVideos([...videos, newVideo.trim()]);
      setNewVideo("");
    }
  };

  const removeVideo = (index: number) => {
    setVideos(videos.filter((_, i) => i !== index));
  };

  const addPart = () => {
    if (newPart.name.trim()) {
      setParts([...parts, { ...newPart }]);
      setNewPart({
        name: "",
        reference: "",
        quantity: 1,
        estimatedCost: 0,
        purchaseLink: "",
      });
    }
  };

  const removePart = (index: number) => {
    setParts(parts.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    // Validate at least one recurrence
    if (!recurrenceTime.enabled && !recurrenceKm.enabled) {
      setError("Au moins une récurrence (temporelle ou kilométrique) est requise");
      return;
    }

    setIsSubmitting(true);

    try {
      const recurrence: { time?: { value: number; unit: string }; kilometers?: number } = {};

      if (recurrenceTime.enabled) {
        recurrence.time = {
          value: recurrenceTime.value,
          unit: recurrenceTime.unit,
        };
      }

      if (recurrenceKm.enabled) {
        recurrence.kilometers = recurrenceKm.value;
      }

      const payload = {
        equipmentId,
        ...formData,
        recurrence,
        conditions: conditions.length > 0 ? conditions : undefined,
        tags: tags.length > 0 ? tags : undefined,
        photos: photos.length > 0 ? photos : undefined,
        videos: videos.length > 0 ? videos : undefined,
        parts: parts.length > 0 ? parts : undefined,
      };

      const url = maintenance
        ? `/api/admin/maintenances/${maintenance._id}`
        : "/api/admin/maintenances";

      const method = maintenance ? "PATCH" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        onSuccess();
      } else {
        const data = await response.json();
        setError(data.error || "Erreur lors de l'enregistrement");
      }
    } catch (error) {
      setError("Erreur lors de l'enregistrement");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.2 }}
        className="bg-white rounded-3xl w-full max-w-6xl my-8 max-h-[90vh] flex flex-col overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 flex-shrink-0">
          <div>
            <h2 className="text-2xl font-bold text-black">
              {maintenance ? "Modifier l&apos;entretien" : "Nouvel entretien"}
            </h2>
            <p className="text-sm text-gray">Pour: {equipmentName}</p>
          </div>
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
          <div className="p-6 space-y-8 overflow-y-auto flex-1">
            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-2xl">
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            )}

            {/* Section 1: Informations de base */}
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-black border-b pb-2">
                📋 Informations de base
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-black mb-2">
                    Nom de l&apos;entretien <span className="text-orange">*</span>
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    placeholder="Ex: Décrassage chauffage à fond"
                    className="w-full px-4 py-3 rounded-2xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-black mb-2">
                    Type d&apos;entretien <span className="text-orange">*</span>
                  </label>
                  <select
                    name="type"
                    value={formData.type}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 rounded-2xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange focus:border-transparent"
                  >
                    <option value="">Sélectionner un type</option>
                    {MAINTENANCE_TYPES.map((type) => (
                      <option key={type.value} value={type.value}>
                        {type.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-sm font-medium text-black mb-2 flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formData.isOfficial}
                      onChange={(e) =>
                        setFormData({ ...formData, isOfficial: e.target.checked })
                      }
                      className="w-4 h-4"
                    />
                    Recommandation officielle constructeur
                  </label>
                  {formData.isOfficial && (
                    <input
                      type="url"
                      name="source"
                      value={formData.source}
                      onChange={handleChange}
                      placeholder="Lien source (manuel, site officiel...)"
                      className="w-full px-4 py-2 mt-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange"
                    />
                  )}
                </div>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-black mb-2">
                  Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={2}
                  placeholder="Description courte de l&apos;entretien..."
                  className="w-full px-4 py-3 rounded-2xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange focus:border-transparent resize-none"
                />
              </div>
            </div>

            {/* Section 2: Récurrence */}
            <div className="space-y-4">
              <h3 className="text-lg font-bold text-black border-b pb-2">
                🔄 Récurrence <span className="text-orange text-sm">(au moins 1 requis)</span>
              </h3>

              {/* Récurrence temporelle */}
              <div className="p-4 bg-blue-50 rounded-2xl">
                <label className="flex items-center gap-3 mb-3">
                  <input
                    type="checkbox"
                    checked={recurrenceTime.enabled}
                    onChange={(e) =>
                      setRecurrenceTime({
                        ...recurrenceTime,
                        enabled: e.target.checked,
                      })
                    }
                    className="w-5 h-5"
                  />
                  <span className="font-semibold">Récurrence temporelle</span>
                </label>

                {recurrenceTime.enabled && (
                  <div className="flex gap-3">
                    <div className="flex-1">
                      <label className="block text-sm font-medium text-black mb-2">
                        Tous les
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={recurrenceTime.value}
                        onChange={(e) =>
                          setRecurrenceTime({
                            ...recurrenceTime,
                            value: Number(e.target.value),
                          })
                        }
                        className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange"
                      />
                    </div>
                    <div className="flex-1">
                      <label className="block text-sm font-medium text-black mb-2">
                        Unité
                      </label>
                      <select
                        value={recurrenceTime.unit}
                        onChange={(e) =>
                          setRecurrenceTime({
                            ...recurrenceTime,
                            unit: e.target.value,
                          })
                        }
                        className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange"
                      >
                        <option value="days">Jours</option>
                        <option value="months">Mois</option>
                        <option value="years">Années</option>
                      </select>
                    </div>
                  </div>
                )}
              </div>

              {/* Récurrence kilométrique */}
              <div className="p-4 bg-green-50 rounded-2xl">
                <label className="flex items-center gap-3 mb-3">
                  <input
                    type="checkbox"
                    checked={recurrenceKm.enabled}
                    onChange={(e) =>
                      setRecurrenceKm({
                        ...recurrenceKm,
                        enabled: e.target.checked,
                      })
                    }
                    className="w-5 h-5"
                  />
                  <span className="font-semibold">Récurrence kilométrique</span>
                </label>

                {recurrenceKm.enabled && (
                  <div>
                    <label className="block text-sm font-medium text-black mb-2">
                      Tous les (km)
                    </label>
                    <input
                      type="number"
                      min="1"
                      step="100"
                      value={recurrenceKm.value}
                      onChange={(e) =>
                        setRecurrenceKm({
                          ...recurrenceKm,
                          value: Number(e.target.value),
                        })
                      }
                      className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Section 3: Priorité & Difficulté */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-bold text-black border-b pb-2 mb-3">
                  ⚠️ Priorité
                </h3>
                <div className="space-y-2">
                  {PRIORITY_LEVELS.map((level) => (
                    <label
                      key={level.value}
                      className={`flex items-center gap-3 p-3 rounded-2xl border-2 cursor-pointer transition-all ${
                        formData.priority === level.value
                          ? "border-orange bg-orange/5"
                          : "border-gray-200 hover:border-orange/30"
                      }`}
                    >
                      <input
                        type="radio"
                        name="priority"
                        value={level.value}
                        checked={formData.priority === level.value}
                        onChange={handleChange}
                        className="w-4 h-4"
                      />
                      <div className="flex-1">
                        <p className="font-semibold">{level.label}</p>
                        <p className="text-xs text-gray">{level.desc}</p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-lg font-bold text-black border-b pb-2 mb-3">
                  👷 Difficulté
                </h3>
                <div className="space-y-2">
                  {DIFFICULTY_LEVELS.map((level) => (
                    <label
                      key={level.value}
                      className={`flex items-center gap-3 p-3 rounded-2xl border-2 cursor-pointer transition-all ${
                        formData.difficulty === level.value
                          ? "border-orange bg-orange/5"
                          : "border-gray-200 hover:border-orange/30"
                      }`}
                    >
                      <input
                        type="radio"
                        name="difficulty"
                        value={level.value}
                        checked={formData.difficulty === level.value}
                        onChange={handleChange}
                        className="w-4 h-4"
                      />
                      <div className="flex-1">
                        <p className="font-semibold">{level.label}</p>
                        <p className="text-xs text-gray">{level.desc}</p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            {/* Section 4: Conditions spéciales */}
            <div className="space-y-3">
              <h3 className="text-lg font-bold text-black border-b pb-2">
                🌡️ Conditions spéciales (optionnel)
              </h3>
              <div className="flex flex-wrap gap-2">
                {COMMON_CONDITIONS.map((condition) => (
                  <button
                    key={condition}
                    type="button"
                    onClick={() => toggleCondition(condition)}
                    className={`px-4 py-2 rounded-2xl font-medium transition-all ${
                      conditions.includes(condition)
                        ? "bg-orange text-white"
                        : "bg-gray-100 text-black hover:bg-gray-200"
                    }`}
                  >
                    {condition}
                  </button>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={customCondition}
                  onChange={(e) => setCustomCondition(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addCustomCondition())}
                  placeholder="Ajouter une condition personnalisée"
                  className="flex-1 px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange"
                />
                <button
                  type="button"
                  onClick={addCustomCondition}
                  className="px-4 py-2 bg-orange text-white rounded-xl hover:bg-orange-dark"
                >
                  +
                </button>
              </div>
            </div>

            {/* Section 5: Instructions détaillées */}
            <div className="space-y-3">
              <h3 className="text-lg font-bold text-black border-b pb-2">
                📝 Instructions détaillées (optionnel)
              </h3>
              <textarea
                name="instructions"
                value={formData.instructions}
                onChange={handleChange}
                rows={6}
                placeholder="Instructions étape par étape (supporte Markdown)..."
                className="w-full px-4 py-3 rounded-2xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange focus:border-transparent resize-none font-mono text-sm"
              />
            </div>

            {/* Section 6: Photos & Vidéos */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="text-lg font-bold text-black border-b pb-2 mb-3">
                  📸 Photos
                </h3>
                <div className="grid grid-cols-3 gap-3">
                  {photos.map((url, index) => (
                    <div key={index} className="relative aspect-square">
                      <img
                        src={url}
                        alt={`Photo ${index + 1}`}
                        className="w-full h-full object-cover rounded-2xl"
                      />
                      <button
                        type="button"
                        onClick={() => setPhotos(photos.filter((_, i) => i !== index))}
                        className="absolute top-1 right-1 p-1 bg-red-600 text-white rounded-full hover:bg-red-700"
                      >
                        <svg
                          className="w-3 h-3"
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
                  {photos.length < 10 && (
                    <ImageUpload
                      onUploadComplete={(url) => setPhotos([...photos, url])}
                      compact
                    />
                  )}
                </div>
              </div>

              <div>
                <h3 className="text-lg font-bold text-black border-b pb-2 mb-3">
                  🎥 Vidéos (URLs)
                </h3>
                <div className="space-y-2 mb-3">
                  {videos.map((url, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-2 p-2 bg-gray-50 rounded-xl"
                    >
                      <svg
                        className="w-5 h-5 text-red-600 flex-shrink-0"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M10 16.5l6-4.5-6-4.5v9zM12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z" />
                      </svg>
                      <a
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 text-sm text-blue-600 truncate hover:underline"
                      >
                        {url}
                      </a>
                      <button
                        type="button"
                        onClick={() => removeVideo(index)}
                        className="p-1 hover:bg-red-50 text-red-600 rounded"
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
                </div>
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={newVideo}
                    onChange={(e) => setNewVideo(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addVideo())}
                    placeholder="https://youtube.com/..."
                    className="flex-1 px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange"
                  />
                  <button
                    type="button"
                    onClick={addVideo}
                    className="px-4 py-2 bg-red-600 text-white rounded-xl hover:bg-red-700"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>

            {/* Section 7: Pièces & Consommables */}
            <div className="space-y-3">
              <h3 className="text-lg font-bold text-black border-b pb-2">
                🛒 Pièces & Consommables (optionnel)
              </h3>
              
              {parts.length > 0 && (
                <div className="space-y-2 mb-4">
                  {parts.map((part, index) => (
                    <div
                      key={index}
                      className="flex items-start gap-3 p-3 bg-gray-50 rounded-2xl"
                    >
                      <div className="flex-1 grid grid-cols-3 gap-2 text-sm">
                        <div>
                          <p className="font-semibold">{part.name}</p>
                          {part.reference && (
                            <p className="text-xs text-gray">Réf: {part.reference}</p>
                          )}
                        </div>
                        <div>
                          <p>Qté: {part.quantity}</p>
                          {part.estimatedCost && part.estimatedCost > 0 && (
                            <p className="text-xs text-gray">{part.estimatedCost}€</p>
                          )}
                        </div>
                        {part.purchaseLink && (
                          <a
                            href={part.purchaseLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 text-xs hover:underline truncate"
                          >
                            Lien achat
                          </a>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => removePart(index)}
                        className="p-1 hover:bg-red-50 text-red-600 rounded"
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
                </div>
              )}

              <div className="p-4 bg-gray-50 rounded-2xl space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="text"
                    value={newPart.name}
                    onChange={(e) => setNewPart({ ...newPart, name: e.target.value })}
                    placeholder="Nom de la pièce *"
                    className="px-3 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange"
                  />
                  <input
                    type="text"
                    value={newPart.reference}
                    onChange={(e) => setNewPart({ ...newPart, reference: e.target.value })}
                    placeholder="Référence"
                    className="px-3 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange"
                  />
                  <input
                    type="number"
                    min="1"
                    value={newPart.quantity}
                    onChange={(e) =>
                      setNewPart({ ...newPart, quantity: Number(e.target.value) })
                    }
                    placeholder="Quantité"
                    className="px-3 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange"
                  />
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={newPart.estimatedCost}
                    onChange={(e) =>
                      setNewPart({ ...newPart, estimatedCost: Number(e.target.value) })
                    }
                    placeholder="Coût estimé (€)"
                    className="px-3 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange"
                  />
                  <input
                    type="url"
                    value={newPart.purchaseLink}
                    onChange={(e) =>
                      setNewPart({ ...newPart, purchaseLink: e.target.value })
                    }
                    placeholder="Lien d'achat"
                    className="col-span-2 px-3 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange"
                  />
                </div>
                <button
                  type="button"
                  onClick={addPart}
                  disabled={!newPart.name.trim()}
                  className="w-full px-4 py-2 bg-orange text-white font-semibold rounded-xl hover:bg-orange-dark disabled:opacity-50"
                >
                  Ajouter la pièce
                </button>
              </div>
            </div>

            {/* Section 8: Estimations */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="text-lg font-bold text-black border-b pb-2 mb-3">
                  ⏱️ Durée estimée
                </h3>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    name="estimatedDuration"
                    min="0"
                    value={formData.estimatedDuration}
                    onChange={handleChange}
                    placeholder="0"
                    className="flex-1 px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange"
                  />
                  <span className="text-gray">minutes</span>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-bold text-black border-b pb-2 mb-3">
                  💰 Coût estimé total
                </h3>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    name="estimatedCost"
                    min="0"
                    step="0.01"
                    value={formData.estimatedCost}
                    onChange={handleChange}
                    placeholder="0"
                    className="flex-1 px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange"
                  />
                  <span className="text-gray">€</span>
                </div>
              </div>
            </div>

            {/* Section 9: Tags */}
            <div className="space-y-3">
              <h3 className="text-lg font-bold text-black border-b pb-2">
                🏷️ Tags (optionnel)
              </h3>
              <div className="flex flex-wrap gap-2">
                {COMMON_TAGS.map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => toggleTag(tag)}
                    className={`px-4 py-2 rounded-2xl font-medium transition-all ${
                      tags.includes(tag)
                        ? "bg-purple-600 text-white"
                        : "bg-gray-100 text-black hover:bg-gray-200"
                    }`}
                  >
                    {tag}
                  </button>
                ))}
              </div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={customTag}
                  onChange={(e) => setCustomTag(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addCustomTag())}
                  placeholder="Ajouter un tag personnalisé"
                  className="flex-1 px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange"
                />
                <button
                  type="button"
                  onClick={addCustomTag}
                  className="px-4 py-2 bg-purple-600 text-white rounded-xl hover:bg-purple-700"
                >
                  +
                </button>
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
              {isSubmitting
                ? "Enregistrement..."
                : maintenance
                ? "Mettre à jour"
                : "Créer l&apos;entretien"}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

