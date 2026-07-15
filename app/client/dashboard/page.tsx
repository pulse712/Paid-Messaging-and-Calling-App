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

const TIER_COLORS: Record<string, string> = {
  "Trusted Support": "bg-blue-100 text-blue-700",
  "Expert": "bg-purple-100 text-purple-700",
  "Premium Expert": "bg-amber-100 text-amber-700",
};

export default function ClientDashboard() {
  const { profile } = useAuth();
  const router = useRouter();
  const [patPals, setPatPals] = useState<PatPalProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

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

    const q = query(
      collection(db, "users"),
      where("role", "==", "patpal"),
      where("isActive", "==", true)
    );
    const unsub = onSnapshot(q, (snap) => {
      setPatPals(snap.docs.map((d) => d.data() as PatPalProfile));
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const online = patPals.filter((p) => p.availability === "available");
  const offline = patPals.filter((p) => p.availability !== "available");

  return (
    <div className="min-h-screen bg-white pb-20">
      {/* Header */}
      <header className="bg-white px-4 pt-6 pb-4">
        <div className="flex items-center justify-between mb-1">
          <div>
            <p className="text-gray-500 text-sm">Welcome back,</p>
            <h1 className="text-xl font-bold text-gray-900">
              {profile?.displayName?.split(" ")[0] || "Friend"} 👋
            </h1>
          </div>
          <div className="w-10 h-10 bg-indigo-600 rounded-full flex items-center justify-center">
            <span className="text-white font-bold text-sm">
              {profile?.displayName?.charAt(0).toUpperCase() || "?"}
            </span>
          </div>
        </div>
      </header>

      {/* Hero banner */}
      <div className="mx-4 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-5 mb-6">
        <p className="text-white/80 text-xs font-medium uppercase tracking-wide mb-1">Pat My Back</p>
        <h2 className="text-white text-lg font-bold leading-tight mb-1">
          Talk to a real person who has your back
        </h2>
        <p className="text-white/70 text-sm mb-4">
          Encouragement when you need it most. Pay only for the time you use.
        </p>
        <button
          onClick={() => router.push("/client/browse")}
          className="bg-white text-indigo-600 font-semibold text-sm px-5 py-2.5 rounded-xl hover:bg-indigo-50 transition-colors"
        >
          Find support now
        </button>
      </div>

      {/* Categories */}
      <div className="mb-6">
        <div className="px-4 mb-3">
          <h3 className="font-semibold text-gray-900">Browse by category</h3>
        </div>
        <div className="flex gap-2 px-4 overflow-x-auto pb-1 scrollbar-hide">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.label}
              onClick={() => setSelectedCategory(selectedCategory === cat.label ? null : cat.label)}
              className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-full text-sm font-medium border transition-colors ${
                selectedCategory === cat.label
                  ? "bg-indigo-600 text-white border-indigo-600"
                  : "bg-white text-gray-700 border-gray-200 hover:border-indigo-300"
              }`}
            >
              <span>{cat.emoji}</span>
              <span>{cat.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Online now */}
      {loading ? (
        <div className="px-4 space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-gray-100 rounded-2xl h-28 animate-pulse" />
          ))}
        </div>
      ) : (
        <>
          {online.length > 0 && (
            <section className="mb-6">
              <div className="px-4 flex items-center justify-between mb-3">
                <h3 className="font-semibold text-gray-900">Online now</h3>
                <button className="text-indigo-600 text-sm font-medium">See all</button>
              </div>
              <div className="px-4 space-y-3">
                {online.map((p) => (
                  <PatPalCard key={p.uid} patPal={p} onConnect={() => router.push(`/client/chat/${p.uid}`)} />
                ))}
              </div>
            </section>
          )}

          {offline.length > 0 && (
            <section className="mb-6">
              <div className="px-4 flex items-center justify-between mb-3">
                <h3 className="font-semibold text-gray-900">Top rated</h3>
              </div>
              <div className="px-4 space-y-3">
                {offline.map((p) => (
                  <PatPalCard key={p.uid} patPal={p} onConnect={() => router.push(`/client/chat/${p.uid}`)} />
                ))}
              </div>
            </section>
          )}

          {patPals.length === 0 && (
            <div className="text-center py-16 px-4 text-gray-400">
              <p className="text-5xl mb-4">👤</p>
              <p className="font-semibold text-gray-600">No Pat Pals yet</p>
              <p className="text-sm mt-1">Check back soon</p>
            </div>
          )}
        </>
      )}

      <BottomNav active="home" />
    </div>
  );
}

function PatPalCard({ patPal, onConnect }: { patPal: PatPalProfile; onConnect: () => void }) {
  const isOnline = patPal.availability === "available";
  const tier = (patPal as any).tier || "Trusted Support";
  const rating = (patPal as any).rating || "5.0";
  const pricePerMin = (patPal as any).pricePerMin ?? 0;
  const tierColor = TIER_COLORS[tier] || TIER_COLORS["Trusted Support"];

  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm">
      <div className="flex items-start gap-3">
        {/* Avatar */}
        <div className="relative flex-shrink-0">
          {(patPal as any).photoURL ? (
            <img
              src={(patPal as any).photoURL}
              alt={patPal.displayName}
              className="w-14 h-14 rounded-full object-cover"
            />
          ) : (
            <div className="w-14 h-14 rounded-full bg-indigo-100 flex items-center justify-center">
              <span className="text-indigo-600 font-bold text-xl">
                {patPal.displayName?.charAt(0).toUpperCase()}
              </span>
            </div>
          )}
          <span className={`absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full border-2 border-white ${isOnline ? "bg-green-500" : "bg-gray-300"}`} />
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="font-semibold text-gray-900">{patPal.displayName}</p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <div className="flex items-center gap-0.5">
                  <span className="text-amber-400 text-xs">★</span>
                  <span className="text-xs font-medium text-gray-700">{rating}</span>
                </div>
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${tierColor}`}>
                  {tier}
                </span>
              </div>
            </div>
            <div className="text-right flex-shrink-0">
              <p className="font-bold text-gray-900 text-sm">
                ${pricePerMin}<span className="text-gray-400 font-normal">/min</span>
              </p>
            </div>
          </div>

          {patPal.bio && (
            <p className="text-gray-500 text-xs mt-1.5 line-clamp-2">{patPal.bio}</p>
          )}

          <div className="flex items-center justify-between mt-3">
            <span className={`text-xs font-medium ${isOnline ? "text-green-600" : "text-gray-400"}`}>
              {isOnline ? "● Online now" : "● Offline"}
            </span>
            <button
              onClick={onConnect}
              disabled={!isOnline}
              className={`px-4 py-1.5 rounded-xl text-sm font-semibold transition-colors ${
                isOnline
                  ? "bg-indigo-600 hover:bg-indigo-700 text-white"
                  : "bg-gray-100 text-gray-400 cursor-not-allowed"
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
