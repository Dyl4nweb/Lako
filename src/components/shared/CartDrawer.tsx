"use client";

import React from "react";
import { useCart } from "@/context/CartContext";
import { formatPHP } from "@/lib/utils";
import { X, Trash2, Plus, Minus, ShoppingBag, ArrowRight, Store } from "lucide-react";
import Link from "next/link";

export function CartDrawer() {
  const {
    items,
    storeName,
    storeSlug,
    subtotal,
    deliveryFee,
    total,
    isDrawerOpen,
    setIsDrawerOpen,
    updateQuantity,
    removeItem,
    clearCart,
  } = useCart();

  if (!isDrawerOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden animate-fadeIn">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
        onClick={() => setIsDrawerOpen(false)}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col">
          {/* Header */}
          <div className="p-5 border-b border-zinc-200 flex items-center justify-between bg-[#FBFBF9]">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-movli-50 text-movli flex items-center justify-center font-bold">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <div>
                <h2 className="font-bold text-slate-deep text-base">Your Basket</h2>
                {storeName && (
                  <p className="text-xs text-zinc-500 flex items-center gap-1">
                    <Store className="w-3 h-3 text-movli" />
                    <span className="font-medium text-slate-deep truncate max-w-[200px]">
                      {storeName}
                    </span>
                  </p>
                )}
              </div>
            </div>
            <button
              onClick={() => setIsDrawerOpen(false)}
              className="p-2 rounded-xl text-zinc-400 hover:text-slate-deep hover:bg-zinc-100 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Items Container */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {items.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 text-zinc-400">
                <div className="w-16 h-16 rounded-full bg-zinc-100 flex items-center justify-center mb-4 text-zinc-300">
                  <ShoppingBag className="w-8 h-8" />
                </div>
                <h3 className="font-bold text-slate-deep text-base mb-1">Your basket is empty</h3>
                <p className="text-xs text-zinc-500 mb-6 max-w-xs">
                  Discover native Lingayen specialties, market produce, and cooked meals delivered in 30-60 mins.
                </p>
                <button
                  onClick={() => setIsDrawerOpen(false)}
                  className="px-5 py-2.5 rounded-xl bg-movli text-white text-xs font-semibold hover:bg-movli-600 transition shadow-md shadow-movli/20"
                >
                  Explore Local Stores
                </button>
              </div>
            ) : (
              <>
                <div className="flex items-center justify-between text-xs text-zinc-500 pb-1 border-b border-zinc-100">
                  <span>{items.length} {items.length === 1 ? "item" : "items"}</span>
                  <button
                    onClick={clearCart}
                    className="text-red-500 hover:text-red-600 font-medium flex items-center gap-1"
                  >
                    <Trash2 className="w-3 h-3" />
                    Clear all
                  </button>
                </div>

                {items.map((item) => (
                  <div
                    key={item.productId}
                    className="p-3 rounded-xl border border-zinc-200 bg-white flex items-center gap-3 shadow-sm hover:border-zinc-300 transition"
                  >
                    <div className="w-14 h-14 rounded-lg bg-zinc-100 overflow-hidden flex-shrink-0 relative">
                      {item.imageUrl ? (
                        <img
                          src={item.imageUrl}
                          alt={item.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-zinc-400">
                          <ShoppingBag className="w-6 h-6" />
                        </div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-slate-deep text-xs leading-snug line-clamp-1">
                        {item.name}
                      </h4>
                      <p className="text-movli font-bold text-xs mt-0.5">
                        {formatPHP(item.price)}
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <div className="flex items-center border border-zinc-200 rounded-lg bg-zinc-50 overflow-hidden">
                          <button
                            onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                            className="p-1 hover:bg-zinc-200 text-zinc-600 transition"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="px-2 text-xs font-bold text-slate-deep">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                            className="p-1 hover:bg-zinc-200 text-zinc-600 transition"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                        <button
                          onClick={() => removeItem(item.productId)}
                          className="text-zinc-400 hover:text-red-500 text-xs transition ml-auto"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  </div>
                ))}

                {storeSlug && (
                  <div className="pt-2">
                    <Link
                      href={`/store/${storeSlug}`}
                      onClick={() => setIsDrawerOpen(false)}
                      className="text-xs text-movli font-semibold hover:underline flex items-center gap-1"
                    >
                      <span>+ Add more items from {storeName}</span>
                    </Link>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Footer Cost Breakdown */}
          {items.length > 0 && (
            <div className="p-5 border-t border-zinc-200 bg-[#FBFBF9] space-y-3">
              <div className="space-y-1.5 text-xs text-zinc-600">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-semibold text-slate-deep">{formatPHP(subtotal)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="flex items-center gap-1">
                    Flat Delivery Fee (Lingayen)
                    <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded font-medium">Fixed</span>
                  </span>
                  <span className="font-semibold text-slate-deep">{formatPHP(deliveryFee)}</span>
                </div>
                <div className="border-t border-zinc-200 pt-2 flex justify-between text-sm font-bold text-slate-deep">
                  <span>Total Amount (COD)</span>
                  <span className="text-movli text-base">{formatPHP(total)}</span>
                </div>
              </div>

              <Link
                href="/checkout"
                onClick={() => setIsDrawerOpen(false)}
                className="w-full py-3.5 rounded-xl bg-movli text-white font-bold text-sm hover:bg-movli-600 transition flex items-center justify-center gap-2 shadow-lg shadow-movli/25"
              >
                <span>Checkout ({formatPHP(total)})</span>
                <ArrowRight className="w-4 h-4" />
              </Link>

              <p className="text-[11px] text-center text-zinc-400">
                Pay with Cash on Delivery (COD) upon doorstep arrival
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
