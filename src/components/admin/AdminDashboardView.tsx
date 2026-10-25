"use client";

import React, { useState, useTransition } from "react";
import { formatPHP, formatDate } from "@/lib/utils";
import { assignRiderToOrderAction } from "@/server/actions/admin";
import {
  logOperatingExpenseAction,
  reconcileRiderCashAction,
  disburseMerchantPayoutAction,
} from "@/server/actions/finances";
import {
  ShieldCheck,
  TrendingUp,
  Percent,
  Wallet,
  Bike,
  Store,
  Layers,
  DollarSign,
  Plus,
  ArrowRight,
  CheckCircle2,
  Clock,
  MapPin,
  FileText,
  AlertCircle,
  Receipt,
  UserCheck,
} from "lucide-react";

export function AdminDashboardView({
  kpis,
  orders,
  riders,
  stores,
  ledgerEntries,
  expenses,
  session,
}: {
  kpis: {
    gmv: number;
    platformRevenue: number;
    cashInTransit: number;
    merchantPayablesVault: number;
    activeOrdersCount: number;
    totalOrdersCount: number;
  };
  orders: any[];
  riders: any[];
  stores: any[];
  ledgerEntries: any[];
  expenses: any[];
  session: any;
}) {
  const [activeTab, setActiveTab] = useState<"dispatch" | "ledger" | "expenses" | "roster">("dispatch");
  const [isPending, startTransition] = useTransition();

  // Rider assignment state
  const [selectedRiderForOrder, setSelectedRiderForOrder] = useState<Record<string, string>>({});

  // Expense modal state
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [expCategory, setExpCategory] = useState("MARKETING");
  const [expAmount, setExpAmount] = useState("");
  const [expDesc, setExpDesc] = useState("");

  // Cash remittance modal state
  const [selectedRiderToRemit, setSelectedRiderToRemit] = useState<any>(null);
  const [remitAmount, setRemitAmount] = useState("");

  // Merchant payout modal state
  const [selectedStoreToPay, setSelectedStoreToPay] = useState<any>(null);
  const [payAmount, setPayAmount] = useState("");

  // Orders needing dispatch
  const readyOrders = orders.filter((o) => o.status === "READY_FOR_PICKUP");
  const unassignedOrders = orders.filter((o) => !o.riderId && o.status !== "DELIVERED" && o.status !== "CANCELLED_BY_CUSTOMER");

  const totalDebits = ledgerEntries.reduce((sum, e) => sum + e.debit, 0);
  const totalCredits = ledgerEntries.reduce((sum, e) => sum + e.credit, 0);
  const isLedgerBalanced = Math.abs(totalDebits - totalCredits) < 0.05;

  const handleAssignRider = (orderId: string) => {
    const riderProfileId = selectedRiderForOrder[orderId];
    if (!riderProfileId) {
      alert("Please select a courier to assign.");
      return;
    }

    startTransition(async () => {
      await assignRiderToOrderAction(orderId, riderProfileId);
    });
  };

  const handleCreateExpense = (e: React.FormEvent) => {
    e.preventDefault();
    const amt = parseFloat(expAmount);
    if (isNaN(amt) || amt <= 0 || !expDesc.trim()) return;

    startTransition(async () => {
      await logOperatingExpenseAction({
        category: expCategory,
        amount: amt,
        description: expDesc,
      });
      setIsExpenseModalOpen(false);
      setExpAmount("");
      setExpDesc("");
    });
  };

  const handleExecuteRemittance = () => {
    if (!selectedRiderToRemit) return;
    const amt = parseFloat(remitAmount);
    if (isNaN(amt) || amt <= 0) return;

    startTransition(async () => {
      await reconcileRiderCashAction(selectedRiderToRemit.id, amt);
      setSelectedRiderToRemit(null);
      setRemitAmount("");
    });
  };

  const handleExecuteMerchantPayout = () => {
    if (!selectedStoreToPay) return;
    const amt = parseFloat(payAmount);
    if (isNaN(amt) || amt <= 0) return;

    startTransition(async () => {
      await disburseMerchantPayoutAction(selectedStoreToPay.id, amt);
      setSelectedStoreToPay(null);
      setPayAmount("");
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold text-slate-deep font-outfit">
              Operations Command & Financial Ledger
            </h1>
            <span className="text-[10px] font-mono bg-blue-100 text-blue-800 font-bold px-2 py-0.5 rounded-full">
              Shared Executive Surface
            </span>
          </div>
          <p className="text-xs text-zinc-500 mt-0.5">
            Real-time Lingayen delivery logistics and double-entry accounting ledger
          </p>
        </div>

        <button
          onClick={() => setIsExpenseModalOpen(true)}
          className="px-4 py-2 rounded-xl bg-slate-deep text-white text-xs font-bold hover:bg-slate-800 transition flex items-center gap-1.5 shadow-sm"
        >
          <Plus className="w-4 h-4 text-movli" />
          <span>Log Operating Expense</span>
        </button>
      </div>

      {/* Overview KPI Deck (Section 9.1 of Master Plan) */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Gross Merchandise Value */}
        <div className="bg-white rounded-2xl p-4 border border-zinc-200 shadow-sm space-y-1">
          <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider flex items-center justify-between">
            <span>Gross GMV</span>
            <TrendingUp className="w-3.5 h-3.5 text-blue-500" />
          </div>
          <div className="text-xl font-extrabold text-slate-deep">
            {formatPHP(kpis.gmv)}
          </div>
          <div className="text-[10px] text-zinc-500">
            {kpis.totalOrdersCount} lifetime orders
          </div>
        </div>

        {/* Platform Net Revenue */}
        <div className="bg-white rounded-2xl p-4 border border-zinc-200 shadow-sm space-y-1">
          <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider flex items-center justify-between">
            <span>Net Revenue</span>
            <DollarSign className="w-3.5 h-3.5 text-movli" />
          </div>
          <div className="text-xl font-extrabold text-movli">
            {formatPHP(kpis.platformRevenue)}
          </div>
          <div className="text-[10px] text-zinc-500">
            5% Comm + ₱10 Delivery Margin
          </div>
        </div>

        {/* Cash in Transit (Rider Pockets) */}
        <div className="bg-white rounded-2xl p-4 border border-zinc-200 shadow-sm space-y-1">
          <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider flex items-center justify-between">
            <span>Cash in Transit</span>
            <Bike className="w-3.5 h-3.5 text-amber-500" />
          </div>
          <div className="text-xl font-extrabold text-amber-600">
            {formatPHP(kpis.cashInTransit)}
          </div>
          <div className="text-[10px] text-zinc-500">
            In courier pockets (unremitted)
          </div>
        </div>

        {/* Merchant Payables Vault */}
        <div className="bg-white rounded-2xl p-4 border border-zinc-200 shadow-sm space-y-1">
          <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider flex items-center justify-between">
            <span>Merchant Payables</span>
            <Store className="w-3.5 h-3.5 text-emerald-500" />
          </div>
          <div className="text-xl font-extrabold text-emerald-600">
            {formatPHP(kpis.merchantPayablesVault)}
          </div>
          <div className="text-[10px] text-zinc-500">
            Owed to 10 verified stores
          </div>
        </div>

        {/* Active Pipeline */}
        <div className="bg-white rounded-2xl p-4 border border-zinc-200 shadow-sm space-y-1 col-span-2 lg:col-span-1">
          <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider flex items-center justify-between">
            <span>Active Pipeline</span>
            <Clock className="w-3.5 h-3.5 text-purple-500" />
          </div>
          <div className="text-xl font-extrabold text-purple-600">
            {kpis.activeOrdersCount} Runs
          </div>
          <div className="text-[10px] text-zinc-500">
            Live orders in fulfillment
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-zinc-200 pb-2 overflow-x-auto no-scrollbar">
        <button
          onClick={() => setActiveTab("dispatch")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === "dispatch"
              ? "bg-movli text-white shadow-md shadow-movli/20"
              : "bg-white text-zinc-600 border border-zinc-200 hover:bg-zinc-50"
          }`}
        >
          <Bike className="w-4 h-4" />
          <span>Dispatch Management</span>
          {readyOrders.length > 0 && (
            <span className="bg-white text-movli text-[10px] font-black px-1.5 py-0.2 rounded-full">
              {readyOrders.length}
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab("ledger")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === "ledger"
              ? "bg-movli text-white shadow-md shadow-movli/20"
              : "bg-white text-zinc-600 border border-zinc-200 hover:bg-zinc-50"
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Double-Entry Ledger</span>
          {isLedgerBalanced && (
            <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-1.5 py-0.2 rounded-full">
              Balanced
            </span>
          )}
        </button>

        <button
          onClick={() => setActiveTab("expenses")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === "expenses"
              ? "bg-movli text-white shadow-md shadow-movli/20"
              : "bg-white text-zinc-600 border border-zinc-200 hover:bg-zinc-50"
          }`}
        >
          <Receipt className="w-4 h-4" />
          <span>Expenses & Budgets</span>
        </button>

        <button
          onClick={() => setActiveTab("roster")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 whitespace-nowrap ${
            activeTab === "roster"
              ? "bg-movli text-white shadow-md shadow-movli/20"
              : "bg-white text-zinc-600 border border-zinc-200 hover:bg-zinc-50"
          }`}
        >
          <UserCheck className="w-4 h-4" />
          <span>Rider & Merchant Roster</span>
        </button>
      </div>

      {/* Tab 1: Dispatch Management Console */}
      {activeTab === "dispatch" && (
        <div className="space-y-4">
          <div className="bg-white rounded-3xl p-6 border border-zinc-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
              <div>
                <h2 className="font-bold text-slate-deep text-sm">
                  Courier Dispatch Board
                </h2>
                <p className="text-xs text-zinc-500">
                  Assign on-duty Lingayen couriers to packed orders ready for delivery.
                </p>
              </div>
            </div>

            <div className="divide-y divide-zinc-100">
              {orders
                .filter(
                  (o) =>
                    o.status === "READY_FOR_PICKUP" ||
                    o.status === "ASSIGNED" ||
                    o.status === "PREPARING"
                )
                .map((order) => {
                  let addr: any = {};
                  try {
                    addr = JSON.parse(order.deliveryAddressJson);
                  } catch (e) {}

                  return (
                    <div
                      key={order.id}
                      className="py-4 flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-slate-deep">
                            #{order.orderNumber}
                          </span>
                          <span
                            className={`px-2 py-0.5 rounded font-bold text-[10px] ${
                              order.status === "READY_FOR_PICKUP"
                                ? "bg-amber-100 text-amber-800 animate-pulse"
                                : "bg-blue-100 text-blue-800"
                            }`}
                          >
                            {order.status}
                          </span>
                        </div>
                        <div className="text-zinc-600">
                          <strong>Store:</strong> {order.store.name} (Brgy. {order.store.barangay})
                        </div>
                        <div className="text-zinc-600">
                          <strong>Customer:</strong> {order.customer.fullName} · Destination: Brgy. {addr.barangay} ({addr.landmark})
                        </div>
                        <div className="text-zinc-400 text-[11px]">
                          COD Total: <strong className="text-slate-deep">{formatPHP(order.totalAmount)}</strong>
                        </div>
                      </div>

                      {/* Dispatch Actions */}
                      <div className="flex items-center gap-2">
                        {order.rider ? (
                          <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center gap-2">
                            <Bike className="w-4 h-4 text-emerald-600" />
                            <div>
                              <div className="font-bold">{order.rider.user.fullName}</div>
                              <div className="text-[10px]">{order.rider.plateNumber}</div>
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <select
                              value={selectedRiderForOrder[order.id] || ""}
                              onChange={(e) =>
                                setSelectedRiderForOrder((prev) => ({
                                  ...prev,
                                  [order.id]: e.target.value,
                                }))
                              }
                              className="px-3 py-2 rounded-xl border border-zinc-200 bg-white text-xs text-slate-deep font-medium"
                            >
                              <option value="">Select On-Duty Courier...</option>
                              {riders.map((r) => (
                                <option key={r.id} value={r.id}>
                                  {r.user.fullName} ({r.vehicleType} - {r.plateNumber}) {r.isAvailable ? "🟢 On Duty" : "⚪ Off"}
                                </option>
                              ))}
                            </select>

                            <button
                              onClick={() => handleAssignRider(order.id)}
                              disabled={isPending || !selectedRiderForOrder[order.id]}
                              className="px-4 py-2 rounded-xl bg-movli text-white text-xs font-bold hover:bg-movli-600 transition shadow-sm disabled:opacity-50"
                            >
                              Assign Run
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Double-Entry Financial Ledger */}
      {activeTab === "ledger" && (
        <div className="space-y-4">
          <div className="bg-white rounded-3xl p-6 border border-zinc-200 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-zinc-100 pb-3">
              <div>
                <h2 className="font-bold text-slate-deep text-sm flex items-center gap-2">
                  <FileText className="w-4 h-4 text-movli" />
                  General Financial Journal (Append-Only Double-Entry)
                </h2>
                <p className="text-xs text-zinc-500">
                  Every order delivery and settlement records balanced debits and credits.
                </p>
              </div>

              <div className="flex items-center gap-3 text-xs">
                <div className="bg-zinc-50 border border-zinc-200 px-3 py-1.5 rounded-xl">
                  Total DR: <strong className="font-mono text-slate-deep">{formatPHP(totalDebits)}</strong>
                </div>
                <div className="bg-zinc-50 border border-zinc-200 px-3 py-1.5 rounded-xl">
                  Total CR: <strong className="font-mono text-slate-deep">{formatPHP(totalCredits)}</strong>
                </div>
                <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-1 rounded-full">
                  Balanced
                </span>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-zinc-200 text-zinc-400 uppercase text-[10px] font-bold tracking-wider">
                    <th className="py-2.5">Date</th>
                    <th className="py-2.5">Account Code</th>
                    <th className="py-2.5">Description</th>
                    <th className="py-2.5">Related Order</th>
                    <th className="py-2.5 text-right">Debit (DR)</th>
                    <th className="py-2.5 text-right">Credit (CR)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 font-mono">
                  {ledgerEntries.map((entry) => (
                    <tr key={entry.id} className="hover:bg-zinc-50 transition">
                      <td className="py-2.5 text-zinc-500 font-sans">
                        {formatDate(entry.createdAt)}
                      </td>
                      <td className="py-2.5 font-bold text-movli">
                        {entry.accountCode}
                      </td>
                      <td className="py-2.5 font-sans text-slate-deep max-w-xs truncate">
                        {entry.description}
                      </td>
                      <td className="py-2.5 text-zinc-500">
                        {entry.order?.orderNumber ? `#${entry.order.orderNumber}` : "—"}
                      </td>
                      <td className="py-2.5 text-right font-bold text-slate-deep">
                        {entry.debit > 0 ? formatPHP(entry.debit) : "—"}
                      </td>
                      <td className="py-2.5 text-right font-bold text-slate-deep">
                        {entry.credit > 0 ? formatPHP(entry.credit) : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Operating Expenses & Budgets */}
      {activeTab === "expenses" && (
        <div className="space-y-4">
          <div className="bg-white rounded-3xl p-6 border border-zinc-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
              <div>
                <h2 className="font-bold text-slate-deep text-sm">
                  Recorded Operating Expenses
                </h2>
                <p className="text-xs text-zinc-500">
                  Track platform overhead, marketing collateral, and fleet gear disbursements.
                </p>
              </div>

              <button
                onClick={() => setIsExpenseModalOpen(true)}
                className="px-3.5 py-1.5 rounded-xl bg-movli text-white text-xs font-bold hover:bg-movli-600 transition shadow-sm"
              >
                + Log Expense
              </button>
            </div>

            <div className="divide-y divide-zinc-100">
              {expenses.map((exp) => (
                <div key={exp.id} className="py-3 flex items-center justify-between text-xs">
                  <div>
                    <div className="font-bold text-slate-deep">{exp.description}</div>
                    <div className="text-zinc-400 text-[11px] flex items-center gap-2 mt-0.5">
                      <span className="font-mono bg-zinc-100 px-1.5 py-0.2 rounded text-zinc-600">
                        {exp.category}
                      </span>
                      <span>{formatDate(exp.createdAt)}</span>
                    </div>
                  </div>
                  <div className="font-extrabold text-red-600 text-sm">
                    -{formatPHP(exp.amount)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: Rider & Merchant Roster & Cash Remittances */}
      {activeTab === "roster" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Riders Roster & COD Remittance */}
          <div className="bg-white rounded-3xl p-6 border border-zinc-200 shadow-sm space-y-4">
            <h2 className="font-bold text-slate-deep text-sm flex items-center gap-2 border-b border-zinc-100 pb-3">
              <Bike className="w-4 h-4 text-emerald-500" />
              Lingayen Courier Fleet & Cash Remittances
            </h2>

            <div className="divide-y divide-zinc-100 space-y-2">
              {riders.map((r) => (
                <div key={r.id} className="pt-2 first:pt-0 flex items-center justify-between text-xs">
                  <div>
                    <div className="font-bold text-slate-deep flex items-center gap-1.5">
                      {r.user.fullName}
                      <span className={`w-2 h-2 rounded-full ${r.isAvailable ? "bg-emerald-500" : "bg-zinc-400"}`} />
                    </div>
                    <div className="text-[11px] text-zinc-400 font-mono">
                      {r.vehicleType} · {r.plateNumber}
                    </div>
                    <div className="text-[11px] text-amber-700 font-semibold mt-0.5">
                      Cash in Bag: {formatPHP(r.currentCashOnHand)}
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      setSelectedRiderToRemit(r);
                      setRemitAmount(r.currentCashOnHand.toFixed(2));
                    }}
                    disabled={r.currentCashOnHand <= 0}
                    className="px-3 py-1.5 rounded-xl border border-zinc-200 hover:border-emerald-500 hover:bg-emerald-50 text-slate-deep font-bold text-xs transition disabled:opacity-40"
                  >
                    Remit Cash
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Merchants Roster & Settlements */}
          <div className="bg-white rounded-3xl p-6 border border-zinc-200 shadow-sm space-y-4">
            <h2 className="font-bold text-slate-deep text-sm flex items-center gap-2 border-b border-zinc-100 pb-3">
              <Store className="w-4 h-4 text-movli" />
              Verified Merchants Roster
            </h2>

            <div className="divide-y divide-zinc-100 space-y-2">
              {stores.map((s) => (
                <div key={s.id} className="pt-2 first:pt-0 flex items-center justify-between text-xs">
                  <div>
                    <div className="font-bold text-slate-deep flex items-center gap-1.5">
                      {s.name}
                      <span className={`w-2 h-2 rounded-full ${s.isOpen ? "bg-emerald-500" : "bg-zinc-400"}`} />
                    </div>
                    <div className="text-[11px] text-zinc-400">
                      Brgy. {s.barangay} · {s.products.length} catalog items
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      setSelectedStoreToPay(s);
                      setPayAmount("300.00");
                    }}
                    className="px-3 py-1.5 rounded-xl border border-zinc-200 hover:border-blue-500 hover:bg-blue-50 text-slate-deep font-bold text-xs transition"
                  >
                    Disburse Payout
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Log Expense Modal */}
      {isExpenseModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <form
            onSubmit={handleCreateExpense}
            className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-zinc-200 space-y-4"
          >
            <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
              <h3 className="font-bold text-slate-deep text-base">
                Log Operating Expense
              </h3>
              <button
                type="button"
                onClick={() => setIsExpenseModalOpen(false)}
                className="text-zinc-400 hover:text-slate-deep"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-zinc-600 mb-1">Category</label>
                <select
                  value={expCategory}
                  onChange={(e) => setExpCategory(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-zinc-200 bg-white"
                >
                  <option value="MARKETING">Marketing & Flyers (Lingayen Promotion)</option>
                  <option value="SUPPLIES">Rider Gear & Insulated Thermal Bags</option>
                  <option value="INFRASTRUCTURE">Tech, Cloud Hosting & Servers</option>
                  <option value="SPOILAGE">Order Loss / Spoiled Food Settlement</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-zinc-600 mb-1">Amount (PHP)</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={expAmount}
                  onChange={(e) => setExpAmount(e.target.value)}
                  placeholder="0.00"
                  className="w-full px-3 py-2 rounded-xl border border-zinc-200 font-mono font-bold text-slate-deep"
                />
              </div>

              <div>
                <label className="block font-bold text-zinc-600 mb-1">Description / Purpose</label>
                <textarea
                  required
                  rows={2}
                  value={expDesc}
                  onChange={(e) => setExpDesc(e.target.value)}
                  placeholder="e.g. Printed 2,000 launch brochures for Baywalk & Capitol"
                  className="w-full px-3 py-2 rounded-xl border border-zinc-200"
                />
              </div>
            </div>

            <div className="pt-2 flex gap-2">
              <button
                type="button"
                onClick={() => setIsExpenseModalOpen(false)}
                className="flex-1 py-2.5 rounded-xl border border-zinc-200 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isPending}
                className="flex-1 py-2.5 rounded-xl bg-movli text-white text-xs font-bold hover:bg-movli-600 transition shadow-sm"
              >
                Record Expense
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Reconcile Rider Cash Modal */}
      {selectedRiderToRemit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-zinc-200 space-y-4">
            <h3 className="font-bold text-slate-deep text-base">
              Reconcile Rider Cash Remittance
            </h3>
            <p className="text-xs text-zinc-500">
              Clear COD cash bag from courier <strong>{selectedRiderToRemit.user.fullName}</strong> into the Platform Vault.
            </p>

            <div className="space-y-2 text-xs">
              <div>
                <label className="block font-bold text-zinc-600 mb-1">Remittance Amount (PHP)</label>
                <input
                  type="number"
                  step="0.01"
                  value={remitAmount}
                  onChange={(e) => setRemitAmount(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-zinc-200 font-mono font-bold text-base text-slate-deep"
                />
              </div>
            </div>

            <div className="pt-2 flex gap-2">
              <button
                type="button"
                onClick={() => setSelectedRiderToRemit(null)}
                className="flex-1 py-2.5 rounded-xl border border-zinc-200 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleExecuteRemittance}
                disabled={isPending}
                className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition shadow-sm"
              >
                Confirm Remittance
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Merchant Payout Modal */}
      {selectedStoreToPay && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-zinc-200 space-y-4">
            <h3 className="font-bold text-slate-deep text-base">
              Disburse Merchant Settlement
            </h3>
            <p className="text-xs text-zinc-500">
              Execute payout to store <strong>{selectedStoreToPay.name}</strong> via Bank / GCash settlement.
            </p>

            <div className="space-y-2 text-xs">
              <div>
                <label className="block font-bold text-zinc-600 mb-1">Payout Amount (PHP)</label>
                <input
                  type="number"
                  step="0.01"
                  value={payAmount}
                  onChange={(e) => setPayAmount(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-zinc-200 font-mono font-bold text-base text-slate-deep"
                />
              </div>
            </div>

            <div className="pt-2 flex gap-2">
              <button
                type="button"
                onClick={() => setSelectedStoreToPay(null)}
                className="flex-1 py-2.5 rounded-xl border border-zinc-200 text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleExecuteMerchantPayout}
                disabled={isPending}
                className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition shadow-sm"
              >
                Disburse Payout
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
