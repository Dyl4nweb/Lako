import React from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/server-auth";
import { MovliLogo } from "@/components/shared/MovliLogo";
import {
  LayoutDashboard,
  Package,
  Layers,
  ShoppingBag,
  Bike,
  Users,
  Store,
  ShieldCheck,
} from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = await requireAdmin();

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-neutral-100/70 text-neutral-900">
      {/* Sidebar Navigation */}
      <aside className="w-full md:w-64 bg-white border-r border-neutral-200/80 flex flex-col shrink-0">
        <div className="p-5 border-b border-neutral-100 flex items-center justify-between">
          <MovliLogo size="sm" isLink={false} />
          <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
            Admin Hub
          </span>
        </div>

        {/* User Card */}
        <div className="p-4 mx-3 my-3 rounded-2xl bg-neutral-50 border border-neutral-100 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-orange-100 text-orange-700 font-bold flex items-center justify-center text-xs shrink-0">
            {user.name?.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="text-xs font-bold text-neutral-900 truncate">{user.name}</p>
            <p className="text-[10px] text-neutral-500 truncate">{user.email}</p>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 px-3 py-2 space-y-1 text-xs font-semibold">
          <Link
            href="/admin"
            className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-neutral-700 hover:bg-neutral-100 hover:text-neutral-900 transition-colors"
          >
            <LayoutDashboard className="w-4 h-4 text-orange-600" />
            <span>Dashboard Overview</span>
          </Link>

          <Link
            href="/admin/orders"
            className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-neutral-700 hover:bg-neutral-100 hover:text-neutral-900 transition-colors"
          >
            <ShoppingBag className="w-4 h-4 text-blue-600" />
            <span>Orders & Dispatch</span>
          </Link>

          <Link
            href="/admin/products"
            className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-neutral-700 hover:bg-neutral-100 hover:text-neutral-900 transition-colors"
          >
            <Package className="w-4 h-4 text-emerald-600" />
            <span>Products Catalog</span>
          </Link>

          <Link
            href="/admin/categories"
            className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-neutral-700 hover:bg-neutral-100 hover:text-neutral-900 transition-colors"
          >
            <Layers className="w-4 h-4 text-purple-600" />
            <span>Categories</span>
          </Link>

          <Link
            href="/admin/riders"
            className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-neutral-700 hover:bg-neutral-100 hover:text-neutral-900 transition-colors"
          >
            <Bike className="w-4 h-4 text-cyan-600" />
            <span>Riders & Fleet</span>
          </Link>

          <Link
            href="/admin/customers"
            className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-neutral-700 hover:bg-neutral-100 hover:text-neutral-900 transition-colors"
          >
            <Users className="w-4 h-4 text-amber-600" />
            <span>Customer Directory</span>
          </Link>
        </nav>

        {/* Storefront return link */}
        <div className="p-4 border-t border-neutral-100">
          <Link
            href="/"
            className="flex items-center justify-center gap-2 w-full py-2.5 px-3 rounded-xl border border-neutral-200 text-xs font-bold text-neutral-700 hover:bg-neutral-50 transition-colors"
          >
            <Store className="w-4 h-4" />
            <span>Back to Storefront</span>
          </Link>
        </div>
      </aside>

      {/* Main Admin Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
