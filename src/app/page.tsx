import { prisma } from "@/lib/prisma";
import { getCurrentSession } from "@/lib/auth/session";
import { Navbar } from "@/components/shared/Navbar";
import { MarketplaceView } from "@/components/customer/MarketplaceView";
import Link from "next/link";
import { Heart, MapPin, ShieldCheck, Truck, Store, ExternalLink } from "lucide-react";


export default async function HomePage() {
  const session = await getCurrentSession();

  const stores = await prisma.store.findMany({
    where: { isOpen: true },
    include: {
      products: { select: { id: true } },
    },
    orderBy: { createdAt: "asc" },
  });

  const products = await prisma.product.findMany({
    where: { isAvailable: true },
    include: {
      store: {
        select: {
          id: true,
          name: true,
          slug: true,
          barangay: true,
          isOpen: true,
        },
      },
    },
    orderBy: { createdAt: "asc" },
  });

  return (
    <div className="min-h-screen flex flex-col bg-[#FBFBF9]">
      <Navbar session={session} />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        <MarketplaceView
          stores={stores as any}
          products={products as any}
        />
      </main>

      {/* Footer */}
      <footer className="border-t border-zinc-200 bg-white py-12 text-xs text-zinc-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-lg bg-movli text-white flex items-center justify-center font-bold">
                M
              </div>
              <span className="font-extrabold text-base text-slate-deep font-outfit">
                Movli<span className="text-movli">.</span>
              </span>
            </div>
            <p className="text-zinc-500 leading-relaxed mb-4">
              Your local marketplace. Your trusted riders. Everything in motion across Lingayen, Pangasinan.
            </p>
            <div className="flex items-center gap-1.5 text-zinc-400 font-mono text-[11px]">
              <MapPin className="w-3.5 h-3.5 text-movli" />
              <span>Lingayen, Pangasinan, Philippines</span>
            </div>
          </div>

          <div>
            <h4 className="font-bold text-slate-deep uppercase tracking-wider mb-3 text-[11px]">
              Core Pillars
            </h4>
            <ul className="space-y-2">
              <li className="flex items-center gap-1.5">
                <Store className="w-3.5 h-3.5 text-amber-500" />
                <span><strong>SHOP:</strong> Instant 30-60 min delivery</span>
              </li>
              <li className="flex items-center gap-1.5">
                <Store className="w-3.5 h-3.5 text-movli" />
                <span><strong>SELL:</strong> 5% Fair Merchant Commission</span>
              </li>
              <li className="flex items-center gap-1.5">
                <Truck className="w-3.5 h-3.5 text-emerald-500" />
                <span><strong>DELIVER:</strong> ₱35 base courier earnings</span>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-slate-deep uppercase tracking-wider mb-3 text-[11px]">
              Operational Surfaces
            </h4>
            <ul className="space-y-2">
              <li>
                <Link href="/seller" className="hover:text-movli transition">
                  Merchant Hub & Orders Pipeline
                </Link>
              </li>
              <li>
                <Link href="/rider" className="hover:text-movli transition">
                  Rider Mobile Dispatch Terminal
                </Link>
              </li>
              <li>
                <Link href="/admin" className="hover:text-movli transition">
                  Shared Operations & Financial Ledger
                </Link>
              </li>
              <li>
                <Link href="/sys-core-portal-x9" className="hover:text-purple-600 transition font-mono">
                  Super Admin Security Console
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-slate-deep uppercase tracking-wider mb-3 text-[11px]">
              Platform Guarantees
            </h4>
            <ul className="space-y-2 text-zinc-600">
              <li>✓ Single-Seller Cart Direct Dispatch</li>
              <li>✓ Fixed ₱45 COD delivery fee</li>
              <li>✓ Balanced Double-Entry Financial Ledger</li>
              <li>✓ Real-Time Proof of Delivery (POD)</li>
            </ul>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 mt-8 border-t border-zinc-100 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-zinc-400">
          <div>© {new Date().getFullYear()} Movli Technologies. Built with pride for Lingayen, Pangasinan.</div>
          <div className="flex items-center gap-1">
            <span>Powered by Next.js App Router & Tailwind CSS v3</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
