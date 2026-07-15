"use client";

import { useRouter } from "next/navigation";

const tabs = [
  { id: "home", label: "Home", icon: "🏠", path: "/client/dashboard" },
  { id: "chats", label: "Chats", icon: "💬", path: "/client/chats" },
  { id: "browse", label: "Browse", icon: "🔍", path: "/client/browse" },
  { id: "wallet", label: "Wallet", icon: "👛", path: "/client/wallet" },
  { id: "profile", label: "Profile", icon: "👤", path: "/client/profile" },
];

export default function BottomNav({ active }: { active: string }) {
  const router = useRouter();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 z-50">
      <div className="max-w-lg mx-auto flex items-center justify-around px-2 py-2">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => router.push(tab.path)}
            className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-colors ${
              active === tab.id
                ? "text-indigo-600"
                : "text-gray-400 hover:text-gray-600"
            }`}
          >
            <span className="text-xl">{tab.icon}</span>
            <span className={`text-xs font-medium ${active === tab.id ? "text-indigo-600" : "text-gray-400"}`}>
              {tab.label}
            </span>
          </button>
        ))}
      </div>
    </nav>
  );
}
