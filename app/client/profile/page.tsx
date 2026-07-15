"use client";

import { useAuth } from "@/context/AuthContext";
import BottomNav from "@/components/BottomNav";

export default function ProfilePage() {
  const { profile, signOut } = useAuth();

  return (
    <div className="min-h-screen bg-white pb-20">
      <header className="px-4 pt-6 pb-4 border-b border-gray-100">
        <h1 className="text-xl font-bold text-gray-900">Profile</h1>
      </header>
      <div className="px-4 py-6 space-y-4">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center">
            <span className="text-indigo-600 font-bold text-2xl">
              {profile?.displayName?.charAt(0).toUpperCase() || "?"}
            </span>
          </div>
          <div>
            <p className="font-bold text-gray-900 text-lg">{profile?.displayName}</p>
            <p className="text-gray-500 text-sm">{profile?.email}</p>
          </div>
        </div>

        <div className="bg-gray-50 rounded-2xl p-4 space-y-3">
          <div>
            <p className="text-xs text-gray-400 uppercase tracking-wide">Phone</p>
            <p className="text-gray-700 text-sm mt-0.5">{(profile as any)?.phone || "—"}</p>
          </div>
          <div>
            <p className="text-xs text-gray-400 uppercase tracking-wide">Role</p>
            <p className="text-gray-700 text-sm mt-0.5 capitalize">{profile?.role || "client"}</p>
          </div>
        </div>

        <button
          onClick={signOut}
          className="w-full bg-red-50 text-red-600 font-semibold py-3 rounded-xl hover:bg-red-100 transition-colors text-sm"
        >
          Sign out
        </button>
      </div>
      <BottomNav active="profile" />
    </div>
  );
}
