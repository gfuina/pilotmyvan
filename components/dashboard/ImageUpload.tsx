"use client";

import { useState, useRef } from "react";
import Image from "next/image";

interface ImageUploadProps {
  onUploadComplete: (url: string) => void;
  existingImage?: string;
  onRemove?: () => void;
  compact?: boolean;
}

export default function ImageUpload({
  onUploadComplete,
  existingImage,
  onRemove,
  compact = false,
}: ImageUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (file: File) => {
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
        onUploadComplete(data.url);
      } else {
        const data = await response.json();
        setError(data.error || "Erreur lors de l'upload");
      }
    } catch (error) {
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
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files[0];
    if (file) {
      handleUpload(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  if (existingImage && !compact) {
    return (
      <div className="relative aspect-video w-full rounded-2xl overflow-hidden border-2 border-gray-200">
        <Image
          src={existingImage}
          alt="Uploaded image"
          fill
          className="object-cover"
        />
        {onRemove && (
          <button
            type="button"
            onClick={onRemove}
            className="absolute top-4 right-4 p-2 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors shadow-lg"
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
        )}
      </div>
    );
  }

  if (compact) {
    return (
      <div
        onClick={() => fileInputRef.current?.click()}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={`aspect-square rounded-2xl border-2 border-dashed ${
          isDragging
            ? "border-orange bg-orange/5"
            : "border-gray-300 hover:border-orange"
        } flex items-center justify-center cursor-pointer transition-all ${
          isUploading ? "opacity-50 cursor-wait" : ""
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          disabled={isUploading}
          className="hidden"
        />
        {isUploading ? (
          <div className="w-6 h-6 border-2 border-orange border-t-transparent rounded-full animate-spin" />
        ) : (
          <svg
            className="w-8 h-8 text-gray-400"
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
        )}
      </div>
    );
  }

  return (
    <div>
      <div
        onClick={() => fileInputRef.current?.click()}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={`relative aspect-video w-full rounded-2xl border-2 border-dashed ${
          isDragging
            ? "border-orange bg-orange/5"
            : "border-gray-300 hover:border-orange"
        } flex flex-col items-center justify-center cursor-pointer transition-all p-8 ${
          isUploading ? "opacity-50 cursor-wait" : ""
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          disabled={isUploading}
          className="hidden"
        />

        {isUploading ? (
          <>
            <div className="w-12 h-12 border-4 border-orange border-t-transparent rounded-full animate-spin mb-4" />
            <p className="text-sm text-gray">Upload en cours...</p>
          </>
        ) : (
          <>
            <svg
              className="w-12 h-12 text-gray-400 mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
              />
            </svg>
            <p className="text-sm font-medium text-black mb-1">
              Cliquez ou glissez une image
            </p>
            <p className="text-xs text-gray">
              JPG, PNG ou WebP • Maximum 5MB
            </p>
          </>
        )}
      </div>

      {error && (
        <p className="text-xs text-red-600 mt-2">{error}</p>
      )}
    </div>
  );
}

