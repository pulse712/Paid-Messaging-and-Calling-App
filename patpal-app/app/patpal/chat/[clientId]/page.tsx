"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  addDoc,
  serverTimestamp,
  doc,
  getDoc,
} from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/context/AuthContext";
import { Message, UserProfile } from "@/types";
import CallModal from "@/components/CallModal";

export default function PatPalChatPage() {
  const { clientId } = useParams<{ clientId: string }>();
  const { user, profile } = useAuth();
  const router = useRouter();

  const [client, setClient] = useState<UserProfile | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [chatId, setChatId] = useState<string | null>(null);
  const [callType, setCallType] = useState<"audio" | "video" | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    getDoc(doc(db, "users", clientId)).then((snap) => {
      if (snap.exists()) setClient(snap.data() as UserProfile);
    });
  }, [clientId]);

  useEffect(() => {
    if (!user) return;
    const id = [user.uid, clientId].sort().join("_");
    setChatId(id);
  }, [user, clientId]);

  useEffect(() => {
    if (!chatId) return;
    const q = query(
      collection(db, "chats", chatId, "messages"),
      orderBy("createdAt", "asc")
    );
    const unsub = onSnapshot(q, (snap) => {
      setMessages(snap.docs.map((d) => ({ id: d.id, ...d.data() } as Message)));
      setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
    });
    return () => unsub();
  }, [chatId]);

  const sendMessage = async () => {
    if (!text.trim() || !chatId || !user) return;
    setSending(true);
    try {
      await addDoc(collection(db, "chats", chatId, "messages"), {
        chatId,
        senderId: user.uid,
        senderName: profile?.displayName || "Pat Pal",
        text: text.trim(),
        createdAt: serverTimestamp(),
        read: false,
      });
      setText("");
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-center gap-3">
          <button onClick={() => router.back()} className="text-gray-500 hover:text-gray-700">
            ←
          </button>
          <div className="w-9 h-9 rounded-full bg-indigo-100 flex items-center justify-center flex-shrink-0">
            <span className="text-indigo-600 font-bold text-sm">
              {client?.displayName?.charAt(0).toUpperCase()}
            </span>
          </div>
          <div className="flex-1">
            <p className="font-semibold text-gray-900 text-sm">{client?.displayName}</p>
            <p className="text-xs text-gray-400">Client</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCallType("audio")}
              className="w-9 h-9 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-600"
            >
              📞
            </button>
            <button
              onClick={() => setCallType("video")}
              className="w-9 h-9 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-600"
            >
              🎥
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-2xl mx-auto w-full px-4 py-4 space-y-3 overflow-y-auto">
        {messages.length === 0 && (
          <div className="text-center py-12 text-gray-400">
            <p className="text-3xl mb-2">💬</p>
            <p className="text-sm">Start the conversation</p>
          </div>
        )}
        {messages.map((msg) => {
          const isMe = msg.senderId === user?.uid;
          return (
            <div key={msg.id} className={`flex ${isMe ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-xs lg:max-w-md px-4 py-2.5 rounded-2xl text-sm ${
                  isMe
                    ? "bg-indigo-600 text-white rounded-br-sm"
                    : "bg-white text-gray-900 shadow-sm border border-gray-100 rounded-bl-sm"
                }`}
              >
                {msg.text}
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </main>

      <div className="bg-white border-t border-gray-200 sticky bottom-0">
        <div className="max-w-2xl mx-auto px-4 py-3 flex items-end gap-3">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            rows={1}
            placeholder="Type a message..."
            className="flex-1 resize-none border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 max-h-32"
          />
          <button
            onClick={sendMessage}
            disabled={!text.trim() || sending}
            className="w-10 h-10 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 rounded-xl flex items-center justify-center transition-colors flex-shrink-0"
          >
            <span className="text-white text-sm">↑</span>
          </button>
        </div>
      </div>

      {callType && chatId && client && (
        <CallModal
          callType={callType}
          channelName={chatId}
          remoteUser={client}
          onClose={() => setCallType(null)}
        />
      )}
    </div>
  );
}
