import React from "react";
import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/server-auth";
import { RiderManagementView } from "@/components/admin/RiderManagementView";

export const dynamic = "force-dynamic";

export default async function AdminRidersPage() {
  await requireAdmin();

  let riders: {
    id: string;
    name: string;
    email: string;
    phone: string | null;
    status: string;
    createdAt: Date;
    _count: {
      riderOrders: number;
    };
  }[] = [];

  try {
    riders = await prisma.user.findMany({
      where: { role: "RIDER" },
      include: {
        _count: {
          select: { riderOrders: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });
  } catch (err) {
    console.error("Failed to load admin riders:", err);
  }

  return <RiderManagementView initialRiders={riders} />;
}
