"use client";

import { useRouter } from "next/navigation";
import { Home, MessageCircle, Search, Wallet, User } from "lucide-react";

const tabs = [
  { id: "home", label: "Home", path: "/client/dashboard", Icon: Home },
  { id: "chats", label: "Chats", path: "/client/chats", Icon: MessageCircle },
  { id: "browse", label: "Browse", path: "/client/browse", Icon: Search },
  { id: "wallet", label: "Wallet", path: "/client/wallet", Icon: Wallet },
  { id: "profile", label: "Profile", path: "/client/profile", Icon: User },
];

export default function BottomNav({ active }: { active: string }) {
  const router = useRouter();
  return (
    <nav className="fixed bottom-0 left-0 right-0 w-full bg-white border-t border-gray-100 z-50">
      <div className="flex items-center justify-around px-1 py-2">
        {tabs.map(({ id, label, path, Icon }) => {
          const isActive = active === id;
          return (
            <button
              key={id}
              onClick={() => router.push(path)}
              className="flex flex-col items-center gap-0.5 px-3 py-1"
            >
              <Icon
                size={22}
                strokeWidth={1.8}
                className={isActive ? "text-teal-600" : "text-gray-400"}
              />
              <span className={`text-xs ${isActive ? "text-teal-600 font-semibold" : "text-gray-400"}`}>
                {label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
