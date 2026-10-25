import React from "react";
import prisma from "@/lib/prisma";
import { requireAdmin } from "@/lib/server-auth";
import { Users, Mail, Phone, Calendar, ShoppingBag } from "lucide-react";

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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-black text-neutral-900 tracking-tight">
          Customer Directory
        </h1>
        <p className="text-xs text-neutral-500 mt-0.5">
          View registered local customers and their marketplace ordering activities
        </p>
      </div>

      <div className="bg-white rounded-3xl border border-neutral-200/80 shadow-xs overflow-hidden">
        <table className="w-full text-left text-xs">
          <thead className="bg-neutral-50/80 border-b border-neutral-200 text-neutral-500 font-bold uppercase tracking-wider text-[10px]">
            <tr>
              <th className="py-3 px-4">Customer</th>
              <th className="py-3 px-4">Phone Number</th>
              <th className="py-3 px-4">Orders Placed</th>
              <th className="py-3 px-4">Account Status</th>
              <th className="py-3 px-4 text-right">Registered Date</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100">
            {customers.map((c) => (
              <tr key={c.id} className="hover:bg-neutral-50/80 transition-colors">
                <td className="py-3.5 px-4">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-orange-50 text-orange-700 font-bold flex items-center justify-center shrink-0">
                      {c.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-bold text-neutral-900">{c.name}</p>
                      <p className="text-[11px] text-neutral-500">{c.email}</p>
                    </div>
                  </div>
                </td>

                <td className="py-3.5 px-4 font-medium text-neutral-700">
                  {c.phone || <span className="text-neutral-400 italic">None</span>}
                </td>

                <td className="py-3.5 px-4 font-bold text-neutral-800">
                  <div className="flex items-center gap-1.5">
                    <ShoppingBag className="w-3.5 h-3.5 text-orange-600" />
                    <span>{c._count.customerOrders} orders</span>
                  </div>
                </td>

                <td className="py-3.5 px-4">
                  <span
                    className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                      c.status === "ACTIVE"
                        ? "bg-emerald-100 text-emerald-800"
                        : "bg-neutral-100 text-neutral-600"
                    }`}
                  >
                    {c.status}
                  </span>
                </td>

                <td className="py-3.5 px-4 text-right text-neutral-500">
                  {new Date(c.createdAt).toLocaleDateString("en-PH")}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
