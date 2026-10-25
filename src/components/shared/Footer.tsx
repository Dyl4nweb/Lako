import React from "react";
import Link from "next/link";
import { MovliLogo } from "./MovliLogo";
import { Truck, ShieldCheck, Banknote, MapPin } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-white border-t border-neutral-200 mt-auto">
      {/* Value Badges Banner */}
      <div className="border-b border-neutral-100 bg-neutral-50/70 py-6 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-4 text-neutral-700">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center shrink-0">
              <Banknote className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-neutral-900">Cash on Delivery</p>
              <p className="text-[11px] text-neutral-500">Pay safely when order arrives</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center shrink-0">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-neutral-900">Dedicated Local Riders</p>
              <p className="text-[11px] text-neutral-500">Direct doorstep local transit</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-neutral-900">Fresh & Authentic</p>
              <p className="text-[11px] text-neutral-500">Curated local producers</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center shrink-0">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-bold text-neutral-900">Town Hub Dispatch</p>
              <p className="text-[11px] text-neutral-500">Lingayen & provincial areas</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto py-10 px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-8">
        <div className="space-y-3 md:col-span-1">
          <MovliLogo showTagline size="md" />
          <p className="text-xs text-neutral-500 leading-relaxed pt-2">
            Movli is your provincial marketplace connecting everyday shoppers with fresh market
            seafood, native delicacies, and pantry staples delivered with trusted local riders.
          </p>
        </div>

        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-900 mb-3">
            Marketplace
          </h4>
          <ul className="space-y-2 text-xs text-neutral-600 font-medium">
            <li>
              <Link href="/products" className="hover:text-orange-600 transition-colors">
                All Products
              </Link>
            </li>
            <li>
              <Link href="/products?category=fresh-market-seafood" className="hover:text-orange-600 transition-colors">
                Fresh Market & Seafood
              </Link>
            </li>
            <li>
              <Link href="/products?category=local-delicacies-snacks" className="hover:text-orange-600 transition-colors">
                Local Delicacies
              </Link>
            </li>
            <li>
              <Link href="/cart" className="hover:text-orange-600 transition-colors">
                Shopping Cart
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-900 mb-3">
            Customer Care
          </h4>
          <ul className="space-y-2 text-xs text-neutral-600 font-medium">
            <li>
              <Link href="/orders" className="hover:text-orange-600 transition-colors">
                Order Tracking
              </Link>
            </li>
            <li>
              <Link href="/profile" className="hover:text-orange-600 transition-colors">
                My Profile
              </Link>
            </li>
            <li>
              <span className="text-neutral-400">Delivery Coverage: Lingayen, Pangasinan</span>
            </li>
            <li>
              <span className="text-neutral-400">Payment: Cash on Delivery (COD)</span>
            </li>
          </ul>
        </div>

        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-900 mb-3">
            Partner Access
          </h4>
          <ul className="space-y-2 text-xs text-neutral-600 font-medium">
            <li>
              <Link href="/rider" className="hover:text-blue-600 transition-colors">
                Rider Portal
              </Link>
            </li>
            <li>
              <Link href="/admin" className="hover:text-amber-600 transition-colors">
                Admin Management
              </Link>
            </li>
            <li>
              <Link href="/login" className="hover:text-orange-600 transition-colors">
                Account Sign In
              </Link>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-neutral-100 py-6 px-4 text-center text-xs text-neutral-500">
        <p>© {new Date().getFullYear()} Movli. All rights reserved. Everything moves with Movli.</p>
      </div>
    </footer>
  );
}
