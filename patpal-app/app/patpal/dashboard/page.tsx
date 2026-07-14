"use client";

import { useEffect, useState } from "react";
import { doc, updateDoc, collection, query, where, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";
import { AvailabilityStatus, Chat } from "@/types";
import { useRouter } from "next/navigation";

const statusOptions: { value: AvailabilityStatus; label: string; color: string }[] = [
  { value: "available", label: "Available", color: "bg-green-500" },
  { value: "busy", label: "Busy", color: "bg-yellow-500" },
  { value: "offline", label: "Offline", color: "bg-gray-400" },
];

export default function PatPalDashboard() {
  const { user, profile, signOut } = useAuth();
  const router = useRouter();
  const [availability, setAvailability] = useState<AvailabilityStatus>("offline");
  const [chats, setChats] = useState<Chat[]>([]);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    if (profile) {
      setAvailability((profile as any).availability || "offline");
    }
  }, [profile]);

  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, "chats"), where("patPalId", "==", user.uid));
    const unsub = onSnapshot(q, (snap) => {
      setChats(snap.docs.map((d) => ({ id: d.id, ...d.data() } as Chat)));
    });
    return () => unsub();
  }, [user]);

  const updateAvailability = async (status: AvailabilityStatus) => {
    if (!user) return;
    setUpdating(true);
    try {
      await updateDoc(doc(db, "users", user.uid), { availability: status });
      setAvailability(status);
    } finally {
      setUpdating(false);
    }
  };

  const current = statusOptions.find((s) => s.value === availability);

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">P</span>
            </div>
            <span className="font-semibold text-gray-900">PatPal</span>
          </div>
          <button onClick={signOut} className="text-gray-500 hover:text-gray-700 text-sm">
            Sign out
          </button>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        <div>
          <h1 className="text-xl font-bold text-gray-900">
            Hello, {profile?.displayName?.split(" ")[0]} 👋
          </h1>
          <p className="text-gray-500 text-sm mt-1">Pat Pal Dashboard</p>
        </div>

        {/* Availability */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <h2 className="font-semibold text-gray-900 mb-4">Your status</h2>
          <div className="flex items-center gap-2 mb-4">
            <span className={`w-3 h-3 rounded-full ${current?.color}`} />
            <span className="text-sm font-medium text-gray-700">{current?.label}</span>
          </div>
          <div className="flex gap-2">
            {statusOptions.map((s) => (
              <button
                key={s.value}
                onClick={() => updateAvailability(s.value)}
                disabled={updating || availability === s.value}
                className={`flex-1 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                  availability === s.value
                    ? "bg-indigo-600 text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>

        {/* Active chats */}
        <div>
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">
            Client conversations
          </h2>
          {chats.length === 0 ? (
            <div className="text-center py-10 text-gray-400">
              <p className="text-3xl mb-2">💬</p>
              <p className="text-sm">No conversations yet</p>
            </div>
          ) : (
            <div className="space-y-2">
              {chats.map((chat) => (
                <button
                  key={chat.id}
                  onClick={() => router.push(`/patpal/chat/${chat.clientId}`)}
                  className="w-full bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex items-center gap-3 text-left hover:border-indigo-200 transition-colors"
                >
                  <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-indigo-600 font-bold text-sm">
                      {chat.clientName?.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 text-sm">{chat.clientName}</p>
                    {chat.lastMessage && (
                      <p className="text-gray-500 text-xs truncate mt-0.5">{chat.lastMessage}</p>
                    )}
                  </div>
                  <span className="text-gray-400 text-lg">›</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
