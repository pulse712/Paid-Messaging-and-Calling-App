"use client";

import { useRouter } from "next/navigation";

const tabs = [
  { id: "home", label: "Home", path: "/client/dashboard", icon: (active: boolean) => (
    <svg className={`w-6 h-6 ${active ? "text-green-500" : "text-gray-400"}`} fill={active ? "currentColor" : "none"} stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
    </svg>
  )},
  { id: "chats", label: "Chats", path: "/client/chats", icon: (active: boolean) => (
    <svg className={`w-6 h-6 ${active ? "text-green-500" : "text-gray-400"}`} fill={active ? "currentColor" : "none"} stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
    </svg>
  )},
  { id: "browse", label: "Browse", path: "/client/browse", icon: (active: boolean) => (
    <svg className={`w-6 h-6 ${active ? "text-green-500" : "text-gray-400"}`} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
  )},
  { id: "wallet", label: "Wallet", path: "/client/wallet", icon: (active: boolean) => (
    <svg className={`w-6 h-6 ${active ? "text-green-500" : "text-gray-400"}`} fill={active ? "currentColor" : "none"} stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
    </svg>
  )},
  { id: "profile", label: "Profile", path: "/client/profile", icon: (active: boolean) => (
    <svg className={`w-6 h-6 ${active ? "text-green-500" : "text-gray-400"}`} fill={active ? "currentColor" : "none"} stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
    </svg>
  )},
];

export default function BottomNav({ active }: { active: string }) {
  const router = useRouter();
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 z-50" style={{ maxWidth: 480, margin: "0 auto", left: "50%", transform: "translateX(-50%)", width: "100%" }}>
      <div className="flex items-center justify-around px-2 py-2">
        {tabs.map((tab) => {
          const isActive = active === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => router.push(tab.path)}
              className="flex flex-col items-center gap-0.5 px-3 py-1"
            >
              {tab.icon(isActive)}
              <span className={`text-xs ${isActive ? "text-green-500 font-semibold" : "text-gray-400"}`}>
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
