import React from "react";
import Link from "next/link";
import Image from "next/image";
import { notFound, redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import { getServerSession } from "@/lib/server-auth";
import { Navbar } from "@/components/shared/Navbar";
import { Footer } from "@/components/shared/Footer";
import { OrderStatusStepper } from "@/components/shared/OrderStatusStepper";
import { OrderCancellationButton } from "@/components/customer/OrderCancellationButton";
import {
  ArrowLeft,
  Truck,
  MapPin,
  Phone,
  User,
  Banknote,
  CheckCircle2,
  Clock,
  Bike,
} from "lucide-react";
import { OrderStatus } from "@/types";
import { LakoMascot } from "@/components/brand/LakoMascot";

export const dynamic = "force-dynamic";

interface OrderDetailPageProps {
  params: Promise<{
    id: string;
  }>;
  searchParams: Promise<{
    success?: string;
  }>;
}

export default async function OrderDetailPage({
  params,
  searchParams,
}: OrderDetailPageProps) {
  const { id } = await params;
  const { success } = await searchParams;

  const sessionData = await getServerSession();
  if (!sessionData || !sessionData.user) {
    redirect(`/login?redirect=/orders/${id}`);
  }

  const userId = sessionData.user.id;
  const userRole = (sessionData.user as unknown as { role?: string }).role;

  let order = null;

  try {
    order = await prisma.order.findUnique({
      where: { id },
      include: {
        items: true,
        assignedRider: {
          select: {
            id: true,
            name: true,
            phone: true,
          },
        },
      },
    });
  } catch (e) {
    console.error("Error fetching order details:", e);
  }

  if (!order) {
    notFound();
  }

  // Security check: Only customer owner, admin, or assigned rider can view
  if (userRole === "CUSTOMER" && order.customerId !== userId) {
    redirect("/orders");
  } else if (userRole === "RIDER" && order.assignedRiderId !== userId) {
    redirect("/rider");
  }

  const isEligibleForCancellation =
    (order.status === "PENDING" || order.status === "CONFIRMED") &&
    (userRole === "CUSTOMER" || userRole === "ADMIN");

  return (
    <div className="min-h-screen flex flex-col bg-neutral-50">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
        {/* Navigation back */}
        <div className="mb-6">
          <Link
            href="/orders"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-neutral-600 hover:text-orange-600 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to All Orders</span>
          </Link>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-2">
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-xl sm:text-2xl font-black text-neutral-900 tracking-tight">
                  Order #{order.orderNumber}
                </h1>
                <span className="text-xs font-bold px-3 py-1 rounded-full bg-orange-100 text-orange-800">
                  {order.status}
                </span>
              </div>
              <p className="text-xs text-neutral-500 mt-1">
                Placed on {new Date(order.createdAt).toLocaleString("en-PH")}
              </p>
            </div>

            {/* Cancellation button if eligible */}
            <OrderCancellationButton
              orderId={order.id}
              isEligible={isEligibleForCancellation}
            />
          </div>
        </div>

        {/* Order Placed Success Banner */}
        {success && (
          <div className="mb-6 p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-emerald-50 via-teal-50 to-orange-50 border border-emerald-200 text-emerald-900 flex items-center gap-4">
            <LakoMascot variant="delivery" size="sm" animate className="shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-xs sm:text-sm font-bold text-emerald-900">Order Confirmed Successfully!</p>
              <p className="text-xs text-neutral-600 mt-0.5">
                Thank you for your order! Your items and stock have been reserved. Our local store
                and riders have been notified and are packing your items.
              </p>
            </div>
          </div>
        )}

        {/* Live Stepper Tracker */}
        <div className="mb-8">
          <OrderStatusStepper
            status={order.status as OrderStatus}
            confirmedAt={order.confirmedAt}
            assignedAt={order.assignedAt}
            pickedUpAt={order.pickedUpAt}
            onTheWayAt={order.onTheWayAt}
            deliveredAt={order.deliveredAt}
            cancelledAt={order.cancelledAt}
            cancellationReason={order.cancellationReason}
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Order Details & Snapshots */}
          <div className="lg:col-span-8 space-y-6">
            <div className="bg-white rounded-3xl border border-neutral-200/80 p-6 sm:p-8 shadow-xs space-y-5">
              <h3 className="text-sm font-bold text-neutral-900 border-b border-neutral-100 pb-3">
                Ordered Items Snapshot ({order.items.length})
              </h3>

              <div className="divide-y divide-neutral-100">
                {order.items.map((item) => (
                  <div key={item.id} className="py-3.5 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3 min-w-0">
                      <div style={{ position: "relative" }} className="relative w-14 h-14 rounded-xl overflow-hidden bg-neutral-100 shrink-0 border border-neutral-200">
                        <Image
                          src={item.productImage}
                          alt={item.productName}
                          fill
                          sizes="56px"
                          className="object-cover"
                        />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs sm:text-sm font-bold text-neutral-900 truncate">
                          {item.productName}
                        </p>
                        <p className="text-xs text-neutral-500">
                          Qty: {item.quantity} × ₱{Number(item.unitPrice).toFixed(2)}
                        </p>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="text-xs sm:text-sm font-black text-neutral-900">
                        ₱{Number(item.lineTotal).toFixed(2)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Delivery Destination Card */}
            <div className="bg-white rounded-3xl border border-neutral-200/80 p-6 sm:p-8 shadow-xs space-y-4">
              <h3 className="text-sm font-bold text-neutral-900 flex items-center gap-2 border-b border-neutral-100 pb-3">
                <MapPin className="w-4 h-4 text-orange-600" />
                <span>Delivery Information</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-neutral-400 font-medium">Recipient Name:</span>
                  <p className="text-neutral-900 font-bold mt-0.5">{order.customerName}</p>
                </div>

                <div>
                  <span className="text-neutral-400 font-medium">Contact Phone:</span>
                  <p className="text-neutral-900 font-bold mt-0.5">{order.customerPhone}</p>
                </div>

                <div className="sm:col-span-2">
                  <span className="text-neutral-400 font-medium">Delivery Address:</span>
                  <p className="text-neutral-900 font-bold mt-0.5 leading-relaxed">
                    {order.deliveryAddress}
                  </p>
                </div>

                {order.orderNotes && (
                  <div className="sm:col-span-2">
                    <span className="text-neutral-400 font-medium">Order Notes:</span>
                    <p className="text-neutral-700 italic mt-0.5">{order.orderNotes}</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar Info & Assigned Rider */}
          <div className="lg:col-span-4 space-y-6">
            {/* Assigned Rider Card */}
            {order.assignedRider && (
              <div className="bg-white rounded-3xl border border-blue-200 p-6 shadow-xs space-y-3">
                <div className="flex items-center gap-2 text-xs font-black uppercase text-blue-700">
                  <Bike className="w-4 h-4" />
                  <span>Assigned Local Rider</span>
                </div>

                <div className="flex items-center gap-3 pt-1">
                  <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-700 flex items-center justify-center font-black text-sm shrink-0 border border-blue-100">
                    {order.assignedRider.name.charAt(0)}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-neutral-900">
                      {order.assignedRider.name}
                    </h4>
                    <p className="text-xs text-neutral-500">Official Lako Delivery Fleet</p>
                  </div>
                </div>

                {order.assignedRider.phone && (
                  <div className="pt-2">
                    <a
                      href={`tel:${order.assignedRider.phone}`}
                      className="inline-flex items-center gap-2 text-xs font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 px-3.5 py-2 rounded-xl transition-colors"
                    >
                      <Phone className="w-3.5 h-3.5" />
                      <span>Call Rider: {order.assignedRider.phone}</span>
                    </a>
                  </div>
                )}
              </div>
            )}

            {/* Financial Summary Card */}
            <div className="bg-white rounded-3xl border border-neutral-200/80 p-6 shadow-xs space-y-4">
              <h3 className="text-sm font-bold text-neutral-900 border-b border-neutral-100 pb-3">
                Payment Summary
              </h3>

              <div className="space-y-2.5 text-xs">
                <div className="flex items-center justify-between text-neutral-600">
                  <span>Subtotal</span>
                  <span className="font-bold text-neutral-900">
                    ₱{Number(order.subtotal).toFixed(2)}
                  </span>
                </div>
                <div className="flex items-center justify-between text-neutral-600">
                  <span>Delivery Fee</span>
                  <span className="font-bold text-neutral-900">
                    ₱{Number(order.deliveryFee).toFixed(2)}
                  </span>
                </div>
                <div className="pt-3 border-t border-neutral-100 flex items-center justify-between text-base font-black">
                  <span className="text-neutral-900">Total Due (COD)</span>
                  <span className="text-orange-600 text-lg">
                    ₱{Number(order.total).toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Payment Collection Status Banner */}
              <div
                className={`rounded-2xl p-3.5 text-xs font-bold flex items-center justify-between ${
                  order.paymentCollectionStatus === "COLLECTED"
                    ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                    : "bg-amber-50 text-amber-800 border border-amber-200"
                }`}
              >
                <div className="flex items-center gap-2">
                  <Banknote className="w-4 h-4 shrink-0" />
                  <span>
                    COD Collection:{" "}
                    {order.paymentCollectionStatus === "COLLECTED" ? "Paid" : "Pending Collection"}
                  </span>
                </div>
                <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full bg-white/80 shadow-xs">
                  {order.paymentCollectionStatus}
                </span>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
