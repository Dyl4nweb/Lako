import React from "react";
import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/server-auth";
import { CustomerManagementView } from "@/components/admin/CustomerManagementView";

export const dynamic = "force-dynamic";

export default async function AdminCustomersPage() {
  await requireAdmin();

  let customers: {
    id: string;
    name: string;
    email: string;
    phone: string | null;
    status: string;
    createdAt: Date;
    _count: {
      customerOrders: number;
    };
  }[] = [];

  try {
    customers = await prisma.user.findMany({
      where: { role: "CUSTOMER" },
      include: {
        _count: {
          select: { customerOrders: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });
  } catch (err) {
    console.error("Failed to load customers:", err);
  }

  return <CustomerManagementView initialCustomers={customers} />;
}
