"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { MovliLogo } from "./MovliLogo";
import { useCart } from "@/context/CartContext";
import { useSession, signOut } from "@/lib/auth-client";
import {
  ShoppingBag,
  Search,
  User,
  PackageCheck,
  ShieldAlert,
  Bike,
  LogOut,
  Menu,
  X,
  ChevronDown,
} from "lucide-react";

export function Navbar() {
  const router = useRouter();
  const { itemCount } = useCart();
  const { data: session, isPending } = useSession();
  const [searchQuery, setSearchQuery] = useState("");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const user = session?.user;
  const userRole = (user as unknown as { role?: string })?.role || "CUSTOMER";

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/products?q=${encodeURIComponent(searchQuery.trim())}`);
      setMobileMenuOpen(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    setUserMenuOpen(false);
    router.push("/");
    router.refresh();
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-white border-b border-neutral-200/80 shadow-xs">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-orange-600 via-orange-500 to-amber-500 text-white text-xs font-medium py-1.5 px-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-amber-200 animate-pulse" />
            <span>Local Market Dispatch • Guaranteed Fresh • Cash on Delivery (COD)</span>
          </div>
          <div className="hidden sm:flex items-center gap-4 text-orange-100 text-[11px]">
            <span>Fast Rider Dispatch</span>
            <span>•</span>
            <span>Provincial Town Hubs</span>
          </div>
        </div>
      </div>

      {/* Main Header Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20 gap-4 sm:gap-8">
          {/* Logo */}
          <div className="flex-shrink-0">
            <MovliLogo showTagline size="md" />
          </div>

          {/* Search Bar (Shopee-Style prominent center search) */}
          <form
            onSubmit={handleSearchSubmit}
            className="hidden md:flex flex-1 max-w-xl relative items-center"
          >
            <div className="relative w-full">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search fresh fish, local delicacies, pantry essentials..."
                className="w-full bg-neutral-100 text-neutral-900 placeholder-neutral-500 text-sm rounded-full pl-4 pr-12 py-2.5 border border-transparent focus:border-orange-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500/20 transition-all"
              />
              <button
                type="submit"
                aria-label="Search products"
                className="absolute right-1.5 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-orange-600 hover:bg-orange-700 text-white transition-colors"
              >
                <Search className="w-4 h-4" />
              </button>
            </div>
          </form>

          {/* Right Navigation & Actions */}
          <div className="flex items-center gap-2 sm:gap-4">
            {/* Products Browse Link */}
            <Link
              href="/products"
              className="hidden lg:inline-flex text-sm font-semibold text-neutral-700 hover:text-orange-600 transition-colors px-2 py-1"
            >
              All Products
            </Link>

            {/* Portal links based on role */}
            {userRole === "ADMIN" && (
              <Link
                href="/admin"
                className="hidden sm:inline-flex items-center gap-1.5 text-xs font-bold text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200 px-3 py-1.5 rounded-full transition-colors"
              >
                <ShieldAlert className="w-3.5 h-3.5" />
                <span>Admin Hub</span>
              </Link>
            )}

            {userRole === "RIDER" && (
              <Link
                href="/rider"
                className="hidden sm:inline-flex items-center gap-1.5 text-xs font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 px-3 py-1.5 rounded-full transition-colors"
              >
                <Bike className="w-3.5 h-3.5" />
                <span>Rider Terminal</span>
              </Link>
            )}

            {/* Cart Icon */}
            <Link
              href="/cart"
              className="relative p-2.5 rounded-xl text-neutral-700 hover:text-orange-600 hover:bg-orange-50 transition-all flex items-center justify-center"
              aria-label="Shopping Cart"
            >
              <ShoppingBag className="w-6 h-6" />
              {itemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-orange-600 text-white text-[11px] font-black w-5 h-5 rounded-full flex items-center justify-center border-2 border-white shadow-xs">
                  {itemCount > 99 ? "99+" : itemCount}
                </span>
              )}
            </Link>

            {/* User Account / Auth Dropdown */}
            {!isPending && (
              <div className="relative">
                {user ? (
                  <div>
                    <button
                      onClick={() => setUserMenuOpen(!userMenuOpen)}
                      className="flex items-center gap-2 p-1.5 sm:px-3 sm:py-2 rounded-xl text-neutral-700 hover:bg-neutral-100 transition-colors"
                    >
                      <div className="w-8 h-8 rounded-full bg-orange-100 border border-orange-200 text-orange-700 font-bold flex items-center justify-center text-xs">
                        {user.name?.charAt(0).toUpperCase() || "U"}
                      </div>
                      <div className="hidden sm:flex flex-col text-left">
                        <span className="text-xs font-bold text-neutral-900 leading-tight">
                          {user.name?.split(" ")[0]}
                        </span>
                        <span className="text-[10px] text-neutral-500 font-medium capitalize">
                          {userRole.toLowerCase()}
                        </span>
                      </div>
                      <ChevronDown className="w-3.5 h-3.5 text-neutral-400 hidden sm:block" />
                    </button>

                    {/* Dropdown Menu */}
                    {userMenuOpen && (
                      <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-neutral-100 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                        <div className="px-4 py-2 border-b border-neutral-100">
                          <p className="text-xs font-bold text-neutral-900">{user.name}</p>
                          <p className="text-[11px] text-neutral-500 truncate">{user.email}</p>
                          <span className="inline-block mt-1 text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-orange-100 text-orange-700">
                            {userRole}
                          </span>
                        </div>

                        <div className="py-1">
                          <Link
                            href="/orders"
                            onClick={() => setUserMenuOpen(false)}
                            className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-neutral-700 hover:bg-orange-50 hover:text-orange-700 transition-colors"
                          >
                            <PackageCheck className="w-4 h-4 text-neutral-500" />
                            My Orders
                          </Link>
                          <Link
                            href="/profile"
                            onClick={() => setUserMenuOpen(false)}
                            className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-neutral-700 hover:bg-orange-50 hover:text-orange-700 transition-colors"
                          >
                            <User className="w-4 h-4 text-neutral-500" />
                            Profile & Addresses
                          </Link>

                          {userRole === "ADMIN" && (
                            <Link
                              href="/admin"
                              onClick={() => setUserMenuOpen(false)}
                              className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-amber-800 hover:bg-amber-50 transition-colors"
                            >
                              <ShieldAlert className="w-4 h-4 text-amber-600" />
                              Admin Portal
                            </Link>
                          )}

                          {userRole === "RIDER" && (
                            <Link
                              href="/rider"
                              onClick={() => setUserMenuOpen(false)}
                              className="flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-blue-800 hover:bg-blue-50 transition-colors"
                            >
                              <Bike className="w-4 h-4 text-blue-600" />
                              Rider Terminal
                            </Link>
                          )}
                        </div>

                        <div className="pt-1 border-t border-neutral-100">
                          <button
                            onClick={handleSignOut}
                            className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-medium text-red-600 hover:bg-red-50 transition-colors"
                          >
                            <LogOut className="w-4 h-4" />
                            Sign Out
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Link
                      href="/login"
                      className="text-xs sm:text-sm font-semibold text-neutral-700 hover:text-orange-600 px-3 py-2 rounded-xl transition-colors"
                    >
                      Sign In
                    </Link>
                    <Link
                      href="/register"
                      className="text-xs sm:text-sm font-bold bg-orange-600 hover:bg-orange-700 text-white px-3 sm:px-4 py-2 rounded-xl shadow-xs shadow-orange-600/30 transition-all hover:scale-102"
                    >
                      Register
                    </Link>
                  </div>
                )}
              </div>
            )}

            {/* Mobile Menu Toggle Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-xl text-neutral-700 hover:bg-neutral-100"
              aria-label="Toggle Navigation"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Search Input */}
        <div className="md:hidden pb-3">
          <form onSubmit={handleSearchSubmit} className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search products, groceries, snacks..."
              className="w-full bg-neutral-100 text-neutral-900 text-sm rounded-full pl-4 pr-10 py-2 border border-transparent focus:border-orange-500 focus:bg-white focus:outline-none"
            />
            <button
              type="submit"
              aria-label="Search"
              className="absolute right-1.5 top-1/2 -translate-y-1/2 p-1.5 rounded-full text-neutral-500"
            >
              <Search className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-neutral-200 px-4 pt-2 pb-6 space-y-3">
          <Link
            href="/products"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-sm font-semibold text-neutral-800 hover:bg-neutral-50"
          >
            All Products
          </Link>
          <Link
            href="/cart"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center justify-between px-3 py-2 rounded-lg text-sm font-semibold text-neutral-800 hover:bg-neutral-50"
          >
            <span>Shopping Cart</span>
            {itemCount > 0 && (
              <span className="px-2 py-0.5 text-xs font-bold rounded-full bg-orange-600 text-white">
                {itemCount}
              </span>
            )}
          </Link>
          {user && (
            <>
              <Link
                href="/orders"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-sm font-semibold text-neutral-800 hover:bg-neutral-50"
              >
                My Orders
              </Link>
              <Link
                href="/profile"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-lg text-sm font-semibold text-neutral-800 hover:bg-neutral-50"
              >
                Profile & Addresses
              </Link>
            </>
          )}
          {userRole === "ADMIN" && (
            <Link
              href="/admin"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-sm font-bold text-amber-700 bg-amber-50"
            >
              Admin Dashboard
            </Link>
          )}
          {userRole === "RIDER" && (
            <Link
              href="/rider"
              onClick={() => setMobileMenuOpen(false)}
              className="block px-3 py-2 rounded-lg text-sm font-bold text-blue-700 bg-blue-50"
            >
              Rider Deliveries
            </Link>
          )}
        </div>
      )}
    </header>
  );
}
