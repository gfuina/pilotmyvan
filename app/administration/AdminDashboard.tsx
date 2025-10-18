"use client";

import { useState, useEffect } from "react";
import { signOut } from "next-auth/react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import BrandList from "@/components/admin/BrandList";
import AddBrandModal from "@/components/admin/AddBrandModal";
import CategoryBuilder from "@/components/admin/CategoryBuilder";
import EquipmentList from "@/components/admin/EquipmentList";
import AddEquipmentModal from "@/components/admin/AddEquipmentModal";
import PendingEquipments from "@/components/admin/PendingEquipments";
import PendingMaintenances from "@/components/admin/PendingMaintenances";

interface User {
  name?: string | null;
  email?: string | null;
  isAdmin: boolean;
}

interface AdminDashboardProps {
  user: User;
}

interface UserData {
  _id: string;
  name: string;
  email: string;
  isAdmin: boolean;
  emailVerified: string | null;
  createdAt: string;
}

interface VehicleData {
  _id: string;
  name: string;
  make: string;
  model: string;
  vehicleType: string;
  userId: string;
  userName?: string;
  userEmail?: string;
}

interface Brand {
  _id: string;
  name: string;
  logo?: string;
}

interface Stats {
  totalUsers: number;
  totalVehicles: number;
  totalAdmins: number;
  usersWithVehicles: number;
}

interface Category {
  _id: string;
  name: string;
  level: number;
  parentId?: string;
  order: number;
  children: Category[];
}

interface Equipment {
  _id: string;
  name: string;
  description?: string;
  categoryId: {
    _id: string;
    name: string;
    level: number;
  };
  vehicleBrands: Array<{
    _id: string;
    name: string;
    logo?: string;
  }>;
  equipmentBrands: Array<{
    _id: string;
    name: string;
    logo?: string;
  }>;
  photos: string[];
  manuals: Array<{
    title: string;
    url: string;
    isExternal: boolean;
  }>;
  notes?: string;
}

export default function AdminDashboard({ user }: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState<
    "stats" | "users" | "vehicles" | "vehicle-brands" | "equipment-brands" | "categories" | "equipments" | "pending-equipments" | "pending-maintenances"
  >("stats");
  const [stats, setStats] = useState<Stats | null>(null);
  const [users, setUsers] = useState<UserData[]>([]);
  const [vehicles, setVehicles] = useState<VehicleData[]>([]);
  const [vehicleBrands, setVehicleBrands] = useState<Brand[]>([]);
  const [equipmentBrands, setEquipmentBrands] = useState<Brand[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [equipments, setEquipments] = useState<Equipment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddBrandModalOpen, setIsAddBrandModalOpen] = useState(false);
  const [editingBrand, setEditingBrand] = useState<Brand | null>(null);
  const [brandModalType, setBrandModalType] = useState<"vehicle" | "equipment">("vehicle");
  const [isAddEquipmentModalOpen, setIsAddEquipmentModalOpen] = useState(false);
  const [editingEquipment, setEditingEquipment] = useState<Equipment | null>(null);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      if (activeTab === "stats" || activeTab === "users") {
        const usersRes = await fetch("/api/admin/users");
        if (usersRes.ok) {
          const data = await usersRes.json();
          setUsers(data.users);
          
          // Calculate stats
          const totalUsers = data.users.length;
          const totalAdmins = data.users.filter((u: UserData) => u.isAdmin).length;
          
          const vehiclesRes = await fetch("/api/admin/vehicles");
          if (vehiclesRes.ok) {
            const vehiclesData = await vehiclesRes.json();
            const userIds = new Set(vehiclesData.vehicles.map((v: VehicleData) => v.userId));
            
            setStats({
              totalUsers,
              totalVehicles: vehiclesData.vehicles.length,
              totalAdmins,
              usersWithVehicles: userIds.size,
            });
          }
        }
      }
      
      if (activeTab === "vehicles") {
        const vehiclesRes = await fetch("/api/admin/vehicles");
        if (vehiclesRes.ok) {
          const data = await vehiclesRes.json();
          setVehicles(data.vehicles);
        }
      }

      if (activeTab === "vehicle-brands") {
        const brandsRes = await fetch("/api/admin/vehicle-brands");
        if (brandsRes.ok) {
          const data = await brandsRes.json();
          setVehicleBrands(data.brands);
        }
      }

      if (activeTab === "equipment-brands") {
        const brandsRes = await fetch("/api/admin/equipment-brands");
        if (brandsRes.ok) {
          const data = await brandsRes.json();
          setEquipmentBrands(data.brands);
        }
      }

      if (activeTab === "categories") {
        const categoriesRes = await fetch("/api/admin/categories");
        if (categoriesRes.ok) {
          const data = await categoriesRes.json();
          setCategories(data.categories);
        }
      }

      if (activeTab === "equipments") {
        const [equipmentsRes, categoriesRes] = await Promise.all([
          fetch("/api/admin/equipments"),
          fetch("/api/admin/categories")
        ]);
        if (equipmentsRes.ok) {
          const data = await equipmentsRes.json();
          setEquipments(data.equipments);
        }
        if (categoriesRes.ok) {
          const data = await categoriesRes.json();
          setCategories(data.categories);
        }
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const handleAddBrand = (type: "vehicle" | "equipment") => {
    setBrandModalType(type);
    setEditingBrand(null);
    setIsAddBrandModalOpen(true);
  };

  const handleEditBrand = (brand: Brand, type: "vehicle" | "equipment") => {
    setBrandModalType(type);
    setEditingBrand(brand);
    setIsAddBrandModalOpen(true);
  };

  const handleBrandSuccess = () => {
    setIsAddBrandModalOpen(false);
    setEditingBrand(null);
    fetchData();
  };

  const handleAddEquipment = () => {
    setEditingEquipment(null);
    setIsAddEquipmentModalOpen(true);
  };

  const handleEditEquipment = (equipment: Equipment) => {
    setEditingEquipment(equipment);
    setIsAddEquipmentModalOpen(true);
  };

  const handleEquipmentSuccess = () => {
    setIsAddEquipmentModalOpen(false);
    setEditingEquipment(null);
    fetchData();
  };

  const handleSignOut = async () => {
    await signOut({ callbackUrl: "/" });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <header className="bg-gradient-to-r from-orange to-orange-light shadow-lg">
        <div className="container mx-auto px-4 lg:px-8">
          <div className="flex items-center justify-between py-3 sm:py-4 gap-2">
            <div className="flex items-center gap-2 sm:gap-4">
              <Link href="/dashboard" className="flex flex-col">
                <span className="text-xl sm:text-2xl font-bold text-white leading-none">
                  P<span className="text-black">M</span>V
                </span>
                <span className="text-[9px] sm:text-[10px] text-white/80 font-medium leading-none mt-0.5">
                  Administration
                </span>
              </Link>
              <span className="px-2 sm:px-3 py-0.5 sm:py-1 bg-white/20 backdrop-blur-sm text-white text-[10px] sm:text-xs font-bold rounded-full">
                ADMIN
              </span>
            </div>

            <div className="flex items-center gap-2 sm:gap-4">
              <div className="text-right hidden lg:block">
                <p className="text-sm font-medium text-white">{user.name}</p>
                <p className="text-xs text-white/80">{user.email}</p>
              </div>
              <Link
                href="/dashboard"
                className="hidden sm:flex px-3 sm:px-4 py-2 bg-white text-orange font-semibold rounded-2xl hover:bg-gray-100 transition-all duration-300 text-sm"
              >
                Dashboard
              </Link>
              <button
                onClick={handleSignOut}
                className="px-3 sm:px-4 py-2 bg-white/10 backdrop-blur-sm text-white font-semibold rounded-2xl hover:bg-white/20 transition-all duration-300 border border-white/30 text-xs sm:text-sm"
              >
                <span className="hidden sm:inline">Déconnexion</span>
                <span className="sm:hidden">↗</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 lg:px-8 py-4 sm:py-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Tabs - Scrollable on mobile */}
          <div className="overflow-x-auto pb-2 mb-6 sm:mb-8 -mx-4 px-4 lg:mx-0 lg:px-0">
            <div className="flex gap-2 min-w-max lg:min-w-0 lg:flex-wrap">
              <button
                onClick={() => setActiveTab("stats")}
                className={`px-4 sm:px-6 py-2 sm:py-3 font-semibold rounded-2xl transition-all duration-300 text-xs sm:text-base whitespace-nowrap ${
                  activeTab === "stats"
                    ? "bg-gradient-to-r from-orange to-orange-light text-white shadow-lg"
                    : "bg-white text-gray hover:bg-gray-50"
                }`}
              >
                📊 <span className="hidden sm:inline">Statistiques</span><span className="sm:hidden">Stats</span>
              </button>
              <button
                onClick={() => setActiveTab("users")}
                className={`px-4 sm:px-6 py-2 sm:py-3 font-semibold rounded-2xl transition-all duration-300 text-xs sm:text-base whitespace-nowrap ${
                  activeTab === "users"
                    ? "bg-gradient-to-r from-orange to-orange-light text-white shadow-lg"
                    : "bg-white text-gray hover:bg-gray-50"
                }`}
              >
                👥 Utilisateurs
              </button>
              <button
                onClick={() => setActiveTab("vehicles")}
                className={`px-4 sm:px-6 py-2 sm:py-3 font-semibold rounded-2xl transition-all duration-300 text-xs sm:text-base whitespace-nowrap ${
                  activeTab === "vehicles"
                    ? "bg-gradient-to-r from-orange to-orange-light text-white shadow-lg"
                    : "bg-white text-gray hover:bg-gray-50"
                }`}
              >
                🚐 Véhicules
              </button>
              <button
                onClick={() => setActiveTab("vehicle-brands")}
                className={`px-4 sm:px-6 py-2 sm:py-3 font-semibold rounded-2xl transition-all duration-300 text-xs sm:text-base whitespace-nowrap ${
                  activeTab === "vehicle-brands"
                    ? "bg-gradient-to-r from-orange to-orange-light text-white shadow-lg"
                    : "bg-white text-gray hover:bg-gray-50"
                }`}
              >
                🏷️ <span className="hidden sm:inline">Marques véhicules</span><span className="sm:hidden">Marques V.</span>
              </button>
              <button
                onClick={() => setActiveTab("equipment-brands")}
                className={`px-4 sm:px-6 py-2 sm:py-3 font-semibold rounded-2xl transition-all duration-300 text-xs sm:text-base whitespace-nowrap ${
                  activeTab === "equipment-brands"
                    ? "bg-gradient-to-r from-orange to-orange-light text-white shadow-lg"
                    : "bg-white text-gray hover:bg-gray-50"
                }`}
              >
                🔧 <span className="hidden sm:inline">Marques équipements</span><span className="sm:hidden">Marques E.</span>
              </button>
              <button
                onClick={() => setActiveTab("categories")}
                className={`px-4 sm:px-6 py-2 sm:py-3 font-semibold rounded-2xl transition-all duration-300 text-xs sm:text-base whitespace-nowrap ${
                  activeTab === "categories"
                    ? "bg-gradient-to-r from-orange to-orange-light text-white shadow-lg"
                    : "bg-white text-gray hover:bg-gray-50"
                }`}
              >
                📂 Catégories
              </button>
              <button
                onClick={() => setActiveTab("equipments")}
                className={`px-4 sm:px-6 py-2 sm:py-3 font-semibold rounded-2xl transition-all duration-300 text-xs sm:text-base whitespace-nowrap ${
                  activeTab === "equipments"
                    ? "bg-gradient-to-r from-orange to-orange-light text-white shadow-lg"
                    : "bg-white text-gray hover:bg-gray-50"
                }`}
              >
                ⚙️ Équipements
              </button>
              <button
                onClick={() => setActiveTab("pending-equipments")}
                className={`px-4 sm:px-6 py-2 sm:py-3 font-semibold rounded-2xl transition-all duration-300 text-xs sm:text-base whitespace-nowrap ${
                  activeTab === "pending-equipments"
                    ? "bg-gradient-to-r from-orange to-orange-light text-white shadow-lg"
                    : "bg-white text-gray hover:bg-gray-50"
                }`}
              >
                ⏳ <span className="hidden sm:inline">Contributions Équipements</span><span className="sm:hidden">Contrib. E.</span>
              </button>
              <button
                onClick={() => setActiveTab("pending-maintenances")}
                className={`px-4 sm:px-6 py-2 sm:py-3 font-semibold rounded-2xl transition-all duration-300 text-xs sm:text-base whitespace-nowrap ${
                  activeTab === "pending-maintenances"
                    ? "bg-gradient-to-r from-orange to-orange-light text-white shadow-lg"
                    : "bg-white text-gray hover:bg-gray-50"
                }`}
              >
                ⏳ <span className="hidden sm:inline">Contributions Entretiens</span><span className="sm:hidden">Contrib. M.</span>
              </button>
            </div>
          </div>

          {/* Pending Equipments Tab - Always show */}
          {activeTab === "pending-equipments" && (
            <PendingEquipments />
          )}

          {/* Pending Maintenances Tab - Always show */}
          {activeTab === "pending-maintenances" && (
            <PendingMaintenances />
          )}

          {isLoading && activeTab !== "pending-equipments" && activeTab !== "pending-maintenances" ? (
            <div className="flex justify-center items-center py-20">
              <div className="w-12 h-12 border-4 border-orange border-t-transparent rounded-full animate-spin" />
            </div>
          ) : activeTab !== "pending-equipments" && activeTab !== "pending-maintenances" ? (
            <>
              {/* Stats Tab */}
              {activeTab === "stats" && stats && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                  <div className="bg-white rounded-3xl shadow-lg p-4 sm:p-6">
                    <div className="flex items-center justify-between mb-3 sm:mb-4">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 bg-orange/10 rounded-2xl flex items-center justify-center">
                        <span className="text-xl sm:text-2xl">👥</span>
                      </div>
                      <span className="text-2xl sm:text-3xl font-bold text-black">
                        {stats.totalUsers}
                      </span>
                    </div>
                    <h3 className="font-semibold text-black text-sm sm:text-base">Utilisateurs</h3>
                    <p className="text-xs sm:text-sm text-gray">Total inscrits</p>
                  </div>

                  <div className="bg-white rounded-3xl shadow-lg p-4 sm:p-6">
                    <div className="flex items-center justify-between mb-3 sm:mb-4">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 bg-orange/10 rounded-2xl flex items-center justify-center">
                        <span className="text-xl sm:text-2xl">🚐</span>
                      </div>
                      <span className="text-2xl sm:text-3xl font-bold text-black">
                        {stats.totalVehicles}
                      </span>
                    </div>
                    <h3 className="font-semibold text-black text-sm sm:text-base">Véhicules</h3>
                    <p className="text-xs sm:text-sm text-gray">Total enregistrés</p>
                  </div>

                  <div className="bg-white rounded-3xl shadow-lg p-4 sm:p-6">
                    <div className="flex items-center justify-between mb-3 sm:mb-4">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 bg-orange/10 rounded-2xl flex items-center justify-center">
                        <span className="text-xl sm:text-2xl">⭐</span>
                      </div>
                      <span className="text-2xl sm:text-3xl font-bold text-black">
                        {stats.totalAdmins}
                      </span>
                    </div>
                    <h3 className="font-semibold text-black text-sm sm:text-base">Admins</h3>
                    <p className="text-xs sm:text-sm text-gray">Administrateurs</p>
                  </div>

                  <div className="bg-white rounded-3xl shadow-lg p-4 sm:p-6">
                    <div className="flex items-center justify-between mb-3 sm:mb-4">
                      <div className="w-10 h-10 sm:w-12 sm:h-12 bg-orange/10 rounded-2xl flex items-center justify-center">
                        <span className="text-xl sm:text-2xl">✅</span>
                      </div>
                      <span className="text-2xl sm:text-3xl font-bold text-black">
                        {stats.usersWithVehicles}
                      </span>
                    </div>
                    <h3 className="font-semibold text-black text-sm sm:text-base">Utilisateurs actifs</h3>
                    <p className="text-xs sm:text-sm text-gray">Avec véhicules</p>
                  </div>
                </div>
              )}

              {/* Users Tab */}
              {activeTab === "users" && (
                <div className="bg-white rounded-3xl shadow-lg overflow-hidden">
                  {/* Mobile view */}
                  <div className="block sm:hidden divide-y divide-gray-200">
                    {users.map((u) => (
                      <div key={u._id} className="p-4 hover:bg-gray-50">
                        <div className="font-medium text-black mb-1">{u.name}</div>
                        <div className="text-sm text-gray mb-2 break-all">{u.email}</div>
                        <div className="flex flex-wrap gap-2 mb-2">
                          {u.isAdmin && (
                            <span className="px-2 py-1 text-xs font-semibold text-orange bg-orange/10 rounded-full">
                              Admin
                            </span>
                          )}
                          {u.emailVerified ? (
                            <span className="px-2 py-1 text-xs font-semibold text-green-600 bg-green-100 rounded-full">
                              Vérifié
                            </span>
                          ) : (
                            <span className="px-2 py-1 text-xs font-semibold text-yellow-600 bg-yellow-100 rounded-full">
                              Non vérifié
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-gray">
                          {new Date(u.createdAt).toLocaleDateString("fr-FR")}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Desktop view */}
                  <div className="hidden sm:block overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                          <th className="px-4 lg:px-6 py-3 lg:py-4 text-left text-xs font-semibold text-gray uppercase tracking-wider">
                            Nom
                          </th>
                          <th className="px-4 lg:px-6 py-3 lg:py-4 text-left text-xs font-semibold text-gray uppercase tracking-wider">
                            Email
                          </th>
                          <th className="px-4 lg:px-6 py-3 lg:py-4 text-left text-xs font-semibold text-gray uppercase tracking-wider">
                            Statut
                          </th>
                          <th className="px-4 lg:px-6 py-3 lg:py-4 text-left text-xs font-semibold text-gray uppercase tracking-wider">
                            Date d&apos;inscription
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {users.map((u) => (
                          <tr key={u._id} className="hover:bg-gray-50">
                            <td className="px-4 lg:px-6 py-3 lg:py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-black">
                                {u.name}
                              </div>
                            </td>
                            <td className="px-4 lg:px-6 py-3 lg:py-4">
                              <div className="text-sm text-gray break-all">{u.email}</div>
                            </td>
                            <td className="px-4 lg:px-6 py-3 lg:py-4 whitespace-nowrap">
                              <div className="flex flex-wrap gap-2">
                                {u.isAdmin && (
                                  <span className="px-2 py-1 text-xs font-semibold text-orange bg-orange/10 rounded-full">
                                    Admin
                                  </span>
                                )}
                                {u.emailVerified ? (
                                  <span className="px-2 py-1 text-xs font-semibold text-green-600 bg-green-100 rounded-full">
                                    Vérifié
                                  </span>
                                ) : (
                                  <span className="px-2 py-1 text-xs font-semibold text-yellow-600 bg-yellow-100 rounded-full">
                                    Non vérifié
                                  </span>
                                )}
                              </div>
                            </td>
                            <td className="px-4 lg:px-6 py-3 lg:py-4 whitespace-nowrap text-sm text-gray">
                              {new Date(u.createdAt).toLocaleDateString("fr-FR")}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Vehicle Brands Tab */}
              {activeTab === "vehicle-brands" && (
                <BrandList
                  brands={vehicleBrands}
                  type="vehicle"
                  onRefresh={fetchData}
                  onAdd={() => handleAddBrand("vehicle")}
                  onEdit={(brand) => handleEditBrand(brand, "vehicle")}
                />
              )}

              {/* Equipment Brands Tab */}
              {activeTab === "equipment-brands" && (
                <BrandList
                  brands={equipmentBrands}
                  type="equipment"
                  onRefresh={fetchData}
                  onAdd={() => handleAddBrand("equipment")}
                  onEdit={(brand) => handleEditBrand(brand, "equipment")}
                />
              )}

              {/* Categories Tab */}
              {activeTab === "categories" && (
                <div className="bg-white rounded-3xl shadow-lg p-4 sm:p-6">
                  <div className="mb-4 sm:mb-6">
                    <h2 className="text-xl sm:text-2xl font-bold text-black mb-2">
                      Gestion des catégories
                    </h2>
                    <p className="text-sm sm:text-base text-gray">
                      Créez une hiérarchie de catégories pour organiser vos
                      équipements et entretiens. Vous pouvez créer plusieurs
                      niveaux de catégories.
                    </p>
                  </div>
                  <CategoryBuilder categories={categories} onRefresh={fetchData} />
                </div>
              )}

              {/* Equipments Tab */}
              {activeTab === "equipments" && (
                <div className="bg-white rounded-3xl shadow-lg p-4 sm:p-6">
                  <EquipmentList
                    equipments={equipments}
                    onRefresh={fetchData}
                    onAdd={handleAddEquipment}
                    onEdit={handleEditEquipment}
                  />
                </div>
              )}

              {/* Vehicles Tab */}
              {activeTab === "vehicles" && (
                <div className="bg-white rounded-3xl shadow-lg overflow-hidden">
                  {/* Mobile view */}
                  <div className="block sm:hidden divide-y divide-gray-200">
                    {vehicles.map((v) => (
                      <div key={v._id} className="p-4 hover:bg-gray-50">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <div className="font-medium text-black">{v.name}</div>
                            <div className="text-sm text-gray">
                              {v.make} {v.model}
                            </div>
                          </div>
                          <span className="px-2 py-1 text-xs font-semibold text-gray bg-gray-100 rounded-full">
                            {v.vehicleType}
                          </span>
                        </div>
                        <div className="text-sm text-gray mb-2">
                          <div>{v.userName || "N/A"}</div>
                          <div className="text-xs break-all">{v.userEmail || ""}</div>
                        </div>
                        <Link
                          href={`/dashboard/vehicles/${v._id}`}
                          className="text-orange hover:text-orange-dark font-semibold text-sm inline-block"
                        >
                          Voir le véhicule →
                        </Link>
                      </div>
                    ))}
                  </div>

                  {/* Desktop view */}
                  <div className="hidden sm:block overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                          <th className="px-4 lg:px-6 py-3 lg:py-4 text-left text-xs font-semibold text-gray uppercase tracking-wider">
                            Véhicule
                          </th>
                          <th className="px-4 lg:px-6 py-3 lg:py-4 text-left text-xs font-semibold text-gray uppercase tracking-wider">
                            Type
                          </th>
                          <th className="px-4 lg:px-6 py-3 lg:py-4 text-left text-xs font-semibold text-gray uppercase tracking-wider">
                            Propriétaire
                          </th>
                          <th className="px-4 lg:px-6 py-3 lg:py-4 text-left text-xs font-semibold text-gray uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {vehicles.map((v) => (
                          <tr key={v._id} className="hover:bg-gray-50">
                            <td className="px-4 lg:px-6 py-3 lg:py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-black">
                                {v.name}
                              </div>
                              <div className="text-sm text-gray">
                                {v.make} {v.model}
                              </div>
                            </td>
                            <td className="px-4 lg:px-6 py-3 lg:py-4 whitespace-nowrap">
                              <span className="px-2 py-1 text-xs font-semibold text-gray bg-gray-100 rounded-full">
                                {v.vehicleType}
                              </span>
                            </td>
                            <td className="px-4 lg:px-6 py-3 lg:py-4">
                              <div className="text-sm text-gray">
                                {v.userName || "N/A"}
                                <br />
                                <span className="text-xs break-all">{v.userEmail || ""}</span>
                              </div>
                            </td>
                            <td className="px-4 lg:px-6 py-3 lg:py-4 whitespace-nowrap text-sm">
                              <Link
                                href={`/dashboard/vehicles/${v._id}`}
                                className="text-orange hover:text-orange-dark font-semibold"
                              >
                                Voir
                              </Link>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </>
          ) : null}
        </motion.div>
      </main>

      {/* Add/Edit Brand Modal */}
      <AnimatePresence>
        {isAddBrandModalOpen && (
          <AddBrandModal
            type={brandModalType}
            existingBrand={editingBrand}
            onClose={() => {
              setIsAddBrandModalOpen(false);
              setEditingBrand(null);
            }}
            onSuccess={handleBrandSuccess}
          />
        )}
      </AnimatePresence>

      {/* Add/Edit Equipment Modal */}
      <AnimatePresence>
        {isAddEquipmentModalOpen && (
          <AddEquipmentModal
            onClose={() => {
              setIsAddEquipmentModalOpen(false);
              setEditingEquipment(null);
            }}
            onSuccess={handleEquipmentSuccess}
            equipment={editingEquipment}
            categories={categories}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

