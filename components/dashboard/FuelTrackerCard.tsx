"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from "recharts";

interface FuelRecord {
  _id: string;
  mileage: number;
  amountPaid: number;
  liters?: number;
  pricePerLiter?: number;
  isFull: boolean;
  note?: string;
  recordedAt: string;
}

interface FuelStats {
  totalSpent: number;
  totalLiters: number;
  averageConsumption: number;
  averagePricePerLiter: number;
  totalDistance: number;
}

interface FuelTrackerCardProps {
  vehicleId: string;
  vehicleName?: string;
  fuelType?: string;
  fuelTankCapacity?: number;
}

export default function FuelTrackerCard({
  vehicleId,
  vehicleName,
  fuelType,
  fuelTankCapacity,
}: FuelTrackerCardProps) {
  const [records, setRecords] = useState<FuelRecord[]>([]);
  const [stats, setStats] = useState<FuelStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  // Accordion states
  const [isStatsOpen, setIsStatsOpen] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);

  // Form state
  const [mileage, setMileage] = useState("");
  const [amountPaid, setAmountPaid] = useState("");
  const [liters, setLiters] = useState("");
  const [pricePerLiter, setPricePerLiter] = useState("");
  const [isFull, setIsFull] = useState(true);
  const [note, setNote] = useState("");

  useEffect(() => {
    fetchRecords();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [vehicleId]);

  // Auto-calculer le prix au litre ou les litres
  useEffect(() => {
    if (amountPaid && liters && !pricePerLiter) {
      const calculated = (parseFloat(amountPaid) / parseFloat(liters)).toFixed(
        3
      );
      setPricePerLiter(calculated);
    }
  }, [amountPaid, liters, pricePerLiter]);

  useEffect(() => {
    if (amountPaid && pricePerLiter && !liters) {
      const calculated = (
        parseFloat(amountPaid) / parseFloat(pricePerLiter)
      ).toFixed(2);
      setLiters(calculated);
    }
  }, [amountPaid, pricePerLiter, liters]);

  const fetchRecords = async () => {
    try {
      const response = await fetch(`/api/vehicles/${vehicleId}/fuel-records`);
      if (response.ok) {
        const data = await response.json();
        setRecords(data.fuelRecords);
        setStats(data.stats);
      }
    } catch (error) {
      console.error("Erreur lors du chargement des pleins:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setError("");
    setSuccessMessage("");

    const mileageValue = parseInt(mileage);
    const amountPaidValue = parseFloat(amountPaid);
    const litersValue = liters ? parseFloat(liters) : undefined;
    const pricePerLiterValue = pricePerLiter
      ? parseFloat(pricePerLiter)
      : undefined;

    if (isNaN(mileageValue) || mileageValue < 0) {
      setError("Veuillez entrer un kilométrage valide");
      setIsSaving(false);
      return;
    }

    if (isNaN(amountPaidValue) || amountPaidValue <= 0) {
      setError("Veuillez entrer un montant valide");
      setIsSaving(false);
      return;
    }

    try {
      const response = await fetch(`/api/vehicles/${vehicleId}/fuel-records`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          mileage: mileageValue,
          amountPaid: amountPaidValue,
          liters: litersValue,
          pricePerLiter: pricePerLiterValue,
          isFull,
          note: note || undefined,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        let message = "Plein enregistré !";
        if (data.consumption) {
          message += ` Consommation: ${data.consumption} L/100km`;
        }
        setSuccessMessage(message);
        setTimeout(() => setSuccessMessage(""), 5000);
        
        // Reset form
        setAmountPaid("");
        setLiters("");
        setPricePerLiter("");
        setNote("");
        
        // Recharger les données
        fetchRecords();
      } else {
        setError(data.error || "Erreur lors de l'enregistrement");
      }
    } catch (error) {
      setError("Erreur lors de l'enregistrement");
    } finally {
      setIsSaving(false);
    }
  };

  // Préparer les données pour les graphiques
  const priceChartData = records
    .filter((r) => r.pricePerLiter)
    .slice(0, 10)
    .reverse()
    .map((record) => ({
      date: new Date(record.recordedAt).toLocaleDateString("fr-FR", {
        day: "2-digit",
        month: "short",
      }),
      price: record.pricePerLiter,
      fullDate: new Date(record.recordedAt).toLocaleDateString("fr-FR"),
    }));

  const consumptionChartData = [];
  for (let i = 0; i < records.length - 1; i++) {
    const current = records[i];
    const previous = records[i + 1];
    if (current.liters && current.mileage > previous.mileage) {
      const distance = current.mileage - previous.mileage;
      const consumption = (current.liters / distance) * 100;
      consumptionChartData.push({
        date: new Date(current.recordedAt).toLocaleDateString("fr-FR", {
          day: "2-digit",
          month: "short",
        }),
        consumption: parseFloat(consumption.toFixed(2)),
        fullDate: new Date(current.recordedAt).toLocaleDateString("fr-FR"),
      });
    }
  }
  consumptionChartData.reverse();

  const fuelEmojis: { [key: string]: string } = {
    essence: "⛽",
    diesel: "🛢️",
    électrique: "⚡",
    hybride: "🔋",
    gpl: "🔥",
    autre: "⛽",
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-3xl shadow-lg p-6 h-full flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-orange border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-white rounded-3xl shadow-lg p-6 h-full flex flex-col"
    >
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
          <span className="text-2xl">
            {fuelType ? fuelEmojis[fuelType] || "⛽" : "⛽"}
          </span>
        </div>
        <div>
          <h2 className="text-xl font-bold text-black">Suivi de carburant</h2>
          <p className="text-sm text-gray-500">
            {fuelType ? fuelType.charAt(0).toUpperCase() + fuelType.slice(1) : "Carburant"}
            {fuelTankCapacity && ` • Réservoir ${fuelTankCapacity}L`}
          </p>
        </div>
      </div>

      {/* Stats Grid - Improved Design */}
      {stats && records.length > 0 && (
        <div className="grid grid-cols-2 gap-3 mb-6">
          {/* Dépenses totales */}
          <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-xl p-4 border border-red-200">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 bg-red-500 rounded-lg flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p className="text-xs font-semibold text-red-800">Dépenses</p>
            </div>
            <p className="text-2xl font-bold text-red-900">
              {stats.totalSpent.toFixed(2)}€
            </p>
            <p className="text-xs text-red-600 mt-1">Total cumulé</p>
          </div>

          {/* Prix moyen */}
          {stats.averagePricePerLiter > 0 && (
            <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-4 border border-orange-200">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 bg-orange rounded-lg flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
                  </svg>
                </div>
                <p className="text-xs font-semibold text-orange-800">Prix moyen</p>
              </div>
              <p className="text-2xl font-bold text-orange-900">
                {stats.averagePricePerLiter.toFixed(3)}€
              </p>
              <p className="text-xs text-orange-600 mt-1">par litre</p>
            </div>
          )}

          {/* Conso moyenne */}
          {stats.averageConsumption > 0 && (
            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4 border border-green-200">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                </div>
                <p className="text-xs font-semibold text-green-800">Consommation</p>
              </div>
              <p className="text-2xl font-bold text-green-900">
                {stats.averageConsumption}L
              </p>
              <p className="text-xs text-green-600 mt-1">aux 100km</p>
            </div>
          )}

          {/* Distance totale */}
          {stats.totalDistance > 0 && (
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 border border-blue-200">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                </div>
                <p className="text-xs font-semibold text-blue-800">Distance</p>
              </div>
              <p className="text-2xl font-bold text-blue-900">
                {stats.totalDistance.toLocaleString()}
              </p>
              <p className="text-xs text-blue-600 mt-1">kilomètres</p>
            </div>
          )}
        </div>
      )}

      {/* Accordion: Statistiques détaillées */}
      {(priceChartData.length >= 2 || consumptionChartData.length >= 2) && (
        <div className="mb-4">
          <button
            onClick={() => setIsStatsOpen(!isStatsOpen)}
            className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <div className="text-left">
                <p className="font-semibold text-black text-sm">Statistiques détaillées</p>
                <p className="text-xs text-gray-500">Graphiques et analyses</p>
              </div>
            </div>
            <svg
              className={`w-5 h-5 text-gray-500 transition-transform ${isStatsOpen ? "rotate-180" : ""}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          <AnimatePresence>
            {isStatsOpen && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden"
              >
                <div className="pt-4 grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Prix du carburant */}
                  {priceChartData.length >= 2 && (
                    <div>
                      <h3 className="text-sm font-semibold text-gray-700 mb-3">
                        Évolution du prix du carburant
                      </h3>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={priceChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 11, fill: "#666" }}
                  stroke="#ccc"
                />
                <YAxis
                  tick={{ fontSize: 11, fill: "#666" }}
                  stroke="#ccc"
                  domain={["dataMin - 0.1", "dataMax + 0.1"]}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#fff",
                    border: "1px solid #e5e5e5",
                    borderRadius: "8px",
                    fontSize: "12px",
                  }}
                  formatter={(value: number) => [`${value.toFixed(3)}€/L`, "Prix"]}
                  labelFormatter={(label, payload) =>
                    payload[0]?.payload.fullDate || label
                  }
                />
                <Line
                  type="monotone"
                  dataKey="price"
                  stroke="#ff6b35"
                  strokeWidth={2}
                  dot={{ fill: "#ff6b35", r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
                      </ResponsiveContainer>
                    </div>
                  )}

                  {/* Consommation */}
                  {consumptionChartData.length >= 2 && (
                    <div>
                      <h3 className="text-sm font-semibold text-gray-700 mb-3">
                        Consommation (L/100km)
                      </h3>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={consumptionChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 11, fill: "#666" }}
                  stroke="#ccc"
                />
                <YAxis
                  tick={{ fontSize: 11, fill: "#666" }}
                  stroke="#ccc"
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#fff",
                    border: "1px solid #e5e5e5",
                    borderRadius: "8px",
                    fontSize: "12px",
                  }}
                  formatter={(value: number) => [
                    `${value} L/100km`,
                    "Consommation",
                  ]}
                  labelFormatter={(label, payload) =>
                    payload[0]?.payload.fullDate || label
                  }
                />
                <Bar dataKey="consumption" fill="#4ade80" radius={[8, 8, 0, 0]} />
              </BarChart>
                      </ResponsiveContainer>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* Accordion: Enregistrer un plein */}
      <div className="mb-4">
        <button
          onClick={() => setIsFormOpen(!isFormOpen)}
          className="w-full flex items-center justify-between p-4 bg-gradient-to-r from-orange-50 to-orange-100 hover:from-orange-100 hover:to-orange-200 rounded-xl transition-colors border border-orange-200"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-orange rounded-lg flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </div>
            <div className="text-left">
              <p className="font-semibold text-black text-sm">Enregistrer un plein</p>
              <p className="text-xs text-orange-700">Ajouter une nouvelle entrée</p>
            </div>
          </div>
          <svg
            className={`w-5 h-5 text-orange-700 transition-transform ${isFormOpen ? "rotate-180" : ""}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        <AnimatePresence>
          {isFormOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden"
            >
              <form onSubmit={handleSubmit} className="pt-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          {/* Kilométrage */}
          <div>
            <label className="text-xs font-medium text-gray-600 block mb-1">
              Kilométrage actuel *
            </label>
            <div className="relative">
              <input
                type="number"
                value={mileage}
                onChange={(e) => setMileage(e.target.value)}
                placeholder="Ex: 45000"
                min="0"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange focus:border-transparent outline-none text-sm"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-500">
                km
              </span>
            </div>
          </div>

          {/* Montant payé */}
          <div>
            <label className="text-xs font-medium text-gray-600 block mb-1">
              Montant payé *
            </label>
            <div className="relative">
              <input
                type="number"
                step="0.01"
                value={amountPaid}
                onChange={(e) => setAmountPaid(e.target.value)}
                placeholder="Ex: 65.50"
                min="0"
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange focus:border-transparent outline-none text-sm"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-500">
                €
              </span>
            </div>
          </div>

          {/* Litres */}
          <div>
            <label className="text-xs font-medium text-gray-600 block mb-1">
              Litres (optionnel)
            </label>
            <div className="relative">
              <input
                type="number"
                step="0.01"
                value={liters}
                onChange={(e) => setLiters(e.target.value)}
                placeholder="Ex: 45.5"
                min="0"
                className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange focus:border-transparent outline-none text-sm"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-500">
                L
              </span>
            </div>
          </div>

          {/* Prix au litre */}
          <div>
            <label className="text-xs font-medium text-gray-600 block mb-1">
              Prix/litre (optionnel)
            </label>
            <div className="relative">
              <input
                type="number"
                step="0.001"
                value={pricePerLiter}
                onChange={(e) => setPricePerLiter(e.target.value)}
                placeholder="Ex: 1.649"
                min="0"
                className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange focus:border-transparent outline-none text-sm"
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-500">
                €/L
              </span>
            </div>
          </div>
        </div>

        {/* Plein complet checkbox */}
        <div className="flex items-center gap-2 mb-4">
          <input
            type="checkbox"
            id="isFull"
            checked={isFull}
            onChange={(e) => setIsFull(e.target.checked)}
            className="w-4 h-4 rounded border-gray-300 text-orange focus:ring-orange"
          />
          <label htmlFor="isFull" className="text-sm text-gray-600">
            Plein complet
          </label>
        </div>

        {/* Note */}
        <div className="mb-4">
          <label className="text-xs font-medium text-gray-600 block mb-1">
            Note (optionnel)
          </label>
          <input
            type="text"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Ex: Station Total sur l'autoroute"
            className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange focus:border-transparent outline-none text-sm"
          />
        </div>

        {/* Submit button */}
        <button
          type="submit"
          disabled={isSaving}
          className="w-full px-6 py-3 bg-gradient-to-r from-orange to-orange-light text-white font-bold rounded-xl hover:shadow-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSaving ? "Enregistrement..." : "Enregistrer le plein"}
        </button>

        {/* Messages */}
        <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mt-4 p-3 bg-red-50 border border-red-200 rounded-xl"
          >
            <p className="text-red-600 text-sm">{error}</p>
          </motion.div>
        )}
        {successMessage && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mt-4 p-3 bg-green-50 border border-green-200 rounded-xl"
          >
            <p className="text-green-600 text-sm">{successMessage}</p>
          </motion.div>
        )}
        </AnimatePresence>
              </form>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Historique récent */}
      {records.length > 0 && (
        <div className="mt-6 border-t pt-6">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">
            Historique récent
          </h3>
          <div className="space-y-2">
            {records.slice(0, 5).map((record) => (
              <div
                key={record._id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-xl text-sm"
              >
                <div>
                  <p className="font-medium text-black">
                    {record.mileage.toLocaleString()} km
                  </p>
                  <p className="text-xs text-gray-500">
                    {new Date(record.recordedAt).toLocaleDateString("fr-FR")}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-bold text-black">
                    {record.amountPaid.toFixed(2)}€
                  </p>
                  {record.liters && (
                    <p className="text-xs text-gray-500">{record.liters}L</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
}

