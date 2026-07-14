"use client";

import { useRouter } from "next/navigation";
import { PatPalProfile, AvailabilityStatus } from "@/types";

const statusConfig: Record<AvailabilityStatus, { label: string; color: string; dot: string }> = {
  available: { label: "Available", color: "text-green-600", dot: "bg-green-500" },
  busy: { label: "Busy", color: "text-yellow-600", dot: "bg-yellow-500" },
  offline: { label: "Offline", color: "text-gray-400", dot: "bg-gray-400" },
};

interface Props {
  patPal: PatPalProfile;
  isSubscribed: boolean;
}

export default function PatPalCard({ patPal, isSubscribed }: Props) {
  const router = useRouter();
  const status = statusConfig[patPal.availability];
  const canConnect = isSubscribed && patPal.availability === "available";

  const handleConnect = () => {
    if (!isSubscribed) {
      router.push("/client/subscribe");
      return;
    }
    if (patPal.availability === "available") {
      router.push(`/client/chat/${patPal.uid}`);
    }
  };

  return (
    <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex items-center gap-4">
      {/* Avatar */}
      <div className="relative flex-shrink-0">
        <div className="w-14 h-14 rounded-full bg-indigo-100 flex items-center justify-center">
          {patPal.photoURL ? (
            <img
              src={patPal.photoURL}
              alt={patPal.displayName}
              className="w-full h-full rounded-full object-cover"
            />
          ) : (
            <span className="text-indigo-600 font-bold text-xl">
              {patPal.displayName?.charAt(0).toUpperCase()}
            </span>
          )}
        </div>
        <span
          className={`absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full border-2 border-white ${status.dot}`}
        />
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-gray-900 truncate">{patPal.displayName}</p>
        <p className={`text-xs font-medium ${status.color} mt-0.5`}>{status.label}</p>
        {patPal.bio && (
          <p className="text-gray-500 text-xs mt-1 line-clamp-1">{patPal.bio}</p>
        )}
      </div>

      {/* Action */}
      <button
        onClick={handleConnect}
        disabled={!canConnect && isSubscribed}
        className={`flex-shrink-0 px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
          canConnect
            ? "bg-indigo-600 hover:bg-indigo-700 text-white"
            : !isSubscribed
            ? "bg-indigo-600 hover:bg-indigo-700 text-white"
            : "bg-gray-100 text-gray-400 cursor-not-allowed"
        }`}
      >
        {!isSubscribed ? "Subscribe" : patPal.availability === "available" ? "Connect" : "Unavailable"}
      </button>
    </div>
  );
}
