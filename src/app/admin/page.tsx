import React from "react";
import Link from "next/link";
import prisma from "@/lib/prisma";
import {
  ShoppingBag,
  Package,
  Users,
  Truck,
  Banknote,
  Clock,
  ArrowRight,
  TrendingUp,
  ShieldCheck,
  Plus,
} from "lucide-react";
import { OrderStatus } from "@/types";

export const dynamic = "force-dynamic";

export default async function AdminDashboardOverviewPage() {
  let totalOrders = 0;
  let totalProducts = 0;
  let totalCustomers = 0;
  let activeDeliveries = 0;
  let deliveredSales = 0;
  let pendingOrders = 0;
  let recentOrders: {
    id: string;
    orderNumber: string;
    customerName: string;
    total: unknown;
    status: OrderStatus;
    createdAt: Date;
    paymentCollectionStatus: string;
  }[] = [];

  try {
    const [ordersCount, productsCount, customersCount, pendingCount, activeCount, deliveredOrders] =
      await Promise.all([
        prisma.order.count(),
        prisma.product.count(),
        prisma.user.count({ where: { role: "CUSTOMER" } }),
        prisma.order.count({ where: { status: "PENDING" } }),
        prisma.order.count({
          where: {
            status: { in: ["CONFIRMED", "ASSIGNED", "PICKED_UP", "ON_THE_WAY"] },
          },
        }),
        prisma.order.findMany({
          where: { status: "DELIVERED" },
          select: { total: true },
        }),
      ]);

    totalOrders = ordersCount;
    totalProducts = productsCount;
    totalCustomers = customersCount;
    pendingOrders = pendingCount;
    activeDeliveries = activeCount;
    deliveredSales = deliveredOrders.reduce((sum, o) => sum + Number(o.total), 0);

    recentOrders = (await prisma.order.findMany({
      take: 6,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        orderNumber: true,
        customerName: true,
        total: true,
        status: true,
        createdAt: true,
        paymentCollectionStatus: true,
      },
    })) as unknown as typeof recentOrders;
  } catch (err) {
    console.error("Failed to query statistics for admin dashboard:", err);
  }

  const statCards = [
    {
      title: "Delivered Sales (Revenue)",
      value: `₱${deliveredSales.toLocaleString("en-PH", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      subtitle: "Excludes cancelled and in-transit orders",
      icon: Banknote,
      color: "bg-emerald-50 text-emerald-600 border-emerald-200",
    },
    {
      title: "Total Marketplace Orders",
      value: totalOrders.toString(),
      subtitle: `${pendingOrders} awaiting confirmation`,
      icon: ShoppingBag,
      color: "bg-blue-50 text-blue-600 border-blue-200",
    },
    {
      title: "Active Deliveries in Transit",
      value: activeDeliveries.toString(),
      subtitle: "Assigned or on the way to customer",
      icon: Truck,
      color: "bg-orange-50 text-orange-600 border-orange-200",
    },
    {
      title: "Published Products",
      value: totalProducts.toString(),
      subtitle: "Market items cataloged",
      icon: Package,
      color: "bg-purple-50 text-purple-600 border-purple-200",
    },
    {
      title: "Registered Customers",
      value: totalCustomers.toString(),
      subtitle: "Active local shoppers",
      icon: Users,
      color: "bg-amber-50 text-amber-600 border-amber-200",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-neutral-900 tracking-tight">
            Marketplace Management Overview
          </h1>
          <p className="text-xs text-neutral-500 mt-0.5">
            Real-time operations, delivery dispatch, and inventory analytics
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/admin/products"
            className="inline-flex items-center gap-1.5 text-xs font-bold bg-orange-600 hover:bg-orange-700 text-white px-4 py-2.5 rounded-xl shadow-xs transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Product</span>
          </Link>
          <Link
            href="/admin/orders"
            className="inline-flex items-center gap-1.5 text-xs font-bold bg-neutral-900 hover:bg-black text-white px-4 py-2.5 rounded-xl transition-colors"
          >
            <span>Dispatch Center</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {statCards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <div
              key={idx}
              className="bg-white rounded-3xl border border-neutral-200/80 p-5 shadow-xs flex items-center justify-between"
            >
              <div className="space-y-1">
                <span className="text-xs font-bold text-neutral-500">{card.title}</span>
                <p className="text-xl sm:text-2xl font-black text-neutral-900 tracking-tight">
                  {card.value}
                </p>
                <p className="text-[11px] text-neutral-400">{card.subtitle}</p>
              </div>
              <div className={`w-12 h-12 rounded-2xl border flex items-center justify-center shrink-0 ${card.color}`}>
                <Icon className="w-6 h-6" />
              </div>
            </div>
          );
        })}
      </div>

      {/* Recent Orders Section */}
      <div className="bg-white rounded-3xl border border-neutral-200/80 p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-neutral-100 pb-4">
          <div>
            <h2 className="text-sm font-bold text-neutral-900">Recent Marketplace Orders</h2>
            <p className="text-xs text-neutral-500">Latest checkout requests across all categories</p>
          </div>
          <Link
            href="/admin/orders"
            className="text-xs font-bold text-orange-600 hover:text-orange-700 flex items-center gap-1"
          >
            <span>View All Orders</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {recentOrders.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-neutral-100 text-neutral-400 font-bold uppercase tracking-wider text-[10px]">
                  <th className="pb-3">Order Number</th>
                  <th className="pb-3">Customer</th>
                  <th className="pb-3">Total (COD)</th>
                  <th className="pb-3">Status</th>
                  <th className="pb-3">Date</th>
                  <th className="pb-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {recentOrders.map((ord) => (
                  <tr key={ord.id} className="hover:bg-neutral-50/80 transition-colors">
                    <td className="py-3 font-bold text-neutral-900">{ord.orderNumber}</td>
                    <td className="py-3 text-neutral-700 font-medium">{ord.customerName}</td>
                    <td className="py-3 font-bold text-orange-600">
                      ₱{Number(ord.total).toFixed(2)}
                    </td>
                    <td className="py-3">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-orange-100 text-orange-800">
                        {ord.status}
                      </span>
                    </td>
                    <td className="py-3 text-neutral-500">
                      {new Date(ord.createdAt).toLocaleDateString("en-PH")}
                    </td>
                    <td className="py-3 text-right">
                      <Link
                        href={`/admin/orders?highlight=${ord.id}`}
                        className="text-orange-600 hover:text-orange-700 font-bold hover:underline"
                      >
                        Manage
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-12 text-neutral-400 text-xs">
            No orders recorded yet. They will appear here immediately once placed.
          </div>
        )}
      </div>
    </div>
  );
}
