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

      {/* Stats Grid */}
      {stats && records.length > 0 && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-gray-50 rounded-xl p-4">
            <p className="text-xs text-gray-500 mb-1">Dépenses totales</p>
            <p className="text-2xl font-bold text-black">
              {stats.totalSpent.toFixed(2)}€
            </p>
          </div>
          {stats.averageConsumption > 0 && (
            <div className="bg-gray-50 rounded-xl p-4">
              <p className="text-xs text-gray-500 mb-1">Conso moyenne</p>
              <p className="text-2xl font-bold text-black">
                {stats.averageConsumption} L
              </p>
              <p className="text-xs text-gray-400">/100km</p>
            </div>
          )}
          {stats.averagePricePerLiter > 0 && (
            <div className="bg-gray-50 rounded-xl p-4">
              <p className="text-xs text-gray-500 mb-1">Prix moyen</p>
              <p className="text-2xl font-bold text-black">
                {stats.averagePricePerLiter.toFixed(3)}€
              </p>
              <p className="text-xs text-gray-400">/litre</p>
            </div>
          )}
          {stats.totalDistance > 0 && (
            <div className="bg-gray-50 rounded-xl p-4">
              <p className="text-xs text-gray-500 mb-1">Distance totale</p>
              <p className="text-2xl font-bold text-black">
                {stats.totalDistance.toLocaleString()} km
              </p>
            </div>
          )}
        </div>
      )}

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
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

      {/* Formulaire */}
      <form onSubmit={handleSubmit} className="border-t pt-6">
        <h3 className="text-sm font-semibold text-gray-700 mb-4">
          Enregistrer un plein
        </h3>

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
      </form>

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

