"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useCart } from "@/context/CartContext";
import { ShoppingBag, Check } from "lucide-react";

interface ProductCardProps {
  id: string;
  name: string;
  slug: string;
  price: number;
  stock: number;
  imageUrl: string;
  categoryName?: string;
}

export function ProductCard({
  id,
  name,
  slug,
  price,
  stock,
  imageUrl,
  categoryName,
}: ProductCardProps) {
  const { addItem } = useCart();
  const [added, setAdded] = useState(false);

  const isOutOfStock = stock <= 0;
  const isLowStock = stock > 0 && stock <= 5;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (isOutOfStock) return;

    addItem(
      {
        productId: id,
        name,
        slug,
        price,
        imageUrl,
        stock,
        categoryName,
      },
      1
    );

    setAdded(true);
    setTimeout(() => setAdded(false), 1200);
  };

  return (
    <div className="group relative flex flex-col bg-white rounded-2xl border border-neutral-200/80 shadow-xs hover:shadow-lg hover:border-orange-200 transition-all duration-200 overflow-hidden">
      {/* Product Image Area */}
      <Link href={`/products/${id}`} className="relative aspect-square w-full overflow-hidden bg-neutral-100">
        <Image
          src={imageUrl}
          alt={name}
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          className="object-cover object-center group-hover:scale-105 transition-transform duration-300"
        />

        {/* Floating Badges */}
        <div className="absolute top-2.5 left-2.5 flex flex-col gap-1 items-start z-10">
          {categoryName && (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-white/90 backdrop-blur-xs text-neutral-800 shadow-xs">
              {categoryName}
            </span>
          )}
          {isOutOfStock && (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-neutral-900/90 text-white shadow-xs">
              Sold Out
            </span>
          )}
          {isLowStock && !isOutOfStock && (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500 text-white shadow-xs">
              Only {stock} left
            </span>
          )}
        </div>
      </Link>

      {/* Card Content Area */}
      <div className="flex flex-col flex-1 p-3.5 sm:p-4">
        <Link href={`/products/${id}`} className="flex-1 group-hover:text-orange-600 transition-colors">
          <h3 className="text-xs sm:text-sm font-bold text-neutral-900 line-clamp-2 leading-snug">
            {name}
          </h3>
        </Link>

        {/* Stock & Delivery Tag */}
        <div className="flex items-center justify-between text-[11px] text-neutral-500 mt-2 mb-3">
          <span>{isOutOfStock ? "Out of stock" : `${stock} in stock`}</span>
          <span className="text-orange-700 font-medium">Local COD</span>
        </div>

        {/* Price & Add to Cart */}
        <div className="flex items-center justify-between pt-2 border-t border-neutral-100 gap-2">
          <div className="flex flex-col">
            <span className="text-[10px] font-medium text-neutral-400">Price</span>
            <span className="text-sm sm:text-base font-black text-orange-600 leading-tight">
              ₱{price.toLocaleString("en-PH", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>

          <button
            onClick={handleAddToCart}
            disabled={isOutOfStock}
            className={`p-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center shrink-0 ${
              isOutOfStock
                ? "bg-neutral-100 text-neutral-400 cursor-not-allowed"
                : added
                ? "bg-emerald-600 text-white scale-105"
                : "bg-orange-50 hover:bg-orange-600 text-orange-600 hover:text-white"
            }`}
            aria-label="Add to cart"
            title={isOutOfStock ? "Out of stock" : "Add to Cart"}
          >
            {added ? <Check className="w-4 h-4" /> : <ShoppingBag className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </div>
  );
}
