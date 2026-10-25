"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { updateOrderStatus, recordCodPayment } from "@/server/actions/orders";
import { OrderStatus } from "@/types";
import {
  ArrowLeft,
  Phone,
  MapPin,
  Banknote,
  CheckCircle,
  Truck,
  PackageCheck,
  Loader2,
  AlertCircle,
} from "lucide-react";

interface DeliveryDetailProps {
  order: {
    id: string;
    orderNumber: string;
    customerName: string;
    customerPhone: string;
    deliveryAddress: string;
    orderNotes: string | null;
    status: OrderStatus;
    paymentCollectionStatus: string;
    subtotal: number;
    deliveryFee: number;
    total: number;
    items: {
      id: string;
      productName: string;
      productImage: string;
      quantity: number;
      unitPrice: number;
      lineTotal: number;
    }[];
  };
}

export function RiderDeliveryDetailClient({ order }: DeliveryDetailProps) {
  const router = useRouter();
  const [currentStatus, setCurrentStatus] = useState(order.status);
  const [codStatus, setCodStatus] = useState(order.paymentCollectionStatus);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleUpdateStatus = async (targetStatus: OrderStatus, markCollected = false) => {
    setLoading(true);
    setError(null);

    const res = await updateOrderStatus({
      orderId: order.id,
      targetStatus,
      note: `Status updated by rider to ${targetStatus}`,
      markCollected,
    });

    if (!res.success) {
      setError(res.error || "Failed to update status.");
    } else {
      setCurrentStatus(targetStatus);
      if (markCollected) setCodStatus("COLLECTED");
      router.refresh();
    }
    setLoading(false);
  };

  const handleToggleCod = async () => {
    setLoading(true);
    const isCollected = codStatus !== "COLLECTED";

    const res = await recordCodPayment(order.id, isCollected);
    if (!res.success) {
      setError(res.error || "Failed to update COD collection.");
    } else {
      setCodStatus(isCollected ? "COLLECTED" : "UNCOLLECTED");
      router.refresh();
    }
    setLoading(false);
  };

  return (
    <div className="space-y-6">
      <Link
        href="/rider"
        className="inline-flex items-center gap-1.5 text-xs font-bold text-neutral-600 hover:text-blue-600 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Active Deliveries</span>
      </Link>

      <div className="bg-white rounded-3xl border border-neutral-200/80 p-5 sm:p-6 shadow-xs space-y-5">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
          <div>
            <span className="text-[11px] font-bold text-neutral-400">Order #{order.orderNumber}</span>
            <h1 className="text-lg sm:text-xl font-black text-neutral-900">{order.customerName}</h1>
          </div>
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-800">
            {currentStatus.replace(/_/g, " ")}
          </span>
        </div>

        {error && (
          <div className="p-3.5 rounded-2xl bg-red-50 border border-red-200 text-red-900 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Customer Touch Actions: Call & Map */}
        <div className="grid grid-cols-2 gap-3">
          <a
            href={`tel:${order.customerPhone}`}
            className="flex items-center justify-center gap-2 py-3.5 px-4 rounded-2xl bg-blue-50 text-blue-700 font-bold text-xs border border-blue-200 active:scale-98 transition-transform"
          >
            <Phone className="w-4 h-4" />
            <span>Call Customer</span>
          </a>

          <a
            href={`https://maps.google.com/?q=${encodeURIComponent(order.deliveryAddress)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 py-3.5 px-4 rounded-2xl bg-neutral-100 text-neutral-800 font-bold text-xs border border-neutral-200 active:scale-98 transition-transform"
          >
            <MapPin className="w-4 h-4 text-orange-600" />
            <span>Open in Maps</span>
          </a>
        </div>

        {/* Delivery Address */}
        <div className="p-4 rounded-2xl bg-neutral-50 border border-neutral-100 space-y-1.5 text-xs">
          <span className="font-bold text-neutral-400 uppercase tracking-wider text-[10px]">
            Delivery Destination
          </span>
          <p className="font-bold text-neutral-900 leading-relaxed">{order.deliveryAddress}</p>
          {order.orderNotes && (
            <p className="text-neutral-500 italic mt-1">Instructions: {order.orderNotes}</p>
          )}
        </div>

        {/* Items to Deliver */}
        <div className="space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-400">
            Items to Hand Over ({order.items.length})
          </h3>
          <div className="divide-y divide-neutral-100 text-xs">
            {order.items.map((i) => (
              <div key={i.id} className="py-2.5 flex items-center justify-between">
                <div>
                  <p className="font-bold text-neutral-900">{i.productName}</p>
                  <p className="text-neutral-500">Qty: {i.quantity}</p>
                </div>
                <span className="font-bold text-neutral-800">₱{i.lineTotal.toFixed(2)}</span>
              </div>
            ))}
          </div>
        </div>

        {/* COD Collection Card */}
        <div className="p-4 rounded-2xl bg-orange-50/70 border border-orange-200 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider text-orange-700">
              Cash to Collect (COD)
            </span>
            <p className="text-xl font-black text-orange-600">₱{order.total.toFixed(2)}</p>
          </div>

          <button
            onClick={handleToggleCod}
            disabled={loading}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold border transition-colors ${
              codStatus === "COLLECTED"
                ? "bg-emerald-600 text-white border-emerald-600"
                : "bg-white text-orange-700 border-orange-300"
            }`}
          >
            {codStatus === "COLLECTED" ? "Cash Received ✓" : "Mark as Collected"}
          </button>
        </div>

        {/* Large Progress Control Buttons */}
        <div className="pt-2">
          {currentStatus === "ASSIGNED" && (
            <button
              onClick={() => handleUpdateStatus("PICKED_UP")}
              disabled={loading}
              className="w-full py-4 px-4 rounded-2xl font-black text-sm bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 active:scale-98 transition-transform"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <CheckCircle className="w-5 h-5" />
                  <span>Mark Picked Up from Store</span>
                </>
              )}
            </button>
          )}

          {currentStatus === "PICKED_UP" && (
            <button
              onClick={() => handleUpdateStatus("ON_THE_WAY")}
              disabled={loading}
              className="w-full py-4 px-4 rounded-2xl font-black text-sm bg-orange-600 hover:bg-orange-700 text-white shadow-lg shadow-orange-600/30 flex items-center justify-center gap-2 active:scale-98 transition-transform"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <Truck className="w-5 h-5" />
                  <span>Mark On the Way to Customer</span>
                </>
              )}
            </button>
          )}

          {currentStatus === "ON_THE_WAY" && (
            <button
              onClick={() => handleUpdateStatus("DELIVERED", true)}
              disabled={loading}
              className="w-full py-4 px-4 rounded-2xl font-black text-sm bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2 active:scale-98 transition-transform"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <PackageCheck className="w-5 h-5" />
                  <span>Confirm Handover & Mark Delivered</span>
                </>
              )}
            </button>
          )}

          {currentStatus === "DELIVERED" && (
            <div className="p-4 rounded-2xl bg-emerald-50 text-emerald-800 text-center text-xs font-bold border border-emerald-200">
              Delivery Completed Successfully!
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
