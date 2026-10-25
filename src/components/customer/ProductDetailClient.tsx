"use client";

import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useCart } from "@/context/CartContext";
import {
  ShoppingBag,
  Check,
  Truck,
  ShieldCheck,
  Banknote,
  Minus,
  Plus,
  ArrowLeft,
} from "lucide-react";

interface ProductDetailClientProps {
  product: {
    id: string;
    name: string;
    slug: string;
    description: string;
    price: number;
    stock: number;
    imageUrl: string;
    category: {
      id: string;
      name: string;
      slug: string;
    };
  };
}

export function ProductDetailClient({ product }: ProductDetailClientProps) {
  const { addItem } = useCart();
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  const isOutOfStock = product.stock <= 0;
  const isLowStock = product.stock > 0 && product.stock <= 5;

  const handleDecrement = () => {
    if (quantity > 1) setQuantity((q) => q - 1);
  };

  const handleIncrement = () => {
    if (quantity < product.stock) setQuantity((q) => q + 1);
  };

  const handleAddToCart = () => {
    if (isOutOfStock) return;

    addItem(
      {
        productId: product.id,
        name: product.name,
        slug: product.slug,
        price: product.price,
        imageUrl: product.imageUrl,
        stock: product.stock,
        categoryName: product.category.name,
      },
      quantity
    );

    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  return (
    <div className="space-y-6">
      {/* Back button */}
      <Link
        href="/products"
        className="inline-flex items-center gap-1.5 text-xs font-bold text-neutral-600 hover:text-orange-600 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Products</span>
      </Link>

      <div className="bg-white rounded-3xl border border-neutral-200/80 p-6 sm:p-8 lg:p-10 shadow-xs">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          {/* Image Area */}
          <div className="lg:col-span-6">
            <div className="relative aspect-square w-full rounded-2xl overflow-hidden bg-neutral-100 border border-neutral-200/80 shadow-inner">
              <Image
                src={product.imageUrl}
                alt={product.name}
                fill
                priority
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover object-center"
              />
              {isOutOfStock && (
                <div className="absolute inset-0 bg-neutral-900/60 backdrop-blur-xs flex items-center justify-center">
                  <span className="bg-neutral-950 text-white font-black text-sm uppercase px-4 py-2 rounded-xl shadow-lg">
                    Out of Stock
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Details & Actions */}
          <div className="lg:col-span-6 flex flex-col space-y-6">
            {/* Category & Title */}
            <div>
              <Link
                href={`/products?category=${product.category.slug}`}
                className="inline-block text-xs font-black uppercase tracking-wider text-orange-600 bg-orange-50 hover:bg-orange-100 px-3 py-1 rounded-full mb-2 transition-colors"
              >
                {product.category.name}
              </Link>
              <h1 className="text-xl sm:text-3xl font-black text-neutral-900 tracking-tight leading-snug">
                {product.name}
              </h1>
            </div>

            {/* Price & Stock Highlight */}
            <div className="bg-neutral-50/80 border border-neutral-100 rounded-2xl p-4 sm:p-5 flex items-center justify-between">
              <div>
                <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider">
                  Item Price
                </span>
                <div className="text-2xl sm:text-3xl font-black text-orange-600">
                  ₱{product.price.toLocaleString("en-PH", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
              </div>

              <div className="text-right">
                <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider">
                  Availability
                </span>
                <div className="flex items-center gap-2 justify-end mt-0.5">
                  <span
                    className={`inline-block w-2 h-2 rounded-full ${
                      isOutOfStock ? "bg-neutral-400" : isLowStock ? "bg-amber-500" : "bg-emerald-500"
                    }`}
                  />
                  <span
                    className={`text-xs font-bold ${
                      isOutOfStock ? "text-neutral-500" : isLowStock ? "text-amber-700" : "text-emerald-700"
                    }`}
                  >
                    {isOutOfStock ? "Out of Stock" : `${product.stock} Units In Stock`}
                  </span>
                </div>
              </div>
            </div>

            {/* Quantity Selector */}
            {!isOutOfStock && (
              <div className="space-y-2">
                <label className="text-xs font-bold text-neutral-700">Quantity</label>
                <div className="flex items-center gap-3">
                  <div className="flex items-center border border-neutral-300 rounded-xl bg-white overflow-hidden shadow-xs">
                    <button
                      type="button"
                      onClick={handleDecrement}
                      disabled={quantity <= 1}
                      className="p-2.5 text-neutral-600 hover:bg-neutral-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                      aria-label="Decrease quantity"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="w-12 text-center text-sm font-bold text-neutral-900 select-none">
                      {quantity}
                    </span>
                    <button
                      type="button"
                      onClick={handleIncrement}
                      disabled={quantity >= product.stock}
                      className="p-2.5 text-neutral-600 hover:bg-neutral-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                      aria-label="Increase quantity"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                  <span className="text-xs text-neutral-500">
                    Max: {product.stock} per purchase
                  </span>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="pt-2 flex flex-col sm:flex-row gap-3">
              <button
                type="button"
                onClick={handleAddToCart}
                disabled={isOutOfStock}
                className={`flex-1 flex items-center justify-center gap-2 py-3.5 px-6 rounded-2xl font-bold text-sm shadow-md transition-all ${
                  isOutOfStock
                    ? "bg-neutral-200 text-neutral-400 cursor-not-allowed shadow-none"
                    : added
                    ? "bg-emerald-600 text-white shadow-emerald-600/30"
                    : "bg-orange-600 hover:bg-orange-700 text-white shadow-orange-600/30 hover:scale-102"
                }`}
              >
                {added ? (
                  <>
                    <Check className="w-5 h-5" />
                    <span>Added to Cart!</span>
                  </>
                ) : (
                  <>
                    <ShoppingBag className="w-5 h-5" />
                    <span>Add to Shopping Cart</span>
                  </>
                )}
              </button>

              <Link
                href="/cart"
                className="inline-flex items-center justify-center py-3.5 px-6 rounded-2xl font-bold text-sm bg-neutral-900 hover:bg-black text-white transition-colors"
              >
                View Cart & Checkout
              </Link>
            </div>

            {/* Description */}
            <div className="pt-6 border-t border-neutral-100 space-y-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-900">
                Product Details
              </h3>
              <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed whitespace-pre-line">
                {product.description}
              </p>
            </div>

            {/* Highlights info box */}
            <div className="rounded-2xl bg-orange-50/60 border border-orange-100 p-4 space-y-2.5 text-xs text-neutral-700">
              <div className="flex items-center gap-2 font-medium">
                <Banknote className="w-4 h-4 text-orange-600 shrink-0" />
                <span>Payment Method: <strong>Cash on Delivery (COD) Only</strong></span>
              </div>
              <div className="flex items-center gap-2 font-medium">
                <Truck className="w-4 h-4 text-orange-600 shrink-0" />
                <span>Standard Delivery Fee: <strong>₱45.00 Flat Local Rate</strong></span>
              </div>
              <div className="flex items-center gap-2 font-medium">
                <ShieldCheck className="w-4 h-4 text-orange-600 shrink-0" />
                <span>Carefully packed by local handlers & dispatched in town</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
