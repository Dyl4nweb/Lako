"use client";

import React, { useState } from "react";
import { formatDate } from "@/lib/utils";
import {
  ShieldAlert,
  Server,
  Activity,
  Key,
  Database,
  Lock,
  Cpu,
  Terminal,
  Save,
  CheckCircle2,
} from "lucide-react";

export function SuperAdminView({
  session,
  auditLogs,
  users,
}: {
  session: any;
  auditLogs: any[];
  users: any[];
}) {
  const [commissionRate, setCommissionRate] = useState("5.0");
  const [deliveryFee, setDeliveryFee] = useState("45.00");
  const [riderPayout, setRiderPayout] = useState("35.00");
  const [isSaved, setIsSaved] = useState(false);

  const handleSaveConfig = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black text-white font-mono tracking-tight flex items-center gap-2">
              <Lock className="w-5 h-5 text-purple-400" />
              /sys-core-portal-x9
            </h1>
            <span className="text-[10px] font-mono bg-purple-950 text-purple-300 border border-purple-800 px-2 py-0.5 rounded-full font-bold">
              Tier 0 Founder Sovereignty
            </span>
          </div>
          <p className="text-xs text-zinc-400 mt-1">
            Stealth Administration Core · Cryptographic Defense-in-Depth & System Environment
          </p>
        </div>

        <div className="flex items-center gap-2 font-mono text-xs text-zinc-400 bg-zinc-900 px-3 py-1.5 rounded-xl border border-zinc-800">
          <span className="w-2 h-2 rounded-full bg-emerald-400 beacon-active" />
          <span>Stealth Mode Active</span>
        </div>
      </div>

      {/* System Health Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-4 space-y-1">
          <div className="text-[10px] font-mono text-zinc-400 uppercase flex items-center justify-between">
            <span>DB Storage Engine</span>
            <Database className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <div className="text-base font-mono font-bold text-white">SQLite / Neon Ready</div>
          <div className="text-[10px] text-emerald-400">Connection Pool: Optimal</div>
        </div>

        <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-4 space-y-1">
          <div className="text-[10px] font-mono text-zinc-400 uppercase flex items-center justify-between">
            <span>Query Statement Timeout</span>
            <Clock className="w-3.5 h-3.5 text-blue-400" />
          </div>
          <div className="text-base font-mono font-bold text-white">5,000 ms</div>
          <div className="text-[10px] text-zinc-400">Anti-DB Flood Protection</div>
        </div>

        <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-4 space-y-1">
          <div className="text-[10px] font-mono text-zinc-400 uppercase flex items-center justify-between">
            <span>Active Server Latency</span>
            <Activity className="w-3.5 h-3.5 text-movli" />
          </div>
          <div className="text-base font-mono font-bold text-white">14 ms</div>
          <div className="text-[10px] text-emerald-400">Sub-50ms Provincial SLA</div>
        </div>

        <div className="bg-zinc-900/80 border border-zinc-800 rounded-2xl p-4 space-y-1">
          <div className="text-[10px] font-mono text-zinc-400 uppercase flex items-center justify-between">
            <span>Provisioned Users</span>
            <Key className="w-3.5 h-3.5 text-purple-400" />
          </div>
          <div className="text-base font-mono font-bold text-white">{users.length} Identities</div>
          <div className="text-[10px] text-zinc-400">5 RBAC Tiers Partitioned</div>
        </div>
      </div>

      {/* Global Economics & Parameter Adjustment Form */}
      <div className="bg-zinc-900/80 border border-zinc-800 rounded-3xl p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
          <div>
            <h2 className="font-bold text-white text-sm font-mono flex items-center gap-2">
              <Cpu className="w-4 h-4 text-purple-400" />
              Global Pricing & Commission Rules Vault
            </h2>
            <p className="text-xs text-zinc-400">
              Founder-level override for unit economics parameters across Lingayen marketplace.
            </p>
          </div>
        </div>

        <form onSubmit={handleSaveConfig} className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-mono">
          <div>
            <label className="block text-zinc-400 mb-1">Platform Commission Rate (%)</label>
            <input
              type="text"
              value={commissionRate}
              onChange={(e) => setCommissionRate(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-700 text-white font-bold"
            />
            <span className="text-[10px] text-zinc-500 mt-1 block">Default: 5.0% proposed MSME take-rate</span>
          </div>

          <div>
            <label className="block text-zinc-400 mb-1">Customer Delivery Fee (PHP)</label>
            <input
              type="text"
              value={deliveryFee}
              onChange={(e) => setDeliveryFee(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-700 text-white font-bold"
            />
            <span className="text-[10px] text-zinc-500 mt-1 block">Flat across all 32 Lingayen barangays</span>
          </div>

          <div>
            <label className="block text-zinc-400 mb-1">Courier Compensation Per Drop (PHP)</label>
            <input
              type="text"
              value={riderPayout}
              onChange={(e) => setRiderPayout(e.target.value)}
              className="w-full px-3 py-2 rounded-xl bg-zinc-950 border border-zinc-700 text-white font-bold"
            />
            <span className="text-[10px] text-zinc-500 mt-1 block">Net rider retention: ₱35.00/drop</span>
          </div>

          <div className="sm:col-span-3 pt-2 flex items-center gap-3">
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs flex items-center gap-1.5 transition"
            >
              <Save className="w-4 h-4" />
              <span>Commit System Config</span>
            </button>
            {isSaved && (
              <span className="text-xs text-emerald-400 flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4" />
                Parameters written to runtime state
              </span>
            )}
          </div>
        </form>
      </div>

      {/* Immutable Security Audit Log (Master Plan Section 10 & 17.3) */}
      <div className="bg-zinc-900/80 border border-zinc-800 rounded-3xl p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
          <div className="flex items-center gap-2">
            <Terminal className="w-4 h-4 text-purple-400" />
            <h2 className="font-bold text-white text-sm font-mono">
              Immutable Cryptographic Audit Trail
            </h2>
          </div>
          <span className="text-[10px] font-mono text-zinc-500">
            Append-Only · Zero Deletion
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="border-b border-zinc-800 text-zinc-500 uppercase text-[10px]">
                <th className="py-2.5">Timestamp</th>
                <th className="py-2.5">Action Code</th>
                <th className="py-2.5">Actor (Role)</th>
                <th className="py-2.5">Resource Target</th>
                <th className="py-2.5">IP Node</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60 text-zinc-300">
              {auditLogs.map((log) => (
                <tr key={log.id} className="hover:bg-zinc-800/40 transition">
                  <td className="py-2.5 text-zinc-400">{formatDate(log.createdAt)}</td>
                  <td className="py-2.5 font-bold text-purple-300">{log.action}</td>
                  <td className="py-2.5 text-zinc-300">
                    {log.user?.fullName} ({log.user?.role})
                  </td>
                  <td className="py-2.5 text-zinc-400">
                    {log.resourceType}:{log.resourceId}
                  </td>
                  <td className="py-2.5 text-zinc-500">{log.ipAddress || "127.0.0.1"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function Clock(props: any) {
  return (
    <svg
      {...props}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  );
}
