"use client";

import React, { useState } from "react";
import Image from "next/image";
import { updateOrderStatus, assignRiderToOrder, recordCodPayment } from "@/server/actions/orders";
import { OrderStatus } from "@/types";
import {
  Search,
  Filter,
  CheckCircle,
  XCircle,
  Bike,
  Clock,
  MapPin,
  Banknote,
  Loader2,
  AlertCircle,
  ChevronRight,
  User,
} from "lucide-react";

interface RiderOption {
  id: string;
  name: string;
  phone: string | null;
}

interface OrderRecord {
  id: string;
  orderNumber: string;
  customerName: string;
  customerPhone: string;
  deliveryAddress: string;
  orderNotes: string | null;
  status: OrderStatus;
  paymentMethod: string;
  paymentCollectionStatus: string;
  subtotal: number;
  deliveryFee: number;
  total: number;
  createdAt: Date;
  assignedRiderId: string | null;
  assignedRider: {
    id: string;
    name: string;
    phone: string | null;
  } | null;
  items: {
    id: string;
    productName: string;
    productImage: string;
    unitPrice: number;
    quantity: number;
    lineTotal: number;
  }[];
}

interface OrderDispatchManagementViewProps {
  initialOrders: OrderRecord[];
  riders: RiderOption[];
}

export function OrderDispatchManagementView({
  initialOrders,
  riders,
}: OrderDispatchManagementViewProps) {
  const [orders, setOrders] = useState(initialOrders);
  const [filterStatus, setFilterStatus] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedOrder, setSelectedOrder] = useState<OrderRecord | null>(null);

  const [loadingOrderId, setLoadingOrderId] = useState<string | null>(null);
  const [assigningRiderId, setAssigningRiderId] = useState<Record<string, string>>({});
  const [actionError, setActionError] = useState<string | null>(null);

  const filteredOrders = orders.filter((o) => {
    if (filterStatus !== "ALL" && o.status !== filterStatus) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        o.orderNumber.toLowerCase().includes(q) ||
        o.customerName.toLowerCase().includes(q) ||
        o.customerPhone.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleConfirmOrder = async (orderId: string) => {
    setLoadingOrderId(orderId);
    setActionError(null);

    const res = await updateOrderStatus({
      orderId,
      targetStatus: "CONFIRMED",
      note: "Confirmed by admin. Ready for rider assignment.",
    });

    if (!res.success) {
      setActionError(res.error || "Failed to confirm order.");
    } else {
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status: "CONFIRMED" } : o))
      );
      if (selectedOrder?.id === orderId) {
        setSelectedOrder((prev) => (prev ? { ...prev, status: "CONFIRMED" } : null));
      }
    }
    setLoadingOrderId(null);
  };

  const handleAssignRider = async (orderId: string) => {
    const riderId = assigningRiderId[orderId];
    if (!riderId) {
      alert("Please select a rider to assign.");
      return;
    }

    setLoadingOrderId(orderId);
    setActionError(null);

    const res = await assignRiderToOrder(orderId, riderId);
    if (!res.success) {
      setActionError(res.error || "Failed to assign rider.");
    } else {
      const riderObj = riders.find((r) => r.id === riderId) || null;
      setOrders((prev) =>
        prev.map((o) =>
          o.id === orderId
            ? {
                ...o,
                status: "ASSIGNED",
                assignedRiderId: riderId,
                assignedRider: riderObj,
              }
            : o
        )
      );
      if (selectedOrder?.id === orderId) {
        setSelectedOrder((prev) =>
          prev
            ? {
                ...prev,
                status: "ASSIGNED",
                assignedRiderId: riderId,
                assignedRider: riderObj,
              }
            : null
        );
      }
    }
    setLoadingOrderId(null);
  };

  const handleCancelOrder = async (orderId: string) => {
    if (!confirm("Are you sure you want to cancel this order? Stock will be restored to store inventory.")) {
      return;
    }

    setLoadingOrderId(orderId);
    setActionError(null);

    const res = await updateOrderStatus({
      orderId,
      targetStatus: "CANCELLED",
      note: "Cancelled by Administrator.",
    });

    if (!res.success) {
      setActionError(res.error || "Failed to cancel order.");
    } else {
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, status: "CANCELLED" } : o))
      );
      if (selectedOrder?.id === orderId) {
        setSelectedOrder((prev) => (prev ? { ...prev, status: "CANCELLED" } : null));
      }
    }
    setLoadingOrderId(null);
  };

  const handleToggleCod = async (orderId: string, currentStatus: string) => {
    const isCollected = currentStatus !== "COLLECTED";
    setLoadingOrderId(orderId);

    const res = await recordCodPayment(orderId, isCollected);
    if (res.success) {
      const nextVal = isCollected ? "COLLECTED" : "UNCOLLECTED";
      setOrders((prev) =>
        prev.map((o) => (o.id === orderId ? { ...o, paymentCollectionStatus: nextVal } : o))
      );
      if (selectedOrder?.id === orderId) {
        setSelectedOrder((prev) => (prev ? { ...prev, paymentCollectionStatus: nextVal } : null));
      }
    }
    setLoadingOrderId(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-neutral-900 tracking-tight">
            Order Dispatch Center
          </h1>
          <p className="text-xs text-neutral-500 mt-0.5">
            Monitor incoming orders, assign available delivery riders, and reconcile COD collections
          </p>
        </div>
      </div>

      {actionError && (
        <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-900 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
          <span>{actionError}</span>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between bg-white p-4 rounded-3xl border border-neutral-200/80 shadow-xs">
        <div className="relative flex-1 max-w-md">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search order #, customer name, or phone..."
            className="w-full bg-neutral-50 rounded-xl pl-9 pr-4 py-2 text-xs border border-neutral-200 focus:bg-white focus:border-orange-500 focus:outline-none"
          />
          <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
        </div>

        {/* Status Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto text-xs font-bold scrollbar-none">
          {["ALL", "PENDING", "CONFIRMED", "ASSIGNED", "PICKED_UP", "ON_THE_WAY", "DELIVERED", "CANCELLED"].map(
            (st) => (
              <button
                key={st}
                onClick={() => setFilterStatus(st)}
                className={`px-3 py-1.5 rounded-xl whitespace-nowrap transition-colors ${
                  filterStatus === st
                    ? "bg-neutral-900 text-white"
                    : "bg-neutral-100 text-neutral-600 hover:bg-neutral-200"
                }`}
              >
                {st.replace(/_/g, " ")}
              </button>
            )
          )}
        </div>
      </div>

      {/* Orders List */}
      <div className="bg-white rounded-3xl border border-neutral-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-neutral-50/80 border-b border-neutral-200 text-neutral-500 font-bold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3 px-4">Order Details</th>
                <th className="py-3 px-4">Customer</th>
                <th className="py-3 px-4">Items</th>
                <th className="py-3 px-4">COD Total</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Rider</th>
                <th className="py-3 px-4 text-right">Dispatch Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {filteredOrders.map((ord) => {
                const isLoading = loadingOrderId === ord.id;

                return (
                  <tr key={ord.id} className="hover:bg-neutral-50/80 transition-colors">
                    <td className="py-3.5 px-4">
                      <div>
                        <span className="font-bold text-neutral-900">{ord.orderNumber}</span>
                        <p className="text-[10px] text-neutral-400">
                          {new Date(ord.createdAt).toLocaleString("en-PH")}
                        </p>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <div>
                        <p className="font-bold text-neutral-800">{ord.customerName}</p>
                        <p className="text-[11px] text-neutral-500">{ord.customerPhone}</p>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 font-bold text-neutral-700">
                      {ord.items.length} item{ord.items.length === 1 ? "" : "s"}
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="space-y-0.5">
                        <span className="font-black text-orange-600">₱{ord.total.toFixed(2)}</span>
                        <div>
                          <button
                            onClick={() => handleToggleCod(ord.id, ord.paymentCollectionStatus)}
                            className={`text-[9px] uppercase font-bold px-2 py-0.5 rounded-md ${
                              ord.paymentCollectionStatus === "COLLECTED"
                                ? "bg-emerald-100 text-emerald-800"
                                : "bg-amber-100 text-amber-800"
                            }`}
                          >
                            {ord.paymentCollectionStatus}
                          </button>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-neutral-100 text-neutral-800">
                        {ord.status}
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      {ord.assignedRider ? (
                        <div className="flex items-center gap-1.5 text-blue-800 font-bold">
                          <Bike className="w-3.5 h-3.5 shrink-0" />
                          <span>{ord.assignedRider.name}</span>
                        </div>
                      ) : (
                        <span className="text-neutral-400 italic">Unassigned</span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {/* 1. Pending -> Confirm */}
                        {ord.status === "PENDING" && (
                          <button
                            onClick={() => handleConfirmOrder(ord.id)}
                            disabled={isLoading}
                            className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold flex items-center gap-1 shadow-xs"
                          >
                            {isLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle className="w-3.5 h-3.5" />}
                            <span>Confirm</span>
                          </button>
                        )}

                        {/* 2. Confirmed or Assigned -> Assign/Reassign Rider */}
                        {(ord.status === "CONFIRMED" || ord.status === "ASSIGNED") && (
                          <div className="flex items-center gap-1">
                            <select
                              value={assigningRiderId[ord.id] || ord.assignedRiderId || ""}
                              onChange={(e) =>
                                setAssigningRiderId((prev) => ({
                                  ...prev,
                                  [ord.id]: e.target.value,
                                }))
                              }
                              className="bg-neutral-50 rounded-xl px-2 py-1.5 border border-neutral-200 text-xs font-medium"
                            >
                              <option value="">Choose Rider...</option>
                              {riders.map((r) => (
                                <option key={r.id} value={r.id}>
                                  {r.name}
                                </option>
                              ))}
                            </select>
                            <button
                              onClick={() => handleAssignRider(ord.id)}
                              disabled={isLoading}
                              className="px-2.5 py-1.5 bg-orange-600 hover:bg-orange-700 text-white rounded-xl font-bold text-xs shadow-xs"
                            >
                              Assign
                            </button>
                          </div>
                        )}

                        {/* Cancel button if not delivered/cancelled */}
                        {ord.status !== "DELIVERED" && ord.status !== "CANCELLED" && (
                          <button
                            onClick={() => handleCancelOrder(ord.id)}
                            disabled={isLoading}
                            className="p-1.5 text-neutral-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Cancel Order"
                          >
                            <XCircle className="w-4 h-4" />
                          </button>
                        )}

                        {/* View Drawer */}
                        <button
                          onClick={() => setSelectedOrder(ord)}
                          className="p-1.5 rounded-lg text-neutral-600 hover:bg-neutral-100"
                          title="View Details"
                        >
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-neutral-200 space-y-5 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
              <div>
                <h3 className="text-base font-black text-neutral-900">
                  Order #{selectedOrder.orderNumber}
                </h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-orange-100 text-orange-800">
                  {selectedOrder.status}
                </span>
              </div>
              <button onClick={() => setSelectedOrder(null)} className="p-1 text-neutral-400">
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            {/* Customer & Address */}
            <div className="space-y-2 text-xs bg-neutral-50 p-4 rounded-2xl border border-neutral-100">
              <div className="flex items-center justify-between">
                <span className="font-bold text-neutral-900">{selectedOrder.customerName}</span>
                <span className="text-neutral-500">{selectedOrder.customerPhone}</span>
              </div>
              <p className="text-neutral-700 leading-relaxed">{selectedOrder.deliveryAddress}</p>
              {selectedOrder.orderNotes && (
                <p className="text-neutral-500 italic mt-1">Note: {selectedOrder.orderNotes}</p>
              )}
            </div>

            {/* Items */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-400">
                Purchased Items ({selectedOrder.items.length})
              </h4>
              <div className="divide-y divide-neutral-100 text-xs">
                {selectedOrder.items.map((it) => (
                  <div key={it.id} className="py-2.5 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <div style={{ position: "relative" }} className="relative w-10 h-10 rounded-lg overflow-hidden bg-neutral-100 shrink-0">
                        <Image
                          src={it.productImage}
                          alt={it.productName}
                          fill
                          sizes="40px"
                          className="object-cover"
                        />
                      </div>
                      <div>
                        <p className="font-bold text-neutral-900">{it.productName}</p>
                        <p className="text-[11px] text-neutral-500">
                          {it.quantity} × ₱{it.unitPrice.toFixed(2)}
                        </p>
                      </div>
                    </div>
                    <span className="font-bold text-neutral-900">₱{it.lineTotal.toFixed(2)}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Financial summary */}
            <div className="pt-3 border-t border-neutral-100 space-y-1.5 text-xs">
              <div className="flex items-center justify-between text-neutral-600">
                <span>Subtotal</span>
                <span>₱{selectedOrder.subtotal.toFixed(2)}</span>
              </div>
              <div className="flex items-center justify-between text-neutral-600">
                <span>Delivery Fee</span>
                <span>₱{selectedOrder.deliveryFee.toFixed(2)}</span>
              </div>
              <div className="pt-2 border-t border-neutral-100 flex items-center justify-between text-sm font-black">
                <span>Total Amount Due (COD)</span>
                <span className="text-orange-600">₱{selectedOrder.total.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
