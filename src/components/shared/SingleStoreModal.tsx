"use client";

import React from "react";
import { useCart } from "@/context/CartContext";
import { AlertCircle, ShoppingBag, ArrowRight } from "lucide-react";

export function SingleStoreModal() {
  const { pendingSwitch, storeName, confirmStoreSwitch, cancelStoreSwitch } = useCart();

  if (!pendingSwitch) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-zinc-200">
        <div className="w-12 h-12 rounded-full bg-amber-50 text-movli flex items-center justify-center mb-4">
          <AlertCircle className="w-6 h-6" />
        </div>

        <h3 className="text-lg font-bold text-slate-deep mb-2">
          Start a new basket?
        </h3>

        <p className="text-sm text-zinc-600 mb-4 leading-relaxed">
          Your basket currently contains items from{" "}
          <span className="font-semibold text-slate-deep">{storeName}</span>.
          Movli orders are fulfilled directly from <span className="font-semibold text-movli">one local store at a time</span> to guarantee prompt 30-to-60-minute delivery.
        </p>

        <div className="bg-sand-canvas p-3 rounded-xl border border-sand-border mb-6 text-xs text-zinc-600 flex items-center gap-2">
          <ShoppingBag className="w-4 h-4 text-movli flex-shrink-0" />
          <span>
            Adding <strong className="text-slate-deep">{pendingSwitch.item.name}</strong> will reset your current basket to <strong className="text-slate-deep">{pendingSwitch.newStore.name}</strong>.
          </span>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <button
            onClick={cancelStoreSwitch}
            className="flex-1 px-4 py-2.5 rounded-xl border border-zinc-300 text-slate-deep font-medium hover:bg-zinc-50 transition text-sm text-center"
          >
            Keep Current Basket
          </button>
          <button
            onClick={confirmStoreSwitch}
            className="flex-1 px-4 py-2.5 rounded-xl bg-movli text-white font-medium hover:bg-movli-600 transition text-sm flex items-center justify-center gap-1.5 shadow-md shadow-movli/20"
          >
            <span>Start New Basket</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
