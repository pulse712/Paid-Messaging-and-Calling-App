"use client";

import Link from "next/link";

export default function SubscribeSuccessPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-indigo-50 px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8 text-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-3xl">✅</span>
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">You&apos;re subscribed!</h1>
        <p className="text-gray-500 text-sm mb-6">
          Your PatPal access is now active. Start connecting with available Pat Pals.
        </p>
        <Link
          href="/client/dashboard"
          className="block w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 rounded-xl transition-colors text-sm"
        >
          Find a Pat Pal
        </Link>
      </div>
    </div>
  );
}
