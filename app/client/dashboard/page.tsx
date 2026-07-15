"use client";

import { useEffect, useState } from "react";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";
import { PatPalProfile } from "@/types";
import PatPalCard from "@/components/PatPalCard";
import SubscriptionBanner from "@/components/SubscriptionBanner";
import Link from "next/link";
import { DEMO_MODE, getDemoUsers } from "@/lib/demo-auth";

export default function ClientDashboard() {
  const { profile, signOut } = useAuth();
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

  const available = patPals.filter((p) => p.availability === "available");
  const others = patPals.filter((p) => p.availability !== "available");

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
          <div className="flex items-center gap-3">
            <Link href="/client/chats" className="text-gray-500 hover:text-gray-700 text-sm">Chats</Link>
            <button onClick={signOut} className="text-gray-500 hover:text-gray-700 text-sm">Sign out</button>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6 space-y-6">
        <div>
          <h1 className="text-xl font-bold text-gray-900">
            Hello, {profile?.displayName?.split(" ")[0]} 👋
          </h1>
          <p className="text-gray-500 text-sm mt-1">Choose a Pat Pal to connect with</p>
        </div>

        {!profile?.hasActiveSubscription && <SubscriptionBanner />}

        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => <div key={i} className="bg-white rounded-2xl h-24 animate-pulse" />)}
          </div>
        ) : (
          <>
            {available.length > 0 && (
              <section>
                <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Available now</h2>
                <div className="space-y-3">
                  {available.map((p) => (
                    <PatPalCard key={p.uid} patPal={p} isSubscribed={!!profile?.hasActiveSubscription} />
                  ))}
                </div>
              </section>
            )}
            {others.length > 0 && (
              <section>
                <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Unavailable</h2>
                <div className="space-y-3">
                  {others.map((p) => (
                    <PatPalCard key={p.uid} patPal={p} isSubscribed={!!profile?.hasActiveSubscription} />
                  ))}
                </div>
              </section>
            )}
            {patPals.length === 0 && (
              <div className="text-center py-16 text-gray-400">
                <p className="text-4xl mb-3">👤</p>
                <p className="font-medium">No Pat Pals yet</p>
                <p className="text-sm mt-1">
                  {DEMO_MODE ? "Sign up as a Pat Pal to see them here" : "Check back soon"}
                </p>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
