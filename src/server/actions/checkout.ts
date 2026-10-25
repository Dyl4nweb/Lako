"use server";

import prisma from "@/lib/prisma";
import { getServerSession } from "@/lib/server-auth";
import { checkoutSchema } from "@/lib/validations";
import { revalidatePath } from "next/cache";
import { sendOrderReceiptEmail } from "@/lib/email";

interface CheckoutItemInput {
  productId: string;
  quantity: number;
}

export async function processCheckout(
  formData: {
    customerName: string;
    customerPhone: string;
    deliveryAddress: string;
    orderNotes?: string;
  },
  items: CheckoutItemInput[]
) {
  try {
    // 1. Authenticate user
    const sessionData = await getServerSession();
    if (!sessionData || !sessionData.user) {
      return {
        success: false,
        error: "You must be signed in to place an order.",
      };
    }

    const customerId = sessionData.user.id;

    // 2. Validate input format
    const validated = checkoutSchema.safeParse(formData);
    if (!validated.success) {
      const firstError = validated.error.issues[0]?.message || "Invalid order details.";
      return { success: false, error: firstError };
    }

    if (!items || items.length === 0) {
      return { success: false, error: "Your shopping cart is empty." };
    }

    // Fixed default delivery fee in PHP
    const deliveryFee = 45.0;

    // 3. Concurrency-safe Prisma Transaction
    const result = await prisma.$transaction(async (tx) => {
      let subtotal = 0;
      const orderItemsToCreate: {
        productId: string;
        productName: string;
        productImage: string;
        unitPrice: number;
        quantity: number;
        lineTotal: number;
      }[] = [];

      for (const item of items) {
        if (item.quantity <= 0) {
          throw new Error("Invalid item quantity detected.");
        }

        // Fetch fresh product with row lock / current database state
        const product = await tx.product.findUnique({
          where: { id: item.productId },
        });

        if (!product || !product.published) {
          throw new Error(`Product "${product?.name || "Unknown"}" is no longer available.`);
        }

        if (product.stock < item.quantity) {
          throw new Error(
            `Insufficient stock for "${product.name}". Only ${product.stock} remaining.`
          );
        }

        // Concurrency-safe deduction: ensure stock is still >= quantity
        const updateResult = await tx.product.updateMany({
          where: {
            id: product.id,
            stock: { gte: item.quantity },
          },
          data: {
            stock: { decrement: item.quantity },
          },
        });

        if (updateResult.count === 0) {
          throw new Error(
            `Could not reserve stock for "${product.name}" due to simultaneous purchases. Please try again.`
          );
        }

        const unitPriceNum = Number(product.price);
        const lineTotal = unitPriceNum * item.quantity;
        subtotal += lineTotal;

        orderItemsToCreate.push({
          productId: product.id,
          productName: product.name,
          productImage: product.imageUrl,
          unitPrice: unitPriceNum,
          quantity: item.quantity,
          lineTotal,
        });

        // Record inventory audit log
        await tx.inventoryLog.create({
          data: {
            productId: product.id,
            change: -item.quantity,
            reason: "ORDER_CHECKOUT",
            createdById: customerId,
          },
        });
      }

      const total = subtotal + deliveryFee;

      // Generate human-friendly order number: LAKO-YYYYMMDD-XXXX
      const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, "");
      const randomSuffix = Math.floor(1000 + Math.random() * 9000);
      const orderNumber = `LAKO-${dateStr}-${randomSuffix}`;

      // Create Order
      const newOrder = await tx.order.create({
        data: {
          orderNumber,
          customerId,
          customerName: validated.data.customerName,
          customerPhone: validated.data.customerPhone,
          deliveryAddress: validated.data.deliveryAddress,
          orderNotes: validated.data.orderNotes || null,
          status: "PENDING",
          paymentMethod: "COD",
          paymentCollectionStatus: "UNCOLLECTED",
          subtotal,
          deliveryFee,
          total,
          items: {
            create: orderItemsToCreate.map((oi) => ({
              productId: oi.productId,
              productName: oi.productName,
              productImage: oi.productImage,
              unitPrice: oi.unitPrice,
              quantity: oi.quantity,
              lineTotal: oi.lineTotal,
            })),
          },
          statusHistory: {
            create: {
              toStatus: "PENDING",
              note: "Order placed by customer via Cash on Delivery.",
              changedById: customerId,
            },
          },
        },
        include: {
          items: true,
        },
      });

      return newOrder;
    });

    // Send confirmation receipt email asynchronously via Resend
    if (sessionData.user.email) {
      sendOrderReceiptEmail({
        toEmail: sessionData.user.email,
        customerName: result.customerName,
        orderNumber: result.orderNumber,
        orderId: result.id,
        deliveryAddress: result.deliveryAddress,
        customerPhone: result.customerPhone,
        items: result.items.map((i) => ({
          productName: i.productName,
          quantity: i.quantity,
          unitPrice: Number(i.unitPrice),
          lineTotal: Number(i.lineTotal),
        })),
        subtotal: Number(result.subtotal),
        deliveryFee: Number(result.deliveryFee),
        total: Number(result.total),
      }).catch((e) => console.error("[Resend] Failed to send receipt email:", e));
    }

    revalidatePath("/orders");
    revalidatePath("/admin/orders");

    return {
      success: true,
      orderId: result.id,
      orderNumber: result.orderNumber,
    };
  } catch (error: unknown) {
    console.error("Checkout transaction error:", error);
    return {
      success: false,
      error: (error as Error)?.message || "Checkout failed. Please try again.",
    };
  }
}
