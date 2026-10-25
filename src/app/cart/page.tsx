"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { useCart } from "@/context/CartContext";
import { Navbar } from "@/components/shared/Navbar";
import { Footer } from "@/components/shared/Footer";
import {
  Trash2,
  Minus,
  Plus,
  ShoppingBag,
  ArrowRight,
  ShieldCheck,
  Truck,
  RotateCcw,
} from "lucide-react";

export default function CartPage() {
  const { items, removeItem, updateQuantity, clearCart, subtotal, deliveryFee, total, isLoaded } =
    useCart();

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex flex-col bg-neutral-50">
        <Navbar />
        <main className="flex-1 flex items-center justify-center py-20">
          <div className="w-8 h-8 border-4 border-orange-600 border-t-transparent rounded-full animate-spin" />
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-neutral-50">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
        {/* Page Title */}
        <div className="flex items-center justify-between pb-6 border-b border-neutral-200">
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-neutral-900 tracking-tight">
              Shopping Cart
            </h1>
            <p className="text-xs text-neutral-500 mt-0.5">
              Review your items before proceeding to Cash on Delivery checkout
            </p>
          </div>

          {items.length > 0 && (
            <button
              onClick={() => {
                if (confirm("Are you sure you want to clear all items from your cart?")) {
                  clearCart();
                }
              }}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-neutral-500 hover:text-red-600 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Clear Cart</span>
            </button>
          )}
        </div>

        {items.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mt-6 items-start">
            {/* Items List */}
            <div className="lg:col-span-8 space-y-4">
              <div className="bg-white rounded-3xl border border-neutral-200/80 divide-y divide-neutral-100 overflow-hidden shadow-xs">
                {items.map((item) => (
                  <div
                    key={item.productId}
                    className="p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                  >
                    <div className="flex items-center gap-4 flex-1">
                      <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden bg-neutral-100 shrink-0 border border-neutral-200/80">
                        <Image
                          src={item.imageUrl}
                          alt={item.name}
                          fill
                          sizes="96px"
                          className="object-cover"
                        />
                      </div>

                      <div className="space-y-1">
                        {item.categoryName && (
                          <span className="text-[10px] font-black uppercase text-orange-600 bg-orange-50 px-2 py-0.5 rounded-md">
                            {item.categoryName}
                          </span>
                        )}
                        <Link
                          href={`/products/${item.productId}`}
                          className="block text-sm font-bold text-neutral-900 hover:text-orange-600 line-clamp-2 transition-colors"
                        >
                          {item.name}
                        </Link>
                        <p className="text-xs font-bold text-orange-600">
                          ₱{item.price.toFixed(2)}
                        </p>
                        <p className="text-[11px] text-neutral-400">
                          Available: {item.stock} in stock
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between w-full sm:w-auto gap-4 sm:gap-6 self-stretch sm:self-center border-t sm:border-t-0 pt-3 sm:pt-0">
                      {/* Quantity Controls */}
                      <div className="flex items-center border border-neutral-300 rounded-xl bg-white overflow-hidden shadow-xs">
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                          className="p-2 text-neutral-600 hover:bg-neutral-100 transition-colors"
                          aria-label="Decrease quantity"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="w-10 text-center text-xs font-bold text-neutral-900 select-none">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                          disabled={item.quantity >= item.stock}
                          className="p-2 text-neutral-600 hover:bg-neutral-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                          aria-label="Increase quantity"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Line Subtotal */}
                      <div className="text-right min-w-[70px]">
                        <span className="text-sm font-black text-neutral-900">
                          ₱{(item.price * item.quantity).toFixed(2)}
                        </span>
                      </div>

                      {/* Remove Button */}
                      <button
                        type="button"
                        onClick={() => removeItem(item.productId)}
                        className="p-2 text-neutral-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                        aria-label="Remove item"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Order Summary Sidebar */}
            <div className="lg:col-span-4">
              <div className="bg-white rounded-3xl border border-neutral-200/80 p-6 shadow-xs space-y-5 sticky top-28">
                <h3 className="text-sm font-bold text-neutral-900 border-b border-neutral-100 pb-3">
                  Order Summary
                </h3>

                <div className="space-y-3 text-xs">
                  <div className="flex items-center justify-between text-neutral-600">
                    <span>Items Subtotal</span>
                    <span className="font-bold text-neutral-900">₱{subtotal.toFixed(2)}</span>
                  </div>

                  <div className="flex items-center justify-between text-neutral-600">
                    <div className="flex items-center gap-1.5">
                      <Truck className="w-3.5 h-3.5 text-orange-600" />
                      <span>Local Delivery Fee</span>
                    </div>
                    <span className="font-bold text-neutral-900">₱{deliveryFee.toFixed(2)}</span>
                  </div>

                  <div className="pt-3 border-t border-neutral-100 flex items-center justify-between text-base font-black">
                    <span className="text-neutral-900">Total to Pay (COD)</span>
                    <span className="text-orange-600 text-lg">₱{total.toFixed(2)}</span>
                  </div>
                </div>

                {/* COD Notice */}
                <div className="bg-orange-50/70 border border-orange-100 rounded-2xl p-3.5 text-xs text-orange-950 space-y-1">
                  <div className="flex items-center gap-1.5 font-bold text-orange-800">
                    <ShieldCheck className="w-4 h-4 text-orange-600 shrink-0" />
                    <span>Cash on Delivery Guaranteed</span>
                  </div>
                  <p className="text-[11px] text-neutral-600 leading-relaxed">
                    You only pay the rider when your items arrive fresh at your door.
                  </p>
                </div>

                {/* Checkout Button */}
                <Link
                  href="/checkout"
                  className="w-full flex items-center justify-center gap-2 py-4 px-6 rounded-2xl font-bold text-sm bg-orange-600 hover:bg-orange-700 text-white shadow-lg shadow-orange-600/25 transition-all hover:scale-102"
                >
                  <span>Proceed to Checkout</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>

                <div className="text-center">
                  <Link
                    href="/products"
                    className="text-xs font-semibold text-neutral-500 hover:text-orange-600 transition-colors"
                  >
                    Continue Shopping
                  </Link>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-20 bg-white rounded-3xl border border-neutral-200/80 p-8 my-8 max-w-lg mx-auto">
            <div className="w-16 h-16 rounded-full bg-orange-50 text-orange-600 flex items-center justify-center mx-auto mb-4">
              <ShoppingBag className="w-8 h-8" />
            </div>
            <h3 className="text-base font-bold text-neutral-900">Your shopping cart is empty</h3>
            <p className="text-xs text-neutral-500 max-w-sm mx-auto mt-1 mb-6">
              Looks like you haven&apos;t added any local produce or goods to your cart yet.
            </p>
            <Link
              href="/products"
              className="inline-flex items-center gap-2 bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold px-6 py-3.5 rounded-2xl shadow-md shadow-orange-600/20 transition-all hover:scale-102"
            >
              <span>Explore Marketplace</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
