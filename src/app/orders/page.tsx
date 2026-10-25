import React from "react";
import Link from "next/link";
import Image from "next/image";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import { getServerSession } from "@/lib/server-auth";
import { Navbar } from "@/components/shared/Navbar";
import { Footer } from "@/components/shared/Footer";
import { PackageCheck, ArrowRight, Clock, ShoppingBag } from "lucide-react";
import { OrderStatus } from "@/types";

export const dynamic = "force-dynamic";

export default async function OrdersPage() {
  const sessionData = await getServerSession();
  if (!sessionData || !sessionData.user) {
    redirect("/login?redirect=/orders");
  }

  const customerId = sessionData.user.id;

  let orders: {
    id: string;
    orderNumber: string;
    status: OrderStatus;
    total: unknown;
    createdAt: Date;
    paymentCollectionStatus: string;
    items: {
      id: string;
      productName: string;
      productImage: string;
      quantity: number;
      unitPrice: unknown;
    }[];
  }[] = [];

  try {
    orders = (await prisma.order.findMany({
      where: { customerId },
      include: {
        items: true,
      },
      orderBy: { createdAt: "desc" },
    })) as unknown as typeof orders;
  } catch (err) {
    console.error("Failed to load customer orders:", err);
  }

  const getStatusBadge = (status: OrderStatus) => {
    switch (status) {
      case "PENDING":
        return <span className="bg-amber-100 text-amber-800 px-2.5 py-1 rounded-full text-xs font-bold">Pending Confirmation</span>;
      case "CONFIRMED":
        return <span className="bg-blue-100 text-blue-800 px-2.5 py-1 rounded-full text-xs font-bold">Confirmed</span>;
      case "ASSIGNED":
        return <span className="bg-indigo-100 text-indigo-800 px-2.5 py-1 rounded-full text-xs font-bold">Rider Dispatched</span>;
      case "PICKED_UP":
        return <span className="bg-purple-100 text-purple-800 px-2.5 py-1 rounded-full text-xs font-bold">Picked Up</span>;
      case "ON_THE_WAY":
        return <span className="bg-orange-100 text-orange-800 px-2.5 py-1 rounded-full text-xs font-bold animate-pulse">Out for Delivery</span>;
      case "DELIVERED":
        return <span className="bg-emerald-100 text-emerald-800 px-2.5 py-1 rounded-full text-xs font-bold">Delivered</span>;
      case "CANCELLED":
        return <span className="bg-neutral-100 text-neutral-600 px-2.5 py-1 rounded-full text-xs font-bold">Cancelled</span>;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-neutral-50">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
        <div className="pb-6 border-b border-neutral-200">
          <h1 className="text-xl sm:text-2xl font-black text-neutral-900 tracking-tight">
            My Order History
          </h1>
          <p className="text-xs text-neutral-500 mt-0.5">
            Track current deliveries and view your past marketplace purchases
          </p>
        </div>

        {orders.length > 0 ? (
          <div className="mt-6 space-y-4">
            {orders.map((order) => (
              <div
                key={order.id}
                className="bg-white rounded-3xl border border-neutral-200/80 p-5 sm:p-6 shadow-xs hover:border-orange-300 transition-all"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-neutral-100">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center shrink-0">
                      <PackageCheck className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-neutral-900">
                          {order.orderNumber}
                        </span>
                        {getStatusBadge(order.status)}
                      </div>
                      <div className="flex items-center gap-1.5 text-[11px] text-neutral-500 mt-0.5">
                        <Clock className="w-3.5 h-3.5" />
                        <span>Placed on {new Date(order.createdAt).toLocaleString("en-PH")}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-4">
                    <div className="text-left sm:text-right">
                      <span className="text-[10px] uppercase font-bold text-neutral-400">
                        Total Amount (COD)
                      </span>
                      <p className="text-base font-black text-orange-600">
                        ₱{Number(order.total).toFixed(2)}
                      </p>
                    </div>

                    <Link
                      href={`/orders/${order.id}`}
                      className="inline-flex items-center gap-1 text-xs font-bold bg-neutral-900 hover:bg-black text-white px-4 py-2.5 rounded-xl transition-colors shrink-0"
                    >
                      <span>Track Order</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>

                {/* Items preview list */}
                <div className="pt-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {order.items.slice(0, 3).map((item) => (
                    <div key={item.id} className="flex items-center gap-3">
                      <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-neutral-100 shrink-0 border border-neutral-200/80">
                        <Image
                          src={item.productImage}
                          alt={item.productName}
                          fill
                          sizes="48px"
                          className="object-cover"
                        />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-neutral-800 truncate">
                          {item.productName}
                        </p>
                        <p className="text-[11px] text-neutral-500">
                          Qty: {item.quantity} × ₱{Number(item.unitPrice).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  ))}
                  {order.items.length > 3 && (
                    <div className="flex items-center text-xs font-bold text-neutral-500 pl-2">
                      +{order.items.length - 3} more items
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-white rounded-3xl border border-neutral-200/80 p-8 my-8 max-w-md mx-auto">
            <ShoppingBag className="w-12 h-12 text-neutral-300 mx-auto mb-3" />
            <h3 className="text-base font-bold text-neutral-900">No orders placed yet</h3>
            <p className="text-xs text-neutral-500 max-w-sm mx-auto mt-1 mb-6">
              When you place Cash on Delivery orders, you can track their live progress right here.
            </p>
            <Link
              href="/products"
              className="inline-flex items-center gap-2 bg-orange-600 hover:bg-orange-700 text-white text-xs font-bold px-5 py-3 rounded-xl shadow-md transition-all hover:scale-102"
            >
              <span>Start Shopping</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
