"use client";

import React, { useState, useTransition } from "react";
import { formatPHP, formatDate } from "@/lib/utils";
import { updateOrderStatusAction } from "@/server/actions/orders";
import { toggleRiderDutyStatusAction } from "@/server/actions/admin";
import {
  Bike,
  Power,
  MapPin,
  Store,
  Phone,
  Camera,
  CheckCircle2,
  AlertTriangle,
  Wallet,
  Clock,
  ArrowRight,
  ShieldAlert,
  X,
  FileCheck,
} from "lucide-react";

export function RiderTerminalView({
  rider,
  financials,
  session,
}: {
  rider: any;
  financials: {
    totalWagesEarned: number;
    completedDropsCount: number;
  };
  session: any;
}) {
  const [isPending, startTransition] = useTransition();
  const [selectedOrderForDelivery, setSelectedOrderForDelivery] = useState<any>(null);
  const [podPhotoUrl, setPodPhotoUrl] = useState<string>(
    "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=600&auto=format&fit=crop&q=80"
  );
  const [cashCollectedInput, setCashCollectedInput] = useState<string>("");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Cash bag threshold (Section 20.1 Risk Register: ₱2,500 cash ceiling)
  const CASH_CEILING = 2500.0;
  const isNearCeiling = rider.currentCashOnHand >= CASH_CEILING * 0.8;
  const isExceededCeiling = rider.currentCashOnHand >= CASH_CEILING;

  // Active runs
  const activeOrders = rider.assignedOrders.filter(
    (o: any) =>
      o.status === "ASSIGNED" || o.status === "PICKED_UP" || o.status === "IN_TRANSIT"
  );
  const completedOrders = rider.assignedOrders.filter((o: any) => o.status === "DELIVERED");

  const handleToggleDuty = () => {
    startTransition(async () => {
      await toggleRiderDutyStatusAction(!rider.isAvailable);
    });
  };

  const handlePickupOrder = (orderId: string) => {
    startTransition(async () => {
      await updateOrderStatusAction(
        orderId,
        "IN_TRANSIT",
        "Courier verified items, picked up package, and is en route to customer."
      );
    });
  };

  const handleConfirmDelivery = () => {
    if (!selectedOrderForDelivery) return;
    setErrorMsg(null);

    const enteredCash = parseFloat(cashCollectedInput);
    if (isNaN(enteredCash) || enteredCash < selectedOrderForDelivery.totalAmount) {
      setErrorMsg(
        `Please confirm exact COD cash collected of at least ${formatPHP(
          selectedOrderForDelivery.totalAmount
        )}.`
      );
      return;
    }

    if (!podPhotoUrl) {
      setErrorMsg("Proof of Delivery (POD) photo is mandatory.");
      return;
    }

    startTransition(async () => {
      try {
        await updateOrderStatusAction(
          selectedOrderForDelivery.id,
          "DELIVERED",
          `Handed over to recipient. COD of ${formatPHP(enteredCash)} collected.`,
          podPhotoUrl
        );
        setSelectedOrderForDelivery(null);
      } catch (err: any) {
        setErrorMsg(err.message || "Failed to complete delivery.");
      }
    });
  };

  const handleFailDelivery = (disposition: string) => {
    if (!selectedOrderForDelivery) return;
    const notes = prompt(`Please specify reason for ${disposition}:`);
    if (!notes) return;

    startTransition(async () => {
      await updateOrderStatusAction(
        selectedOrderForDelivery.id,
        "FAILED_DELIVERY",
        `${disposition}: ${notes}. Returning goods to merchant.`
      );
      setSelectedOrderForDelivery(null);
    });
  };

  return (
    <div className="space-y-6">
      {/* Top Courier Header Bar */}
      <div className="bg-white rounded-3xl p-6 border border-zinc-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-zinc-100 overflow-hidden relative border border-zinc-200 flex-shrink-0">
            {rider.user.avatarUrl ? (
              <img src={rider.user.avatarUrl} alt={rider.user.fullName} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-zinc-400 font-bold">
                <Bike className="w-7 h-7" />
              </div>
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-extrabold text-slate-deep font-outfit">
                {rider.user.fullName}
              </h1>
              <span className="text-[10px] font-mono bg-zinc-100 text-zinc-600 px-2 py-0.5 rounded-full font-bold">
                {rider.plateNumber}
              </span>
            </div>
            <p className="text-xs text-zinc-500 mt-0.5">
              {rider.vehicleType} · Lingayen Courier Fleet
            </p>
          </div>
        </div>

        {/* Duty Toggle Button */}
        <button
          onClick={handleToggleDuty}
          disabled={isPending}
          className={`px-5 py-2.5 rounded-2xl text-xs font-extrabold flex items-center gap-2 transition shadow-sm ${
            rider.isAvailable
              ? "bg-emerald-500 text-white hover:bg-emerald-600 shadow-emerald-500/20"
              : "bg-zinc-800 text-zinc-300 hover:bg-zinc-700"
          }`}
        >
          <Power className="w-4 h-4" />
          <span>{rider.isAvailable ? "Status: ON DUTY" : "Status: OFF DUTY"}</span>
          <span
            className={`w-2.5 h-2.5 rounded-full ${
              rider.isAvailable ? "bg-white beacon-active" : "bg-zinc-500"
            }`}
          />
        </button>
      </div>

      {/* Cash Bag & Wage Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Cash in Bag */}
        <div
          className={`rounded-2xl p-4 border shadow-sm flex items-center gap-3 ${
            isExceededCeiling
              ? "bg-red-50 border-red-300 text-red-900"
              : isNearCeiling
              ? "bg-amber-50 border-amber-300 text-amber-900"
              : "bg-white border-zinc-200 text-slate-deep"
          }`}
        >
          <div className="w-10 h-10 rounded-xl bg-movli-50 text-movli flex items-center justify-center font-bold">
            <Wallet className="w-5 h-5" />
          </div>
          <div className="flex-1">
            <div className="text-[11px] font-semibold uppercase opacity-75">
              Cash Bag in Hand
            </div>
            <div className="text-lg font-black">{formatPHP(rider.currentCashOnHand)}</div>
            <div className="text-[10px] opacity-75">
              Ceiling: {formatPHP(CASH_CEILING)}
            </div>
          </div>
        </div>

        {/* Net Wages Earned Today */}
        <div className="bg-white rounded-2xl p-4 border border-zinc-200 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] font-semibold text-zinc-400 uppercase">
              Wages Earned (₱35/drop)
            </div>
            <div className="text-lg font-black text-emerald-600">
              {formatPHP(financials.totalWagesEarned)}
            </div>
            <div className="text-[10px] text-zinc-400">
              {financials.completedDropsCount} drops completed
            </div>
          </div>
        </div>

        {/* Active Runs Count */}
        <div className="bg-white rounded-2xl p-4 border border-zinc-200 shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
            <Bike className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[11px] font-semibold text-zinc-400 uppercase">
              Active Assigned Runs
            </div>
            <div className="text-lg font-black text-blue-600">
              {activeOrders.length}
            </div>
            <div className="text-[10px] text-zinc-400">
              Ready for pickup or in transit
            </div>
          </div>
        </div>
      </div>

      {isExceededCeiling && (
        <div className="p-4 rounded-2xl bg-red-100 border border-red-300 text-red-900 text-xs flex items-center gap-3">
          <ShieldAlert className="w-5 h-5 text-red-600 flex-shrink-0" />
          <div>
            <span className="font-bold">Maximum Cash Ceiling Reached ({formatPHP(CASH_CEILING)}): </span>
            Please remit your collected Cash-on-Delivery funds to Platform Admin at Lingayen Town Hub before taking new deliveries.
          </div>
        </div>
      )}

      {/* Active Runs Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b border-zinc-200 pb-2">
          <h2 className="text-base font-bold text-slate-deep">
            Active Assigned Deliveries ({activeOrders.length})
          </h2>
          <span className="text-xs text-zinc-400">
            Lingayen Municipal Delivery Zone
          </span>
        </div>

        {activeOrders.length === 0 ? (
          <div className="bg-white rounded-3xl p-10 border border-zinc-200 text-center text-zinc-400 shadow-sm">
            <Bike className="w-12 h-12 mx-auto mb-3 opacity-30 text-movli" />
            <h3 className="font-bold text-slate-deep text-base mb-1">No pending runs assigned</h3>
            <p className="text-xs text-zinc-500">
              Ensure your status is set to <strong className="text-emerald-600">ON DUTY</strong>. New assignments dispatched from Lingayen stores will appear here.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {activeOrders.map((order: any) => {
              let addr: any = {};
              try {
                addr = JSON.parse(order.deliveryAddressJson);
              } catch (e) {}

              return (
                <div
                  key={order.id}
                  className="bg-white rounded-3xl p-6 border-2 border-movli/30 shadow-md space-y-4"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-zinc-100 pb-3">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-sm font-black text-slate-deep">
                        #{order.orderNumber}
                      </span>
                      <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800 animate-pulse">
                        {order.status}
                      </span>
                    </div>

                    <div className="text-xs font-bold text-emerald-600">
                      Courier Wage: ₱35.00
                    </div>
                  </div>

                  {/* Pickup & Drop Details */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                    {/* Store Pickup */}
                    <div className="p-4 rounded-2xl bg-sand-canvas border border-sand-border space-y-1.5">
                      <div className="text-[10px] font-bold text-movli uppercase flex items-center gap-1">
                        <Store className="w-3.5 h-3.5" />
                        <span>Pickup Merchant</span>
                      </div>
                      <div className="font-bold text-slate-deep text-sm">{order.store.name}</div>
                      <div className="text-zinc-500">Brgy. {order.store.barangay}, Lingayen</div>
                      <div className="pt-1">
                        <a
                          href={`tel:${order.store.contactNumber}`}
                          className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-deep hover:text-movli"
                        >
                          <Phone className="w-3 h-3 text-movli" />
                          <span>{order.store.contactNumber}</span>
                        </a>
                      </div>
                    </div>

                    {/* Customer Delivery & Landmark Highlight Box */}
                    <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200 space-y-1.5">
                      <div className="text-[10px] font-bold text-amber-800 uppercase flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-movli" />
                        <span>Customer Handover</span>
                      </div>
                      <div className="font-bold text-slate-deep text-sm">
                        {addr.recipient || order.customer.fullName}
                      </div>
                      <div className="text-zinc-700">
                        Brgy. {addr.barangay}, Lingayen · {addr.street}
                      </div>
                      <div className="p-2 rounded-xl bg-amber-100/80 text-amber-950 font-bold text-[11px]">
                        Landmark: {addr.landmark}
                      </div>
                      {addr.phoneNumber && (
                        <div className="pt-1">
                          <a
                            href={`tel:${addr.phoneNumber}`}
                            className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-deep hover:text-movli"
                          >
                            <Phone className="w-3 h-3 text-movli" />
                            <span>{addr.phoneNumber}</span>
                          </a>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Items Verification Checklist */}
                  <div className="p-3 rounded-2xl bg-zinc-50 border border-zinc-200 text-xs">
                    <div className="text-[11px] font-bold text-zinc-500 uppercase mb-1">
                      Package Contents Checklist
                    </div>
                    <div className="divide-y divide-zinc-200/50">
                      {order.orderItems.map((item: any) => (
                        <div key={item.id} className="py-1 flex justify-between">
                          <span>
                            <strong>{item.quantity}x</strong> {item.product.name}
                          </span>
                          <span className="font-mono">{formatPHP(item.lineTotal)}</span>
                        </div>
                      ))}
                    </div>
                    <div className="border-t border-zinc-200 mt-2 pt-2 flex justify-between font-bold text-slate-deep">
                      <span>Total Cash to Collect (COD):</span>
                      <span className="text-movli text-sm font-black">
                        {formatPHP(order.totalAmount)}
                      </span>
                    </div>
                  </div>

                  {/* Courier Action Buttons */}
                  <div className="pt-2 flex flex-col sm:flex-row gap-3">
                    {order.status === "ASSIGNED" && (
                      <button
                        onClick={() => handlePickupOrder(order.id)}
                        disabled={isPending}
                        className="flex-1 py-3.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs transition flex items-center justify-center gap-2 shadow-lg shadow-blue-600/20"
                      >
                        <FileCheck className="w-4 h-4" />
                        <span>Confirm Picked Up at Merchant</span>
                      </button>
                    )}

                    {(order.status === "PICKED_UP" || order.status === "IN_TRANSIT") && (
                      <button
                        onClick={() => {
                          setSelectedOrderForDelivery(order);
                          setCashCollectedInput(order.totalAmount.toFixed(2));
                        }}
                        disabled={isPending}
                        className="flex-1 py-3.5 rounded-2xl bg-movli hover:bg-movli-600 text-white font-extrabold text-xs transition flex items-center justify-center gap-2 shadow-lg shadow-movli/25"
                      >
                        <Camera className="w-4 h-4" />
                        <span>Arrived at Customer · Complete Delivery Handover</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Proof of Delivery (POD) & Cash Confirmation Modal */}
      {selectedOrderForDelivery && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-zinc-200 max-h-[90vh] overflow-y-auto space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-movli-50 text-movli flex items-center justify-center">
                  <Camera className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-deep text-base">
                    Proof of Delivery (POD)
                  </h3>
                  <p className="text-xs text-zinc-500">
                    Order #{selectedOrderForDelivery.orderNumber}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedOrderForDelivery(null)}
                className="p-1.5 rounded-lg text-zinc-400 hover:text-slate-deep"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {errorMsg && (
              <div className="p-3 rounded-xl bg-red-50 text-red-700 text-xs border border-red-200">
                {errorMsg}
              </div>
            )}

            {/* Mandatory Photo Proof */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-deep">
                1. Handover Verification Photo (Mandatory)
              </label>
              <div className="h-44 w-full rounded-2xl bg-zinc-100 overflow-hidden relative border-2 border-dashed border-zinc-300">
                <img
                  src={podPhotoUrl}
                  alt="Proof of Delivery Handover"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex gap-2 text-xs">
                <button
                  type="button"
                  onClick={() =>
                    setPodPhotoUrl(
                      "https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=600&auto=format&fit=crop&q=80"
                    )
                  }
                  className="px-2.5 py-1 rounded-lg bg-zinc-100 hover:bg-zinc-200 text-zinc-700 font-medium"
                >
                  Use Sample Doorstep Photo
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setPodPhotoUrl(
                      "https://images.unsplash.com/photo-1577705998148-6da4f3963bc8?w=600&auto=format&fit=crop&q=80"
                    )
                  }
                  className="px-2.5 py-1 rounded-lg bg-zinc-100 hover:bg-zinc-200 text-zinc-700 font-medium"
                >
                  Use Sample Package Handover
                </button>
              </div>
            </div>

            {/* Cash Confirmation Input */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-slate-deep">
                2. Confirm Exact Cash-on-Delivery (COD) Collected
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-slate-deep text-sm">
                  ₱
                </span>
                <input
                  type="number"
                  step="0.01"
                  value={cashCollectedInput}
                  onChange={(e) => setCashCollectedInput(e.target.value)}
                  className="w-full pl-8 pr-4 py-2.5 rounded-xl border border-zinc-300 font-mono font-bold text-base text-slate-deep focus:outline-none focus:ring-2 focus:ring-movli"
                />
              </div>
              <div className="text-[11px] text-zinc-400">
                Order amount due:{" "}
                <strong className="text-movli">
                  {formatPHP(selectedOrderForDelivery.totalAmount)}
                </strong>
              </div>
            </div>

            {/* Submission / Failed Disposition */}
            <div className="pt-2 space-y-2">
              <button
                onClick={handleConfirmDelivery}
                disabled={isPending}
                className="w-full py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-sm transition flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/25"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Confirm Handover & Collect Cash</span>
              </button>

              <div className="flex gap-2 pt-2">
                <button
                  onClick={() => handleFailDelivery("CUSTOMER_UNREACHABLE")}
                  className="flex-1 py-2 rounded-xl border border-zinc-200 text-zinc-600 hover:bg-zinc-50 text-xs font-semibold"
                >
                  Customer Unreachable
                </button>
                <button
                  onClick={() => handleFailDelivery("REFUSED_COD")}
                  className="flex-1 py-2 rounded-xl border border-zinc-200 text-zinc-600 hover:bg-zinc-50 text-xs font-semibold"
                >
                  Refused COD
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
