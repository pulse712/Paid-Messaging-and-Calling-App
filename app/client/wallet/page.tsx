"use client";

import BottomNav from "@/components/BottomNav";
import Link from "next/link";

export default function WalletPage() {
  return (
    <div className="min-h-screen bg-white pb-20">
      <header className="px-4 pt-6 pb-4 border-b border-gray-100">
        <h1 className="text-xl font-bold text-gray-900">Wallet</h1>
      </header>
      <div className="flex items-center justify-center py-20 text-gray-400">
        <div className="text-center">
          <p className="text-4xl mb-3">👛</p>
          <p className="font-medium">Coming soon</p>
          <Link href="/client/dashboard" className="text-indigo-600 text-sm mt-2 block">Back to home</Link>
        </div>
      </div>
      <BottomNav active="wallet" />
    </div>
  );
}
