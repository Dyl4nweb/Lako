"use client";

import React, { useState } from "react";
import { deleteCustomerAction, toggleUserStatusAction } from "@/server/actions/admin";
import {
  Users,
  Search,
  Trash2,
  CheckCircle,
  XCircle,
  Phone,
  Mail,
  ShoppingBag,
  Loader2,
  AlertTriangle,
  X,
  UserCheck,
  UserX,
} from "lucide-react";

export interface CustomerRecord {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  status: string;
  createdAt: Date;
  _count: {
    customerOrders: number;
  };
}

export function CustomerManagementView({
  initialCustomers,
}: {
  initialCustomers: CustomerRecord[];
}) {
  const [customers, setCustomers] = useState<CustomerRecord[]>(initialCustomers);
  const [searchQuery, setSearchQuery] = useState("");
  const [customerToDelete, setCustomerToDelete] = useState<CustomerRecord | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(
    null
  );

  const filteredCustomers = customers.filter((c) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      c.name.toLowerCase().includes(q) ||
      c.email.toLowerCase().includes(q) ||
      (c.phone && c.phone.includes(q))
    );
  });

  const handleToggleStatus = async (userId: string) => {
    setActionLoadingId(userId);
    setFeedback(null);

    const res = await toggleUserStatusAction(userId);
    setActionLoadingId(null);

    if (res.success && res.newStatus) {
      setCustomers((prev) =>
        prev.map((c) => (c.id === userId ? { ...c, status: res.newStatus! } : c))
      );
      setFeedback({
        type: "success",
        message: `Account status successfully updated to ${res.newStatus}.`,
      });
    } else {
      setFeedback({
        type: "error",
        message: res.error || "Failed to update account status.",
      });
    }
  };

  const handleConfirmDelete = async () => {
    if (!customerToDelete) return;
    setIsDeleting(true);
    setFeedback(null);

    const res = await deleteCustomerAction(customerToDelete.id);
    setIsDeleting(false);

    if (res.success) {
      setCustomers((prev) => prev.filter((c) => c.id !== customerToDelete.id));
      setFeedback({
        type: "success",
        message: res.message || `Customer ${customerToDelete.name} deleted successfully.`,
      });
      setCustomerToDelete(null);
    } else {
      setFeedback({
        type: "error",
        message: res.error || "Failed to delete customer.",
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header and stats */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-neutral-900 tracking-tight">
            Customer Directory
          </h1>
          <p className="text-xs text-neutral-500 mt-0.5">
            Manage registered marketplace customers, account statuses, and profiles
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-orange-50 text-orange-700 font-bold text-xs border border-orange-200/60">
            <Users className="w-3.5 h-3.5" />
            <span>{customers.length} Total Customers</span>
          </span>
        </div>
      </div>

      {/* Feedback Banner */}
      {feedback && (
        <div
          className={`flex items-center justify-between p-3.5 rounded-2xl text-xs font-semibold animate-in fade-in ${
            feedback.type === "success"
              ? "bg-emerald-50 text-emerald-800 border border-emerald-200/80"
              : "bg-red-50 text-red-800 border border-red-200/80"
          }`}
        >
          <div className="flex items-center gap-2">
            {feedback.type === "success" ? (
              <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <XCircle className="w-4 h-4 text-red-600 shrink-0" />
            )}
            <span>{feedback.message}</span>
          </div>
          <button
            onClick={() => setFeedback(null)}
            className="p-1 hover:opacity-70 transition-opacity"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Search Bar */}
      <div className="relative max-w-md">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search customer by name, email, or phone..."
          className="w-full bg-white text-neutral-900 placeholder-neutral-400 text-xs rounded-2xl pl-10 pr-4 py-2.5 border border-neutral-200/80 focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/20 transition-all shadow-2xs"
        />
      </div>

      {/* Customers Table */}
      <div className="bg-white rounded-3xl border border-neutral-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-neutral-50/80 border-b border-neutral-200 text-neutral-500 font-bold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3 px-4">Customer</th>
                <th className="py-3 px-4">Contact</th>
                <th className="py-3 px-4">Orders</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Registered Date</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {filteredCustomers.length > 0 ? (
                filteredCustomers.map((c) => (
                  <tr key={c.id} className="hover:bg-neutral-50/80 transition-colors">
                    {/* Customer Info */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-orange-100 text-orange-700 font-black flex items-center justify-center shrink-0 shadow-2xs">
                          {c.name ? c.name.charAt(0).toUpperCase() : "C"}
                        </div>
                        <div>
                          <p className="font-bold text-neutral-900">{c.name}</p>
                          <p className="text-[11px] text-neutral-500 flex items-center gap-1">
                            <Mail className="w-3 h-3 text-neutral-400" />
                            <span>{c.email}</span>
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Contact */}
                    <td className="py-3.5 px-4 font-medium text-neutral-700">
                      {c.phone ? (
                        <div className="flex items-center gap-1 text-[11px]">
                          <Phone className="w-3 h-3 text-neutral-400" />
                          <span>{c.phone}</span>
                        </div>
                      ) : (
                        <span className="text-neutral-400 italic text-[11px]">No phone</span>
                      )}
                    </td>

                    {/* Orders Placed */}
                    <td className="py-3.5 px-4 font-bold text-neutral-800">
                      <div className="flex items-center gap-1.5">
                        <ShoppingBag className="w-3.5 h-3.5 text-orange-600" />
                        <span>{c._count.customerOrders} orders</span>
                      </div>
                    </td>

                    {/* Status Badge */}
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          c.status === "ACTIVE"
                            ? "bg-emerald-100 text-emerald-800"
                            : "bg-neutral-100 text-neutral-600"
                        }`}
                      >
                        {c.status}
                      </span>
                    </td>

                    {/* Registered Date */}
                    <td className="py-3.5 px-4 text-neutral-500 text-[11px]">
                      {new Date(c.createdAt).toLocaleDateString("en-PH", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {/* Toggle Status Button */}
                        <button
                          onClick={() => handleToggleStatus(c.id)}
                          disabled={actionLoadingId === c.id}
                          title={c.status === "ACTIVE" ? "Deactivate Customer" : "Activate Customer"}
                          className="p-1.5 rounded-lg border border-neutral-200 text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 transition-colors disabled:opacity-50"
                        >
                          {actionLoadingId === c.id ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : c.status === "ACTIVE" ? (
                            <UserX className="w-3.5 h-3.5 text-amber-600" />
                          ) : (
                            <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
                          )}
                        </button>

                        {/* Delete Customer Button */}
                        <button
                          onClick={() => setCustomerToDelete(c)}
                          title="Delete Customer"
                          className="p-1.5 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-neutral-400">
                    <Users className="w-8 h-8 mx-auto mb-2 opacity-40" />
                    <p className="text-sm font-semibold">No customers found</p>
                    {searchQuery && (
                      <p className="text-xs text-neutral-400 mt-1">
                        Try adjusting your search query &quot;{searchQuery}&quot;
                      </p>
                    )}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {customerToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-neutral-200 space-y-5 animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
              <div className="flex items-center gap-2 text-red-600">
                <div className="w-8 h-8 rounded-xl bg-red-50 flex items-center justify-center">
                  <AlertTriangle className="w-4 h-4" />
                </div>
                <h3 className="text-base font-bold text-neutral-900">Delete Customer Account</h3>
              </div>
              <button
                onClick={() => setCustomerToDelete(null)}
                disabled={isDeleting}
                className="text-neutral-400 hover:text-neutral-600 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-neutral-600">
              <p>
                Are you sure you want to permanently delete this customer account?
              </p>

              <div className="p-3.5 rounded-2xl bg-neutral-50 border border-neutral-200/80 space-y-1">
                <p className="font-bold text-neutral-900 text-sm">{customerToDelete.name}</p>
                <p className="text-neutral-500">{customerToDelete.email}</p>
                {customerToDelete._count.customerOrders > 0 && (
                  <p className="text-[11px] font-semibold text-amber-700 pt-1">
                    ⚠️ Note: This customer has {customerToDelete._count.customerOrders} associated
                    order(s) which will also be cleaned up.
                  </p>
                )}
              </div>

              <p className="text-[11px] text-neutral-400 italic">
                This action is irreversible and immediately revokes all active login sessions for
                this customer.
              </p>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setCustomerToDelete(null)}
                disabled={isDeleting}
                className="px-4 py-2.5 rounded-xl border border-neutral-200 font-semibold text-xs text-neutral-700 hover:bg-neutral-50 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={isDeleting}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs shadow-md shadow-red-600/20 transition-all disabled:opacity-50"
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Deleting...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete Permanently</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
