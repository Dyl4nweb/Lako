"use server";

import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/server-auth";
import { productSchema, categorySchema } from "@/lib/validations";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";

// PRODUCT ACTIONS
export async function createProductAction(data: {
  name: string;
  slug?: string;
  description: string;
  price: number;
  stock: number;
  imageUrl: string;
  categoryId: string;
  published?: boolean;
}) {
  try {
    const { user } = await requireAdmin();

    const validated = productSchema.safeParse(data);
    if (!validated.success) {
      return { success: false, error: validated.error.issues[0]?.message || "Validation failed" };
    }

    const baseSlug = (data.slug || data.name)
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");

    // Ensure unique slug
    let finalSlug = baseSlug;
    let counter = 1;
    while (await prisma.product.findUnique({ where: { slug: finalSlug } })) {
      finalSlug = `${baseSlug}-${counter}`;
      counter++;
    }

    const newProduct = await prisma.product.create({
      data: {
        name: validated.data.name,
        slug: finalSlug,
        description: validated.data.description,
        price: validated.data.price,
        stock: validated.data.stock,
        imageUrl: validated.data.imageUrl,
        categoryId: validated.data.categoryId,
        published: validated.data.published ?? true,
      },
    });

    // Record initial inventory log
    await prisma.inventoryLog.create({
      data: {
        productId: newProduct.id,
        change: validated.data.stock,
        reason: "INITIAL_STOCK",
        createdById: user.id,
      },
    });

    revalidatePath("/admin/products");
    revalidatePath("/products");
    revalidatePath("/");

    return { success: true, product: newProduct };
  } catch (error: unknown) {
    console.error("Create product error:", error);
    return { success: false, error: (error as Error)?.message || "Failed to create product." };
  }
}

export async function updateProductAction(
  id: string,
  data: {
    name: string;
    description: string;
    price: number;
    stock: number;
    imageUrl: string;
    categoryId: string;
    published?: boolean;
  }
) {
  try {
    const { user } = await requireAdmin();

    const validated = productSchema.safeParse(data);
    if (!validated.success) {
      return { success: false, error: validated.error.issues[0]?.message || "Validation failed" };
    }

    const existing = await prisma.product.findUnique({ where: { id } });
    if (!existing) {
      return { success: false, error: "Product not found." };
    }

    const stockDiff = validated.data.stock - existing.stock;

    await prisma.$transaction(async (tx) => {
      await tx.product.update({
        where: { id },
        data: {
          name: validated.data.name,
          description: validated.data.description,
          price: validated.data.price,
          stock: validated.data.stock,
          imageUrl: validated.data.imageUrl,
          categoryId: validated.data.categoryId,
          published: validated.data.published,
        },
      });

      if (stockDiff !== 0) {
        await tx.inventoryLog.create({
          data: {
            productId: id,
            change: stockDiff,
            reason: "ADMIN_STOCK_ADJUSTMENT",
            createdById: user.id,
          },
        });
      }
    });

    revalidatePath(`/products/${id}`);
    revalidatePath("/admin/products");
    revalidatePath("/products");
    revalidatePath("/");

    return { success: true };
  } catch (error: unknown) {
    console.error("Update product error:", error);
    return { success: false, error: (error as Error)?.message || "Failed to update product." };
  }
}

export async function deleteProductAction(id: string) {
  try {
    await requireAdmin();

    // Check if product is referenced in orders
    const orderItemsCount = await prisma.orderItem.count({
      where: { productId: id },
    });

    if (orderItemsCount > 0) {
      // Safe delete: unpublish product so past order history snapshots remain pristine
      await prisma.product.update({
        where: { id },
        data: { published: false },
      });
      revalidatePath("/admin/products");
      revalidatePath("/products");
      return {
        success: true,
        message: "Product is linked to previous customer orders. It has been archived and unpublished.",
      };
    }

    await prisma.product.delete({ where: { id } });

    revalidatePath("/admin/products");
    revalidatePath("/products");
    revalidatePath("/");

    return { success: true, message: "Product deleted permanently." };
  } catch (error: unknown) {
    console.error("Delete product error:", error);
    return { success: false, error: (error as Error)?.message || "Failed to delete product." };
  }
}

// CATEGORY ACTIONS
export async function createCategoryAction(data: {
  name: string;
  description?: string;
  imageUrl?: string;
  active?: boolean;
}) {
  try {
    await requireAdmin();

    const validated = categorySchema.safeParse(data);
    if (!validated.success) {
      return { success: false, error: validated.error.issues[0]?.message || "Validation failed" };
    }

    const baseSlug = data.name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");

    let finalSlug = baseSlug;
    let counter = 1;
    while (await prisma.category.findUnique({ where: { slug: finalSlug } })) {
      finalSlug = `${baseSlug}-${counter}`;
      counter++;
    }

    const newCategory = await prisma.category.create({
      data: {
        name: validated.data.name,
        slug: finalSlug,
        description: validated.data.description,
        imageUrl: validated.data.imageUrl || null,
        active: validated.data.active ?? true,
      },
    });

    revalidatePath("/admin/categories");
    revalidatePath("/products");
    revalidatePath("/");

    return { success: true, category: newCategory };
  } catch (error: unknown) {
    console.error("Create category error:", error);
    return { success: false, error: (error as Error)?.message || "Failed to create category." };
  }
}

export async function updateCategoryAction(
  id: string,
  data: {
    name: string;
    description?: string;
    imageUrl?: string;
    active?: boolean;
  }
) {
  try {
    await requireAdmin();

    const validated = categorySchema.safeParse(data);
    if (!validated.success) {
      return { success: false, error: validated.error.issues[0]?.message || "Validation failed" };
    }

    await prisma.category.update({
      where: { id },
      data: {
        name: validated.data.name,
        description: validated.data.description,
        imageUrl: validated.data.imageUrl || null,
        active: validated.data.active,
      },
    });

    revalidatePath("/admin/categories");
    revalidatePath("/products");
    revalidatePath("/");

    return { success: true };
  } catch (error: unknown) {
    console.error("Update category error:", error);
    return { success: false, error: (error as Error)?.message || "Failed to update category." };
  }
}

export async function deleteCategoryAction(id: string) {
  try {
    await requireAdmin();

    // Prevent deletion if category contains products
    const productsCount = await prisma.product.count({
      where: { categoryId: id },
    });

    if (productsCount > 0) {
      return {
        success: false,
        error: `Cannot delete category containing ${productsCount} product(s). Please reassign or delete the products first, or deactivate the category.`,
      };
    }

    await prisma.category.delete({ where: { id } });

    revalidatePath("/admin/categories");
    revalidatePath("/products");

    return { success: true };
  } catch (error: unknown) {
    console.error("Delete category error:", error);
    return { success: false, error: (error as Error)?.message || "Failed to delete category." };
  }
}

// RIDER & USER MANAGEMENT
export async function createRiderAction(data: {
  name: string;
  email: string;
  phone: string;
  password?: string;
}) {
  try {
    await requireAdmin();

    const initialPassword = data.password || "RiderPass123!";

    // Create via Better Auth API
    const signupRes = await auth.api.signUpEmail({
      body: {
        name: data.name,
        email: data.email,
        password: initialPassword,
      },
    });

    if (!signupRes?.user?.id) {
      return { success: false, error: "Failed to create rider account." };
    }

    // Set role to RIDER
    await prisma.user.update({
      where: { id: signupRes.user.id },
      data: {
        role: "RIDER",
        phone: data.phone,
        status: "ACTIVE",
      },
    });

    revalidatePath("/admin/riders");

    return { success: true, message: `Rider ${data.name} created successfully.` };
  } catch (error: unknown) {
    console.error("Create rider error:", error);
    return { success: false, error: (error as Error)?.message || "Failed to register rider." };
  }
}

export async function toggleUserStatusAction(userId: string) {
  try {
    const { user: currentAdmin } = await requireAdmin();

    if (userId === currentAdmin.id) {
      return { success: false, error: "You cannot deactivate your own admin account." };
    }

    const targetUser = await prisma.user.findUnique({ where: { id: userId } });
    if (!targetUser) {
      return { success: false, error: "User not found." };
    }

    const nextStatus = targetUser.status === "ACTIVE" ? "INACTIVE" : "ACTIVE";

    await prisma.user.update({
      where: { id: userId },
      data: { status: nextStatus },
    });

    revalidatePath("/admin/riders");
    revalidatePath("/admin/customers");

    return { success: true, newStatus: nextStatus };
  } catch (error: unknown) {
    console.error("Toggle user status error:", error);
    return { success: false, error: (error as Error)?.message || "Failed to update account status." };
  }
}
