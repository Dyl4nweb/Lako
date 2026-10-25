"use client";

import React, { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "@/lib/auth-client";
import { registerCustomerAction } from "@/server/actions/auth";
import { MovliLogo } from "@/components/shared/MovliLogo";
import { Lock, Mail, ArrowRight, Loader2, AlertCircle, User, Phone } from "lucide-react";

function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get("redirect") || "/";

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await registerCustomerAction({
        name,
        email,
        phone,
        password,
      });

      if (!res.success) {
        setError(res.error || "Failed to register account.");
        setLoading(false);
        return;
      }

      // Auto-sign in the user with Better Auth client session
      const signinRes = await signIn.email({
        email,
        password,
      });

      if (signinRes.error) {
        router.push("/login?registered=true");
      } else {
        router.push(redirectUrl);
        router.refresh();
      }
    } catch (err: unknown) {
      setError((err as Error)?.message || "Registration failed. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="bg-white py-8 px-6 sm:px-10 rounded-3xl border border-neutral-200/80 shadow-lg shadow-neutral-200/50 space-y-6">
      {error && (
        <div className="p-3.5 rounded-2xl bg-red-50 border border-red-200 text-red-900 text-xs flex items-center gap-2.5">
          <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleRegister} className="space-y-4">
        <div className="space-y-1.5">
          <label htmlFor="name" className="text-xs font-bold text-neutral-700">
            Full Name
          </label>
          <div className="relative">
            <input
              id="name"
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Maria Santos"
              className="w-full bg-neutral-50 text-neutral-900 text-sm rounded-xl pl-10 pr-4 py-3 border border-neutral-200 focus:bg-white focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20 transition-all"
            />
            <User className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          </div>
        </div>

        <div className="space-y-1.5">
          <label htmlFor="reg-email" className="text-xs font-bold text-neutral-700">
            Email Address
          </label>
          <div className="relative">
            <input
              id="reg-email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.com"
              className="w-full bg-neutral-50 text-neutral-900 text-sm rounded-xl pl-10 pr-4 py-3 border border-neutral-200 focus:bg-white focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20 transition-all"
            />
            <Mail className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          </div>
        </div>

        <div className="space-y-1.5">
          <label htmlFor="phone" className="text-xs font-bold text-neutral-700">
            Phone Number (for Delivery)
          </label>
          <div className="relative">
            <input
              id="phone"
              type="tel"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="0917 123 4567"
              className="w-full bg-neutral-50 text-neutral-900 text-sm rounded-xl pl-10 pr-4 py-3 border border-neutral-200 focus:bg-white focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20 transition-all"
            />
            <Phone className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          </div>
        </div>

        <div className="space-y-1.5">
          <label htmlFor="reg-pass" className="text-xs font-bold text-neutral-700">
            Create Password
          </label>
          <div className="relative">
            <input
              id="reg-pass"
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 6 characters"
              className="w-full bg-neutral-50 text-neutral-900 text-sm rounded-xl pl-10 pr-4 py-3 border border-neutral-200 focus:bg-white focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20 transition-all"
            />
            <Lock className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl font-bold text-sm bg-orange-600 hover:bg-orange-700 text-white shadow-md shadow-orange-600/25 transition-all hover:scale-101 disabled:opacity-50"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Creating Account...</span>
            </>
          ) : (
            <>
              <span>Create Account</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>

      <div className="pt-2 text-center text-xs text-neutral-500">
        Already have an account?{" "}
        <Link
          href={`/login${redirectUrl !== "/" ? `?redirect=${encodeURIComponent(redirectUrl)}` : ""}`}
          className="font-bold text-orange-600 hover:text-orange-700"
        >
          Sign in here
        </Link>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <div className="min-h-screen bg-neutral-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <MovliLogo showTagline size="lg" className="justify-center" />
        <h2 className="mt-4 text-xl sm:text-2xl font-black text-neutral-900 tracking-tight">
          Create Customer Account
        </h2>
        <p className="text-xs text-neutral-500 mt-1">
          Join Movli for fast local delivery and Cash on Delivery orders
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <Suspense
          fallback={
            <div className="p-8 text-center text-xs text-neutral-400">Loading form...</div>
          }
        >
          <RegisterForm />
        </Suspense>
      </div>
    </div>
  );
}
