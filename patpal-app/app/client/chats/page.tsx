"use client";

import { useEffect, useState } from "react";
import { collection, query, where, onSnapshot, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";
import { Chat } from "@/types";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function ClientChatsPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [chats, setChats] = useState<Chat[]>([]);

  useEffect(() => {
    if (!user) return;
    const q = query(
      collection(db, "chats"),
      where("clientId", "==", user.uid)
    );
    const unsub = onSnapshot(q, (snap) => {
      setChats(snap.docs.map((d) => ({ id: d.id, ...d.data() } as Chat)));
    });
    return () => unsub();
  }, [user]);

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center gap-3">
          <Link href="/client/dashboard" className="text-gray-500 hover:text-gray-700">
            ←
          </Link>
          <h1 className="font-semibold text-gray-900">My Chats</h1>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-6">
        {chats.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <p className="text-4xl mb-3">💬</p>
            <p className="font-medium">No chats yet</p>
            <p className="text-sm mt-1">Connect with a Pat Pal to get started</p>
            <Link
              href="/client/dashboard"
              className="inline-block mt-4 text-indigo-600 text-sm font-medium hover:underline"
            >
              Browse Pat Pals
            </Link>
          </div>
        ) : (
          <div className="space-y-2">
            {chats.map((chat) => (
              <button
                key={chat.id}
                onClick={() => router.push(`/client/chat/${chat.patPalId}`)}
                className="w-full bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex items-center gap-3 text-left hover:border-indigo-200 transition-colors"
              >
                <div className="w-11 h-11 bg-indigo-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-indigo-600 font-bold">
                    {chat.patPalName?.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900 text-sm">{chat.patPalName}</p>
                  {chat.lastMessage && (
                    <p className="text-gray-500 text-xs truncate mt-0.5">{chat.lastMessage}</p>
                  )}
                </div>
                <span className="text-gray-400 text-lg">›</span>
              </button>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
