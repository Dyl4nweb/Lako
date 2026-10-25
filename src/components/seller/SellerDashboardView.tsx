"use client";

import React, { useState, useTransition } from "react";
import { formatPHP, formatDate } from "@/lib/utils";
import { updateOrderStatusAction } from "@/server/actions/orders";
import { toggleProductStockAction, toggleStoreOpenStatusAction } from "@/server/actions/catalog";
import { OrderStatus } from "@/types";
import {
  Store,
  Power,
  Bell,
  Clock,
  Package,
  CheckCircle2,
  XCircle,
  Truck,
  ArrowRight,
  TrendingUp,
  Percent,
  Wallet,
  Sparkles,
} from "lucide-react";

export function SellerDashboardView({
  store,
  financials,
  session,
}: {
  store: any;
  financials: {
    grossSales: number;
    totalCommission: number;
    netReceivable: number;
    completedDropsCount: number;
  };
  session: any;
}) {
  const [activeTab, setActiveTab] = useState<"pipeline" | "inventory" | "ledger">("pipeline");
  const [isPending, startTransition] = useTransition();
  const [prepTime, setPrepTime] = useState<number>(20);

  // Group orders by pipeline stage
  const pendingOrders = store.orders.filter((o: any) => o.status === "PENDING");
  const preparingOrders = store.orders.filter(
    (o: any) => o.status === "ACCEPTED" || o.status === "PREPARING"
  );
  const dispatchedOrders = store.orders.filter(
    (o: any) =>
      o.status === "READY_FOR_PICKUP" ||
      o.status === "ASSIGNED" ||
      o.status === "PICKED_UP" ||
      o.status === "IN_TRANSIT"
  );
  const completedOrders = store.orders.filter((o: any) => o.status === "DELIVERED");

  const handleToggleStoreOpen = () => {
    startTransition(async () => {
      await toggleStoreOpenStatusAction(store.id, !store.isOpen);
    });
  };

  const handleToggleProductStock = (productId: string, currentAvailable: boolean) => {
    startTransition(async () => {
      await toggleProductStockAction(productId, !currentAvailable);
    });
  };

  const handleAcceptOrder = (orderId: string) => {
    startTransition(async () => {
      await updateOrderStatusAction(
        orderId,
        "ACCEPTED",
        `Merchant accepted order. Prep time estimate: ${prepTime} mins.`
      );
    });
  };

  const handleMarkPreparing = (orderId: string) => {
    startTransition(async () => {
      await updateOrderStatusAction(orderId, "PREPARING", "Store cooking / packaging items.");
    });
  };

  const handleMarkReady = (orderId: string) => {
    startTransition(async () => {
      await updateOrderStatusAction(
        orderId,
        "READY_FOR_PICKUP",
        "Order packaged and sealed. Ready for dispatcher courier pickup."
      );
    });
  };

  const handleRejectOrder = (orderId: string) => {
    const reason = prompt("Reason for declining order (e.g. Closing early, Ingredient shortage):");
    if (!reason) return;
    startTransition(async () => {
      await updateOrderStatusAction(orderId, "REJECTED_BY_STORE", reason);
    });
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Control Deck */}
      <div className="bg-white rounded-3xl p-6 border border-zinc-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-zinc-100 overflow-hidden relative border border-zinc-200 flex-shrink-0">
            {store.logoUrl ? (
              <img src={store.logoUrl} alt={store.name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-zinc-400 font-bold">
                <Store className="w-7 h-7" />
              </div>
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-extrabold text-slate-deep font-outfit">
                {store.name}
              </h1>
              <span className="text-[10px] font-mono bg-zinc-100 text-zinc-600 px-2 py-0.5 rounded-full">
                5% Commission Tier
              </span>
            </div>
            <p className="text-xs text-zinc-500 mt-0.5">
              Brgy. {store.barangay}, Lingayen · Merchant Operations Center
            </p>
          </div>
        </div>

        {/* Store Open/Closed Toggle Switch */}
        <div className="flex items-center gap-3">
          <button
            onClick={handleToggleStoreOpen}
            disabled={isPending}
            className={`px-4 py-2.5 rounded-2xl text-xs font-bold flex items-center gap-2 transition shadow-sm ${
              store.isOpen
                ? "bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100"
                : "bg-zinc-800 text-white hover:bg-zinc-700"
            }`}
          >
            <Power className="w-4 h-4" />
            <span>{store.isOpen ? "Store: OPEN FOR ORDERS" : "Store: PAUSED / CLOSED"}</span>
            <span
              className={`w-2.5 h-2.5 rounded-full ${
                store.isOpen ? "bg-emerald-500 beacon-active" : "bg-zinc-400"
              }`}
            />
          </button>
        </div>
      </div>

      {/* Financial Receivables Mini-Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl p-4 border border-zinc-200 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] font-semibold text-zinc-400 uppercase">Gross Food Sales</div>
            <div className="text-base font-extrabold text-slate-deep">
              {formatPHP(financials.grossSales)}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-zinc-200 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
            <Percent className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] font-semibold text-zinc-400 uppercase">Platform Take (5%)</div>
            <div className="text-base font-extrabold text-slate-deep">
              {formatPHP(financials.totalCommission)}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-zinc-200 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            <Wallet className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] font-semibold text-zinc-400 uppercase">Net Merchant Receivable</div>
            <div className="text-base font-extrabold text-emerald-600">
              {formatPHP(financials.netReceivable)}
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-zinc-200 pb-2">
        <button
          onClick={() => setActiveTab("pipeline")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
            activeTab === "pipeline"
              ? "bg-movli text-white shadow-md shadow-movli/20"
              : "bg-white text-zinc-600 border border-zinc-200 hover:bg-zinc-50"
          }`}
        >
          <Bell className="w-4 h-4" />
          <span>Live Order Pipeline</span>
          {pendingOrders.length > 0 && (
            <span className="bg-white text-movli text-[10px] font-black px-1.5 py-0.2 rounded-full">
              {pendingOrders.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab("inventory")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
            activeTab === "inventory"
              ? "bg-movli text-white shadow-md shadow-movli/20"
              : "bg-white text-zinc-600 border border-zinc-200 hover:bg-zinc-50"
          }`}
        >
          <Package className="w-4 h-4" />
          <span>Stock Fast-Toggle ({store.products.length} items)</span>
        </button>
      </div>

      {/* Tab 1: Live Orders Pipeline */}
      {activeTab === "pipeline" && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Column 1: Incoming / Pending Orders */}
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-amber-200 pb-2">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500 beacon-active" />
                <h3 className="font-extrabold text-sm text-slate-deep">Incoming Orders</h3>
              </div>
              <span className="bg-amber-100 text-amber-800 text-xs px-2 py-0.5 rounded-full font-bold">
                {pendingOrders.length}
              </span>
            </div>

            {pendingOrders.length === 0 ? (
              <div className="p-8 text-center bg-white rounded-2xl border border-zinc-200 text-zinc-400 text-xs">
                No new incoming orders right now.
              </div>
            ) : (
              pendingOrders.map((o: any) => (
                <div
                  key={o.id}
                  className="bg-white rounded-2xl p-4 border-2 border-amber-300 shadow-md space-y-3 animate-pulse-short"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-slate-deep">
                      #{o.orderNumber}
                    </span>
                    <span className="text-[10px] text-zinc-400 font-mono">
                      {formatDate(o.createdAt)}
                    </span>
                  </div>

                  <div className="text-xs space-y-1">
                    <div className="font-bold text-slate-deep">{o.customer.fullName}</div>
                    <div className="text-zinc-600">
                      {o.orderItems.map((i: any) => (
                        <div key={i.id} className="flex justify-between py-0.5">
                          <span>{i.quantity}x {i.product.name}</span>
                          <span className="font-semibold">{formatPHP(i.lineTotal)}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="border-t border-zinc-100 pt-2 flex items-center justify-between text-xs">
                    <span className="text-zinc-500">Gross:</span>
                    <span className="font-extrabold text-movli">{formatPHP(o.subtotalAmount)}</span>
                  </div>

                  {/* Accept / Reject Action Pipeline (Master plan 7.2) */}
                  <div className="pt-2 border-t border-zinc-100 space-y-2">
                    <div className="flex items-center gap-1.5 text-[11px] text-zinc-500">
                      <Clock className="w-3.5 h-3.5 text-zinc-400" />
                      <span>Prep time:</span>
                      <select
                        value={prepTime}
                        onChange={(e) => setPrepTime(Number(e.target.value))}
                        className="bg-zinc-100 text-xs rounded px-1.5 py-0.5 border border-zinc-200"
                      >
                        <option value={15}>15 mins</option>
                        <option value={20}>20 mins</option>
                        <option value={30}>30 mins</option>
                        <option value={45}>45 mins</option>
                      </select>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => handleRejectOrder(o.id)}
                        disabled={isPending}
                        className="flex-1 py-2 rounded-xl border border-red-200 text-red-600 hover:bg-red-50 text-xs font-bold transition"
                      >
                        Decline
                      </button>
                      <button
                        onClick={() => handleAcceptOrder(o.id)}
                        disabled={isPending}
                        className="flex-2 py-2 px-3 rounded-xl bg-movli text-white text-xs font-bold hover:bg-movli-600 transition shadow-md shadow-movli/20 flex items-center justify-center gap-1"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Accept ({prepTime}m)</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Column 2: In Kitchen / Preparing */}
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-blue-200 pb-2">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                <h3 className="font-extrabold text-sm text-slate-deep">In Kitchen / Preparing</h3>
              </div>
              <span className="bg-blue-100 text-blue-800 text-xs px-2 py-0.5 rounded-full font-bold">
                {preparingOrders.length}
              </span>
            </div>

            {preparingOrders.length === 0 ? (
              <div className="p-8 text-center bg-white rounded-2xl border border-zinc-200 text-zinc-400 text-xs">
                No orders currently in preparation.
              </div>
            ) : (
              preparingOrders.map((o: any) => (
                <div
                  key={o.id}
                  className="bg-white rounded-2xl p-4 border border-zinc-200 shadow-sm space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-slate-deep">
                      #{o.orderNumber}
                    </span>
                    <span className="text-[10px] bg-blue-50 text-blue-700 px-2 py-0.5 rounded-md font-bold">
                      {o.status}
                    </span>
                  </div>

                  <div className="text-xs space-y-1">
                    <div className="font-bold text-slate-deep">{o.customer.fullName}</div>
                    <div className="text-zinc-600">
                      {o.orderItems.map((i: any) => (
                        <div key={i.id} className="flex justify-between py-0.5">
                          <span>{i.quantity}x {i.product.name}</span>
                          <span className="font-semibold">{formatPHP(i.lineTotal)}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="pt-2 border-t border-zinc-100 flex gap-2">
                    {o.status === "ACCEPTED" && (
                      <button
                        onClick={() => handleMarkPreparing(o.id)}
                        disabled={isPending}
                        className="flex-1 py-2 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-slate-deep text-xs font-bold transition"
                      >
                        Start Prep
                      </button>
                    )}
                    <button
                      onClick={() => handleMarkReady(o.id)}
                      disabled={isPending}
                      className="flex-1 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition shadow-md shadow-emerald-600/20 flex items-center justify-center gap-1"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Ready for Pickup</span>
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Column 3: Dispatched & Handed Over */}
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-emerald-200 pb-2">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                <h3 className="font-extrabold text-sm text-slate-deep">Awaiting / In-Transit</h3>
              </div>
              <span className="bg-emerald-100 text-emerald-800 text-xs px-2 py-0.5 rounded-full font-bold">
                {dispatchedOrders.length}
              </span>
            </div>

            {dispatchedOrders.length === 0 ? (
              <div className="p-8 text-center bg-white rounded-2xl border border-zinc-200 text-zinc-400 text-xs">
                No dispatched orders right now.
              </div>
            ) : (
              dispatchedOrders.map((o: any) => (
                <div
                  key={o.id}
                  className="bg-white rounded-2xl p-4 border border-zinc-200 shadow-sm space-y-2.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-slate-deep">
                      #{o.orderNumber}
                    </span>
                    <span className="text-[10px] bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded font-bold">
                      {o.status}
                    </span>
                  </div>

                  <div className="text-xs text-zinc-600">
                    <div><strong>Customer:</strong> {o.customer.fullName}</div>
                    {o.rider ? (
                      <div className="text-emerald-700 mt-1 flex items-center gap-1 font-semibold">
                        <Truck className="w-3.5 h-3.5" />
                        <span>Courier: {o.rider.user.fullName} ({o.rider.plateNumber})</span>
                      </div>
                    ) : (
                      <div className="text-amber-600 mt-1 text-[11px] font-medium">
                        Waiting for dispatcher to assign courier
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Tab 2: Stock Fast-Toggle */}
      {activeTab === "inventory" && (
        <div className="bg-white rounded-3xl p-6 border border-zinc-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
            <div>
              <h2 className="font-bold text-slate-deep text-sm">
                1-Touch Inventory & Availability Editor
              </h2>
              <p className="text-xs text-zinc-500">
                Instantly mark items In Stock or Out of Stock to prevent unfulfillable orders.
              </p>
            </div>
          </div>

          <div className="divide-y divide-zinc-100">
            {store.products.map((p: any) => (
              <div
                key={p.id}
                className="py-3 flex items-center justify-between gap-4 text-xs"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-zinc-100 overflow-hidden relative flex-shrink-0">
                    {p.imageUrl ? (
                      <img src={p.imageUrl} alt={p.name} className="w-full h-full object-cover" />
                    ) : (
                      <Package className="w-5 h-5 text-zinc-400 m-auto" />
                    )}
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-deep">{p.name}</h4>
                    <span className="text-movli font-bold">{formatPHP(p.price)}</span>
                    <span className="text-zinc-400 text-[11px] ml-2">
                      ({p.stock} units recorded)
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => handleToggleProductStock(p.id, p.isAvailable)}
                  disabled={isPending}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                    p.isAvailable && p.stock > 0
                      ? "bg-emerald-100 text-emerald-800 hover:bg-emerald-200"
                      : "bg-red-100 text-red-800 hover:bg-red-200"
                  }`}
                >
                  <span
                    className={`w-2 h-2 rounded-full ${
                      p.isAvailable && p.stock > 0 ? "bg-emerald-600" : "bg-red-500"
                    }`}
                  />
                  <span>{p.isAvailable && p.stock > 0 ? "IN STOCK" : "OUT OF STOCK"}</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
