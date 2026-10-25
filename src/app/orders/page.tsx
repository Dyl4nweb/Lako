import { prisma } from "@/lib/prisma";
import { getCurrentSession } from "@/lib/auth/session";
import { Navbar } from "@/components/shared/Navbar";
import { formatPHP, formatDate } from "@/lib/utils";
import Link from "next/link";
import { ShoppingBag, ArrowRight, Store, Clock, MapPin } from "lucide-react";


export default async function OrdersListPage() {
  const session = await getCurrentSession();

  // If customer, fetch their orders; otherwise fetch recent orders
  const orders = await prisma.order.findMany({
    where: session?.role === "CUSTOMER" ? { customerId: session.id } : {},
    include: {
      store: true,
      orderItems: { include: { product: true } },
    },
    orderBy: { createdAt: "desc" },
    take: 20,
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "PENDING":
        return <span className="bg-amber-100 text-amber-800 text-xs px-2.5 py-1 rounded-full font-bold">Order Placed</span>;
      case "ACCEPTED":
      case "PREPARING":
        return <span className="bg-amber-100 text-amber-900 text-xs px-2.5 py-1 rounded-full font-bold">Store Preparing</span>;
      case "READY_FOR_PICKUP":
      case "ASSIGNED":
        return <span className="bg-blue-100 text-blue-800 text-xs px-2.5 py-1 rounded-full font-bold">Awaiting Pickup</span>;
      case "PICKED_UP":
      case "IN_TRANSIT":
        return <span className="bg-blue-600 text-white text-xs px-2.5 py-1 rounded-full font-bold animate-pulse">Rider In Transit</span>;
      case "DELIVERED":
        return <span className="bg-emerald-100 text-emerald-800 text-xs px-2.5 py-1 rounded-full font-bold">Delivered</span>;
      case "CANCELLED_BY_CUSTOMER":
        return <span className="bg-zinc-100 text-zinc-600 text-xs px-2.5 py-1 rounded-full font-medium">Cancelled</span>;
      default:
        return <span className="bg-zinc-100 text-zinc-700 text-xs px-2.5 py-1 rounded-full font-medium">{status}</span>;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FBFBF9]">
      <Navbar session={session} />
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 py-8 space-y-6">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-deep font-outfit">
            My Orders
          </h1>
          <p className="text-xs text-zinc-500">
            Track live dispatch status of your Lingayen deliveries
          </p>
        </div>

        {orders.length === 0 ? (
          <div className="bg-white rounded-3xl p-10 border border-zinc-200 text-center shadow-sm">
            <div className="w-16 h-16 rounded-full bg-zinc-100 flex items-center justify-center mx-auto mb-4 text-zinc-400">
              <ShoppingBag className="w-8 h-8" />
            </div>
            <h2 className="text-lg font-bold text-slate-deep mb-1">No orders placed yet</h2>
            <p className="text-xs text-zinc-500 mb-6">
              Shop from local Lingayen stores and receive fast delivery in 30-60 mins.
            </p>
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-movli text-white text-xs font-bold hover:bg-movli-600 transition shadow-md shadow-movli/20"
            >
              <span>Explore Marketplace</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => {
              let addr: any = {};
              try {
                addr = JSON.parse(order.deliveryAddressJson);
              } catch (e) {}

              return (
                <Link
                  key={order.id}
                  href={`/orders/${order.id}`}
                  className="block bg-white rounded-2xl p-5 border border-zinc-200 hover:border-movli/40 shadow-sm hover:shadow-card transition group"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-100 pb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-sand-canvas border border-zinc-200 flex items-center justify-center text-movli font-bold flex-shrink-0">
                        <Store className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-deep text-sm group-hover:text-movli transition">
                            {order.store.name}
                          </span>
                          <span className="text-[11px] font-mono text-zinc-400">
                            #{order.orderNumber}
                          </span>
                        </div>
                        <div className="text-[11px] text-zinc-400 flex items-center gap-1 mt-0.5">
                          <Clock className="w-3 h-3" />
                          <span>{formatDate(order.createdAt)}</span>
                        </div>
                      </div>
                    </div>

                    <div>{getStatusBadge(order.status)}</div>
                  </div>

                  <div className="pt-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                    <div className="text-zinc-600">
                      <div className="font-medium text-slate-deep">
                        {order.orderItems.map((i) => `${i.quantity}x ${i.product.name}`).join(", ")}
                      </div>
                      <div className="text-[11px] text-zinc-400 mt-0.5 flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-movli" />
                        <span>Delivering to Brgy. {addr.barangay || "Lingayen"}</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-4">
                      <div className="text-right">
                        <div className="text-[10px] text-zinc-400 uppercase font-semibold">Total COD</div>
                        <div className="font-extrabold text-slate-deep text-sm">
                          {formatPHP(order.totalAmount)}
                        </div>
                      </div>
                      <span className="text-movli font-bold text-xs flex items-center gap-1 group-hover:translate-x-1 transition">
                        Track Live <ArrowRight className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
