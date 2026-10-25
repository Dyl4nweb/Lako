"use client";

import React, { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/context/CartContext";
import { placeOrderAction } from "@/server/actions/orders";
import { formatPHP, LINGAYEN_BARANGAYS } from "@/lib/utils";
import confetti from "canvas-confetti";
import {
  Store,
  MapPin,
  Banknote,
  ShieldCheck,
  Clock,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  Phone,
  User,
  Building,
} from "lucide-react";
import Link from "next/link";

export function CheckoutView({
  session,
  savedAddresses,
}: {
  session: any;
  savedAddresses: any[];
}) {
  const router = useRouter();
  const { items, storeId, storeName, subtotal, deliveryFee, total, clearCart, selectedBarangay } = useCart();
  const [isPending, startTransition] = useTransition();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Default address fields
  const defaultAddr = savedAddresses.find((a) => a.isDefault) || savedAddresses[0];

  const [recipient, setRecipient] = useState(session?.fullName || "Aling Teresa Santos");
  const [phoneNumber, setPhoneNumber] = useState(session?.phoneNumber || "09178889901");
  const [barangay, setBarangay] = useState(defaultAddr?.barangay || selectedBarangay || "Poblacion");
  const [street, setStreet] = useState(defaultAddr?.street || "Artacho St. corner Rizal Ave");
  const [landmark, setLandmark] = useState(defaultAddr?.landmark || "Near Lingayen Town Plaza, white gate beside bakery");

  const currentBarangayInfo = LINGAYEN_BARANGAYS.find((b) => b.name === barangay) || LINGAYEN_BARANGAYS[0];

  if (!storeId || items.length === 0) {
    return (
      <div className="bg-white rounded-3xl p-8 border border-zinc-200 text-center shadow-sm">
        <div className="w-16 h-16 rounded-full bg-zinc-100 flex items-center justify-center mx-auto mb-4 text-zinc-400">
          <Store className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-slate-deep mb-2">No items to checkout</h2>
        <p className="text-sm text-zinc-500 mb-6">Your shopping basket is currently empty.</p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-movli text-white text-sm font-bold hover:bg-movli-600 transition shadow-md shadow-movli/20"
        >
          <span>Return to Marketplace</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    );
  }

  const handlePlaceOrder = () => {
    setErrorMsg(null);

    if (!recipient.trim()) {
      setErrorMsg("Please enter the recipient full name.");
      return;
    }
    if (!phoneNumber.trim() || phoneNumber.length < 10) {
      setErrorMsg("Please enter a valid Philippine mobile number (e.g. 0917XXXXXXX).");
      return;
    }
    if (!landmark.trim() || landmark.trim().length < 5) {
      setErrorMsg("A clear local landmark is required to assist Lingayen couriers.");
      return;
    }

    startTransition(async () => {
      try {
        const order = await placeOrderAction({
          storeId,
          items: items.map((i) => ({ productId: i.productId, quantity: i.quantity })),
          deliveryAddress: {
            recipient,
            phoneNumber,
            barangay,
            street,
            landmark,
          },
        });

        // Trigger celebratory confetti
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
          colors: ["#E25822", "#10B981", "#2563EB", "#F59E0B"],
        });

        clearCart();
        router.push(`/orders/${order.id}`);
      } catch (err: any) {
        setErrorMsg(err.message || "Failed to place order. Please check item stock.");
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* Page Title */}
      <div>
        <h1 className="text-2xl font-extrabold text-slate-deep font-outfit">
          Single-Store Checkout
        </h1>
        <p className="text-xs text-zinc-500">
          Complete your order with Cash on Delivery (COD)
        </p>
      </div>

      {/* Single-Store Direct Fulfill Notice */}
      <div className="bg-movli-50 border border-movli-200 rounded-2xl p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-movli text-white flex items-center justify-center font-bold flex-shrink-0 shadow-sm">
            <Store className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs text-movli font-bold uppercase tracking-wider">
              Single-Store Direct Dispatch
            </div>
            <div className="font-extrabold text-slate-deep text-sm">
              Fulfilling from {storeName} — Lingayen
            </div>
          </div>
        </div>
        <span className="text-xs font-semibold text-movli hidden sm:inline">
          30-60 min arrival
        </span>
      </div>

      {errorMsg && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Delivery Address & Details */}
        <div className="lg:col-span-7 space-y-6">
          {/* Delivery Address Card */}
          <div className="bg-white rounded-3xl p-6 border border-zinc-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
              <h2 className="font-bold text-slate-deep text-sm flex items-center gap-2">
                <MapPin className="w-4 h-4 text-movli" />
                Delivery Address in Lingayen
              </h2>
              <span className="text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                All 32 Barangays Supported
              </span>
            </div>

            <div className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-zinc-600 uppercase mb-1">
                    Recipient Full Name
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                    <input
                      type="text"
                      value={recipient}
                      onChange={(e) => setRecipient(e.target.value)}
                      placeholder="e.g. Aling Teresa Santos"
                      className="w-full pl-9 pr-3 py-2 rounded-xl border border-zinc-200 text-xs text-slate-deep focus:outline-none focus:ring-2 focus:ring-movli"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-zinc-600 uppercase mb-1">
                    Mobile Phone Number
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                    <input
                      type="text"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      placeholder="0917-123-4567"
                      className="w-full pl-9 pr-3 py-2 rounded-xl border border-zinc-200 text-xs text-slate-deep focus:outline-none focus:ring-2 focus:ring-movli"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-zinc-600 uppercase mb-1">
                  Lingayen Barangay
                </label>
                <div className="relative">
                  <Building className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                  <select
                    value={barangay}
                    onChange={(e) => setBarangay(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 rounded-xl border border-zinc-200 text-xs text-slate-deep focus:outline-none focus:ring-2 focus:ring-movli bg-white"
                  >
                    {LINGAYEN_BARANGAYS.map((b) => (
                      <option key={b.name} value={b.name}>
                        Brgy. {b.name} ({b.cluster} Cluster · ~{b.deliveryEstimateMinutes} mins)
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-zinc-600 uppercase mb-1">
                  Street Name / House / Compound #
                </label>
                <input
                  type="text"
                  value={street}
                  onChange={(e) => setStreet(e.target.value)}
                  placeholder="Street, Block, or House number"
                  className="w-full px-3 py-2 rounded-xl border border-zinc-200 text-xs text-slate-deep focus:outline-none focus:ring-2 focus:ring-movli"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-[11px] font-bold text-zinc-600 uppercase">
                    Mandatory Local Landmark
                  </label>
                  <span className="text-[10px] text-movli font-semibold">Critical for Couriers</span>
                </div>
                <input
                  type="text"
                  value={landmark}
                  onChange={(e) => setLandmark(e.target.value)}
                  placeholder="e.g. Near town plaza, white gate in front of bakery"
                  className="w-full px-3 py-2 rounded-xl border border-zinc-200 text-xs text-slate-deep focus:outline-none focus:ring-2 focus:ring-movli"
                />
                <div className="mt-1 text-[11px] text-zinc-400">
                  Popular landmarks in {barangay}:{" "}
                  <span className="text-zinc-600 font-medium">
                    {currentBarangayInfo.popularLandmarks.join(", ")}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Payment Method Card */}
          <div className="bg-white rounded-3xl p-6 border border-zinc-200 shadow-sm space-y-3">
            <h2 className="font-bold text-slate-deep text-sm flex items-center gap-2 border-b border-zinc-100 pb-3">
              <Banknote className="w-4 h-4 text-movli" />
              Payment Method
            </h2>

            <div className="p-4 rounded-2xl border-2 border-movli bg-movli-50/30 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-movli text-white flex items-center justify-center font-bold text-sm">
                  ₱
                </div>
                <div>
                  <div className="font-bold text-slate-deep text-xs flex items-center gap-1.5">
                    Cash on Delivery (COD)
                    <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded font-semibold">
                      Guaranteed
                    </span>
                  </div>
                  <div className="text-[11px] text-zinc-500 mt-0.5">
                    Pay our local courier upon doorstep handover. Please prepare exact cash.
                  </div>
                </div>
              </div>
              <CheckCircle2 className="w-5 h-5 text-movli flex-shrink-0" />
            </div>
          </div>
        </div>

        {/* Right Column: Order Summary & Placement */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white rounded-3xl p-6 border border-zinc-200 shadow-sm space-y-4">
            <h2 className="font-bold text-slate-deep text-sm border-b border-zinc-100 pb-3">
              Order Summary ({items.length} items)
            </h2>

            <div className="divide-y divide-zinc-100 max-h-60 overflow-y-auto space-y-2 pr-1">
              {items.map((item) => (
                <div key={item.productId} className="pt-2 first:pt-0 flex items-center justify-between text-xs">
                  <div className="flex-1 pr-3">
                    <div className="font-semibold text-slate-deep">{item.name}</div>
                    <div className="text-[11px] text-zinc-400">
                      {item.quantity} × {formatPHP(item.price)}
                    </div>
                  </div>
                  <div className="font-bold text-slate-deep">
                    {formatPHP(item.price * item.quantity)}
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t border-zinc-200 pt-3 space-y-2 text-xs text-zinc-600">
              <div className="flex justify-between">
                <span>Items Subtotal</span>
                <span className="font-semibold text-slate-deep">{formatPHP(subtotal)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="flex items-center gap-1">
                  Lingayen Town Delivery Fee
                  <span className="text-[10px] bg-zinc-100 px-1 rounded text-zinc-600 font-mono">Flat</span>
                </span>
                <span className="font-semibold text-slate-deep">{formatPHP(deliveryFee)}</span>
              </div>
              <div className="border-t border-zinc-200 pt-2 flex justify-between text-base font-extrabold text-slate-deep">
                <span>Total COD Amount</span>
                <span className="text-movli text-lg">{formatPHP(total)}</span>
              </div>
            </div>

            <button
              onClick={handlePlaceOrder}
              disabled={isPending}
              className={`w-full py-4 rounded-2xl bg-movli text-white font-extrabold text-sm hover:bg-movli-600 transition flex items-center justify-center gap-2 shadow-xl shadow-movli/30 active:scale-98 ${
                isPending ? "opacity-75 cursor-wait" : ""
              }`}
            >
              <span>{isPending ? "Submitting Order..." : `Place Order (COD) — ${formatPHP(total)}`}</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <div className="flex items-center justify-center gap-2 text-[11px] text-zinc-400 pt-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
              <span>Zero cancellation fee prior to store acceptance</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
