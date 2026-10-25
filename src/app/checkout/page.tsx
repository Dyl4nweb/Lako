"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { checkoutSchema } from "@/lib/validations";
import { z } from "zod";
import { useCart } from "@/context/CartContext";
import { useSession } from "@/lib/auth-client";
import { processCheckout } from "@/server/actions/checkout";
import { Navbar } from "@/components/shared/Navbar";
import { Footer } from "@/components/shared/Footer";
import {
  ShieldCheck,
  Truck,
  Banknote,
  Lock,
  ArrowLeft,
  AlertCircle,
  Loader2,
  CheckCircle,
} from "lucide-react";

type CheckoutFormData = z.infer<typeof checkoutSchema>;

export default function CheckoutPage() {
  const router = useRouter();
  const { items, subtotal, deliveryFee, total, clearCart, isLoaded } = useCart();
  const { data: session, isPending: isSessionPending } = useSession();

  const [serverError, setServerError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<CheckoutFormData>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      customerName: "",
      customerPhone: "",
      deliveryAddress: "",
      orderNotes: "",
    },
  });

  // Pre-fill user data if signed in
  useEffect(() => {
    if (session?.user) {
      if (session.user.name) setValue("customerName", session.user.name);
      const userPhone = (session.user as unknown as { phone?: string })?.phone;
      if (userPhone) setValue("customerPhone", userPhone);
    }
  }, [session, setValue]);

  // If cart is empty once loaded, redirect to /products
  useEffect(() => {
    if (isLoaded && items.length === 0) {
      router.push("/cart");
    }
  }, [isLoaded, items, router]);

  const onSubmit = async (data: CheckoutFormData) => {
    if (items.length === 0) return;

    setIsSubmitting(true);
    setServerError(null);

    try {
      const itemsPayload = items.map((i) => ({
        productId: i.productId,
        quantity: i.quantity,
      }));

      const res = await processCheckout(data, itemsPayload);

      if (!res.success) {
        setServerError(res.error || "Checkout failed. Please review your order.");
        setIsSubmitting(false);
        return;
      }

      // Success: clear cart and redirect to live order page
      clearCart();
      router.push(`/orders/${res.orderId}?success=true`);
    } catch (err: unknown) {
      setServerError((err as Error)?.message || "An unexpected error occurred.");
      setIsSubmitting(false);
    }
  };

  if (!isLoaded || isSessionPending) {
    return (
      <div className="min-h-screen flex flex-col bg-neutral-50">
        <Navbar />
        <main className="flex-1 flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 text-orange-600 animate-spin" />
        </main>
        <Footer />
      </div>
    );
  }

  const user = session?.user;

  return (
    <div className="min-h-screen flex flex-col bg-neutral-50">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
        {/* Navigation back */}
        <div className="mb-6">
          <Link
            href="/cart"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-neutral-600 hover:text-orange-600 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Cart</span>
          </Link>
          <h1 className="text-xl sm:text-2xl font-black text-neutral-900 tracking-tight mt-2">
            Cash on Delivery Checkout
          </h1>
          <p className="text-xs text-neutral-500 mt-0.5">
            Provide your delivery details. Pay the rider upon arrival.
          </p>
        </div>

        {/* Not Signed In Warning Banner */}
        {!user && (
          <div className="mb-6 p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Lock className="w-5 h-5 text-amber-600 shrink-0" />
              <div>
                <p className="text-xs font-bold">You are checking out as a guest</p>
                <p className="text-[11px] text-amber-700">
                  Sign in or register an account to track your delivery history and save addresses.
                </p>
              </div>
            </div>
            <Link
              href="/login?redirect=/checkout"
              className="text-xs font-bold bg-amber-600 hover:bg-amber-700 text-white px-3.5 py-1.5 rounded-xl shrink-0 transition-colors"
            >
              Sign In
            </Link>
          </div>
        )}

        {serverError && (
          <div className="mb-6 p-4 rounded-2xl bg-red-50 border border-red-200 text-red-900 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-bold">Checkout Issue</p>
              <p className="text-xs text-red-700 mt-0.5">{serverError}</p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Delivery Information Form */}
            <div className="lg:col-span-7 space-y-6">
              <div className="bg-white rounded-3xl border border-neutral-200/80 p-6 sm:p-8 shadow-xs space-y-5">
                <h3 className="text-sm font-bold text-neutral-900 flex items-center gap-2 border-b border-neutral-100 pb-3">
                  <Truck className="w-4 h-4 text-orange-600" />
                  <span>1. Delivery Destination</span>
                </h3>

                {/* Customer Name */}
                <div className="space-y-1.5">
                  <label htmlFor="customerName" className="text-xs font-bold text-neutral-700">
                    Recipient Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="customerName"
                    type="text"
                    {...register("customerName")}
                    placeholder="e.g., Maria Santos"
                    className="w-full bg-neutral-50 text-neutral-900 text-sm rounded-xl px-4 py-3 border border-neutral-200 focus:bg-white focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20 transition-all"
                  />
                  {errors.customerName && (
                    <p className="text-[11px] font-medium text-red-600">
                      {errors.customerName.message}
                    </p>
                  )}
                </div>

                {/* Customer Contact Number */}
                <div className="space-y-1.5">
                  <label htmlFor="customerPhone" className="text-xs font-bold text-neutral-700">
                    Contact Phone Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="customerPhone"
                    type="tel"
                    {...register("customerPhone")}
                    placeholder="e.g., 0917 123 4567 or +639171234567"
                    className="w-full bg-neutral-50 text-neutral-900 text-sm rounded-xl px-4 py-3 border border-neutral-200 focus:bg-white focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20 transition-all"
                  />
                  <p className="text-[10px] text-neutral-500">
                    The assigned rider will call or SMS this number upon arrival.
                  </p>
                  {errors.customerPhone && (
                    <p className="text-[11px] font-medium text-red-600">
                      {errors.customerPhone.message}
                    </p>
                  )}
                </div>

                {/* Detailed Delivery Address */}
                <div className="space-y-1.5">
                  <label htmlFor="deliveryAddress" className="text-xs font-bold text-neutral-700">
                    Complete Street Address & Landmark <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    id="deliveryAddress"
                    rows={3}
                    {...register("deliveryAddress")}
                    placeholder="House/Unit #, Street, Barangay, Town/City (e.g., #45 Artacho St., Brgy. Poblacion, Lingayen)"
                    className="w-full bg-neutral-50 text-neutral-900 text-sm rounded-xl px-4 py-3 border border-neutral-200 focus:bg-white focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20 transition-all"
                  />
                  {errors.deliveryAddress && (
                    <p className="text-[11px] font-medium text-red-600">
                      {errors.deliveryAddress.message}
                    </p>
                  )}
                </div>

                {/* Optional Order Notes */}
                <div className="space-y-1.5">
                  <label htmlFor="orderNotes" className="text-xs font-bold text-neutral-700">
                    Delivery Notes / Special Instructions <span className="text-neutral-400 font-normal">(Optional)</span>
                  </label>
                  <input
                    id="orderNotes"
                    type="text"
                    {...register("orderNotes")}
                    placeholder="e.g., Green gate beside church, leave with guard if absent"
                    className="w-full bg-neutral-50 text-neutral-900 text-sm rounded-xl px-4 py-3 border border-neutral-200 focus:bg-white focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20 transition-all"
                  />
                  {errors.orderNotes && (
                    <p className="text-[11px] font-medium text-red-600">
                      {errors.orderNotes.message}
                    </p>
                  )}
                </div>
              </div>

              {/* Payment Method Selector */}
              <div className="bg-white rounded-3xl border border-neutral-200/80 p-6 shadow-xs space-y-4">
                <h3 className="text-sm font-bold text-neutral-900 flex items-center gap-2 border-b border-neutral-100 pb-3">
                  <Banknote className="w-4 h-4 text-orange-600" />
                  <span>2. Payment Option</span>
                </h3>

                <div className="rounded-2xl border-2 border-orange-500 bg-orange-50/40 p-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-orange-600 text-white flex items-center justify-center shrink-0">
                      <Banknote className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-neutral-900">
                          Cash on Delivery (COD)
                        </span>
                        <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-orange-600 text-white">
                          Selected
                        </span>
                      </div>
                      <p className="text-xs text-neutral-600 mt-0.5">
                        Prepare exact cash for the rider upon package inspection.
                      </p>
                    </div>
                  </div>
                  <CheckCircle className="w-5 h-5 text-orange-600 shrink-0" />
                </div>
              </div>
            </div>

            {/* Order Review Sidebar */}
            <div className="lg:col-span-5 space-y-6">
              <div className="bg-white rounded-3xl border border-neutral-200/80 p-6 shadow-xs space-y-5 sticky top-28">
                <h3 className="text-sm font-bold text-neutral-900 border-b border-neutral-100 pb-3">
                  Order Breakdown ({items.length} item{items.length === 1 ? "" : "s"})
                </h3>

                {/* Items list preview */}
                <div className="max-h-64 overflow-y-auto space-y-3 pr-1 scrollbar-thin">
                  {items.map((item) => (
                    <div key={item.productId} className="flex items-center gap-3 text-xs">
                      <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-neutral-100 shrink-0 border border-neutral-200/80">
                        <Image
                          src={item.imageUrl}
                          alt={item.name}
                          fill
                          sizes="48px"
                          className="object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-neutral-900 truncate">{item.name}</p>
                        <p className="text-neutral-500 text-[11px]">
                          Qty: {item.quantity} × ₱{item.price.toFixed(2)}
                        </p>
                      </div>
                      <div className="text-right font-bold text-neutral-900 shrink-0">
                        ₱{(item.price * item.quantity).toFixed(2)}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Costs breakdown */}
                <div className="pt-3 border-t border-neutral-100 space-y-2.5 text-xs">
                  <div className="flex items-center justify-between text-neutral-600">
                    <span>Subtotal</span>
                    <span className="font-bold text-neutral-900">₱{subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex items-center justify-between text-neutral-600">
                    <div className="flex items-center gap-1">
                      <Truck className="w-3.5 h-3.5 text-orange-600" />
                      <span>Local Delivery Fee</span>
                    </div>
                    <span className="font-bold text-neutral-900">₱{deliveryFee.toFixed(2)}</span>
                  </div>
                  <div className="pt-3 border-t border-neutral-100 flex items-center justify-between text-base font-black">
                    <span className="text-neutral-900">Total COD Amount</span>
                    <span className="text-orange-600 text-lg">₱{total.toFixed(2)}</span>
                  </div>
                </div>

                {/* Submit button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full flex items-center justify-center gap-2 py-4 px-6 rounded-2xl font-bold text-sm bg-orange-600 hover:bg-orange-700 text-white shadow-lg shadow-orange-600/30 transition-all hover:scale-102 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Securing Order & Stock...</span>
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="w-5 h-5" />
                      <span>Place Cash on Delivery Order</span>
                    </>
                  )}
                </button>

                <p className="text-[11px] text-center text-neutral-500 leading-tight">
                  By clicking Place Order, your inventory is reserved and our local dispatch team will
                  prepare the delivery.
                </p>
              </div>
            </div>
          </div>
        </form>
      </main>

      <Footer />
    </div>
  );
}
