"use client";

import { useState } from "react";
import { sendEmailVerification } from "firebase/auth";
import { auth } from "@/lib/firebase";
import Link from "next/link";

export default function VerifyEmailPage() {
  const [sent, setSent] = useState(false);

  const resend = async () => {
    if (auth.currentUser) {
      await sendEmailVerification(auth.currentUser);
      setSent(true);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-indigo-50 px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8 text-center">
        <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-3xl">📧</span>
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Check your email</h1>
        <p className="text-gray-500 text-sm mb-6">
          We sent a verification link to your email address. Click the link to verify your account before signing in.
        </p>
        {sent && (
          <div className="bg-green-50 border border-green-200 rounded-xl px-4 py-3 mb-4">
            <p className="text-green-600 text-sm">Verification email resent.</p>
          </div>
        )}
        <button
          onClick={resend}
          className="text-indigo-600 text-sm font-medium hover:underline block mb-4 mx-auto"
        >
          Resend verification email
        </button>
        <Link
          href="/auth/login"
          className="text-gray-500 text-sm hover:underline"
        >
          Back to sign in
        </Link>
      </div>
    </div>
  );
}
