"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { createUserWithEmailAndPassword, sendEmailVerification, updateProfile } from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { demoRegister } from "@/lib/demo-auth";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { UserRole } from "@/types";

const schema = z.object({
  displayName: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Enter a valid email"),
  phone: z.string().min(10, "Enter a valid phone number"),
  role: z.enum(["client", "patpal"]),
  bio: z.string().optional(),
  password: z.string().min(6, "Password must be at least 6 characters"),
  confirmPassword: z.string(),
}).refine((d) => d.password === d.confirmPassword, { message: "Passwords do not match", path: ["confirmPassword"] });

type FormData = z.infer<typeof schema>;

export default function RegisterPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const { register, handleSubmit, watch, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { role: "client" },
  });

  const role = watch("role");

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    setError("");
    try {
      const isDemo =
        !process.env.NEXT_PUBLIC_FIREBASE_API_KEY ||
        process.env.NEXT_PUBLIC_FIREBASE_API_KEY === "your_firebase_api_key" ||
        process.env.NEXT_PUBLIC_FIREBASE_API_KEY === "placeholder";

      if (isDemo) {
        demoRegister(data.email, data.password, data.displayName, data.role, data.phone, data.bio);
        if (data.role === "patpal") router.push("/patpal/dashboard");
        else router.push("/client/dashboard");
        return;
      }

      const userCred = await createUserWithEmailAndPassword(auth, data.email, data.password);
      await updateProfile(userCred.user, { displayName: data.displayName });
      await sendEmailVerification(userCred.user);
      await setDoc(doc(db, "users", userCred.user.uid), {
        uid: userCred.user.uid, email: data.email, phone: data.phone,
        displayName: data.displayName, role: data.role as UserRole,
        bio: data.bio || "", photoURL: "", isActive: true,
        createdAt: serverTimestamp(),
        ...(data.role === "patpal" && { availability: "available", sessionCount: 0 }),
      });
      router.push("/auth/verify-email");
    } catch (err: unknown) {
      if (err instanceof Error && err.message.includes("email-already-in-use")) {
        setError("An account with this email already exists");
      } else {
        setError("Registration failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-white px-6">
      <div className="flex flex-col items-center pt-10 pb-6">
        <div className="w-14 h-14 bg-green-500 rounded-2xl flex items-center justify-center mb-3 shadow-lg shadow-green-200">
          <span className="text-white text-2xl font-bold">P</span>
        </div>
        <h1 className="text-2xl font-bold text-gray-900">Create account</h1>
        <p className="text-gray-400 text-sm mt-1">Join Pat My Back today</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {/* Role */}
        <div className="grid grid-cols-2 gap-3">
          {(["client", "patpal"] as const).map((r) => (
            <label key={r} className={`flex items-center justify-center py-3.5 rounded-2xl border-2 cursor-pointer transition-colors ${
              role === r ? "border-green-500 bg-green-50 text-green-700" : "border-gray-200 text-gray-500"
            }`}>
              <input {...register("role")} type="radio" value={r} className="sr-only" />
              <span className="font-semibold text-sm">{r === "patpal" ? "Pat Pal" : "Client"}</span>
            </label>
          ))}
        </div>

        <div>
          <input {...register("displayName")} placeholder="Full name"
            className="w-full px-4 py-3.5 border border-gray-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-green-400 bg-gray-50" />
          {errors.displayName && <p className="text-red-500 text-xs mt-1">{errors.displayName.message}</p>}
        </div>

        <div>
          <input {...register("email")} type="email" placeholder="Email address"
            className="w-full px-4 py-3.5 border border-gray-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-green-400 bg-gray-50" />
          {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
        </div>

        <div>
          <input {...register("phone")} type="tel" placeholder="Phone number"
            className="w-full px-4 py-3.5 border border-gray-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-green-400 bg-gray-50" />
          {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone.message}</p>}
        </div>

        {role === "patpal" && (
          <div>
            <textarea {...register("bio")} rows={3} placeholder="Short bio — tell clients about yourself"
              className="w-full px-4 py-3.5 border border-gray-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-green-400 bg-gray-50 resize-none" />
          </div>
        )}

        <div>
          <input {...register("password")} type="password" placeholder="Password"
            className="w-full px-4 py-3.5 border border-gray-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-green-400 bg-gray-50" />
          {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password.message}</p>}
        </div>

        <div>
          <input {...register("confirmPassword")} type="password" placeholder="Confirm password"
            className="w-full px-4 py-3.5 border border-gray-200 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-green-400 bg-gray-50" />
          {errors.confirmPassword && <p className="text-red-500 text-xs mt-1">{errors.confirmPassword.message}</p>}
        </div>

        {error && (
          <div className="bg-red-50 border border-red-100 rounded-2xl px-4 py-3">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}

        <button type="submit" disabled={loading}
          className="w-full bg-green-500 hover:bg-green-600 disabled:bg-green-300 text-white font-semibold py-4 rounded-2xl transition-colors text-sm shadow-lg shadow-green-200">
          {loading ? "Creating account..." : "Create account"}
        </button>
      </form>

      <p className="text-center text-gray-500 text-sm py-8">
        Already have an account?{" "}
        <Link href="/auth/login" className="text-green-600 font-semibold">Sign in</Link>
      </p>
    </div>
  );
}
