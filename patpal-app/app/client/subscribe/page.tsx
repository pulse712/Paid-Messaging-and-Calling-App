"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";

export default function SubscribePage() {
  const { profile } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleSubscribe = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/stripe/create-checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: profile?.uid, email: profile?.email }),
      });
      const { url } = await res.json();
      if (url) window.location.href = url;
    } catch {
      alert("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-indigo-50 px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8">
        <div className="text-center mb-8">
          <div className="w-14 h-14 bg-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <span className="text-white text-2xl font-bold">P</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">PatPal Access</h1>
          <p className="text-gray-500 text-sm mt-2">
            Connect with Pat Pals via text, audio, and video
          </p>
        </div>

        {/* Plan card */}
        <div className="border-2 border-indigo-600 rounded-2xl p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-900">Monthly Plan</h2>
            <span className="bg-indigo-100 text-indigo-700 text-xs font-semibold px-2.5 py-1 rounded-full">
              Popular
            </span>
          </div>
          <div className="flex items-baseline gap-1 mb-4">
            <span className="text-4xl font-bold text-gray-900">$29</span>
            <span className="text-gray-500">/month</span>
          </div>
          <ul className="space-y-2">
            {[
              "Unlimited text messaging",
              "Audio & video calls",
              "Access to all available Pat Pals",
              "Cancel anytime",
            ].map((feature) => (
              <li key={feature} className="flex items-center gap-2 text-sm text-gray-600">
                <span className="text-green-500 font-bold">✓</span>
                {feature}
              </li>
            ))}
          </ul>
        </div>

        <button
          onClick={handleSubscribe}
          disabled={loading}
          className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-semibold py-3.5 rounded-xl transition-colors"
        >
          {loading ? "Redirecting to payment..." : "Subscribe now — $29/month"}
        </button>

        <p className="text-center text-gray-400 text-xs mt-4">
          Secure payment powered by Stripe. Cancel anytime.
        </p>

        <button
          onClick={() => router.back()}
          className="w-full mt-3 text-gray-500 text-sm hover:underline"
        >
          Go back
        </button>
      </div>
    </div>
  );
}
