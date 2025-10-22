"use client";

import { useState, useRef, useEffect } from "react";
import { COUNTRIES, Country } from "@/lib/countries";

interface CountrySelectProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

export default function CountrySelect({
  value,
  onChange,
  className = "",
}: CountrySelectProps) {
  const [search, setSearch] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  const selectedCountry = COUNTRIES.find((c) => c.name === value);

  const filteredCountries = COUNTRIES.filter((country) =>
    country.name.toLowerCase().includes(search.toLowerCase())
  );

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
        setSearch("");
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (isOpen && focusedIndex >= 0 && listRef.current) {
      const focusedElement = listRef.current.children[
        focusedIndex
      ] as HTMLElement;
      if (focusedElement) {
        focusedElement.scrollIntoView({ block: "nearest" });
      }
    }
  }, [focusedIndex, isOpen]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) {
      if (e.key === "Enter" || e.key === "ArrowDown") {
        e.preventDefault();
        setIsOpen(true);
        setFocusedIndex(0);
      }
      return;
    }

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setFocusedIndex((prev) =>
          prev < filteredCountries.length - 1 ? prev + 1 : prev
        );
        break;
      case "ArrowUp":
        e.preventDefault();
        setFocusedIndex((prev) => (prev > 0 ? prev - 1 : 0));
        break;
      case "Enter":
        e.preventDefault();
        if (focusedIndex >= 0 && filteredCountries[focusedIndex]) {
          onChange(filteredCountries[focusedIndex].name);
          setIsOpen(false);
          setSearch("");
          setFocusedIndex(-1);
        }
        break;
      case "Escape":
        e.preventDefault();
        setIsOpen(false);
        setSearch("");
        setFocusedIndex(-1);
        break;
    }
  };

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <div className="w-full px-3 py-2 border border-gray-300 rounded-xl focus-within:ring-2 focus-within:ring-orange focus-within:border-transparent bg-white">
        {!isOpen ? (
          <div
            onClick={() => {
              setIsOpen(true);
              setTimeout(() => inputRef.current?.focus(), 100);
            }}
            className="flex items-center justify-between cursor-pointer"
          >
            <span className="text-sm">
              {selectedCountry ? (
                <>
                  <span className="mr-2">{selectedCountry.flag}</span>
                  {selectedCountry.name}
                </>
              ) : (
                <span className="text-gray-400">Sélectionner un pays</span>
              )}
            </span>
            <svg
              className="w-4 h-4 text-gray-500 transition-transform"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </div>
        ) : (
          <input
            ref={inputRef}
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setFocusedIndex(0);
            }}
            onKeyDown={handleKeyDown}
            placeholder="Rechercher un pays..."
            className="w-full outline-none text-sm"
            autoComplete="off"
          />
        )}
      </div>

      {isOpen && (
        <div
          ref={listRef}
          className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-xl shadow-lg max-h-60 overflow-y-auto"
        >
          {filteredCountries.length > 0 ? (
            filteredCountries.map((country, index) => (
              <div
                key={country.code}
                onClick={() => {
                  onChange(country.name);
                  setIsOpen(false);
                  setSearch("");
                  setFocusedIndex(-1);
                }}
                className={`px-3 py-2 cursor-pointer text-sm hover:bg-orange-50 ${
                  index === focusedIndex ? "bg-orange-50" : ""
                } ${country.name === value ? "bg-orange-100" : ""}`}
              >
                <span className="mr-2">{country.flag}</span>
                {country.name}
              </div>
            ))
          ) : (
            <div className="px-3 py-2 text-sm text-gray-500">
              Aucun pays trouvé
            </div>
          )}
        </div>
      )}
    </div>
  );
}

