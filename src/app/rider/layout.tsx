import React from "react";
import Link from "next/link";
import { requireRider } from "@/lib/server-auth";
import { MovliLogo } from "@/components/shared/MovliLogo";
import { Bike, Package, History, User, Store } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function RiderLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = await requireRider();

  return (
    <div className="min-h-screen flex flex-col bg-neutral-100 text-neutral-900 pb-20 sm:pb-0">
      {/* Rider Mobile Header */}
      <header className="sticky top-0 z-40 bg-white border-b border-neutral-200/80 px-4 py-3 shadow-xs">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MovliLogo size="sm" isLink={false} />
            <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-blue-100 text-blue-800">
              Rider Dispatch
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-neutral-800 hidden sm:inline">
              {user.name}
            </span>
            <Link
              href="/"
              className="text-xs font-bold text-neutral-500 hover:text-orange-600 px-2 py-1 rounded-lg"
            >
              Storefront
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-6 sm:py-8">
        {children}
      </main>

      {/* Sticky Bottom Navigation for Mobile Touch */}
      <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-t border-neutral-200/90 py-2 px-6 sm:hidden flex items-center justify-around">
        <Link
          href="/rider"
          className="flex flex-col items-center gap-1 text-[10px] font-bold text-neutral-600 hover:text-blue-600"
        >
          <Bike className="w-5 h-5 text-blue-600" />
          <span>Active</span>
        </Link>
        <Link
          href="/rider/deliveries"
          className="flex flex-col items-center gap-1 text-[10px] font-bold text-neutral-600 hover:text-blue-600"
        >
          <Package className="w-5 h-5" />
          <span>Deliveries</span>
        </Link>
        <Link
          href="/rider/history"
          className="flex flex-col items-center gap-1 text-[10px] font-bold text-neutral-600 hover:text-blue-600"
        >
          <History className="w-5 h-5" />
          <span>History</span>
        </Link>
        <Link
          href="/rider/profile"
          className="flex flex-col items-center gap-1 text-[10px] font-bold text-neutral-600 hover:text-blue-600"
        >
          <User className="w-5 h-5" />
          <span>Profile</span>
        </Link>
      </nav>
    </div>
  );
}
