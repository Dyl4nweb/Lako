import React from "react";
import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/server-auth";
import { OrderDispatchManagementView } from "@/components/admin/OrderDispatchManagementView";
import { OrderStatus } from "@/types";

export const dynamic = "force-dynamic";

export default async function AdminOrdersPage() {
  await requireAdmin();

  let orders: {
    id: string;
    orderNumber: string;
    customerName: string;
    customerPhone: string;
    deliveryAddress: string;
    orderNotes: string | null;
    status: OrderStatus;
    paymentMethod: string;
    paymentCollectionStatus: string;
    subtotal: unknown;
    deliveryFee: unknown;
    total: unknown;
    createdAt: Date;
    assignedRiderId: string | null;
    assignedRider: {
      id: string;
      name: string;
      phone: string | null;
    } | null;
    items: {
      id: string;
      productName: string;
      productImage: string;
      unitPrice: unknown;
      quantity: number;
      lineTotal: unknown;
    }[];
  }[] = [];

  let riders: { id: string; name: string; phone: string | null }[] = [];

  try {
    const [fetchedOrders, fetchedRiders] = await Promise.all([
      prisma.order.findMany({
        include: {
          items: true,
          assignedRider: {
            select: { id: true, name: true, phone: true },
          },
        },
        orderBy: { createdAt: "desc" },
      }),
      prisma.user.findMany({
        where: { role: "RIDER", status: "ACTIVE" },
        select: { id: true, name: true, phone: true },
        orderBy: { name: "asc" },
      }),
    ]);

    orders = fetchedOrders as unknown as typeof orders;
    riders = fetchedRiders;
  } catch (err) {
    console.error("Failed to load admin orders dispatch:", err);
  }

  const formattedOrders = orders.map((o) => ({
    ...o,
    subtotal: Number(o.subtotal),
    deliveryFee: Number(o.deliveryFee),
    total: Number(o.total),
    items: o.items.map((i) => ({
      ...i,
      unitPrice: Number(i.unitPrice),
      lineTotal: Number(i.lineTotal),
    })),
  }));

  return (
    <OrderDispatchManagementView
      initialOrders={formattedOrders}
      riders={riders}
    />
  );
}
