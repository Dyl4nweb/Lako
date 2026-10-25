import React from "react";
import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/server-auth";
import { ProductManagementView } from "@/components/admin/ProductManagementView";

export const dynamic = "force-dynamic";

export default async function AdminProductsPage() {
  await requireAdmin();

  let products: {
    id: string;
    name: string;
    slug: string;
    description: string;
    price: unknown;
    stock: number;
    imageUrl: string;
    published: boolean;
    categoryId: string;
    category: {
      name: string;
    };
  }[] = [];

  let categories: { id: string; name: string }[] = [];

  try {
    const [fetchedProducts, fetchedCategories] = await Promise.all([
      prisma.product.findMany({
        include: {
          category: {
            select: { name: true },
          },
        },
        orderBy: { createdAt: "desc" },
      }),
      prisma.category.findMany({
        where: { active: true },
        select: { id: true, name: true },
        orderBy: { name: "asc" },
      }),
    ]);

    products = fetchedProducts;
    categories = fetchedCategories;
  } catch (e) {
    console.error("Failed to load admin products:", e);
  }

  const formattedProducts = products.map((p) => ({
    ...p,
    price: Number(p.price),
  }));

  return (
    <ProductManagementView
      initialProducts={formattedProducts}
      categories={categories}
    />
  );
}
