"use client";

import React, { useState } from "react";
import Link from "next/link";
import { formatPHP } from "@/lib/utils";
import { useCart } from "@/context/CartContext";
import {
  ArrowLeft,
  MapPin,
  Clock,
  Phone,
  Plus,
  Check,
  ShoppingBag,
  Store,
  Sparkles,
} from "lucide-react";

interface Product {
  id: string;
  name: string;
  description: string | null;
  price: number;
  stock: number;
  imageUrl: string | null;
  category: string;
  isAvailable: boolean;
}

interface StoreData {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  barangay: string;
  contactNumber: string;
  logoUrl: string | null;
  bannerUrl: string | null;
  isOpen: boolean;
  products: Product[];
}

export function StoreProfileView({ store }: { store: StoreData }) {
  const [selectedCategory, setSelectedCategory] = useState("ALL");
  const [addedProductId, setAddedProductId] = useState<string | null>(null);

  const { addItem, storeId, items } = useCart();

  const categories = ["ALL", ...Array.from(new Set(store.products.map((p) => p.category)))];

  const filteredProducts = store.products.filter(
    (p) => selectedCategory === "ALL" || p.category === selectedCategory
  );

  const isCurrentCartStore = storeId === store.id;

  const handleAddToCart = (p: Product) => {
    addItem(
      {
        id: store.id,
        name: store.name,
        slug: store.slug,
        barangay: store.barangay,
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
    <div className="space-y-6">
      {/* Back link */}
      <div>
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-zinc-500 hover:text-slate-deep transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Marketplace</span>
        </Link>
      </div>

      {/* Panoramic Banner Card */}
      <div className="bg-white rounded-3xl border border-zinc-200 overflow-hidden shadow-sm">
        <div className="h-44 sm:h-64 w-full bg-zinc-200 relative overflow-hidden">
          {store.bannerUrl ? (
            <img
              src={store.bannerUrl}
              alt={store.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-r from-movli to-movli-700" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

          {/* Operational Status Pill */}
          <div className="absolute top-4 right-4">
            {store.isOpen ? (
              <span className="bg-emerald-500/90 backdrop-blur-md text-white text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1.5 shadow-md">
                <span className="w-2 h-2 rounded-full bg-white beacon-active" />
                Open for Orders
              </span>
            ) : (
              <span className="bg-zinc-800/90 backdrop-blur-md text-zinc-300 text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-zinc-400" />
                Closed
              </span>
            )}
          </div>
        </div>

        {/* Store Info Bar */}
        <div className="p-6 relative">
          <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 -mt-16 sm:-mt-20 mb-4">
            <div className="flex items-end gap-4">
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-white border-4 border-white shadow-xl overflow-hidden relative flex-shrink-0">
                {store.logoUrl ? (
                  <img
                    src={store.logoUrl}
                    alt={store.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full bg-zinc-100 flex items-center justify-center text-zinc-400">
                    <Store className="w-8 h-8" />
                  </div>
                )}
              </div>
              <div className="pb-1">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-deep tracking-tight font-outfit">
                  {store.name}
                </h1>
                <div className="flex flex-wrap items-center gap-3 text-xs text-zinc-500 mt-1">
                  <span className="flex items-center gap-1 text-slate-deep font-semibold">
                    <MapPin className="w-3.5 h-3.5 text-movli" />
                    Brgy. {store.barangay}, Lingayen
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-zinc-400" />
                    25-35 mins prep
                  </span>
                  <span className="flex items-center gap-1">
                    <Phone className="w-3.5 h-3.5 text-zinc-400" />
                    {store.contactNumber}
                  </span>
                </div>
              </div>
            </div>

            {isCurrentCartStore && items.length > 0 && (
              <div className="bg-movli-50 border border-movli-200 px-3 py-1.5 rounded-xl text-xs text-movli font-bold flex items-center gap-1.5">
                <ShoppingBag className="w-4 h-4" />
                <span>{items.reduce((acc, i) => acc + i.quantity, 0)} items from this store in basket</span>
              </div>
            )}
          </div>

          {store.description && (
            <p className="text-xs sm:text-sm text-zinc-600 max-w-3xl leading-relaxed">
              {store.description}
            </p>
          )}
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar">
        {categories.map((c) => {
          const isSelected = selectedCategory === c;
          return (
            <button
              key={c}
              onClick={() => setSelectedCategory(c)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
                isSelected
                  ? "bg-slate-deep text-white shadow-sm"
                  : "bg-white text-zinc-600 border border-zinc-200 hover:border-zinc-300"
              }`}
            >
              {c === "ALL" ? "All Store Products" : c}
            </button>
          );
        })}
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredProducts.map((p) => {
          const isAdded = addedProductId === p.id;
          return (
            <div
              key={p.id}
              className="bg-white rounded-2xl p-4 border border-zinc-200 hover:border-zinc-300 shadow-sm flex flex-col justify-between"
            >
              <div className="flex gap-4">
                <div className="w-24 h-24 rounded-xl bg-zinc-100 overflow-hidden flex-shrink-0 relative">
                  {p.imageUrl ? (
                    <img
                      src={p.imageUrl}
                      alt={p.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-zinc-300">
                      <ShoppingBag className="w-6 h-6" />
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider mb-0.5">
                    {p.category}
                  </div>
                  <h3 className="font-bold text-slate-deep text-sm line-clamp-2 leading-snug">
                    {p.name}
                  </h3>
                  {p.description && (
                    <p className="text-xs text-zinc-500 line-clamp-2 mt-1 leading-relaxed">
                      {p.description}
                    </p>
                  )}
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-zinc-100 flex items-center justify-between">
                <div>
                  <div className="text-movli font-black text-base">
                    {formatPHP(p.price)}
                  </div>
                  <div className="text-[10px] text-zinc-400">
                    {p.stock > 0 ? `${p.stock} units available` : "Out of stock"}
                  </div>
                </div>

                <button
                  disabled={!store.isOpen || !p.isAvailable || p.stock <= 0}
                  onClick={() => handleAddToCart(p)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition ${
                    isAdded
                      ? "bg-emerald-600 text-white"
                      : !store.isOpen || !p.isAvailable || p.stock <= 0
                      ? "bg-zinc-100 text-zinc-400 cursor-not-allowed"
                      : "bg-movli text-white hover:bg-movli-600 shadow-md shadow-movli/20 active:scale-95"
                  }`}
                >
                  {isAdded ? (
                    <>
                      <Check className="w-4 h-4" />
                      <span>Added</span>
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4" />
                      <span>Add to Basket</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
