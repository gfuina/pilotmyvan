"use client";

import { useState } from "react";
import Image from "next/image";

interface MultiImageUploadProps {
  images: string[];
  onImagesChange: (images: string[]) => void;
  maxImages?: number;
}

export default function MultiImageUpload({
  images,
  onImagesChange,
  maxImages = 5,
}: MultiImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState("");

  const handleUpload = async (file: File) => {
    if (images.length >= maxImages) {
      setError(`Maximum ${maxImages} images autorisées`);
      return;
    }

    setError("");
    setIsUploading(true);

    // Validate file type
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      setError("Type de fichier non autorisé. Utilisez JPG, PNG ou WebP.");
      setIsUploading(false);
      return;
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      setError("Le fichier est trop volumineux. Maximum 5MB.");
      setIsUploading(false);
      return;
    }

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        onImagesChange([...images, data.url]);
      } else {
        const errorData = await response.json();
        setError(errorData.error || "Erreur lors de l'upload");
      }
    } catch (error) {
      console.error("Upload error:", error);
      setError("Erreur lors de l'upload");
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleUpload(file);
    }
    // Reset input value to allow re-uploading the same file
    e.target.value = "";
  };

  const removeImage = (index: number) => {
    onImagesChange(images.filter((_, i) => i !== index));
  };

  return (
    <div>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {/* Existing images */}
        {images.map((url, index) => (
          <div
            key={index}
            className="relative aspect-square rounded-xl overflow-hidden border-2 border-gray-200"
          >
            <Image
              src={url}
              alt={`Photo ${index + 1}`}
              fill
              className="object-cover"
            />
            <button
              type="button"
              onClick={() => removeImage(index)}
              className="absolute top-2 right-2 p-1.5 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors shadow-lg"
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
            {index === 0 && (
              <div className="absolute bottom-2 left-2 px-2 py-1 bg-orange text-white text-xs font-semibold rounded">
                Principal
              </div>
            )}
          </div>
        ))}

        {/* Add button */}
        {images.length < maxImages && (
          <label className="relative aspect-square rounded-xl border-2 border-dashed border-gray-300 hover:border-orange flex items-center justify-center cursor-pointer transition-all group">
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              disabled={isUploading}
              className="hidden"
            />
            {isUploading ? (
              <div className="w-8 h-8 border-4 border-orange border-t-transparent rounded-full animate-spin" />
            ) : (
              <div className="text-center p-4">
                <svg
                  className="w-8 h-8 text-gray-400 group-hover:text-orange mx-auto mb-2 transition-colors"
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
                <p className="text-xs text-gray-600 group-hover:text-black transition-colors">
                  Ajouter
                </p>
              </div>
            )}
          </label>
        )}
      </div>

      {/* Info & Error */}
      <div className="mt-2 space-y-1">
        {error && <p className="text-xs text-red-600">{error}</p>}
        <p className="text-xs text-gray">
          {images.length} / {maxImages} photos • JPG, PNG ou WebP • Max 5MB
        </p>
      </div>
    </div>
  );
}

