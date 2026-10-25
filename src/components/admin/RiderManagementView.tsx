"use client";

import React, { useState } from "react";
import { createRiderAction, toggleUserStatusAction } from "@/server/actions/admin";
import {
  Bike,
  Plus,
  CheckCircle,
  XCircle,
  Phone,
  Mail,
  Loader2,
  AlertCircle,
  X,
  PackageCheck,
  UserX,
  UserCheck,
} from "lucide-react";

interface RiderRecord {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  status: string;
  createdAt: Date;
  _count: {
    riderOrders: number;
  };
}

export function RiderManagementView({
  initialRiders,
}: {
  initialRiders: RiderRecord[];
}) {
  const [riders, setRiders] = useState(initialRiders);
  const [modalOpen, setModalOpen] = useState(false);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("RiderPass123!");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleCreateRider = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccessMsg(null);

    const res = await createRiderAction({
      name,
      email,
      phone,
      password,
    });

    if (!res.success) {
      setError(res.error || "Failed to create rider.");
      setLoading(false);
    } else {
      setSuccessMsg(res.message || "Rider registered successfully!");
      setRiders((prev) => [
        {
          id: `rider-${Date.now()}`,
          name,
          email,
          phone,
          status: "ACTIVE",
          createdAt: new Date(),
          _count: { riderOrders: 0 },
        },
        ...prev,
      ]);
      setTimeout(() => {
        setModalOpen(false);
        setSuccessMsg(null);
        setName("");
        setEmail("");
        setPhone("");
      }, 900);
      setLoading(false);
    }
  };

  const handleToggleStatus = async (userId: string) => {
    const res = await toggleUserStatusAction(userId);
    if (res.success && res.newStatus) {
      setRiders((prev) =>
        prev.map((r) => (r.id === userId ? { ...r, status: res.newStatus } : r))
      );
    } else {
      alert(res.error || "Failed to update rider status.");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-neutral-900 tracking-tight">
            Delivery Fleet Management
          </h1>
          <p className="text-xs text-neutral-500 mt-0.5">
            Register and manage local motorcycle delivery riders and their dispatch performance
          </p>
        </div>

        <button
          onClick={() => {
            setError(null);
            setModalOpen(true);
          }}
          className="inline-flex items-center gap-2 bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-xs transition-colors self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Register New Rider</span>
        </button>
      </div>

      {/* Riders Table */}
      <div className="bg-white rounded-3xl border border-neutral-200/80 shadow-xs overflow-hidden">
        <table className="w-full text-left text-xs">
          <thead className="bg-neutral-50/80 border-b border-neutral-200 text-neutral-500 font-bold uppercase tracking-wider text-[10px]">
            <tr>
              <th className="py-3 px-4">Rider Details</th>
              <th className="py-3 px-4">Contact Phone</th>
              <th className="py-3 px-4">Deliveries Handled</th>
              <th className="py-3 px-4">Status</th>
              <th className="py-3 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100">
            {riders.map((r) => (
              <tr key={r.id} className="hover:bg-neutral-50/80 transition-colors">
                <td className="py-3.5 px-4">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-700 font-bold flex items-center justify-center shrink-0">
                      <Bike className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="font-bold text-neutral-900">{r.name}</p>
                      <p className="text-[11px] text-neutral-500">{r.email}</p>
                    </div>
                  </div>
                </td>

                <td className="py-3.5 px-4 font-medium text-neutral-700">
                  {r.phone || <span className="text-neutral-400 italic">No phone</span>}
                </td>

                <td className="py-3.5 px-4 font-bold text-neutral-800">
                  <div className="flex items-center gap-1.5">
                    <PackageCheck className="w-3.5 h-3.5 text-blue-600" />
                    <span>{r._count.riderOrders} assigned orders</span>
                  </div>
                </td>

                <td className="py-3.5 px-4">
                  <span
                    className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                      r.status === "ACTIVE"
                        ? "bg-emerald-100 text-emerald-800"
                        : "bg-neutral-100 text-neutral-600"
                    }`}
                  >
                    {r.status}
                  </span>
                </td>

                <td className="py-3.5 px-4 text-right">
                  <button
                    onClick={() => handleToggleStatus(r.id)}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-bold text-[11px] transition-colors ${
                      r.status === "ACTIVE"
                        ? "text-red-700 hover:bg-red-50 border border-red-200"
                        : "text-emerald-700 hover:bg-emerald-50 border border-emerald-200"
                    }`}
                  >
                    {r.status === "ACTIVE" ? (
                      <>
                        <UserX className="w-3.5 h-3.5" />
                        <span>Deactivate</span>
                      </>
                    ) : (
                      <>
                        <UserCheck className="w-3.5 h-3.5" />
                        <span>Activate</span>
                      </>
                    )}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal to Register Rider */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-neutral-200 space-y-4">
            <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
              <h3 className="text-base font-black text-neutral-900">
                Register Delivery Rider Account
              </h3>
              <button onClick={() => setModalOpen(false)} className="p-1 text-neutral-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-red-50 text-red-900 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {successMsg && (
              <div className="p-3 rounded-xl bg-emerald-50 text-emerald-900 text-xs flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{successMsg}</span>
              </div>
            )}

            <form onSubmit={handleCreateRider} className="space-y-3.5 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-neutral-700">Rider Full Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Juan Dela Cruz"
                  className="w-full bg-neutral-50 rounded-xl px-3.5 py-2.5 border border-neutral-200 focus:bg-white focus:border-orange-500 focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-neutral-700">Email Address (Login ID)</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="rider.juan@movli.com"
                  className="w-full bg-neutral-50 rounded-xl px-3.5 py-2.5 border border-neutral-200 focus:bg-white focus:border-orange-500 focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-neutral-700">Mobile Phone Number</label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="0918 987 6543"
                  className="w-full bg-neutral-50 rounded-xl px-3.5 py-2.5 border border-neutral-200 focus:bg-white focus:border-orange-500 focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="font-bold text-neutral-700">Temporary Password</label>
                <input
                  type="text"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-neutral-50 rounded-xl px-3.5 py-2.5 border border-neutral-200 focus:bg-white focus:border-orange-500 focus:outline-none"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-neutral-100">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-neutral-200 font-bold text-neutral-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2 rounded-xl bg-orange-600 hover:bg-orange-700 font-bold text-white shadow-xs flex items-center gap-1.5"
                >
                  {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>Register Rider</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
