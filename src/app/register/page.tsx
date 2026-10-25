"use client";

import React, { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn } from "@/lib/auth-client";
import { registerCustomerAction } from "@/server/actions/auth";
import { MovliLogo } from "@/components/shared/MovliLogo";
import { Lock, Mail, ArrowRight, Loader2, AlertCircle, User, Phone, Eye, EyeOff } from "lucide-react";

function GoogleIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17Z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24Z"
      />
      <path
        fill="#FBBC05"
        d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15Z"
      />
      <path
        fill="#EA4335"
        d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98Z"
      />
    </svg>
  );
}

function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get("redirect") || "/";

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

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

  const handleGoogleSignUp = async () => {
    setError(null);
    setGoogleLoading(true);

    try {
      const res = await signIn.social({
        provider: "google",
        callbackURL: redirectUrl,
      });

      if ((res as any)?.data?.url) {
        window.location.href = (res as any).data.url;
        return;
      }

      if (res?.error) {
        setError(res.error.message || "Google sign-in is not configured yet. Please ensure GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET are set in .env.");
        setGoogleLoading(false);
      }
    } catch (err: unknown) {
      setError((err as Error)?.message || "Google registration is currently unavailable. Please verify your Google credentials in .env.");
      setGoogleLoading(false);
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

      {/* Google OAuth Quick Registration */}
      <button
        type="button"
        onClick={handleGoogleSignUp}
        disabled={loading || googleLoading}
        className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-xl font-bold text-sm bg-white hover:bg-neutral-50 text-neutral-800 border border-neutral-200/90 shadow-xs hover:border-neutral-300 transition-all hover:scale-100.5 disabled:opacity-50 cursor-pointer"
      >
        {googleLoading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin text-neutral-500" />
            <span>Connecting to Google...</span>
          </>
        ) : (
          <>
            <GoogleIcon className="w-4 h-4 shrink-0" />
            <span>Continue with Google</span>
          </>
        )}
      </button>

      {/* Divider */}
      <div className="relative flex items-center justify-center my-1">
        <div className="border-t border-neutral-200 w-full" />
        <span className="bg-white px-3 text-[11px] font-semibold text-neutral-400 uppercase tracking-wider shrink-0">
          or register with email
        </span>
        <div className="border-t border-neutral-200 w-full" />
      </div>

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
            <User className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
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
            <Mail className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
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
            <Phone className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>

        <div className="space-y-1.5">
          <label htmlFor="reg-pass" className="text-xs font-bold text-neutral-700">
            Create Password
          </label>
          <div className="relative">
            <input
              id="reg-pass"
              type={showPassword ? "text" : "password"}
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 6 characters"
              className="w-full bg-neutral-50 text-neutral-900 text-sm rounded-xl pl-10 pr-11 py-3 border border-neutral-200 focus:bg-white focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20 transition-all"
            />
            <Lock className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-700 p-1 rounded-lg hover:bg-neutral-100 transition-colors cursor-pointer"
              aria-label={showPassword ? "Hide password" : "Show password"}
              title={showPassword ? "Hide password" : "Show password"}
              tabIndex={-1}
            >
              {showPassword ? (
                <EyeOff className="w-4 h-4" />
              ) : (
                <Eye className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading || googleLoading}
          className="w-full flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl font-bold text-sm bg-orange-600 hover:bg-orange-700 text-white shadow-md shadow-orange-600/25 transition-all hover:scale-101 disabled:opacity-50 cursor-pointer"
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
          Join Lako for fast local delivery and Cash on Delivery orders
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
