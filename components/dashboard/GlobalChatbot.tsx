"use client";

import { useState, useRef, useEffect } from "react";
import { Send, X, Search, Loader2, User } from "lucide-react";
import Image from "next/image";

interface Message {
  role: "user" | "assistant";
  content: string;
  emotion?: "hello" | "thinking" | "speaking" | "error" | "question";
  sources?: Array<{ manual: string; similarity: number; chunksUsed: number }>;
}

interface Equipment {
  _id: string;
  name: string;
  description?: string;
  categoryId: { name: string };
  equipmentBrands: Array<{ name: string }>;
  photos: string[];
  manualsCount: number;
}

const ROBOT_EMOTIONS = {
  hello: "/images/bot/say-hello.png",
  thinking: "/images/bot/reading-book.png",
  speaking: "/images/bot/speaking-and-translating.png",
  error: "/images/bot/404-error.png",
  question: "/images/bot/interrogation.png",
};

export default function GlobalChatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [equipments, setEquipments] = useState<Equipment[]>([]);
  const [selectedEquipment, setSelectedEquipment] = useState<Equipment | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [loadingEquipments, setLoadingEquipments] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Charger les équipements avec manuels
  useEffect(() => {
    if (isOpen && equipments.length === 0) {
      loadEquipments();
    }
  }, [isOpen]);

  const loadEquipments = async () => {
    setLoadingEquipments(true);
    try {
      const response = await fetch("/api/user/equipments-with-manuals");
      if (response.ok) {
        const data = await response.json();
        setEquipments(data.equipments);
      }
    } catch (error) {
      console.error("Error loading equipments:", error);
    } finally {
      setLoadingEquipments(false);
    }
  };

  const handleSelectEquipment = (equipment: Equipment) => {
    setSelectedEquipment(equipment);
    setMessages([
      {
        role: "assistant",
        content: `Bonjour ! Je suis votre assistant pour ${equipment.name}. Posez-moi vos questions concernant cet équipement, je répondrai en me basant sur les ${equipment.manualsCount} manuel${equipment.manualsCount > 1 ? "s" : ""} disponible${equipment.manualsCount > 1 ? "s" : ""}.`,
        emotion: "hello",
      },
    ]);
    setSearchQuery("");
  };

  const handleBackToSelection = () => {
    setSelectedEquipment(null);
    setMessages([]);
    setInput("");
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading || !selectedEquipment) return;

    const userMessage: Message = {
      role: "user",
      content: input,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    // Message de réflexion
    const thinkingMessage: Message = {
      role: "assistant",
      content: "Je consulte les manuels...",
      emotion: "thinking",
    };
    setMessages((prev) => [...prev, thinkingMessage]);

    try {
      const response = await fetch(`/api/equipment/${selectedEquipment._id}/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ question: input }),
      });

      // Retirer le message de réflexion
      setMessages((prev) => prev.slice(0, -1));

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Erreur lors de la génération de la réponse");
      }

      const data = await response.json();

      const assistantMessage: Message = {
        role: "assistant",
        content: data.answer,
        emotion: data.answer.includes("Je n'ai pas trouvé") || data.answer.includes("Je ne peux pas") ? "error" : "speaking",
        sources: data.sources,
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error: any) {
      setMessages((prev) => prev.slice(0, -1));
      const errorMessage: Message = {
        role: "assistant",
        content: `Erreur : ${error.message}`,
        emotion: "error",
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const filteredEquipments = equipments.filter((eq) =>
    eq.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    eq.categoryId.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <>
      {/* Robot flottant vivant qui sort de l'écran */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed -bottom-4 right-4 md:right-8 z-50 group cursor-pointer"
          title="💬 Posez vos questions à l'assistant IA"
        >
          {/* Robot animé */}
          <div className="relative transition-all duration-300 ease-out group-hover:-translate-y-6 group-hover:scale-110 h-[100px] md:h-[130px] flex items-center">
            <Image
              src="/images/bot/say-hello.png"
              alt="Assistant IA"
              width={130}
              height={130}
              className="drop-shadow-2xl h-[100px] md:h-[130px] w-auto object-contain"
            />
            {/* Bulle de dialogue au hover - cachée sur mobile */}
            <div className="hidden md:block absolute -top-12 -left-24 w-44 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
              <div className="bg-gradient-to-r from-orange to-orange-light text-white text-sm font-medium px-4 py-2 rounded-xl shadow-xl">
                Une question ? 💬
                {/* Petite flèche */}
                <div className="absolute -bottom-1.5 right-10 w-4 h-4 bg-orange-light transform rotate-45"></div>
              </div>
            </div>
            {/* Effet de pulsation subtile */}
            <div className="absolute inset-0 rounded-full bg-orange/20 blur-xl animate-pulse"></div>
          </div>
        </button>
      )}

      {/* Chatbot modal avec animation d'entrée */}
      {isOpen && (
        <div className="fixed inset-x-4 top-20 bottom-4 md:inset-auto md:bottom-6 md:right-6 z-50 flex w-auto md:w-[450px] md:h-[650px] flex-col rounded-2xl bg-white shadow-2xl border border-gray-200 animate-in slide-in-from-bottom-4 fade-in duration-300 max-h-[85vh] md:max-h-none">
          {/* Header avec robot intégré */}
          <div className="relative border-b bg-gradient-to-r from-orange to-orange-light rounded-t-2xl overflow-visible">
            {/* Effet de brillance animé */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer rounded-t-2xl"></div>
            
            <div className="flex items-center justify-between p-3 md:p-4 relative z-10">
              {/* Robot animé qui dépasse du header - Plus vivant ! */}
              <div className="absolute -top-8 md:-top-10 -left-3 md:-left-4 z-20 transition-all duration-300 hover:scale-110 hover:-translate-y-2 animate-bounce-subtle h-[80px] md:h-[100px] flex items-center">
                <Image
                  src={
                    ROBOT_EMOTIONS[
                      (messages.length > 0 && messages[messages.length - 1].emotion) || "hello"
                    ]
                  }
                  alt="Robot"
                  width={100}
                  height={100}
                  className="drop-shadow-2xl h-[80px] md:h-[100px] w-auto object-contain"
                />
              </div>

              <div className="text-white ml-20 md:ml-24 flex-1">
                <h2 className="font-bold text-lg md:text-xl">Assistant IA</h2>
                <p className="text-xs md:text-sm text-orange-100 font-medium mt-0.5 truncate">
                  {selectedEquipment ? selectedEquipment.name : "Choisissez un équipement"}
                </p>
              </div>
              
              <button
                onClick={() => setIsOpen(false)}
                className="rounded-lg p-2 hover:bg-white/20 text-white transition-all hover:rotate-90 duration-300"
                title="Fermer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Contenu */}
          <div className="flex-1 overflow-hidden bg-gradient-to-b from-gray-50/50 to-white">
            {!selectedEquipment ? (
              /* Sélection d'équipement */
              <div className="flex h-full flex-col p-4 md:p-5 pt-6 md:pt-8">
                <h3 className="mb-3 md:mb-4 text-sm md:text-base font-bold text-gray-800 flex items-center gap-2">
                  <span className="text-orange">🤖</span>
                  Sur quel équipement avez-vous des questions ?
                </h3>

                {/* Recherche */}
                <div className="relative mb-3 md:mb-4">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-orange/60" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Rechercher un équipement..."
                    className="w-full rounded-xl border-2 border-gray-200 py-2 md:py-2.5 pl-10 pr-4 text-sm focus:border-orange focus:outline-none focus:ring-2 focus:ring-orange/20 transition-all bg-white shadow-sm"
                  />
                </div>

                {/* Liste des équipements */}
                <div className="flex-1 space-y-2 overflow-y-auto">
                  {loadingEquipments ? (
                    <div className="flex h-full items-center justify-center">
                      <Loader2 className="h-8 w-8 animate-spin text-orange" />
                    </div>
                  ) : filteredEquipments.length === 0 ? (
                    <div className="flex h-full flex-col items-center justify-center text-gray-400">
                      <div className="h-16 md:h-20 flex items-center">
                        <Image
                          src={ROBOT_EMOTIONS.question}
                          alt="Question"
                          width={80}
                          height={80}
                          className="drop-shadow-lg h-16 md:h-20 w-auto object-contain"
                        />
                      </div>
                      <p className="mt-2 text-xs md:text-sm">Aucun équipement trouvé</p>
                    </div>
                  ) : (
                    filteredEquipments.map((equipment) => (
                      <button
                        key={equipment._id}
                        onClick={() => handleSelectEquipment(equipment)}
                        className="w-full rounded-xl border-2 border-gray-200 p-2.5 md:p-3 text-left transition-all hover:border-orange hover:bg-orange/5 hover:shadow-md hover:scale-[1.02] active:scale-[0.98] bg-white"
                      >
                        <div className="flex gap-2 md:gap-3">
                          {equipment.photos[0] && (
                            <div className="relative h-12 md:h-14 w-12 md:w-14 shrink-0 overflow-hidden rounded-lg bg-gradient-to-br from-gray-50 to-gray-100 border border-gray-200">
                              <Image
                                src={equipment.photos[0]}
                                alt={equipment.name}
                                fill
                                className="object-contain p-1.5 md:p-2"
                              />
                            </div>
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="font-bold text-xs md:text-sm text-gray-900 truncate">
                              {equipment.name}
                            </p>
                            <p className="text-[10px] md:text-xs text-gray-500 mt-0.5">
                              {equipment.categoryId.name}
                            </p>
                            <div className="flex items-center gap-1 mt-1 md:mt-1.5">
                              <span className="text-[10px] md:text-xs font-semibold text-green-600 bg-green-50 px-1.5 md:px-2 py-0.5 rounded-full">
                                📄 {equipment.manualsCount} manuel{equipment.manualsCount > 1 ? "s" : ""}
                              </span>
                            </div>
                          </div>
                        </div>
                      </button>
                    ))
                  )}
                </div>
              </div>
            ) : (
              /* Chat */
              <div className="h-full flex flex-col bg-gradient-to-b from-white to-gray-50 pt-4 md:pt-6">
                {/* Bouton retour */}
                <button
                  onClick={handleBackToSelection}
                  className="w-full border-b-2 border-orange/10 p-2.5 md:p-3.5 text-left text-xs md:text-sm text-orange hover:bg-orange/5 transition-all font-bold flex items-center gap-2 group bg-white"
                >
                  <span className="group-hover:-translate-x-1 transition-transform text-sm md:text-base">←</span>
                  <span>Changer d'équipement</span>
                </button>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-3 md:p-5 space-y-3 md:space-y-4">
                  {messages.map((message, index) => (
                    <div
                      key={index}
                      className={`flex gap-2 md:gap-3 animate-in fade-in slide-in-from-bottom-2 duration-300 ${
                        message.role === "user" ? "justify-end" : "justify-start"
                      }`}
                    >
                      <div
                        className={`${message.role === "user" ? "max-w-[85%]" : "max-w-[90%]"} rounded-2xl px-3 md:px-4 py-2 md:py-3 shadow-sm ${
                          message.role === "user"
                            ? "bg-gradient-to-br from-orange to-orange-light text-white rounded-tr-sm"
                            : "bg-white text-gray-900 border border-gray-200 rounded-tl-sm"
                        }`}
                      >
                        <p className="whitespace-pre-wrap text-xs md:text-sm leading-relaxed">{message.content}</p>

                        {message.sources && message.sources.length > 0 && (
                          <div className="mt-2 md:mt-3 space-y-1 md:space-y-1.5 border-t border-gray-200 pt-2 md:pt-3">
                            <p className="text-[10px] md:text-xs font-bold text-gray-700 flex items-center gap-1">
                              <span>📚</span> Sources consultées :
                            </p>
                            {message.sources.map((source, i) => (
                              <div key={i} className="text-[10px] md:text-xs text-gray-600 bg-gray-50 px-1.5 md:px-2 py-1 md:py-1.5 rounded-lg flex items-center justify-between gap-2">
                                <span className="font-medium truncate">📄 {source.manual}</span>
                                <span className="text-gray-400 text-[9px] md:text-[10px] shrink-0">
                                  {source.chunksUsed > 1 && `${source.chunksUsed} extraits • `}
                                  {Math.round(source.similarity * 100)}%
                                </span>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      {message.role === "user" && (
                        <div className="flex h-9 w-9 md:h-11 md:w-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-orange to-orange-light shadow-md">
                          <User className="h-4 w-4 md:h-5 md:w-5 text-white" />
                        </div>
                      )}
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>

                {/* Input */}
                <div className="border-t-2 border-gray-100 p-3 md:p-4 bg-white">
                  <div className="flex gap-2 md:gap-3">
                    <textarea
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyPress={handleKeyPress}
                      placeholder="Posez votre question..."
                      className="flex-1 resize-none rounded-xl border-2 border-gray-200 px-3 md:px-4 py-2 md:py-3 text-base md:text-sm focus:border-orange focus:outline-none focus:ring-2 focus:ring-orange/20 transition-all shadow-sm"
                      rows={2}
                      disabled={isLoading}
                    />
                    <button
                      onClick={handleSend}
                      disabled={!input.trim() || isLoading}
                      className="flex h-[60px] w-[60px] md:h-[68px] md:w-[68px] shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-orange to-orange-light text-white transition-all hover:shadow-lg hover:shadow-orange/50 hover:scale-105 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100"
                    >
                      {isLoading ? (
                        <Loader2 className="h-5 w-5 md:h-6 md:w-6 animate-spin" />
                      ) : (
                        <Send className="h-5 w-5 md:h-6 md:w-6" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}

