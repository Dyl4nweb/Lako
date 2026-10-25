"use client";

import React, { useState, useTransition } from "react";
import Link from "next/link";
import { formatPHP, formatDate } from "@/lib/utils";
import { OrderStatusStepper } from "@/components/shared/OrderStatusStepper";
import { updateOrderStatusAction } from "@/server/actions/orders";
import { OrderStatus } from "@/types";
import {
  ArrowLeft,
  Store,
  MapPin,
  Bike,
  Phone,
  Clock,
  ShieldCheck,
  AlertTriangle,
  Camera,
  CheckCircle2,
  XCircle,
} from "lucide-react";

export function OrderLiveTrackerView({
  order,
  session,
}: {
  order: any;
  session: any;
}) {
  const [isPending, startTransition] = useTransition();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  let addr: any = {};
  try {
    addr = JSON.parse(order.deliveryAddressJson);
  } catch (e) {}

  const canCancel =
    order.status === "PENDING" &&
    (session?.id === order.customerId || session?.role === "ADMIN" || session?.role === "SUPER_ADMIN");

  const handleCancelOrder = () => {
    if (!confirm("Are you sure you want to cancel this order?")) return;
    setErrorMsg(null);
    startTransition(async () => {
      try {
        await updateOrderStatusAction(
          order.id,
          "CANCELLED_BY_CUSTOMER",
          "Cancelled by customer prior to preparation"
        );
      } catch (err: any) {
        setErrorMsg(err.message || "Failed to cancel order.");
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* Back button */}
      <div className="flex items-center justify-between">
        <Link
          href="/orders"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-500 hover:text-slate-deep transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>All Orders</span>
        </Link>

        <span className="font-mono text-xs text-zinc-500">
          Order ID: <strong className="text-slate-deep">#{order.orderNumber}</strong>
        </span>
      </div>

      {errorMsg && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs">
          {errorMsg}
        </div>
      )}

      {/* Stepper Card */}
      <div className="bg-white rounded-3xl p-6 border border-zinc-200 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-zinc-100 pb-3">
          <div>
            <h1 className="text-lg font-extrabold text-slate-deep font-outfit">
              Order Dispatch Status
            </h1>
            <p className="text-xs text-zinc-500">
              Placed on {formatDate(order.createdAt)} · Lingayen Hub
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-zinc-400 font-mono">
              Fulfilling Store:
            </span>
            <span className="text-xs font-bold text-movli">
              {order.store.name}
            </span>
          </div>
        </div>

        <OrderStatusStepper status={order.status as OrderStatus} />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Left Column: Courier & Delivery Details */}
        <div className="md:col-span-7 space-y-6">
          {/* Assigned Courier Card */}
          {order.rider ? (
            <div className="bg-white rounded-3xl p-6 border border-zinc-200 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
                <h2 className="font-bold text-slate-deep text-sm flex items-center gap-2">
                  <Bike className="w-4 h-4 text-emerald-500" />
                  Your Assigned Movli Courier
                </h2>
                <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">
                  Verified Local Rider
                </span>
              </div>

              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-zinc-100 overflow-hidden relative flex-shrink-0 border border-zinc-200">
                    {order.rider.user.avatarUrl ? (
                      <img
                        src={order.rider.user.avatarUrl}
                        alt={order.rider.user.fullName}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-zinc-400 font-bold">
                        {order.rider.user.fullName[0]}
                      </div>
                    )}
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-deep text-sm">
                      {order.rider.user.fullName}
                    </h3>
                    <p className="text-xs text-zinc-500">
                      {order.rider.vehicleType} · Plate:{" "}
                      <strong className="text-slate-deep font-mono">
                        {order.rider.plateNumber}
                      </strong>
                    </p>
                  </div>
                </div>

                {order.rider.user.phoneNumber && (
                  <a
                    href={`tel:${order.rider.user.phoneNumber}`}
                    className="px-3.5 py-2 rounded-xl bg-emerald-50 text-emerald-700 hover:bg-emerald-100 font-bold text-xs flex items-center gap-1.5 transition border border-emerald-200"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    <span>Call Courier</span>
                  </a>
                )}
              </div>
            </div>
          ) : (
            <div className="bg-amber-50/60 rounded-3xl p-6 border border-amber-200 text-amber-900 space-y-2">
              <div className="flex items-center gap-2 font-bold text-sm">
                <Clock className="w-4 h-4 text-amber-600" />
                <span>Dispatcher Assignment Pending</span>
              </div>
              <p className="text-xs text-amber-700 leading-relaxed">
                The merchant is currently preparing your order. Once packed and marked ready for pickup, our local Lingayen dispatcher will assign the nearest on-duty courier.
              </p>
            </div>
          )}

          {/* Proof of Delivery (POD) photo if completed */}
          {order.podImageUrl && (
            <div className="bg-white rounded-3xl p-6 border border-zinc-200 shadow-sm space-y-3">
              <h2 className="font-bold text-slate-deep text-sm flex items-center gap-2 border-b border-zinc-100 pb-3">
                <Camera className="w-4 h-4 text-movli" />
                Proof of Delivery (POD) Handover Photo
              </h2>
              <div className="rounded-2xl overflow-hidden border border-zinc-200 max-h-72 w-full bg-zinc-100">
                <img
                  src={order.podImageUrl}
                  alt="Proof of Delivery"
                  className="w-full h-full object-cover"
                />
              </div>
              <p className="text-[11px] text-zinc-400">
                Photographic verification captured by courier upon doorstep cash collection.
              </p>
            </div>
          )}

          {/* Delivery Address Card */}
          <div className="bg-white rounded-3xl p-6 border border-zinc-200 shadow-sm space-y-3">
            <h2 className="font-bold text-slate-deep text-sm flex items-center gap-2 border-b border-zinc-100 pb-3">
              <MapPin className="w-4 h-4 text-movli" />
              Delivery Location
            </h2>
            <div className="text-xs space-y-1.5 text-zinc-600">
              <div>
                <strong className="text-slate-deep">Recipient:</strong> {addr.recipient || session?.fullName} ({addr.phoneNumber || "N/A"})
              </div>
              <div>
                <strong className="text-slate-deep">Barangay:</strong> Brgy. {addr.barangay}, Lingayen
              </div>
              <div>
                <strong className="text-slate-deep">Street:</strong> {addr.street}
              </div>
              <div className="p-2.5 rounded-xl bg-amber-50/70 border border-amber-200 text-amber-900 font-medium">
                <strong>Landmark:</strong> {addr.landmark}
              </div>
            </div>
          </div>

          {/* Status Timeline History */}
          <div className="bg-white rounded-3xl p-6 border border-zinc-200 shadow-sm space-y-3">
            <h2 className="font-bold text-slate-deep text-sm border-b border-zinc-100 pb-3">
              Status Audit History
            </h2>
            <div className="space-y-3 text-xs">
              {order.statusHistory.map((h: any) => (
                <div key={h.id} className="flex items-start gap-2.5">
                  <div className="w-2 h-2 rounded-full bg-movli mt-1.5 flex-shrink-0" />
                  <div className="flex-1">
                    <div className="font-semibold text-slate-deep">
                      {h.status}
                    </div>
                    {h.notes && <div className="text-zinc-500 text-[11px]">{h.notes}</div>}
                    <div className="text-[10px] text-zinc-400 mt-0.5 font-mono">
                      {formatDate(h.createdAt)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Order Items Summary & Cancellation */}
        <div className="md:col-span-5 space-y-6">
          <div className="bg-white rounded-3xl p-6 border border-zinc-200 shadow-sm space-y-4">
            <h2 className="font-bold text-slate-deep text-sm border-b border-zinc-100 pb-3">
              Order Receipt
            </h2>

            <div className="divide-y divide-zinc-100 space-y-2">
              {order.orderItems.map((item: any) => (
                <div key={item.id} className="pt-2 first:pt-0 flex items-center justify-between text-xs">
                  <div>
                    <div className="font-semibold text-slate-deep">{item.product.name}</div>
                    <div className="text-[11px] text-zinc-400">
                      {item.quantity} × {formatPHP(item.unitPrice)}
                    </div>
                  </div>
                  <div className="font-bold text-slate-deep">
                    {formatPHP(item.lineTotal)}
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t border-zinc-200 pt-3 space-y-2 text-xs text-zinc-600">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="font-semibold text-slate-deep">{formatPHP(order.subtotalAmount)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Flat Delivery Fee</span>
                <span className="font-semibold text-slate-deep">{formatPHP(order.deliveryFee)}</span>
              </div>
              <div className="border-t border-zinc-200 pt-2 flex justify-between text-base font-extrabold text-slate-deep">
                <span>Total COD Due</span>
                <span className="text-movli text-lg">{formatPHP(order.totalAmount)}</span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-zinc-50 border border-zinc-200 text-[11px] text-zinc-500 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-500 flex-shrink-0" />
              <span>Payment Method: Cash-on-Delivery (COD)</span>
            </div>

            {canCancel && (
              <div className="pt-2">
                <button
                  onClick={handleCancelOrder}
                  disabled={isPending}
                  className="w-full py-2.5 rounded-xl border border-red-200 text-red-600 hover:bg-red-50 text-xs font-bold transition flex items-center justify-center gap-1.5"
                >
                  <XCircle className="w-4 h-4" />
                  <span>{isPending ? "Cancelling..." : "Cancel Order (Before Acceptance)"}</span>
                </button>
                <p className="text-[10px] text-zinc-400 text-center mt-1">
                  Cancellation allowed only while store has not begun preparation.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
