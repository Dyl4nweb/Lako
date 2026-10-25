"use client";

import React, { useState } from "react";
import Link from "next/link";
import { formatPHP } from "@/lib/utils";
import { useCart } from "@/context/CartContext";
import {
  Search,
  Store,
  Clock,
  Sparkles,
  Plus,
  Check,
  ShoppingBag,
  ArrowRight,
  Shield,
  MapPin,
  Utensils,
  Fish,
  ShoppingBasket,
  Croissant,
  Pill,
  Package,
} from "lucide-react";

interface ProductModel {
  id: string;
  name: string;
  description: string | null;
  price: number;
  stock: number;
  imageUrl: string | null;
  category: string;
  isAvailable: boolean;
  store: {
    id: string;
    name: string;
    slug: string;
    barangay: string;
    isOpen: boolean;
  };
}

interface StoreModel {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  barangay: string;
  logoUrl: string | null;
  bannerUrl: string | null;
  isOpen: boolean;
  products: { id: string }[];
}

const CATEGORIES = [
  { id: "ALL", name: "All Items", icon: Sparkles },
  { id: "Bagoong & Native Snacks", name: "Bagoong & Delicacies", icon: Fish },
  { id: "Food & Meals", name: "Cooked Meals", icon: Utensils },
  { id: "Bakery", name: "Bakery & Breads", icon: Croissant },
  { id: "Groceries", name: "Market Produce", icon: ShoppingBasket },
  { id: "Pharmacy", name: "Pharmacy", icon: Pill },
  { id: "Retail", name: "Pantry & Home", icon: Package },
];

export function MarketplaceView({
  stores,
  products,
}: {
  stores: StoreModel[];
  products: ProductModel[];
}) {
  const [selectedCategory, setSelectedCategory] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [addedProductId, setAddedProductId] = useState<string | null>(null);

  const { addItem, storeId: cartStoreId } = useCart();

  const filteredProducts = products.filter((p) => {
    const matchesCategory =
      selectedCategory === "ALL" || p.category === selectedCategory;
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.store.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.description && p.description.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  const handleAddToCart = (p: ProductModel) => {
    addItem(
      {
        id: p.store.id,
        name: p.store.name,
        slug: p.store.slug,
        barangay: p.store.barangay,
      },
      {
        productId: p.id,
        name: p.name,
        price: p.price,
        quantity: 1,
        imageUrl: p.imageUrl,
      }
    );

    setAddedProductId(p.id);
    setTimeout(() => setAddedProductId(null), 1500);
  };

  return (
    <div className="space-y-10 pb-16">
      {/* Hero Banner Section */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#1A202C] via-[#242D3D] to-[#1A202C] text-white p-6 sm:p-10 shadow-2xl">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-96 h-96 rounded-full bg-movli/10 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 -mb-10 w-80 h-80 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-movli/20 border border-movli/30 text-movli-300 text-xs font-semibold mb-4 backdrop-blur-md">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Provincial Hyper-Local Commerce · Lingayen, Pangasinan</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight font-outfit leading-tight mb-4 text-white">
            Everything moves with <span className="text-movli">Movli.</span>
          </h1>

          <p className="text-sm sm:text-base text-zinc-300 mb-6 leading-relaxed">
            Fresh Lingayen bagoong, native tupig, warm pan de sal, market vegetables, and hot meals delivered straight to your doorstep in <strong className="text-white">30 to 60 minutes</strong>.
          </p>

          {/* Quick value badges */}
          <div className="flex flex-wrap items-center gap-3 text-xs text-zinc-300 font-medium">
            <div className="flex items-center gap-1.5 bg-white/10 px-3 py-1.5 rounded-xl backdrop-blur-sm border border-white/10">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span>Flat ₱45 Delivery across 32 Barangays</span>
            </div>
            <div className="flex items-center gap-1.5 bg-white/10 px-3 py-1.5 rounded-xl backdrop-blur-sm border border-white/10">
              <Shield className="w-3.5 h-3.5 text-amber-400" />
              <span>Cash-on-Delivery (COD)</span>
            </div>
            <div className="flex items-center gap-1.5 bg-white/10 px-3 py-1.5 rounded-xl backdrop-blur-sm border border-white/10">
              <Clock className="w-3.5 h-3.5 text-blue-400" />
              <span>Direct Single-Store Dispatch</span>
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="mt-8 relative max-w-xl">
          <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search bagoong, boneless bangus, hot pandesal, medicine..."
            className="w-full pl-11 pr-4 py-3.5 rounded-2xl bg-white text-slate-deep placeholder:text-zinc-400 text-sm focus:outline-none focus:ring-2 focus:ring-movli shadow-lg"
          />
        </div>
      </section>

      {/* Category Pills Strip */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-deep tracking-tight">Categories</h2>
          <span className="text-xs text-zinc-500">Pick a category to filter</span>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar">
          {CATEGORIES.map((cat) => {
            const isSelected = selectedCategory === cat.id;
            const Icon = cat.icon;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-4 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap flex items-center gap-2 transition-all duration-200 ${
                  isSelected
                    ? "bg-movli text-white shadow-md shadow-movli/20 scale-102"
                    : "bg-white text-zinc-700 border border-zinc-200 hover:border-zinc-300 hover:bg-zinc-50"
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isSelected ? "text-white" : "text-movli"}`} />
                <span>{cat.name}</span>
              </button>
            );
          })}
        </div>
      </section>

      {/* Featured Lingayen Stores Showcase */}
      <section id="stores" className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-deep tracking-tight">Verified Lingayen Stores</h2>
            <p className="text-xs text-zinc-500">Fulfill directly from trusted local native merchants</p>
          </div>
          <span className="text-xs font-bold text-movli font-mono">{stores.length} Stores Online</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {stores.map((s) => (
            <Link
              key={s.id}
              href={`/store/${s.slug}`}
              className="group bg-white rounded-2xl p-4 border border-zinc-200 hover:border-movli/40 shadow-sm hover:shadow-card transition flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 rounded-xl bg-zinc-100 overflow-hidden flex-shrink-0 border border-zinc-100 relative">
                    {s.logoUrl ? (
                      <img
                        src={s.logoUrl}
                        alt={s.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-zinc-400">
                        <Store className="w-6 h-6" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <h3 className="font-bold text-slate-deep text-sm truncate group-hover:text-movli transition">
                        {s.name}
                      </h3>
                      {s.isOpen ? (
                        <span className="w-2 h-2 rounded-full bg-emerald-500 flex-shrink-0" />
                      ) : (
                        <span className="w-2 h-2 rounded-full bg-zinc-400 flex-shrink-0" />
                      )}
                    </div>
                    <div className="flex items-center gap-1 text-[11px] text-zinc-500 mt-0.5">
                      <MapPin className="w-3 h-3 text-movli" />
                      <span>Brgy. {s.barangay}</span>
                    </div>
                  </div>
                </div>

                <p className="text-xs text-zinc-600 line-clamp-2 leading-relaxed mb-3">
                  {s.description}
                </p>
              </div>

              <div className="pt-3 border-t border-zinc-100 flex items-center justify-between text-xs text-zinc-500">
                <span className="flex items-center gap-1 text-[11px] text-zinc-500">
                  <Clock className="w-3 h-3 text-zinc-400" />
                  20-35 mins
                </span>
                <span className="text-xs font-semibold text-movli group-hover:translate-x-0.5 transition flex items-center gap-1">
                  View Catalog <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Trending Products Catalog Grid */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-slate-deep tracking-tight">
              {selectedCategory === "ALL" ? "Marketplace Catalog" : selectedCategory}
            </h2>
            <p className="text-xs text-zinc-500">
              Showing {filteredProducts.length} local items ready for dispatch
            </p>
          </div>
        </div>

        {filteredProducts.length === 0 ? (
          <div className="p-12 text-center bg-white rounded-2xl border border-zinc-200 text-zinc-400">
            <ShoppingBag className="w-12 h-12 mx-auto mb-3 opacity-40" />
            <p className="text-sm font-semibold text-slate-deep">No products match your search</p>
            <p className="text-xs text-zinc-500 mt-1">Try another keyword or select All Categories.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredProducts.map((p) => {
              const isAdded = addedProductId === p.id;
              const isFromCartStore = cartStoreId === p.store.id;

              return (
                <div
                  key={p.id}
                  className="bg-white rounded-2xl p-3 border border-zinc-200 hover:border-zinc-300 shadow-sm hover:shadow-card transition flex flex-col justify-between"
                >
                  <div>
                    {/* 1:1 Aspect Ratio Product Image */}
                    <div className="w-full aspect-square rounded-xl bg-zinc-100 overflow-hidden mb-2.5 relative group">
                      {p.imageUrl ? (
                        <img
                          src={p.imageUrl}
                          alt={p.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-zinc-300">
                          <ShoppingBag className="w-8 h-8" />
                        </div>
                      )}

                      <span className="absolute top-2 left-2 text-[10px] font-semibold bg-white/90 backdrop-blur-md px-2 py-0.5 rounded-md text-zinc-700 shadow-sm border border-zinc-200/50">
                        {p.store.name}
                      </span>
                    </div>

                    <h3 className="font-bold text-slate-deep text-xs leading-snug line-clamp-2 mb-1">
                      {p.name}
                    </h3>

                    {p.description && (
                      <p className="text-[11px] text-zinc-500 line-clamp-2 leading-relaxed mb-2">
                        {p.description}
                      </p>
                    )}
                  </div>

                  <div className="pt-2 border-t border-zinc-100 flex items-center justify-between gap-2">
                    <div>
                      <span className="text-movli font-black text-sm">
                        {formatPHP(p.price)}
                      </span>
                      <div className="text-[10px] text-zinc-400">
                        {p.stock > 0 ? `${p.stock} in stock` : "Out of stock"}
                      </div>
                    </div>

                    <button
                      disabled={!p.isAvailable || p.stock <= 0}
                      onClick={() => handleAddToCart(p)}
                      className={`px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1 transition ${
                        isAdded
                          ? "bg-emerald-600 text-white"
                          : !p.isAvailable || p.stock <= 0
                          ? "bg-zinc-100 text-zinc-400 cursor-not-allowed"
                          : "bg-movli text-white hover:bg-movli-600 shadow-sm active:scale-95"
                      }`}
                    >
                      {isAdded ? (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          <span>Added</span>
                        </>
                      ) : (
                        <>
                          <Plus className="w-3.5 h-3.5" />
                          <span>Add</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
