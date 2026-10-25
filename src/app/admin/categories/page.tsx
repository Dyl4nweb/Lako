import React from "react";
import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/server-auth";
import { CategoryManagementView } from "@/components/admin/CategoryManagementView";

export const dynamic = "force-dynamic";

export default async function AdminCategoriesPage() {
  await requireAdmin();

  let categories: {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    imageUrl: string | null;
    active: boolean;
    _count: {
      products: number;
    };
  }[] = [];

  try {
    categories = await prisma.category.findMany({
      include: {
        _count: {
          select: { products: true },
        },
      },
      orderBy: { name: "asc" },
    });
  } catch (err) {
    console.error("Failed to load admin categories:", err);
  }

  return <CategoryManagementView initialCategories={categories} />;
}
