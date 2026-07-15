"use client";

import { useEffect, useState } from "react";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";
import { PatPalProfile } from "@/types";
import { DEMO_MODE, getDemoUsers } from "@/lib/demo-auth";
import { useRouter } from "next/navigation";
import BottomNav from "@/components/BottomNav";

const CATEGORIES = [
  { emoji: "🎓", label: "Mentorship" },
  { emoji: "📚", label: "Tutoring" },
  { emoji: "🔥", label: "Motivation" },
  { emoji: "🎯", label: "Accountability" },
  { emoji: "📈", label: "Business Coaching" },
  { emoji: "☕", label: "Friendly Chat" },
  { emoji: "💙", label: "Emotional Support" },
  { emoji: "💡", label: "Consulting" },
  { emoji: "💼", label: "Career Advice" },
  { emoji: "🌟", label: "Encouragement" },
  { emoji: "✝", label: "Spiritual" },
  { emoji: "🎵", label: "Music Lessons" },
];

export default function ClientDashboard() {
  const { profile } = useAuth();
  const router = useRouter();
  const [patPals, setPatPals] = useState<PatPalProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCat, setSelectedCat] = useState<string | null>(null);

  useEffect(() => {
    if (DEMO_MODE) {
      const users = getDemoUsers();
      const pals = Object.values(users)
        .filter((u) => u.role === "patpal" && u.isActive)
        .map((u) => u as unknown as PatPalProfile);
      setPatPals(pals);
      setLoading(false);
      return;
    }
    const q = query(collection(db, "users"), where("role", "==", "patpal"), where("isActive", "==", true));
    const unsub = onSnapshot(q, (snap) => {
      setPatPals(snap.docs.map((d) => d.data() as PatPalProfile));
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const online = patPals.filter((p) => p.availability === "available");

  return (
    <div className="min-h-screen bg-white pb-24">
      {/* Header */}
      <header className="sticky top-0 bg-white z-10 border-b border-gray-100">
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-sm">P</span>
            </div>
            <span className="font-bold text-gray-900 text-lg">Pat My Back 👋</span>
          </div>
          <div className="flex items-center gap-2 bg-gray-100 rounded-full px-3 py-1.5">
            <span className="text-xs font-semibold text-gray-600">0 min</span>
          </div>
        </div>
      </header>

      {/* Hero */}
      <div className="px-4 py-5">
        <h2 className="text-xl font-bold text-gray-900 mb-1">Talk to a real person who has your back</h2>
        <p className="text-gray-500 text-sm mb-4">Encouragement when you need it most. Pay only for the time you use.</p>
        <button
          onClick={() => router.push("/client/browse")}
          className="bg-green-500 hover:bg-green-600 text-white font-semibold px-5 py-2.5 rounded-full text-sm transition-colors"
        >
          Find support now →
        </button>
      </div>

      {/* Talk to the Team */}
      {online.length > 0 && (
        <section className="mb-4">
          <div className="px-4 flex items-center gap-2 mb-3">
            <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center">
              <span className="text-green-600 text-xs">✓</span>
            </div>
            <h3 className="font-semibold text-gray-900 text-sm">Talk to the Team</h3>
          </div>
          <div className="flex gap-3 px-4 overflow-x-auto scrollbar-hide pb-1">
            {online.map((p) => (
              <TeamCard key={p.uid} patPal={p} onCall={() => router.push(`/client/chat/${p.uid}`)} />
            ))}
          </div>
        </section>
      )}

      {/* Categories */}
      <section className="mb-4">
        <h3 className="font-semibold text-gray-900 text-sm px-4 mb-3">Browse by category</h3>
        <div className="flex gap-2 px-4 overflow-x-auto scrollbar-hide pb-1">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.label}
              onClick={() => setSelectedCat(selectedCat === cat.label ? null : cat.label)}
              className={`flex-shrink-0 flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                selectedCat === cat.label
                  ? "bg-green-500 text-white border-green-500"
                  : "bg-white text-gray-700 border-gray-200"
              }`}
            >
              <span>{cat.emoji}</span>
              <span>{cat.label}</span>
            </button>
          ))}
        </div>
      </section>

      {/* Online now */}
      <section className="mb-4">
        <div className="px-4 flex items-center justify-between mb-3">
          <h3 className="font-semibold text-gray-900 text-sm">Online now</h3>
          <button className="text-green-500 text-xs font-medium">See all</button>
        </div>
        {loading ? (
          <div className="px-4 space-y-3">
            {[1,2,3].map(i => <div key={i} className="bg-gray-100 rounded-2xl h-24 animate-pulse" />)}
          </div>
        ) : patPals.length === 0 ? (
          <div className="px-4 text-center py-10 text-gray-400">
            <p className="text-3xl mb-2">👤</p>
            <p className="text-sm">No Pat Pals yet. Sign up as a Pat Pal to appear here.</p>
          </div>
        ) : (
          <div className="px-4 space-y-3">
            {patPals.map((p) => (
              <PatPalCard key={p.uid} patPal={p} onCall={() => router.push(`/client/chat/${p.uid}`)} />
            ))}
          </div>
        )}
      </section>

      <BottomNav active="home" />
    </div>
  );
}

function TeamCard({ patPal, onCall }: { patPal: PatPalProfile; onCall: () => void }) {
  return (
    <div className="flex-shrink-0 w-36 bg-white border border-gray-100 rounded-2xl p-3 shadow-sm">
      <div className="relative mb-2">
        <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mx-auto">
          {(patPal as any).photoURL ? (
            <img src={(patPal as any).photoURL} className="w-full h-full rounded-full object-cover" alt="" />
          ) : (
            <span className="text-green-700 font-bold text-lg">{patPal.displayName?.charAt(0).toUpperCase()}</span>
          )}
        </div>
        <span className="absolute bottom-0 right-6 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
      </div>
      <p className="font-semibold text-gray-900 text-xs text-center truncate">{patPal.displayName}</p>
      <p className="text-gray-400 text-xs text-center mb-2 truncate">{(patPal as any).bio?.slice(0, 30) || "Pat Pal"}</p>
      <p className="text-green-600 text-xs text-center mb-2 font-medium">Online now</p>
      <button
        onClick={onCall}
        className="w-full bg-green-500 hover:bg-green-600 text-white text-xs font-semibold py-1.5 rounded-full transition-colors"
      >
        Call
      </button>
    </div>
  );
}

function PatPalCard({ patPal, onCall }: { patPal: PatPalProfile; onCall: () => void }) {
  const isOnline = patPal.availability === "available";
  const rating = (patPal as any).rating || "5.0";
  const tier = (patPal as any).tier || "Trusted Support";
  const pricePerMin = (patPal as any).pricePerMin ?? 0;

  const tierColors: Record<string, string> = {
    "Trusted Support": "bg-blue-50 text-blue-600",
    "Expert": "bg-purple-50 text-purple-600",
    "Premium Expert": "bg-amber-50 text-amber-600",
  };

  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm">
      <div className="flex items-start gap-3">
        <div className="relative flex-shrink-0">
          {(patPal as any).photoURL ? (
            <img src={(patPal as any).photoURL} className="w-14 h-14 rounded-full object-cover" alt="" />
          ) : (
            <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center">
              <span className="text-green-700 font-bold text-xl">{patPal.displayName?.charAt(0).toUpperCase()}</span>
            </div>
          )}
          <span className={`absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full border-2 border-white ${isOnline ? "bg-green-500" : "bg-gray-300"}`} />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between">
            <div>
              <p className="font-semibold text-gray-900">{patPal.displayName}</p>
              <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                <div className="flex items-center gap-0.5">
                  <span className="text-amber-400 text-xs">★</span>
                  <span className="text-xs font-semibold text-gray-700">{rating}</span>
                </div>
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${tierColors[tier] || tierColors["Trusted Support"]}`}>
                  {tier}
                </span>
              </div>
            </div>
            <p className="font-bold text-gray-900 text-sm flex-shrink-0">
              ${pricePerMin}<span className="text-gray-400 font-normal text-xs">/min</span>
            </p>
          </div>

          {patPal.bio && (
            <p className="text-gray-500 text-xs mt-1.5 line-clamp-2">{patPal.bio}</p>
          )}

          <div className="flex items-center justify-between mt-3">
            <span className={`text-xs font-medium flex items-center gap-1 ${isOnline ? "text-green-600" : "text-gray-400"}`}>
              <span className={`w-2 h-2 rounded-full inline-block ${isOnline ? "bg-green-500" : "bg-gray-300"}`} />
              {isOnline ? "Online now" : "Offline"}
            </span>
            <button
              onClick={onCall}
              disabled={!isOnline}
              className={`px-5 py-1.5 rounded-full text-sm font-semibold transition-colors ${
                isOnline ? "bg-green-500 hover:bg-green-600 text-white" : "bg-gray-100 text-gray-400 cursor-not-allowed"
              }`}
            >
              Call
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
