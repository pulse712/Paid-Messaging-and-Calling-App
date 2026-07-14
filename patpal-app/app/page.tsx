"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export default function Home() {
  const { user, profile, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.push("/auth/login");
      return;
    }
    if (profile?.role === "admin") {
      router.push("/admin");
    } else if (profile?.role === "patpal") {
      router.push("/patpal/dashboard");
    } else {
      router.push("/client/dashboard");
    }
  }, [user, profile, loading, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-indigo-50">
      <div className="flex flex-col items-center gap-4">
        <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center">
          <span className="text-white text-2xl font-bold">P</span>
        </div>
        <p className="text-indigo-600 font-medium">Loading PatPal...</p>
      </div>
    </div>
  );
}
