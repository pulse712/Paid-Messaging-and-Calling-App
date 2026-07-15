"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { signInWithEmailAndPassword } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { demoLogin } from "@/lib/demo-auth";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

const schema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(1, "Enter your password"),
});

type FormData = z.infer<typeof schema>;

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    setError("");
    try {
      const isDemo =
        !process.env.NEXT_PUBLIC_FIREBASE_API_KEY ||
        process.env.NEXT_PUBLIC_FIREBASE_API_KEY === "your_firebase_api_key" ||
        process.env.NEXT_PUBLIC_FIREBASE_API_KEY === "placeholder";

      if (isDemo) {
        const user = demoLogin(data.email, data.password);
        if (user.role === "admin") router.push("/admin");
        else if (user.role === "patpal") router.push("/patpal/dashboard");
        else router.push("/client/dashboard");
        return;
      }

      const userCred = await signInWithEmailAndPassword(auth, data.email, data.password);
      const docSnap = await getDoc(doc(db, "users", userCred.user.uid));
      const profile = docSnap.data();
      if (profile?.role === "admin") router.push("/admin");
      else if (profile?.role === "patpal") router.push("/patpal/dashboard");
      else router.push("/client/dashboard");
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message.includes("No account") ? err.message : "Invalid email or password");
      } else {
        setError("Invalid email or password");
      }
    } finally {
      setLoading(false);
    }
  };

  const isDemo =
    !process.env.NEXT_PUBLIC_FIREBASE_API_KEY ||
    process.env.NEXT_PUBLIC_FIREBASE_API_KEY === "your_firebase_api_key" ||
    process.env.NEXT_PUBLIC_FIREBASE_API_KEY === "placeholder";

  return (
    <div className="min-h-screen flex flex-col bg-white px-6">
      {/* Logo */}
      <div className="flex flex-col items-center pt-14 pb-8">
        <div className="w-16 h-16 bg-green-500 rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-green-200">
          <span className="text-white text-3xl font-bold">P</span>
        </div>
        <h1 className="text-2xl font-bold text-gray-900">Pat My Back</h1>
        <p className="text-gray-400 text-sm mt-1">Sign in to your account</p>
      </div>

      {isDemo && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl px-4 py-3 mb-5">
          <p className="text-amber-700 text-xs font-semibold">Demo Mode — No Firebase needed</p>
          <p className="text-amber-600 text-xs mt-0.5">Use <strong>admin@demo.com</strong> for admin. Sign up first for other roles.</p>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 flex-1">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
          <input
            {...register("email")}
            type="email"
            autoComplete="email"
            placeholder="you@example.com"
            className="w-full px-4 py-3.5 border border-gray-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-green-400 bg-gray-50"
          />
          {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
          <input
            {...register("password")}
            type="password"
            autoComplete="current-password"
            placeholder="••••••••"
            className="w-full px-4 py-3.5 border border-gray-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-green-400 bg-gray-50"
          />
          {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
        </div>

        <div className="text-right">
          <Link href="/auth/forgot-password" className="text-green-600 text-sm font-medium">Forgot password?</Link>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-100 rounded-2xl px-4 py-3">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-green-500 hover:bg-green-600 disabled:bg-green-300 text-white font-semibold py-4 rounded-2xl transition-colors text-sm shadow-lg shadow-green-200"
        >
          {loading ? "Signing in..." : "Sign in"}
        </button>
      </form>

      <p className="text-center text-gray-500 text-sm py-8">
        Don&apos;t have an account?{" "}
        <Link href="/auth/register" className="text-green-600 font-semibold">Sign up</Link>
      </p>
    </div>
  );
}
