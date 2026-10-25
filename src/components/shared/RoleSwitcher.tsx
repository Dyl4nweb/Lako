"use client";

import React, { useState, useTransition } from "react";
import { UserSession } from "@/types";
import { switchDemoUserAction } from "@/server/actions/admin";
import { ShieldCheck, Truck, Store, User, Sparkles, ChevronDown, Check } from "lucide-react";
import Link from "next/link";

interface DemoUserItem {
  id: string;
  name: string;
  role: string;
  label: string;
  portalUrl: string;
}

const DEMO_ACCOUNTS: DemoUserItem[] = [
  { id: "", name: "Aling Teresa (Customer)", role: "CUSTOMER", label: "Customer (Buyer)", portalUrl: "/" },
  { id: "", name: "Aling Senang (Native Delicacies)", role: "SELLER", label: "Merchant (Seller)", portalUrl: "/seller" },
  { id: "", name: "Mark Dizon (Courier)", role: "RIDER", label: "Courier (Rider)", portalUrl: "/rider" },
  { id: "", name: "Carlo Gomez (Operations Admin)", role: "ADMIN", label: "Business Admin", portalUrl: "/admin" },
  { id: "", name: "Patricia Co (Investor Partner)", role: "ADMIN", label: "Investor Admin", portalUrl: "/admin" },
  { id: "", name: "Marc Andrei (Super Admin)", role: "SUPER_ADMIN", label: "Founder / Dev", portalUrl: "/sys-core-portal-x9" },
];

export function RoleSwitcher({
  currentSession,
  allUsers,
}: {
  currentSession: UserSession | null;
  allUsers: any[];
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleSwitch = (userId: string) => {
    startTransition(async () => {
      await switchDemoUserAction(userId);
      setIsOpen(false);
    });
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case "SUPER_ADMIN":
        return <span className="bg-purple-900/40 text-purple-300 text-xs px-2 py-0.5 rounded-full font-mono border border-purple-500/30">Tier 0 Super Admin</span>;
      case "ADMIN":
        return <span className="bg-blue-900/40 text-blue-300 text-xs px-2 py-0.5 rounded-full font-mono border border-blue-500/30">Tier 1 Admin</span>;
      case "SELLER":
        return <span className="bg-amber-900/40 text-amber-300 text-xs px-2 py-0.5 rounded-full font-mono border border-amber-500/30">Tier 2 Seller</span>;
      case "RIDER":
        return <span className="bg-emerald-900/40 text-emerald-300 text-xs px-2 py-0.5 rounded-full font-mono border border-emerald-500/30">Tier 3 Courier</span>;
      default:
        return <span className="bg-zinc-800 text-zinc-300 text-xs px-2 py-0.5 rounded-full font-mono border border-zinc-700">Tier 4 Customer</span>;
    }
  };

  return (
    <div className="bg-[#1A202C] text-white border-b border-zinc-800 text-xs py-1.5 px-4 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Left: Active Role Indication */}
        <div className="flex items-center gap-2 overflow-hidden text-ellipsis whitespace-nowrap">
          <div className="flex items-center gap-1.5 font-medium text-zinc-300">
            <span className="w-2 h-2 rounded-full bg-emerald-400 beacon-active"></span>
            <span className="text-zinc-400">Active Identity:</span>
            <span className="text-white font-semibold">{currentSession?.fullName || "Guest"}</span>
          </div>
          {currentSession && getRoleBadge(currentSession.role)}
        </div>

        {/* Right: Quick Surface Links & Role Switcher Dropdown */}
        <div className="flex items-center gap-3">
          <div className="hidden md:flex items-center gap-2 border-r border-zinc-700 pr-3">
            <Link
              href="/"
              className="text-zinc-300 hover:text-white px-2 py-1 rounded hover:bg-zinc-800 transition"
            >
              Shop
            </Link>
            <Link
              href="/seller"
              className="text-zinc-300 hover:text-white px-2 py-1 rounded hover:bg-zinc-800 transition flex items-center gap-1"
            >
              <Store className="w-3.5 h-3.5 text-amber-400" />
              Seller Hub
            </Link>
            <Link
              href="/rider"
              className="text-zinc-300 hover:text-white px-2 py-1 rounded hover:bg-zinc-800 transition flex items-center gap-1"
            >
              <Truck className="w-3.5 h-3.5 text-emerald-400" />
              Rider Terminal
            </Link>
            <Link
              href="/admin"
              className="text-zinc-300 hover:text-white px-2 py-1 rounded hover:bg-zinc-800 transition flex items-center gap-1"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
              Admin & Finances
            </Link>
            <Link
              href="/sys-core-portal-x9"
              prefetch={false}
              className="text-purple-300 hover:text-purple-100 px-2 py-1 rounded hover:bg-purple-950/50 border border-purple-800/40 transition flex items-center gap-1 font-mono"
            >
              <Sparkles className="w-3.5 h-3.5" />
              Super Admin
            </Link>
          </div>

          {/* Switch User Dropdown */}
          <div className="relative">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="bg-zinc-800 hover:bg-zinc-700 text-white px-3 py-1 rounded-md flex items-center gap-1.5 transition font-medium border border-zinc-700"
            >
              <span>Switch Persona</span>
              <ChevronDown className="w-3.5 h-3.5 text-zinc-400" />
            </button>

            {isOpen && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setIsOpen(false)}
                />
                <div className="absolute right-0 mt-2 w-72 bg-[#1A202C] border border-zinc-700 rounded-xl shadow-2xl p-2 z-50 text-white space-y-1">
                  <div className="px-3 py-1.5 text-[11px] font-semibold text-zinc-400 uppercase tracking-wider border-b border-zinc-800">
                    Switch Test Account (Instant RBAC)
                  </div>
                  <div className="max-h-80 overflow-y-auto space-y-1 py-1">
                    {allUsers.map((u) => {
                      const isSelected = currentSession?.id === u.id;
                      return (
                        <button
                          key={u.id}
                          disabled={isPending}
                          onClick={() => handleSwitch(u.id)}
                          className={`w-full text-left px-3 py-2 rounded-lg text-xs flex items-center justify-between transition ${
                            isSelected
                              ? "bg-movli text-white font-medium"
                              : "hover:bg-zinc-800 text-zinc-200"
                          }`}
                        >
                          <div>
                            <div className="font-semibold">{u.fullName}</div>
                            <div className="text-[10px] opacity-75">
                              {u.role === "SELLER" && u.store?.name
                                ? u.store.name
                                : u.role === "RIDER" && u.riderProfile?.plateNumber
                                ? `Courier (${u.riderProfile.plateNumber})`
                                : u.email}
                            </div>
                          </div>
                          {isSelected && <Check className="w-4 h-4 ml-2 flex-shrink-0" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
