import React from "react";
import Link from "next/link";
import Image from "next/image";
import prisma from "@/lib/prisma";
import { Navbar } from "@/components/shared/Navbar";
import { Footer } from "@/components/shared/Footer";
import { ProductCard } from "@/components/shared/ProductCard";
import { ArrowRight, Sparkles, TrendingUp, ShoppingBag, ShieldCheck } from "lucide-react";

import { getCategories, getProducts } from "@/lib/catalog-service";

export default async function HomePage() {
  const categories = await getCategories();
  const featuredProducts = await getProducts({ limit: 12 });

  return (
    <div className="min-h-screen flex flex-col bg-neutral-50">
      <Navbar />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden bg-gradient-to-b from-orange-600 via-orange-500 to-amber-500 text-white pt-8 pb-14 sm:pt-12 sm:pb-20">
          {/* Subtle background texture circles */}
          <div className="absolute top-0 right-0 -mt-10 -mr-10 w-96 h-96 rounded-full bg-white/10 blur-2xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-80 h-80 rounded-full bg-orange-700/20 blur-xl pointer-events-none" />

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              <div className="lg:col-span-7 space-y-4 text-center lg:text-left">
                <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-xs px-3.5 py-1.5 rounded-full text-xs font-bold tracking-wide uppercase shadow-xs">
                  <Sparkles className="w-3.5 h-3.5 text-amber-200" />
                  <span>Lingayen & Provincial Express Marketplace</span>
                </div>

                <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-tight">
                  Everything moves <br className="hidden sm:inline" />
                  <span className="text-amber-200 underline decoration-amber-300 decoration-wavy decoration-2">
                    with Movli.
                  </span>
                </h1>

                <p className="text-sm sm:text-lg text-orange-50/90 max-w-xl mx-auto lg:mx-0 font-medium leading-relaxed">
                  Shop fresh market seafood, famous native delicacies, and everyday pantry essentials
                  delivered straight to your doorstep with guaranteed Cash on Delivery.
                </p>

                <div className="pt-2 flex flex-wrap items-center justify-center lg:justify-start gap-3">
                  <Link
                    href="/products"
                    className="inline-flex items-center gap-2 bg-neutral-900 hover:bg-black text-white font-bold text-sm px-6 py-3.5 rounded-2xl shadow-lg shadow-black/20 transition-all hover:scale-102"
                  >
                    <span>Browse Catalog</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>

                  <Link
                    href="/orders"
                    className="inline-flex items-center gap-2 bg-white/20 hover:bg-white/30 text-white font-bold text-sm px-6 py-3.5 rounded-2xl backdrop-blur-xs transition-colors"
                  >
                    <span>Track Active Order</span>
                  </Link>
                </div>

                {/* Trust Badges */}
                <div className="pt-4 flex items-center justify-center lg:justify-start gap-6 text-xs text-orange-100 font-semibold">
                  <div className="flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-amber-200" />
                    <span>100% Cash on Delivery</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <ShoppingBag className="w-4 h-4 text-amber-200" />
                    <span>Fresh Daily Market Stock</span>
                  </div>
                </div>
              </div>

              {/* Hero Visual Card */}
              <div className="lg:col-span-5 flex justify-center">
                <div className="relative w-full max-w-md aspect-4/3 sm:aspect-square rounded-3xl overflow-hidden shadow-2xl border-4 border-white/30 bg-neutral-900">
                  <Image
                    src="https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=800&q=80"
                    alt="Movli Local Market Goods"
                    fill
                    priority
                    sizes="(max-width: 768px) 100vw, 40vw"
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-neutral-950/80 via-transparent to-transparent flex flex-col justify-end p-6 text-white">
                    <span className="px-2.5 py-1 rounded-full text-[11px] font-black bg-orange-600 text-white w-fit shadow-xs mb-2">
                      Featured Marketplace
                    </span>
                    <h2 className="text-xl font-bold">Lingayen Local Goods Hub</h2>
                    <p className="text-xs text-neutral-200">
                      Fresh Boneless Bangus, Authentic Bagoong & Tupig
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Categories Carousel/Grid */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg sm:text-xl font-black text-neutral-900 tracking-tight">
                Shop by Category
              </h2>
              <p className="text-xs text-neutral-500">Find what you need in seconds</p>
            </div>
            <Link
              href="/products"
              className="text-xs font-bold text-orange-600 hover:text-orange-700 flex items-center gap-1"
            >
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
            {categories.length > 0 ? (
              categories.map((cat) => (
                <Link
                  key={cat.id}
                  href={`/products?category=${cat.slug}`}
                  className="group flex flex-col items-center bg-white rounded-2xl p-4 border border-neutral-200/80 hover:border-orange-500 hover:shadow-md transition-all text-center"
                >
                  <div className="relative w-14 h-14 rounded-2xl overflow-hidden mb-3 bg-orange-50 group-hover:scale-105 transition-transform">
                    {cat.imageUrl ? (
                      <Image
                        src={cat.imageUrl}
                        alt={cat.name}
                        fill
                        sizes="60px"
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-orange-600 font-bold text-lg">
                        {cat.name.charAt(0)}
                      </div>
                    )}
                  </div>
                  <h3 className="text-xs font-bold text-neutral-800 group-hover:text-orange-600 line-clamp-2 leading-snug">
                    {cat.name}
                  </h3>
                </Link>
              ))
            ) : (
              <div className="col-span-full py-8 text-center text-neutral-500 text-xs bg-white rounded-2xl border border-dashed border-neutral-200">
                Categories are loading or pending database migration.
              </div>
            )}
          </div>
        </section>

        {/* Featured Products Listing */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-orange-600" />
              <div>
                <h2 className="text-lg sm:text-xl font-black text-neutral-900 tracking-tight">
                  Fresh Arrivals & Marketplace Favorites
                </h2>
                <p className="text-xs text-neutral-500">
                  Ready for instant packing and rider dispatch
                </p>
              </div>
            </div>

            <Link
              href="/products"
              className="text-xs font-bold text-orange-600 hover:text-orange-700 flex items-center gap-1"
            >
              <span>See More</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {featuredProducts.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5">
              {featuredProducts.map((prod) => (
                <ProductCard
                  key={prod.id}
                  id={prod.id}
                  name={prod.name}
                  slug={prod.slug}
                  price={Number(prod.price)}
                  stock={prod.stock}
                  imageUrl={prod.imageUrl}
                  categoryName={prod.category?.name}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-16 bg-white rounded-3xl border border-neutral-200 p-8">
              <ShoppingBag className="w-12 h-12 text-neutral-300 mx-auto mb-3" />
              <h3 className="text-base font-bold text-neutral-800">
                No products currently displayed
              </h3>
              <p className="text-xs text-neutral-500 max-w-sm mx-auto mt-1 mb-4">
                Connect your Neon database and run the migration and seed scripts to populate fresh local market items.
              </p>
              <Link
                href="/admin"
                className="inline-flex items-center gap-2 bg-orange-600 text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-xs"
              >
                Go to Admin Hub
              </Link>
            </div>
          )}
        </section>
      </main>

      <Footer />
    </div>
  );
}
