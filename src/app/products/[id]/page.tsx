import React from "react";
import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";
import { Navbar } from "@/components/shared/Navbar";
import { Footer } from "@/components/shared/Footer";
import { ProductDetailClient } from "@/components/customer/ProductDetailClient";
import { ProductCard } from "@/components/shared/ProductCard";

import { getProductById, getProducts } from "@/lib/catalog-service";

interface ProductPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function ProductDetailPage({ params }: ProductPageProps) {
  const { id } = await params;

  const product = await getProductById(id);

  if (!product) {
    notFound();
  }

  const relatedProducts = await getProducts({
    categoryId: product.categoryId,
    limit: 4,
  });

  const formattedProduct = {
    ...product,
    price: Number(product.price),
  };

  return (
    <div className="min-h-screen flex flex-col bg-neutral-50">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <ProductDetailClient product={formattedProduct} />

        {/* Related Category Products */}
        {relatedProducts.length > 0 && (
          <section className="mt-12 sm:mt-16 pt-8 border-t border-neutral-200">
            <h2 className="text-lg sm:text-xl font-black text-neutral-900 tracking-tight mb-5">
              More from {product.category.name}
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-5">
              {relatedProducts.map((p) => (
                <ProductCard
                  key={p.id}
                  id={p.id}
                  name={p.name}
                  slug={p.slug}
                  price={Number(p.price)}
                  stock={p.stock}
                  imageUrl={p.imageUrl}
                  categoryName={p.category?.name}
                />
              ))}
            </div>
          </section>
        )}
      </main>

      <Footer />
    </div>
  );
}
