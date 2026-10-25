import React from "react";
import prisma from "@/lib/prisma";
import { requireRider } from "@/lib/server-auth";
import { RiderActiveDeliveriesView } from "@/components/rider/RiderActiveDeliveriesView";
import { OrderStatus } from "@/types";

export const dynamic = "force-dynamic";

export default async function RiderDashboardOverviewPage() {
  const { user } = await requireRider();

  let activeDeliveries: {
    id: string;
    orderNumber: string;
    customerName: string;
    customerPhone: string;
    deliveryAddress: string;
    orderNotes: string | null;
    status: OrderStatus;
    paymentCollectionStatus: string;
    total: unknown;
    createdAt: Date;
    items: {
      id: string;
      productName: string;
      quantity: number;
      unitPrice: unknown;
    }[];
  }[] = [];

  let deliveredCount = 0;
  let totalCodCollected = 0;

  try {
    const [fetchedActive, fetchedDelivered] = await Promise.all([
      prisma.order.findMany({
        where: {
          assignedRiderId: user.id,
          status: { in: ["ASSIGNED", "PICKED_UP", "ON_THE_WAY"] },
        },
        include: {
          items: true,
        },
        orderBy: { createdAt: "desc" },
      }),
      prisma.order.findMany({
        where: {
          assignedRiderId: user.id,
          status: "DELIVERED",
        },
        select: {
          total: true,
          paymentCollectionStatus: true,
        },
      }),
    ]);

    activeDeliveries = fetchedActive as unknown as typeof activeDeliveries;
    deliveredCount = fetchedDelivered.length;
    totalCodCollected = fetchedDelivered
      .filter((o) => o.paymentCollectionStatus === "COLLECTED")
      .reduce((sum, o) => sum + Number(o.total), 0);
  } catch (err) {
    console.error("Failed to load rider deliveries:", err);
  }

  const formattedDeliveries = activeDeliveries.map((d) => ({
    ...d,
    total: Number(d.total),
    items: d.items.map((i) => ({
      ...i,
      unitPrice: Number(i.unitPrice),
    })),
  }));

  return (
    <RiderActiveDeliveriesView
      initialDeliveries={formattedDeliveries}
      riderName={user.name || "Delivery Partner"}
      totalDeliveredCount={deliveredCount}
      totalCodCollected={totalCodCollected}
    />
  );
}
