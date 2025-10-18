"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface Category {
  _id: string;
  name: string;
  level: number;
  parentId?: string;
  order: number;
  children: Category[];
}

interface CategoryBuilderProps {
  categories: Category[];
  onRefresh: () => void;
}

export default function CategoryBuilder({
  categories,
  onRefresh,
}: CategoryBuilderProps) {
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [addingParentId, setAddingParentId] = useState<string | "root" | null>(null);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const toggleExpand = (id: string) => {
    const newExpanded = new Set(expandedIds);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedIds(newExpanded);
  };

  const handleAddCategory = async (parentId: string | null, level: number) => {
    if (!newCategoryName.trim()) return;

    setIsSubmitting(true);
    try {
      const response = await fetch("/api/admin/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newCategoryName.trim(),
          parentId,
          level,
        }),
      });

      if (response.ok) {
        setNewCategoryName("");
        setAddingParentId(null);
        onRefresh();
        // Auto-expand parent if adding a child
        if (parentId) {
          setExpandedIds((prev) => new Set(prev).add(parentId));
        }
      }
    } catch (error) {
      console.error("Error adding category:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateCategory = async (id: string) => {
    if (!editName.trim()) return;

    setIsSubmitting(true);
    try {
      const response = await fetch(`/api/admin/categories/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: editName.trim() }),
      });

      if (response.ok) {
        setEditingId(null);
        setEditName("");
        onRefresh();
      }
    } catch (error) {
      console.error("Error updating category:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteCategory = async (id: string, hasChildren: boolean) => {
    if (hasChildren) {
      alert("Impossible de supprimer une catégorie contenant des sous-catégories");
      return;
    }

    if (!confirm("Êtes-vous sûr de vouloir supprimer cette catégorie ?")) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/categories/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        onRefresh();
      } else {
        const data = await response.json();
        alert(data.error || "Erreur lors de la suppression");
      }
    } catch (error) {
      console.error("Error deleting category:", error);
    }
  };

  const startEditing = (id: string, currentName: string) => {
    setEditingId(id);
    setEditName(currentName);
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditName("");
  };

  const startAdding = (parentId: string | null) => {
    setAddingParentId(parentId === null ? "root" : parentId);
    setNewCategoryName("");
  };

  const cancelAdding = () => {
    setAddingParentId(null);
    setNewCategoryName("");
  };

  const renderCategory = (category: Category, depth: number = 0) => {
    const isExpanded = expandedIds.has(category._id);
    const isEditing = editingId === category._id;
    const isAddingChild = addingParentId === category._id;
    const hasChildren = category.children && category.children.length > 0;

    const bgColors = [
      "bg-white",
      "bg-orange/5",
      "bg-blue-50",
      "bg-purple-50",
      "bg-green-50",
    ];
    const bgColor = bgColors[depth % bgColors.length];

    const levelColors = [
      "text-orange",
      "text-blue-600",
      "text-purple-600",
      "text-green-600",
    ];
    const levelColor = levelColors[depth % levelColors.length];

    return (
      <div key={category._id}>
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          className={`${bgColor} rounded-2xl p-4 mb-2`}
          style={{ marginLeft: `${depth * 24}px` }}
        >
          <div className="flex items-center gap-3">
            {/* Expand/Collapse Button */}
            {hasChildren && (
              <button
                onClick={() => toggleExpand(category._id)}
                className="p-1 hover:bg-white/50 rounded-lg transition-colors flex-shrink-0"
              >
                <svg
                  className={`w-5 h-5 transition-transform ${
                    isExpanded ? "rotate-90" : ""
                  }`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </button>
            )}

            {/* Level Badge */}
            <span
              className={`px-2 py-1 ${levelColor} bg-white rounded-lg text-xs font-bold flex-shrink-0`}
            >
              N{category.level}
            </span>

            {/* Category Name or Edit Input */}
            {isEditing ? (
              <div className="flex items-center gap-2 flex-1">
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleUpdateCategory(category._id);
                    if (e.key === "Escape") cancelEditing();
                  }}
                  autoFocus
                  className="flex-1 px-3 py-2 rounded-xl border border-orange focus:outline-none focus:ring-2 focus:ring-orange"
                />
                <button
                  onClick={() => handleUpdateCategory(category._id)}
                  disabled={isSubmitting}
                  className="px-3 py-2 bg-orange text-white rounded-xl hover:bg-orange-dark transition-colors disabled:opacity-50"
                >
                  ✓
                </button>
                <button
                  onClick={cancelEditing}
                  className="px-3 py-2 bg-gray-200 text-black rounded-xl hover:bg-gray-300 transition-colors"
                >
                  ✕
                </button>
              </div>
            ) : (
              <>
                <span className="flex-1 font-semibold text-black">
                  {category.name}
                </span>

                {/* Action Buttons */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => startAdding(category._id)}
                    className="p-2 hover:bg-orange/10 rounded-lg transition-colors"
                    title="Ajouter une sous-catégorie"
                  >
                    <svg
                      className="w-4 h-4 text-orange"
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
                  </button>
                  <button
                    onClick={() => startEditing(category._id, category.name)}
                    className="p-2 hover:bg-blue-50 rounded-lg transition-colors"
                    title="Modifier"
                  >
                    <svg
                      className="w-4 h-4 text-blue-600"
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
                  </button>
                  <button
                    onClick={() =>
                      handleDeleteCategory(category._id, hasChildren)
                    }
                    className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                    title="Supprimer"
                  >
                    <svg
                      className="w-4 h-4 text-red-600"
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
              </>
            )}
          </div>

          {/* Add Child Form */}
          {isAddingChild && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-3 flex items-center gap-2"
            >
              <span className="px-2 py-1 bg-white rounded-lg text-xs font-bold text-gray-500">
                N{category.level + 1}
              </span>
              <input
                type="text"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter")
                    handleAddCategory(category._id, category.level + 1);
                  if (e.key === "Escape") cancelAdding();
                }}
                placeholder="Nom de la sous-catégorie"
                autoFocus
                className="flex-1 px-3 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange"
              />
              <button
                onClick={() =>
                  handleAddCategory(category._id, category.level + 1)
                }
                disabled={isSubmitting || !newCategoryName.trim()}
                className="px-3 py-2 bg-orange text-white rounded-xl hover:bg-orange-dark transition-colors disabled:opacity-50"
              >
                Ajouter
              </button>
              <button
                onClick={cancelAdding}
                className="px-3 py-2 bg-gray-200 text-black rounded-xl hover:bg-gray-300 transition-colors"
              >
                Annuler
              </button>
            </motion.div>
          )}
        </motion.div>

        {/* Render Children */}
        <AnimatePresence>
          {isExpanded &&
            hasChildren &&
            category.children.map((child) => renderCategory(child, depth + 1))}
        </AnimatePresence>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      {/* Add Root Category */}
      {addingParentId !== "root" ? (
        <button
          onClick={() => startAdding(null)}
          className="w-full px-6 py-4 bg-gradient-to-r from-orange to-orange-light text-white font-bold rounded-2xl hover:shadow-lg transition-all duration-300 flex items-center justify-center gap-2"
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
              d="M12 4v16m8-8H4"
            />
          </svg>
          Ajouter une catégorie principale (Niveau 1)
        </button>
      ) : (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          className="bg-white rounded-2xl p-4 flex items-center gap-3"
        >
          <span className="px-2 py-1 text-orange bg-orange/10 rounded-lg text-xs font-bold">
            N1
          </span>
          <input
            type="text"
            value={newCategoryName}
            onChange={(e) => setNewCategoryName(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleAddCategory(null, 1);
              if (e.key === "Escape") cancelAdding();
            }}
            placeholder="Nom de la catégorie principale"
            autoFocus
            className="flex-1 px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-orange"
          />
          <button
            onClick={() => handleAddCategory(null, 1)}
            disabled={isSubmitting || !newCategoryName.trim()}
            className="px-4 py-3 bg-orange text-white font-semibold rounded-xl hover:bg-orange-dark transition-colors disabled:opacity-50"
          >
            Ajouter
          </button>
          <button
            onClick={cancelAdding}
            className="px-4 py-3 bg-gray-200 text-black font-semibold rounded-xl hover:bg-gray-300 transition-colors"
          >
            Annuler
          </button>
        </motion.div>
      )}

      {/* Categories Tree */}
      <div className="space-y-2">
        {categories.length === 0 ? (
          <div className="text-center py-12 text-gray">
            <p className="text-lg mb-2">Aucune catégorie</p>
            <p className="text-sm">
              Commencez par créer une catégorie de niveau 1
            </p>
          </div>
        ) : (
          categories.map((category) => renderCategory(category, 0))
        )}
      </div>
    </div>
  );
}

