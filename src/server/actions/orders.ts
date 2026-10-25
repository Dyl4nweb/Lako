"use server";

import prisma from "@/lib/prisma";
import { getServerSession } from "@/lib/server-auth";
import { canTransitionOrder, shouldRestoreStock } from "@/lib/order-state-machine";
import { OrderStatus, Role } from "@/types";
import { revalidatePath } from "next/cache";

export async function updateOrderStatus({
  orderId,
  targetStatus,
  note,
  markCollected,
}: {
  orderId: string;
  targetStatus: OrderStatus;
  note?: string;
  markCollected?: boolean;
}) {
  try {
    const sessionData = await getServerSession();
    if (!sessionData || !sessionData.user) {
      return { success: false, error: "Unauthorized. Please sign in." };
    }

    const userId = sessionData.user.id;
    const userRole = ((sessionData.user as unknown as { role?: string }).role || "CUSTOMER") as Role;

    // Fetch existing order
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: true,
      },
    });

    if (!order) {
      return { success: false, error: "Order not found." };
    }

    // Role-specific authorization checks
    if (userRole === "CUSTOMER") {
      if (order.customerId !== userId) {
        return { success: false, error: "You do not have permission to view or edit this order." };
      }
    } else if (userRole === "RIDER") {
      if (order.assignedRiderId !== userId) {
        return { success: false, error: "You are not the assigned rider for this delivery." };
      }
    } else if (userRole !== "ADMIN") {
      return { success: false, error: "Unauthorized role access." };
    }

    // State machine check
    const transitionCheck = canTransitionOrder(order.status as OrderStatus, targetStatus, userRole);
    if (!transitionCheck.allowed) {
      return { success: false, error: transitionCheck.reason || "Invalid status transition." };
    }

    // Atomic transaction for order update and optional stock restoration
    await prisma.$transaction(async (tx) => {
      const now = new Date();
      const updateData: Record<string, unknown> = {
        status: targetStatus,
        updatedAt: now,
      };

      if (targetStatus === "CONFIRMED") updateData.confirmedAt = now;
      if (targetStatus === "PICKED_UP") updateData.pickedUpAt = now;
      if (targetStatus === "ON_THE_WAY") updateData.onTheWayAt = now;
      if (targetStatus === "DELIVERED") {
        updateData.deliveredAt = now;
        // Optionally mark COD collected upon delivery if rider/admin flags it
        if (markCollected) {
          updateData.paymentCollectionStatus = "COLLECTED";
          updateData.collectedAt = now;
        }
      }
      if (targetStatus === "CANCELLED") {
        updateData.cancelledAt = now;
        updateData.cancellationReason = note || "Cancelled by user or administrator";
      }

      // Check if stock needs restoration
      if (shouldRestoreStock(order.status as OrderStatus, targetStatus)) {
        for (const item of order.items) {
          if (item.productId) {
            await tx.product.update({
              where: { id: item.productId },
              data: {
                stock: { increment: item.quantity },
              },
            });

            await tx.inventoryLog.create({
              data: {
                productId: item.productId,
                change: item.quantity,
                reason: "ORDER_CANCELLED",
                orderId: order.id,
                createdById: userId,
              },
            });
          }
        }
      }

      await tx.order.update({
        where: { id: order.id },
        data: updateData,
      });

      await tx.orderStatusHistory.create({
        data: {
          orderId: order.id,
          fromStatus: order.status,
          toStatus: targetStatus,
          note: note || `Status updated to ${targetStatus} by ${userRole}.`,
          changedById: userId,
        },
      });
    });

    revalidatePath(`/orders/${orderId}`);
    revalidatePath("/orders");
    revalidatePath("/admin/orders");
    revalidatePath(`/rider/deliveries/${orderId}`);
    revalidatePath("/rider/deliveries");
    revalidatePath("/rider");

    return { success: true };
  } catch (error: unknown) {
    console.error("Order status update error:", error);
    return {
      success: false,
      error: (error as Error)?.message || "Failed to update order status.",
    };
  }
}

export async function assignRiderToOrder(orderId: string, riderId: string) {
  try {
    const sessionData = await getServerSession();
    if (!sessionData || !sessionData.user) {
      return { success: false, error: "Unauthorized." };
    }

    const userRole = (sessionData.user as unknown as { role?: string }).role;
    if (userRole !== "ADMIN") {
      return { success: false, error: "Only administrators can assign riders." };
    }

    // Verify rider exists and has RIDER role
    const rider = await prisma.user.findUnique({
      where: { id: riderId },
    });

    if (!rider || rider.role !== "RIDER" || rider.status !== "ACTIVE") {
      return { success: false, error: "Selected user is not an active rider." };
    }

    const order = await prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order) {
      return { success: false, error: "Order not found." };
    }

    if (order.status === "DELIVERED" || order.status === "CANCELLED") {
      return { success: false, error: "Cannot assign rider to completed or cancelled orders." };
    }

    await prisma.$transaction(async (tx) => {
      await tx.order.update({
        where: { id: orderId },
        data: {
          assignedRiderId: riderId,
          status: "ASSIGNED",
          assignedAt: new Date(),
        },
      });

      await tx.orderStatusHistory.create({
        data: {
          orderId,
          fromStatus: order.status,
          toStatus: "ASSIGNED",
          note: `Assigned to rider ${rider.name} (${rider.phone || "No phone"}).`,
          changedById: sessionData.user.id,
        },
      });
    });

    revalidatePath(`/orders/${orderId}`);
    revalidatePath("/admin/orders");
    revalidatePath("/rider/deliveries");
    revalidatePath("/rider");

    return { success: true };
  } catch (error: unknown) {
    console.error("Rider assignment error:", error);
    return {
      success: false,
      error: (error as Error)?.message || "Failed to assign rider.",
    };
  }
}

export async function recordCodPayment(orderId: string, isCollected = true) {
  try {
    const sessionData = await getServerSession();
    if (!sessionData || !sessionData.user) {
      return { success: false, error: "Unauthorized." };
    }

    const userRole = (sessionData.user as unknown as { role?: string }).role;
    const userId = sessionData.user.id;

    const order = await prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order) {
      return { success: false, error: "Order not found." };
    }

    if (userRole === "RIDER" && order.assignedRiderId !== userId) {
      return { success: false, error: "You can only update COD for your assigned delivery." };
    }

    if (userRole !== "ADMIN" && userRole !== "RIDER") {
      return { success: false, error: "Unauthorized to record COD collection." };
    }

    await prisma.order.update({
      where: { id: orderId },
      data: {
        paymentCollectionStatus: isCollected ? "COLLECTED" : "UNCOLLECTED",
        collectedAt: isCollected ? new Date() : null,
      },
    });

    revalidatePath(`/orders/${orderId}`);
    revalidatePath("/admin/orders");
    revalidatePath(`/rider/deliveries/${orderId}`);

    return { success: true };
  } catch (error: unknown) {
    console.error("COD payment record error:", error);
    return {
      success: false,
      error: (error as Error)?.message || "Failed to record payment collection.",
    };
  }
}
