import React from "react";
import Link from "next/link";
import { requireRider } from "@/lib/server-auth";
import { Bike, Phone, Mail, ShieldCheck, LogOut, Store } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function RiderProfilePage() {
  const { user } = await requireRider();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-black text-neutral-900 tracking-tight">
          Rider Profile
        </h1>
        <p className="text-xs text-neutral-500 mt-0.5">
          Your dispatch account details and official fleet credentials
        </p>
      </div>

      <div className="bg-white rounded-3xl border border-neutral-200/80 p-6 shadow-xs space-y-6">
        <div className="flex items-center gap-4 border-b border-neutral-100 pb-5">
          <div className="w-16 h-16 rounded-2xl bg-blue-100 border border-blue-200 text-blue-700 font-black text-2xl flex items-center justify-center">
            {user.name?.charAt(0).toUpperCase()}
          </div>
          <div>
            <h2 className="text-lg font-black text-neutral-900">{user.name}</h2>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800">
                Official Delivery Rider
              </span>
              <span className="text-xs text-neutral-500">Fleet ID: {user.id.slice(0, 8)}</span>
            </div>
          </div>
        </div>

        <div className="space-y-3 text-xs">
          <div className="flex items-center justify-between p-3.5 rounded-2xl bg-neutral-50 border border-neutral-100">
            <span className="text-neutral-500 flex items-center gap-2">
              <Mail className="w-4 h-4 text-neutral-400" />
              <span>Email</span>
            </span>
            <span className="font-bold text-neutral-900">{user.email}</span>
          </div>

          <div className="flex items-center justify-between p-3.5 rounded-2xl bg-neutral-50 border border-neutral-100">
            <span className="text-neutral-500 flex items-center gap-2">
              <Phone className="w-4 h-4 text-neutral-400" />
              <span>Mobile Phone</span>
            </span>
            <span className="font-bold text-neutral-900">
              {(user as unknown as { phone?: string })?.phone || "No phone configured"}
            </span>
          </div>

          <div className="flex items-center justify-between p-3.5 rounded-2xl bg-neutral-50 border border-neutral-100">
            <span className="text-neutral-500 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-neutral-400" />
              <span>Account Status</span>
            </span>
            <span className="font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full">
              Active Partner
            </span>
          </div>
        </div>

        <div className="pt-4 border-t border-neutral-100 flex flex-col sm:flex-row gap-3">
          <Link
            href="/"
            className="flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl border border-neutral-200 text-xs font-bold text-neutral-700 hover:bg-neutral-50"
          >
            <Store className="w-4 h-4" />
            <span>Visit Customer Storefront</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
