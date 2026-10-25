import React from "react";
import Link from "next/link";
import prisma from "@/lib/prisma";
import { Navbar } from "@/components/shared/Navbar";
import { Footer } from "@/components/shared/Footer";
import { ProductCard } from "@/components/shared/ProductCard";
import { Prisma } from "@prisma/client";
import { Filter, Search, RotateCcw } from "lucide-react";
import { getCategories, getProducts } from "@/lib/catalog-service";

interface ProductsPageProps {
  searchParams: Promise<{
    category?: string;
    q?: string;
    sort?: string;
  }>;
}

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  const resolvedParams = await searchParams;
  const categorySlug = resolvedParams.category;
  const searchQuery = resolvedParams.q;
  const sort = resolvedParams.sort || "newest";

  const [categories, products] = await Promise.all([
    getCategories(),
    getProducts({
      categorySlug,
      searchQuery,
      sort,
    }),
  ]);

  const selectedCategory = categories.find((c) => c.slug === categorySlug);

  return (
    <div className="min-h-screen flex flex-col bg-neutral-50">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Breadcrumb & Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-neutral-200">
          <div>
            <div className="flex items-center gap-2 text-xs text-neutral-500 mb-1">
              <Link href="/" className="hover:text-orange-600">
                Home
              </Link>
              <span>/</span>
              <span className="text-neutral-900 font-medium">Marketplace Catalog</span>
              {selectedCategory && (
                <>
                  <span>/</span>
                  <span className="text-orange-600 font-bold">{selectedCategory.name}</span>
                </>
              )}
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-neutral-900 tracking-tight">
              {searchQuery
                ? `Results for "${searchQuery}"`
                : selectedCategory
                ? selectedCategory.name
                : "All Local Market Goods"}
            </h1>
            <p className="text-xs text-neutral-500 mt-0.5">
              Showing {products.length} product{products.length === 1 ? "" : "s"} ready for local delivery
            </p>
          </div>

          {/* Sort Control */}
          <div className="flex items-center gap-2 self-start sm:self-auto">
            <span className="text-xs font-semibold text-neutral-500">Sort by:</span>
            <div className="flex items-center gap-1.5 bg-white p-1 rounded-xl border border-neutral-200 text-xs font-semibold">
              <Link
                href={`/products?${new URLSearchParams({
                  ...(categorySlug ? { category: categorySlug } : {}),
                  ...(searchQuery ? { q: searchQuery } : {}),
                  sort: "newest",
                }).toString()}`}
                className={`px-3 py-1.5 rounded-lg transition-colors ${
                  sort === "newest"
                    ? "bg-orange-600 text-white"
                    : "text-neutral-600 hover:text-neutral-900"
                }`}
              >
                Newest
              </Link>
              <Link
                href={`/products?${new URLSearchParams({
                  ...(categorySlug ? { category: categorySlug } : {}),
                  ...(searchQuery ? { q: searchQuery } : {}),
                  sort: "price-asc",
                }).toString()}`}
                className={`px-3 py-1.5 rounded-lg transition-colors ${
                  sort === "price-asc"
                    ? "bg-orange-600 text-white"
                    : "text-neutral-600 hover:text-neutral-900"
                }`}
              >
                Price: Low to High
              </Link>
              <Link
                href={`/products?${new URLSearchParams({
                  ...(categorySlug ? { category: categorySlug } : {}),
                  ...(searchQuery ? { q: searchQuery } : {}),
                  sort: "price-desc",
                }).toString()}`}
                className={`px-3 py-1.5 rounded-lg transition-colors ${
                  sort === "price-desc"
                    ? "bg-orange-600 text-white"
                    : "text-neutral-600 hover:text-neutral-900"
                }`}
              >
                Price: High to Low
              </Link>
            </div>
          </div>
        </div>

        {/* Categories Bar */}
        <div className="flex items-center gap-2 overflow-x-auto py-4 scrollbar-none">
          <Link
            href={`/products${searchQuery ? `?q=${encodeURIComponent(searchQuery)}` : ""}`}
            className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-colors ${
              !categorySlug
                ? "bg-neutral-900 text-white"
                : "bg-white text-neutral-600 border border-neutral-200 hover:border-neutral-400"
            }`}
          >
            All Categories
          </Link>
          {categories.map((c) => (
            <Link
              key={c.id}
              href={`/products?category=${c.slug}${searchQuery ? `&q=${encodeURIComponent(searchQuery)}` : ""}`}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-colors ${
                categorySlug === c.slug
                  ? "bg-orange-600 text-white shadow-xs"
                  : "bg-white text-neutral-600 border border-neutral-200 hover:border-orange-500 hover:text-orange-600"
              }`}
            >
              {c.name}
            </Link>
          ))}
        </div>

        {/* Product Grid */}
        {products.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5 pt-2 pb-12">
            {products.map((prod) => (
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
          <div className="text-center py-20 bg-white rounded-3xl border border-neutral-200 p-8 my-6">
            <Search className="w-12 h-12 text-neutral-300 mx-auto mb-3" />
            <h3 className="text-base font-bold text-neutral-900">
              No matching products found
            </h3>
            <p className="text-xs text-neutral-500 max-w-sm mx-auto mt-1 mb-5">
              Try adjusting your search terms or selecting a different category filter.
            </p>
            <Link
              href="/products"
              className="inline-flex items-center gap-2 bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-xs transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset All Filters</span>
            </Link>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
