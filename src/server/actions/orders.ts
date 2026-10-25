"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getCurrentSession } from "@/lib/auth/session";
import { canTransition } from "@/lib/state-machine";
import { postOrderDeliveryJournal } from "@/lib/ledger";
import { DeliveryAddressData, OrderStatus } from "@/types";

export interface PlaceOrderInput {
  storeId: string;
  items: { productId: string; quantity: number }[];
  deliveryAddress: DeliveryAddressData;
}

export async function placeOrderAction(input: PlaceOrderInput) {
  const session = await getCurrentSession();
  if (!session) {
    throw new Error("You must be logged in to place an order.");
  }

  const { storeId, items, deliveryAddress } = input;

  if (!items || items.length === 0) {
    throw new Error("Cannot place an order with an empty cart.");
  }

  // Mandatory Landmark Validation for provincial Lingayen delivery (Section 6.1 & 20.1)
  if (!deliveryAddress.landmark || deliveryAddress.landmark.trim().length < 5) {
    throw new Error("A recognizable landmark is mandatory for Lingayen deliveries to assist local couriers.");
  }

  const store = await prisma.store.findUnique({
    where: { id: storeId },
    include: { products: true },
  });

  if (!store) throw new Error("Store not found.");
  if (!store.isOpen) throw new Error("This store is currently closed and not accepting new orders.");

  // Execute in atomic transaction to prevent race conditions in inventory
  return await prisma.$transaction(async (tx) => {
    let subtotalAmount = 0;
    const orderItemsData: { productId: string; unitPrice: number; quantity: number; lineTotal: number }[] = [];

    for (const item of items) {
      const product = await tx.product.findUnique({
        where: { id: item.productId },
      });

      if (!product || product.storeId !== storeId) {
        throw new Error(`Product ${item.productId} does not belong to this store.`);
      }

      if (!product.isAvailable || product.stock < item.quantity) {
        throw new Error(`Item "${product.name}" is out of stock or does not have enough inventory.`);
      }

      // Atomic inventory deduction
      await tx.product.update({
        where: { id: product.id },
        data: {
          stock: { decrement: item.quantity },
          isAvailable: product.stock - item.quantity > 0,
        },
      });

      const lineTotal = product.price * item.quantity;
      subtotalAmount += lineTotal;

      orderItemsData.push({
        productId: product.id,
        unitPrice: product.price,
        quantity: item.quantity,
        lineTotal,
      });
    }

    const deliveryFee = 45.0; // Standard Lingayen flat delivery fee
    const totalAmount = subtotalAmount + deliveryFee;

    // Platform Financial Distribution Model (Master Plan Section 11.1)
    const commissionRate = store.commissionRate || 0.05;
    const commissionAmount = Number((subtotalAmount * commissionRate).toFixed(2));
    const merchantPayoutAmount = Number((subtotalAmount - commissionAmount).toFixed(2));
    const riderPayoutAmount = 35.0;
    const platformMarginAmount = 10.0; // 45.00 - 35.00

    // Generate readable deterministic order number: MOV-YYMMDD-XXX
    const today = new Date();
    const dateStr = today.toISOString().slice(2, 10).replace(/-/g, "");
    const randomSuffix = Math.floor(100 + Math.random() * 900);
    const orderNumber = `MOV-${dateStr}-${randomSuffix}`;

    const newOrder = await tx.order.create({
      data: {
        orderNumber,
        customerId: session.id,
        storeId,
        status: "PENDING",
        subtotalAmount,
        deliveryFee,
        totalAmount,
        commissionAmount,
        merchantPayoutAmount,
        riderPayoutAmount,
        platformMarginAmount,
        deliveryAddressJson: JSON.stringify(deliveryAddress),
        orderItems: {
          create: orderItemsData,
        },
        statusHistory: {
          create: {
            status: "PENDING",
            changedById: session.id,
            notes: "Order submitted via Cash-on-Delivery (COD)",
          },
        },
      },
    });

    // Write audit log
    await tx.auditLog.create({
      data: {
        userId: session.id,
        action: "PLACE_ORDER",
        resourceType: "ORDER",
        resourceId: newOrder.id,
        detailsJson: JSON.stringify({ orderNumber, totalAmount, storeId }),
      },
    });

    return newOrder;
  });
}

export async function updateOrderStatusAction(
  orderId: string,
  newStatus: OrderStatus,
  notes?: string,
  podImageUrl?: string
) {
  const session = await getCurrentSession();
  if (!session) throw new Error("Unauthorized.");

  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: {
      store: true,
      rider: { include: { user: true } },
      customer: true,
      orderItems: { include: { product: true } },
    },
  });

  if (!order) throw new Error("Order not found.");

  const check = canTransition(order.status as OrderStatus, newStatus, session.role);
  if (!check.allowed) {
    throw new Error(check.reason || "Invalid status transition.");
  }

  // POD enforcement when delivering
  if (newStatus === "DELIVERED" && !podImageUrl && !order.podImageUrl) {
    throw new Error("Proof of Delivery (POD) photo is mandatory to complete delivery handover.");
  }

  await prisma.$transaction(async (tx) => {
    // If order was cancelled or rejected, restore stock
    if (newStatus === "CANCELLED_BY_CUSTOMER" || newStatus === "REJECTED_BY_STORE") {
      for (const item of order.orderItems) {
        await tx.product.update({
          where: { id: item.productId },
          data: {
            stock: { increment: item.quantity },
            isAvailable: true,
          },
        });
      }
    }

    // Update order status
    await tx.order.update({
      where: { id: orderId },
      data: {
        status: newStatus,
        podImageUrl: podImageUrl || order.podImageUrl,
        cancellationReason:
          newStatus === "CANCELLED_BY_CUSTOMER" || newStatus === "REJECTED_BY_STORE"
            ? notes
            : order.cancellationReason,
      },
    });

    // Add status history record
    await tx.orderStatusHistory.create({
      data: {
        orderId,
        status: newStatus,
        changedById: session.id,
        notes: notes || `Order transitioned to ${newStatus}`,
      },
    });
  });

  // If transitioned to DELIVERED, automatically post balanced double-entry ledger entries!
  if (newStatus === "DELIVERED") {
    await postOrderDeliveryJournal({
      orderId: order.id,
      orderNumber: order.orderNumber,
      totalCOD: order.totalAmount,
      merchantPayout: order.merchantPayoutAmount,
      riderPayout: order.riderPayoutAmount,
      commission: order.commissionAmount,
      deliveryMargin: order.platformMarginAmount,
      merchantName: order.store.name,
      riderName: order.rider?.user.fullName || "Courier",
    });
  }

  revalidatePath("/");
  revalidatePath("/seller");
  revalidatePath("/rider");
  revalidatePath("/admin");
  revalidatePath(`/orders/${orderId}`);

  return { success: true, newStatus };
}
