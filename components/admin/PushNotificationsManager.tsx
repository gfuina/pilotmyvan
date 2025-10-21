"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";

interface PushSubscriber {
  _id: string;
  name: string;
  email: string;
  emailVerified: Date | null;
  subscriptionsCount: number;
  subscriptions: Array<{
    endpoint: string;
    userAgent?: string;
    subscribedAt: Date;
  }>;
}

interface PushStats {
  totalUsersWithPush: number;
  totalSubscriptions: number;
  users: PushSubscriber[];
}

export default function PushNotificationsManager() {
  const [stats, setStats] = useState<PushStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [message, setMessage] = useState({ title: "", body: "", url: "" });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await fetch("/api/admin/push-notifications");
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      } else {
        setError("Erreur lors du chargement des statistiques");
      }
    } catch (error) {
      setError("Erreur lors du chargement des statistiques");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectAll = () => {
    if (selectedUsers.length === stats?.users.length) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(stats?.users.map((u) => u._id) || []);
    }
  };

  const handleToggleUser = (userId: string) => {
    if (selectedUsers.includes(userId)) {
      setSelectedUsers(selectedUsers.filter((id) => id !== userId));
    } else {
      setSelectedUsers([...selectedUsers, userId]);
    }
  };

  const handleSendNotification = async () => {
    if (!message.title || !message.body) {
      setError("Titre et message requis");
      return;
    }

    if (selectedUsers.length === 0) {
      setError("Sélectionnez au moins un utilisateur");
      return;
    }

    setIsSending(true);
    setError("");
    setSuccess("");

    try {
      const response = await fetch("/api/admin/push-notifications", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: message.title,
          body: message.body,
          url: message.url || undefined,
          userIds: selectedUsers,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setSuccess(
          `Notifications envoyées : ${data.results.successful} réussies, ${data.results.failed} échouées`
        );
        setMessage({ title: "", body: "", url: "" });
        setSelectedUsers([]);
        // Rafraîchir les stats pour mettre à jour les subscriptions expirées
        fetchStats();
      } else {
        const data = await response.json();
        setError(data.error || "Erreur lors de l'envoi");
      }
    } catch (error) {
      setError("Erreur lors de l'envoi");
    } finally {
      setIsSending(false);
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-3xl shadow-lg p-8">
        <div className="flex justify-center items-center py-12">
          <div className="w-12 h-12 border-4 border-orange border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-3xl shadow-lg p-8"
    >
      <h2 className="text-2xl font-bold text-black mb-6">
        📱 Notifications Push
      </h2>

      {/* Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-gradient-to-br from-orange/10 to-orange-light/10 rounded-2xl p-4">
          <p className="text-sm text-gray-600 mb-1">Utilisateurs abonnés</p>
          <p className="text-3xl font-bold text-orange">
            {stats?.totalUsersWithPush || 0}
          </p>
        </div>
        <div className="bg-gradient-to-br from-blue-500/10 to-blue-400/10 rounded-2xl p-4">
          <p className="text-sm text-gray-600 mb-1">Total subscriptions</p>
          <p className="text-3xl font-bold text-blue-600">
            {stats?.totalSubscriptions || 0}
          </p>
        </div>
        <div className="bg-gradient-to-br from-green-500/10 to-green-400/10 rounded-2xl p-4">
          <p className="text-sm text-gray-600 mb-1">Sélectionnés</p>
          <p className="text-3xl font-bold text-green-600">
            {selectedUsers.length}
          </p>
        </div>
      </div>

      {/* Formulaire d'envoi */}
      <div className="mb-8 p-6 bg-gray-50 rounded-2xl">
        <h3 className="text-lg font-semibold text-black mb-4">
          Envoyer une notification
        </h3>

        <div className="space-y-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Titre
            </label>
            <input
              type="text"
              value={message.title}
              onChange={(e) =>
                setMessage({ ...message, title: e.target.value })
              }
              placeholder="Ex: Nouvelle fonctionnalité disponible"
              className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange focus:border-transparent outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Message
            </label>
            <textarea
              value={message.body}
              onChange={(e) => setMessage({ ...message, body: e.target.value })}
              placeholder="Ex: Découvrez les nouvelles améliorations de l'app..."
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange focus:border-transparent outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              URL (optionnel)
            </label>
            <input
              type="text"
              value={message.url}
              onChange={(e) => setMessage({ ...message, url: e.target.value })}
              placeholder="/dashboard"
              className="w-full px-4 py-2 border border-gray-300 rounded-xl focus:ring-2 focus:ring-orange focus:border-transparent outline-none"
            />
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}

        {success && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-xl">
            <p className="text-green-600 text-sm">{success}</p>
          </div>
        )}

        <button
          onClick={handleSendNotification}
          disabled={isSending || selectedUsers.length === 0}
          className="w-full px-6 py-3 bg-gradient-to-r from-orange to-orange-light text-white font-bold rounded-2xl hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSending
            ? "Envoi en cours..."
            : `Envoyer à ${selectedUsers.length} utilisateur${selectedUsers.length > 1 ? "s" : ""}`}
        </button>
      </div>

      {/* Liste des utilisateurs */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-black">
            Utilisateurs abonnés ({stats?.users.length || 0})
          </h3>
          <button
            onClick={handleSelectAll}
            className="text-sm text-orange hover:text-orange-dark font-medium"
          >
            {selectedUsers.length === stats?.users.length
              ? "Tout désélectionner"
              : "Tout sélectionner"}
          </button>
        </div>

        {stats?.users.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <p>Aucun utilisateur abonné aux notifications push</p>
          </div>
        ) : (
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {stats?.users.map((user) => (
              <div
                key={user._id}
                onClick={() => handleToggleUser(user._id)}
                className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
                  selectedUsers.includes(user._id)
                    ? "border-orange bg-orange/5"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={selectedUsers.includes(user._id)}
                        onChange={() => {}}
                        className="w-4 h-4 text-orange rounded focus:ring-orange"
                      />
                      <div>
                        <p className="font-medium text-black">{user.name}</p>
                        <p className="text-sm text-gray-500">{user.email}</p>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-orange">
                      {user.subscriptionsCount} appareil{user.subscriptionsCount > 1 ? "s" : ""}
                    </p>
                    {user.emailVerified && (
                      <p className="text-xs text-green-600">✓ Vérifié</p>
                    )}
                  </div>
                </div>

                {/* Détails des subscriptions */}
                {user.subscriptions.length > 0 && (
                  <div className="mt-2 pl-7 space-y-1">
                    {user.subscriptions.map((sub, idx) => (
                      <div key={idx} className="text-xs text-gray-500">
                        {sub.userAgent?.includes("Mobile") ? "📱" : "💻"}{" "}
                        {new Date(sub.subscribedAt).toLocaleDateString("fr-FR")}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}

