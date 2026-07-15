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
      router.replace("/auth/login");
      return;
    }
    const role = (profile as any)?.role;
    if (role === "admin") router.replace("/admin");
    else if (role === "patpal") router.replace("/patpal/dashboard");
    else router.replace("/client/dashboard");
  }, [user, profile, loading, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-indigo-50">
      <div className="flex flex-col items-center gap-4">
        <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center">
          <span className="text-white text-2xl font-bold">P</span>
        </div>
        <p className="text-indigo-600 font-medium">Loading...</p>
      </div>
    </div>
  );
}
