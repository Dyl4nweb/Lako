"use client";

import React, { useState } from "react";
import Link from "next/link";
import { updateOrderStatus, recordCodPayment } from "@/server/actions/orders";
import { OrderStatus } from "@/types";
import {
  Bike,
  PackageCheck,
  Phone,
  MapPin,
  Clock,
  ArrowRight,
  Loader2,
  CheckCircle,
  Truck,
  Banknote,
  AlertCircle,
} from "lucide-react";

interface DeliveryItem {
  id: string;
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  deliveryAddress: string;
  orderNotes: string | null;
  status: OrderStatus;
  paymentCollectionStatus: string;
  total: number;
  createdAt: Date;
  items: {
    id: string;
    productName: string;
    quantity: number;
    unitPrice: number;
  }[];
}

interface RiderActiveDeliveriesViewProps {
  initialDeliveries: DeliveryItem[];
  riderName: string;
  totalDeliveredCount: number;
  totalCodCollected: number;
}

export function RiderActiveDeliveriesView({
  initialDeliveries,
  riderName,
  totalDeliveredCount,
  totalCodCollected,
}: RiderActiveDeliveriesViewProps) {
  const [deliveries, setDeliveries] = useState(initialDeliveries);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const handleUpdateStatus = async (
    orderId: string,
    targetStatus: OrderStatus,
    markCollected = false
  ) => {
    setUpdatingId(orderId);
    setActionError(null);

    const res = await updateOrderStatus({
      orderId,
      targetStatus,
      note: `Updated by rider ${riderName} to ${targetStatus}`,
      markCollected,
    });

    if (!res.success) {
      setActionError(res.error || "Failed to update delivery status.");
    } else {
      setDeliveries((prev) =>
        prev
          .map((d) =>
            d.id === orderId
              ? {
                  ...d,
                  status: targetStatus,
                  paymentCollectionStatus: markCollected ? "COLLECTED" : d.paymentCollectionStatus,
                }
              : d
          )
          .filter((d) => d.status !== "DELIVERED")
      );
    }
    setUpdatingId(null);
  };

  const handleToggleCod = async (orderId: string, currentStatus: string) => {
    const isCollected = currentStatus !== "COLLECTED";
    setUpdatingId(orderId);

    const res = await recordCodPayment(orderId, isCollected);
    if (res.success) {
      setDeliveries((prev) =>
        prev.map((d) =>
          d.id === orderId
            ? { ...d, paymentCollectionStatus: isCollected ? "COLLECTED" : "UNCOLLECTED" }
            : d
        )
      );
    }
    setUpdatingId(null);
  };

  return (
    <div className="space-y-6">
      {/* Top Greeting & Stats */}
      <div className="bg-white rounded-3xl border border-neutral-200/80 p-5 sm:p-6 shadow-xs space-y-4">
        <div>
          <span className="text-xs font-bold text-neutral-400 uppercase tracking-wider">
            Rider Terminal
          </span>
          <h1 className="text-xl sm:text-2xl font-black text-neutral-900 tracking-tight">
            Hello, {riderName} 👋
          </h1>
          <p className="text-xs text-neutral-500 mt-0.5">
            You have {deliveries.length} active delivery task{deliveries.length === 1 ? "" : "s"}
          </p>
        </div>

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-3 gap-2 text-center pt-2 border-t border-neutral-100">
          <div className="p-3 rounded-2xl bg-blue-50/80 text-blue-900 border border-blue-100">
            <span className="text-xs text-blue-600 font-bold block">Assigned</span>
            <span className="text-xl font-black">{deliveries.length}</span>
          </div>

          <div className="p-3 rounded-2xl bg-emerald-50/80 text-emerald-900 border border-emerald-100">
            <span className="text-xs text-emerald-600 font-bold block">Delivered</span>
            <span className="text-xl font-black">{totalDeliveredCount}</span>
          </div>

          <div className="p-3 rounded-2xl bg-orange-50/80 text-orange-900 border border-orange-100">
            <span className="text-xs text-orange-600 font-bold block">COD Reconciled</span>
            <span className="text-sm sm:text-base font-black truncate block">
              ₱{totalCodCollected.toFixed(0)}
            </span>
          </div>
        </div>
      </div>

      {actionError && (
        <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-900 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
          <span>{actionError}</span>
        </div>
      )}

      {/* Active Deliveries List */}
      <div className="space-y-4">
        <h2 className="text-sm font-bold text-neutral-900 px-1">
          Active Parcels To Deliver ({deliveries.length})
        </h2>

        {deliveries.length > 0 ? (
          deliveries.map((delivery) => {
            const isUpdating = updatingId === delivery.id;

            return (
              <div
                key={delivery.id}
                className="bg-white rounded-3xl border border-neutral-200/80 p-5 shadow-xs space-y-4"
              >
                {/* Header */}
                <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
                  <div>
                    <span className="text-xs font-bold text-neutral-400">
                      Order #{delivery.orderNumber}
                    </span>
                    <h3 className="text-base font-black text-neutral-900">
                      {delivery.customerName}
                    </h3>
                  </div>

                  <span
                    className={`px-3 py-1 rounded-full text-xs font-bold ${
                      delivery.status === "ASSIGNED"
                        ? "bg-indigo-100 text-indigo-800"
                        : delivery.status === "PICKED_UP"
                        ? "bg-purple-100 text-purple-800"
                        : "bg-orange-100 text-orange-800 animate-pulse"
                    }`}
                  >
                    {delivery.status.replace(/_/g, " ")}
                  </span>
                </div>

                {/* Customer Phone & Address */}
                <div className="space-y-2 text-xs">
                  <div className="flex items-start gap-2.5 text-neutral-700">
                    <MapPin className="w-4 h-4 text-orange-600 shrink-0 mt-0.5" />
                    <span className="font-semibold leading-relaxed">
                      {delivery.deliveryAddress}
                    </span>
                  </div>

                  <div className="flex items-center gap-2.5 text-neutral-700">
                    <Phone className="w-4 h-4 text-orange-600 shrink-0" />
                    <a
                      href={`tel:${delivery.customerPhone}`}
                      className="font-bold text-blue-600 underline"
                    >
                      {delivery.customerPhone} (Tap to Call)
                    </a>
                  </div>

                  {delivery.orderNotes && (
                    <div className="p-2.5 rounded-xl bg-amber-50 text-amber-900 text-[11px] italic">
                      Note: {delivery.orderNotes}
                    </div>
                  )}
                </div>

                {/* Items & COD Amount */}
                <div className="p-3 rounded-2xl bg-neutral-50 flex items-center justify-between text-xs">
                  <div>
                    <span className="text-neutral-400 font-medium">Items to hand over:</span>
                    <p className="font-bold text-neutral-900">
                      {delivery.items.reduce((sum, i) => sum + i.quantity, 0)} items ({delivery.items.map((i) => i.productName).join(", ")})
                    </p>
                  </div>

                  <div className="text-right">
                    <span className="text-neutral-400 font-medium">COD Collect:</span>
                    <p className="text-base font-black text-orange-600">
                      ₱{delivery.total.toFixed(2)}
                    </p>
                  </div>
                </div>

                {/* COD Status Toggle */}
                <div className="flex items-center justify-between pt-1">
                  <button
                    onClick={() => handleToggleCod(delivery.id, delivery.paymentCollectionStatus)}
                    disabled={isUpdating}
                    className={`text-xs font-bold px-3 py-1.5 rounded-xl border flex items-center gap-1.5 ${
                      delivery.paymentCollectionStatus === "COLLECTED"
                        ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                        : "bg-amber-50 text-amber-800 border-amber-200"
                    }`}
                  >
                    <Banknote className="w-3.5 h-3.5" />
                    <span>
                      COD: {delivery.paymentCollectionStatus === "COLLECTED" ? "Cash Received ✓" : "Collect Cash"}
                    </span>
                  </button>

                  <Link
                    href={`/rider/deliveries/${delivery.id}`}
                    className="text-xs font-bold text-neutral-500 hover:text-neutral-900 flex items-center gap-1"
                  >
                    <span>Details</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>

                {/* Large Touch-Friendly Progress Action Buttons */}
                <div className="pt-2">
                  {delivery.status === "ASSIGNED" && (
                    <button
                      onClick={() => handleUpdateStatus(delivery.id, "PICKED_UP")}
                      disabled={isUpdating}
                      className="w-full py-4 px-4 rounded-2xl font-black text-sm bg-indigo-600 hover:bg-indigo-700 text-white shadow-md shadow-indigo-600/30 flex items-center justify-center gap-2 active:scale-98 transition-transform"
                    >
                      {isUpdating ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : (
                        <>
                          <CheckCircle className="w-5 h-5" />
                          <span>1. Confirm Pickup From Store</span>
                        </>
                      )}
                    </button>
                  )}

                  {delivery.status === "PICKED_UP" && (
                    <button
                      onClick={() => handleUpdateStatus(delivery.id, "ON_THE_WAY")}
                      disabled={isUpdating}
                      className="w-full py-4 px-4 rounded-2xl font-black text-sm bg-orange-600 hover:bg-orange-700 text-white shadow-md shadow-orange-600/30 flex items-center justify-center gap-2 active:scale-98 transition-transform"
                    >
                      {isUpdating ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : (
                        <>
                          <Truck className="w-5 h-5" />
                          <span>2. Mark On The Way To Customer</span>
                        </>
                      )}
                    </button>
                  )}

                  {delivery.status === "ON_THE_WAY" && (
                    <button
                      onClick={() => handleUpdateStatus(delivery.id, "DELIVERED", true)}
                      disabled={isUpdating}
                      className="w-full py-4 px-4 rounded-2xl font-black text-sm bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-600/30 flex items-center justify-center gap-2 active:scale-98 transition-transform"
                    >
                      {isUpdating ? (
                        <Loader2 className="w-5 h-5 animate-spin" />
                      ) : (
                        <>
                          <PackageCheck className="w-5 h-5" />
                          <span>3. Confirm Delivered & COD Collected</span>
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            );
          })
        ) : (
          <div className="text-center py-16 bg-white rounded-3xl border border-neutral-200/80 p-6">
            <Bike className="w-12 h-12 text-neutral-300 mx-auto mb-3" />
            <h3 className="text-base font-bold text-neutral-900">
              No active deliveries right now
            </h3>
            <p className="text-xs text-neutral-500 max-w-sm mx-auto mt-1 mb-4">
              When new orders are confirmed by store dispatch and assigned to you, they will appear
              here instantly.
            </p>
            <Link
              href="/rider/history"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:underline"
            >
              <span>View Completed History</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
