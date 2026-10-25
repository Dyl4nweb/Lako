"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { LINGAYEN_BARANGAYS } from "@/lib/utils";
import {
  MapPin,
  ShoppingBag,
  Search,
  ChevronDown,
  Clock,
  Sparkles,
  Menu,
  X,
  Store,
  Truck,
  ShieldCheck,
} from "lucide-react";

export function Navbar({ session }: { session: any }) {
  const { totalQuantity, setIsDrawerOpen, selectedBarangay, setSelectedBarangay } = useCart();
  const [isBarangayModalOpen, setIsBarangayModalOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const currentBarangayInfo = LINGAYEN_BARANGAYS.find((b) => b.name === selectedBarangay) || LINGAYEN_BARANGAYS[0];

  return (
    <>
      <header className="sticky top-7 z-40 bg-white/95 backdrop-blur-md border-b border-zinc-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 gap-4">
            {/* Logo */}
            <div className="flex items-center gap-6">
              <Link href="/" className="flex items-center gap-2 group">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-movli-700 via-movli to-movli-400 flex items-center justify-center text-white shadow-md shadow-movli/30 group-hover:scale-105 transition">
                  {/* Abstract dynamic forward-leaning "M" icon */}
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="w-5 h-5"
                  >
                    <path d="M3 17V7l5 6 4-6 5 6 4-6v10" />
                  </svg>
                </div>
                <div className="flex flex-col">
                  <span className="font-extrabold text-xl tracking-tight text-slate-deep leading-none font-outfit">
                    Movli<span className="text-movli">.</span>
                  </span>
                  <span className="text-[10px] font-semibold text-zinc-400 tracking-wider uppercase">
                    Lingayen Hub
                  </span>
                </div>
              </Link>

              {/* Barangay Location Pill (Desktop) */}
              <button
                onClick={() => setIsBarangayModalOpen(true)}
                className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-full bg-sand-canvas border border-zinc-200 text-xs text-slate-deep hover:border-movli/50 hover:bg-movli-50/30 transition group"
              >
                <MapPin className="w-3.5 h-3.5 text-movli flex-shrink-0 group-hover:animate-bounce" />
                <span className="text-zinc-500">Delivering to:</span>
                <span className="font-bold text-slate-deep underline decoration-movli/40 decoration-2 underline-offset-2">
                  Brgy. {selectedBarangay}
                </span>
                <span className="text-[10px] text-zinc-400 flex items-center gap-1 font-mono">
                  <Clock className="w-2.5 h-2.5" />
                  ~{currentBarangayInfo.deliveryEstimateMinutes}m
                </span>
                <ChevronDown className="w-3 h-3 text-zinc-400" />
              </button>
            </div>

            {/* Navigation links (Desktop) */}
            <nav className="hidden lg:flex items-center gap-6 text-xs font-semibold text-zinc-600">
              <Link href="/" className="hover:text-movli transition">
                Explore Marketplace
              </Link>
              <Link href="/#stores" className="hover:text-movli transition">
                Verified Stores
              </Link>
              <Link href="/orders" className="hover:text-movli transition">
                Track Orders
              </Link>
              {session?.role === "SELLER" && (
                <Link href="/seller" className="text-amber-600 hover:text-amber-700 transition flex items-center gap-1">
                  <Store className="w-3.5 h-3.5" />
                  Store Hub
                </Link>
              )}
              {session?.role === "RIDER" && (
                <Link href="/rider" className="text-emerald-600 hover:text-emerald-700 transition flex items-center gap-1">
                  <Truck className="w-3.5 h-3.5" />
                  Rider Terminal
                </Link>
              )}
              {(session?.role === "ADMIN" || session?.role === "SUPER_ADMIN") && (
                <Link href="/admin" className="text-blue-600 hover:text-blue-700 transition flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Admin Console
                </Link>
              )}
            </nav>

            {/* Right: Cart Button & Mobile Menu Toggle */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsDrawerOpen(true)}
                className="relative px-4 py-2 rounded-xl bg-movli text-white font-bold text-xs flex items-center gap-2 hover:bg-movli-600 transition shadow-md shadow-movli/20 active:scale-95"
              >
                <ShoppingBag className="w-4 h-4" />
                <span className="hidden sm:inline">Basket</span>
                {totalQuantity > 0 && (
                  <span className="bg-white text-movli text-[10px] font-black px-1.5 py-0.2 rounded-full shadow-inner">
                    {totalQuantity}
                  </span>
                )}
              </button>

              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="lg:hidden p-2 rounded-xl border border-zinc-200 text-zinc-600 hover:bg-zinc-100 transition"
              >
                {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Mobile Location Bar */}
          <div className="md:hidden pb-2.5 pt-0.5">
            <button
              onClick={() => setIsBarangayModalOpen(true)}
              className="w-full flex items-center justify-between px-3 py-1.5 rounded-lg bg-sand-canvas border border-zinc-200 text-xs text-slate-deep"
            >
              <div className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-movli" />
                <span className="text-zinc-500">Delivering to:</span>
                <span className="font-bold">Brgy. {selectedBarangay}</span>
              </div>
              <div className="flex items-center gap-1 text-[11px] text-zinc-400">
                <span>~{currentBarangayInfo.deliveryEstimateMinutes} mins</span>
                <ChevronDown className="w-3 h-3" />
              </div>
            </button>
          </div>
        </div>

        {/* Mobile Flyout Menu */}
        {isMobileMenuOpen && (
          <div className="lg:hidden border-t border-zinc-200 bg-white p-4 space-y-3">
            <div className="grid grid-cols-2 gap-2 text-xs font-semibold">
              <Link
                href="/"
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-3 rounded-xl bg-zinc-50 hover:bg-zinc-100 text-slate-deep"
              >
                🛍️ Marketplace
              </Link>
              <Link
                href="/orders"
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-3 rounded-xl bg-zinc-50 hover:bg-zinc-100 text-slate-deep"
              >
                📦 Track Orders
              </Link>
              <Link
                href="/seller"
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-3 rounded-xl bg-amber-50 text-amber-800"
              >
                🏪 Seller Hub
              </Link>
              <Link
                href="/rider"
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-3 rounded-xl bg-emerald-50 text-emerald-800"
              >
                🛵 Rider Terminal
              </Link>
              <Link
                href="/admin"
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-3 rounded-xl bg-blue-50 text-blue-800 col-span-2"
              >
                📊 Admin & Financial Ledger
              </Link>
              <Link
                href="/sys-core-portal-x9"
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-3 rounded-xl bg-purple-50 text-purple-800 col-span-2 font-mono text-[11px]"
              >
                ⚡ Secret Super Admin Portal
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* Lingayen Barangay Selector Modal */}
      {isBarangayModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-zinc-200 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between pb-4 border-b border-zinc-100">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-movli-50 text-movli flex items-center justify-center">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-deep text-base">Select Lingayen Delivery Barangay</h3>
                  <p className="text-xs text-zinc-500">All 32 barangays supported with flat ₱45 delivery</p>
                </div>
              </div>
              <button
                onClick={() => setIsBarangayModalOpen(false)}
                className="p-1.5 rounded-lg text-zinc-400 hover:text-slate-deep hover:bg-zinc-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="py-3">
              <div className="text-xs text-zinc-500 mb-2">
                Couriers use local barangay clusters and landmark hints for pin-point provincial dispatch.
              </div>
            </div>

            <div className="flex-1 overflow-y-auto space-y-1.5 pr-1">
              {LINGAYEN_BARANGAYS.map((b) => {
                const isSelected = selectedBarangay === b.name;
                return (
                  <button
                    key={b.name}
                    onClick={() => {
                      setSelectedBarangay(b.name);
                      setIsBarangayModalOpen(false);
                    }}
                    className={`w-full text-left p-3 rounded-xl border text-xs transition flex items-center justify-between ${
                      isSelected
                        ? "border-movli bg-movli-50/50 text-movli-900 font-bold"
                        : "border-zinc-200 hover:border-zinc-300 hover:bg-sand-canvas text-slate-deep"
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm">Brgy. {b.name}</span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-zinc-100 text-zinc-600 font-medium">
                          {b.cluster}
                        </span>
                      </div>
                      <div className="text-[11px] text-zinc-500 mt-0.5">
                        Landmarks: {b.popularLandmarks.slice(0, 2).join(", ")}
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-semibold text-emerald-600">~{b.deliveryEstimateMinutes} mins</span>
                      <div className="text-[10px] text-zinc-400">Fixed ₱45 COD</div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
