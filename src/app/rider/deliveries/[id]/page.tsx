import React from "react";
import prisma from "@/lib/prisma";
import { notFound, redirect } from "next/navigation";
import { requireRider } from "@/lib/server-auth";
import { RiderDeliveryDetailClient } from "@/components/rider/RiderDeliveryDetailClient";
import { OrderStatus } from "@/types";

export const dynamic = "force-dynamic";

interface RiderDeliveryPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function RiderDeliveryPage({ params }: RiderDeliveryPageProps) {
  const { id } = await params;
  const { user } = await requireRider();

  let order = null;

  try {
    order = await prisma.order.findUnique({
      where: { id },
      include: {
        items: true,
      },
    });
  } catch (err) {
    console.error("Failed to fetch rider order:", err);
  }

  if (!order) {
    notFound();
  }

  // Security: only assigned rider can access
  if (order.assignedRiderId !== user.id) {
    redirect("/rider");
  }

  const formattedOrder = {
    ...order,
    status: order.status as OrderStatus,
    subtotal: Number(order.subtotal),
    deliveryFee: Number(order.deliveryFee),
    total: Number(order.total),
    items: order.items.map((i) => ({
      ...i,
      unitPrice: Number(i.unitPrice),
      lineTotal: Number(i.lineTotal),
    })),
  };

  return <RiderDeliveryDetailClient order={formattedOrder} />;
}
