"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getCurrentSession } from "@/lib/auth/session";

export async function toggleProductStockAction(productId: string, isAvailable: boolean) {
  const session = await getCurrentSession();
  if (!session || (session.role !== "SELLER" && session.role !== "ADMIN" && session.role !== "SUPER_ADMIN")) {
    throw new Error("Unauthorized to modify inventory.");
  }

  const product = await prisma.product.findUnique({
    where: { id: productId },
    include: { store: true },
  });

  if (!product) throw new Error("Product not found.");

  // If seller, ensure they own the store
  if (session.role === "SELLER" && product.store.ownerId !== session.id) {
    throw new Error("You do not have permission to manage this store's inventory.");
  }

  const updated = await prisma.product.update({
    where: { id: productId },
    data: {
      isAvailable,
      stock: isAvailable ? (product.stock > 0 ? product.stock : 10) : 0,
    },
  });

  revalidatePath("/");
  revalidatePath("/seller");
  revalidatePath(`/store/${product.store.slug}`);

  return updated;
}

export async function toggleStoreOpenStatusAction(storeId: string, isOpen: boolean) {
  const session = await getCurrentSession();
  if (!session || (session.role !== "SELLER" && session.role !== "ADMIN" && session.role !== "SUPER_ADMIN")) {
    throw new Error("Unauthorized.");
  }

  const store = await prisma.store.findUnique({ where: { id: storeId } });
  if (!store) throw new Error("Store not found.");

  if (session.role === "SELLER" && store.ownerId !== session.id) {
    throw new Error("You do not own this store.");
  }

  const updated = await prisma.store.update({
    where: { id: storeId },
    data: { isOpen },
  });

  revalidatePath("/");
  revalidatePath("/seller");
  revalidatePath(`/store/${store.slug}`);

  return updated;
}
