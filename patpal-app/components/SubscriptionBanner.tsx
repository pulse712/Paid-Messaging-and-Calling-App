"use client";

import { useRouter } from "next/navigation";

export default function SubscriptionBanner() {
  const router = useRouter();

  return (
    <div className="bg-indigo-600 rounded-2xl p-5 text-white">
      <h3 className="font-bold text-lg">Get started with PatPal</h3>
      <p className="text-indigo-200 text-sm mt-1 mb-4">
        Subscribe to connect with available Pat Pals via text, audio, and video.
      </p>
      <button
        onClick={() => router.push("/client/subscribe")}
        className="bg-white text-indigo-600 font-semibold text-sm px-5 py-2.5 rounded-xl hover:bg-indigo-50 transition-colors"
      >
        View plans
      </button>
    </div>
  );
}
