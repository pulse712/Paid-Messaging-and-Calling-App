"use client";

import { useEffect, useState } from "react";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";
import { PatPalProfile } from "@/types";
import { DEMO_MODE, getDemoUsers } from "@/lib/demo-auth";
import { useRouter } from "next/navigation";
import BottomNav from "@/components/BottomNav";
import { Clock, ChevronRight, Info, Star, Trophy } from "lucide-react";

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
  { emoji: "✝️", label: "Spiritual Encouragement" },
  { emoji: "🎵", label: "Music Lessons" },
  { emoji: "👨‍💼", label: "Benhurk" },
];

const TIER_STYLES: Record<string, { bg: string; text: string }> = {
  "Trusted Support": { bg: "bg-teal-50", text: "text-teal-700" },
  "Expert": { bg: "bg-purple-50", text: "text-purple-700" },
  "Premium Expert": { bg: "bg-orange-50", text: "text-orange-700" },
};

export default function ClientDashboard() {
  const { profile } = useAuth();
  const router = useRouter();
  const [patPals, setPatPals] = useState<PatPalProfile[]>([]);
  const [loading, setLoading] = useState(true);

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
      <header className="sticky top-0 bg-white z-10 px-4 pt-4 pb-3">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-400 font-medium">Welcome</p>
            <h1 className="text-xl font-bold text-gray-900">Pat My Back 👋</h1>
          </div>
          <div className="flex items-center gap-1.5 bg-teal-50 border border-teal-100 rounded-full px-3 py-1.5">
            <Clock size={12} className="text-teal-600" strokeWidth={2} />
            <span className="text-xs font-bold text-teal-700">0 min</span>
          </div>
        </div>
      </header>

      {/* Hero Banner — teal to orange gradient */}
      <div className="mx-4 mb-5 rounded-2xl overflow-hidden" style={{ background: "linear-gradient(135deg, #0EA5A0 0%, #F97316 100%)" }}>
        <div className="p-5">
          <h2 className="text-white font-bold text-lg leading-snug mb-1">
            Talk to a real person who has your back
          </h2>
          <p className="text-white/80 text-xs mb-4">
            Encouragement when you need it most. Pay only for the time you use.
          </p>
          <button
            onClick={() => router.push("/client/browse")}
            className="bg-white/20 hover:bg-white/30 text-white text-xs font-semibold px-4 py-2 rounded-full border border-white/30 transition-colors flex items-center gap-1"
          >
            Find support now <ChevronRight size={13} />
          </button>
        </div>
      </div>

      {/* Talk to the Team */}
      {online.length > 0 && (
        <section className="mb-5">
          <div className="flex items-center gap-2 px-4 mb-3">
            <div className="w-4 h-4 rounded-full bg-teal-100 flex items-center justify-center">
              <span className="text-teal-600 text-xs font-bold">✓</span>
            </div>
            <h3 className="text-sm font-semibold text-gray-800">Talk to the Team</h3>
          </div>
          <div className="px-4 space-y-2">
            {online.map((p) => (
              <TeamListCard key={p.uid} patPal={p} onCall={() => router.push(`/client/chat/${p.uid}`)} />
            ))}
          </div>
        </section>
      )}

      {/* Browse by category */}
      <section className="mb-5">
        <h3 className="text-sm font-semibold text-gray-800 px-4 mb-3">Browse by category</h3>
        <div className="px-4 grid grid-cols-4 gap-3">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.label}
              className="flex flex-col items-center gap-1.5 p-2 rounded-xl hover:bg-gray-50 transition-colors"
            >
              <div className="w-12 h-12 rounded-2xl bg-gray-50 flex items-center justify-center text-2xl shadow-sm">
                {cat.emoji}
              </div>
              <span className="text-gray-600 text-xs text-center leading-tight">{cat.label}</span>
            </button>
          ))}
        </div>
      </section>

      {/* Online now */}
      <section className="mb-5">
        <div className="flex items-center justify-between px-4 mb-3">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-teal-500 inline-block" />
            <h3 className="text-sm font-semibold text-gray-800">Online now</h3>
          </div>
          <button className="flex items-center gap-0.5 text-teal-600 text-xs font-medium">
            See all <ChevronRight size={12} />
          </button>
        </div>

        {loading ? (
          <div className="px-4 space-y-2">
            {[1,2,3].map(i => <div key={i} className="bg-gray-100 rounded-2xl h-20 animate-pulse" />)}
          </div>
        ) : patPals.length === 0 ? (
          <div className="px-4 text-center py-10 text-gray-400">
            <p className="text-3xl mb-2">👤</p>
            <p className="text-sm">No Pat Pals yet</p>
          </div>
        ) : (
          <div className="px-4 space-y-2">
            {patPals.map((p) => (
              <PatPalListCard key={p.uid} patPal={p} onCall={() => router.push(`/client/chat/${p.uid}`)} />
            ))}
          </div>
        )}
      </section>

      {/* Top rated */}
      {patPals.length > 0 && (
        <section className="mb-5">
          <div className="flex items-center gap-1.5 px-4 mb-3">
            <Trophy size={14} className="text-amber-500" />
            <h3 className="text-sm font-semibold text-gray-800">Top rated</h3>
          </div>
          <div className="px-4 space-y-2">
            {patPals.slice(0, 4).map((p) => (
              <PatPalListCard key={`top-${p.uid}`} patPal={p} onCall={() => router.push(`/client/chat/${p.uid}`)} />
            ))}
          </div>
        </section>
      )}

      <BottomNav active="home" />
    </div>
  );
}

function TeamListCard({ patPal, onCall }: { patPal: PatPalProfile; onCall: () => void }) {
  return (
    <div className="bg-white border border-gray-100 rounded-2xl px-4 py-3 flex items-center gap-3 shadow-sm">
      <div className="w-10 h-10 rounded-full bg-teal-100 flex items-center justify-center flex-shrink-0">
        {(patPal as any).photoURL ? (
          <img src={(patPal as any).photoURL} className="w-full h-full rounded-full object-cover" alt="" />
        ) : (
          <span className="text-teal-700 font-bold">{patPal.displayName?.charAt(0).toUpperCase()}</span>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <p className="font-semibold text-gray-900 text-sm">{patPal.displayName}</p>
          <span className="text-xs bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded-full">Admin</span>
        </div>
        <p className="text-gray-400 text-xs truncate">{patPal.bio || "Pat Pal"}</p>
        <div className="flex items-center gap-1 mt-0.5">
          <span className="w-1.5 h-1.5 rounded-full bg-teal-500 inline-block" />
          <span className="text-teal-600 text-xs font-medium">Online now</span>
        </div>
      </div>
      <button
        onClick={onCall}
        className="flex items-center gap-1 bg-teal-500 hover:bg-teal-600 text-white text-xs font-semibold px-3 py-2 rounded-xl transition-colors flex-shrink-0"
      >
        Call <ChevronRight size={12} />
      </button>
    </div>
  );
}

function PatPalListCard({ patPal, onCall }: { patPal: PatPalProfile; onCall: () => void }) {
  const isOnline = patPal.availability === "available";
  const rating = (patPal as any).rating || "5.0";
  const tier = (patPal as any).tier || "Trusted Support";
  const pricePerMin = (patPal as any).pricePerMin ?? 0;
  const tierStyle = TIER_STYLES[tier] || TIER_STYLES["Trusted Support"];

  return (
    <div className="bg-white border border-gray-100 rounded-2xl px-4 py-3 flex items-start gap-3 shadow-sm">
      <div className="relative flex-shrink-0">
        {(patPal as any).photoURL ? (
          <img src={(patPal as any).photoURL} className="w-11 h-11 rounded-full object-cover" alt="" />
        ) : (
          <div className="w-11 h-11 rounded-full bg-teal-100 flex items-center justify-center">
            <span className="text-teal-700 font-bold text-base">{patPal.displayName?.charAt(0).toUpperCase()}</span>
          </div>
        )}
        <span className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white ${isOnline ? "bg-teal-500" : "bg-gray-300"}`} />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1">
          <p className="font-semibold text-gray-900 text-sm">{patPal.displayName}</p>
          <Info size={12} className="text-gray-300" />
        </div>
        <p className="text-gray-400 text-xs truncate mt-0.5">{patPal.bio || "Pat Pal"}</p>
        <div className="flex items-center gap-1.5 mt-1">
          <div className="flex items-center gap-0.5">
            <Star size={11} className="text-amber-400 fill-amber-400" />
            <span className="text-xs font-semibold text-gray-700">{rating}</span>
          </div>
          <span className={`text-xs font-medium px-1.5 py-0.5 rounded-full ${tierStyle.bg} ${tierStyle.text}`}>
            {tier}
          </span>
        </div>
      </div>

      <div className="flex-shrink-0 text-right">
        <p className="font-bold text-gray-900 text-sm">${pricePerMin}<span className="text-gray-400 font-normal text-xs">/min</span></p>
        <p className={`text-xs font-medium mt-1 ${isOnline ? "text-teal-600" : "text-gray-400"}`}>
          {isOnline ? "Online now" : "Offline"}
        </p>
      </div>
    </div>
  );
}
