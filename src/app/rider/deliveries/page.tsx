import React from "react";
import Link from "next/link";
import prisma from "@/lib/prisma";
import { requireRider } from "@/lib/server-auth";
import { Bike, MapPin, Phone, ArrowRight, Package } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function RiderDeliveriesListPage() {
  const { user } = await requireRider();

  let deliveries: {
    id: string;
    orderNumber: string;
    customerName: string;
    customerPhone: string;
    deliveryAddress: string;
    status: string;
    total: unknown;
    createdAt: Date;
    paymentCollectionStatus: string;
  }[] = [];

  try {
    deliveries = (await prisma.order.findMany({
      where: { assignedRiderId: user.id },
      orderBy: { createdAt: "desc" },
    })) as unknown as typeof deliveries;
  } catch (err) {
    console.error("Failed to load rider deliveries list:", err);
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-black text-neutral-900 tracking-tight">
          All Assigned Deliveries
        </h1>
        <p className="text-xs text-neutral-500 mt-0.5">
          History of parcels assigned to your dispatch route
        </p>
      </div>

      <div className="space-y-3">
        {deliveries.length > 0 ? (
          deliveries.map((del) => (
            <Link
              key={del.id}
              href={`/rider/deliveries/${del.id}`}
              className="block bg-white rounded-3xl border border-neutral-200/80 p-5 shadow-xs hover:border-blue-300 transition-colors"
            >
              <div className="flex items-center justify-between border-b border-neutral-100 pb-2.5">
                <div>
                  <span className="text-[11px] font-bold text-neutral-400">
                    #{del.orderNumber}
                  </span>
                  <h3 className="text-sm font-bold text-neutral-900">{del.customerName}</h3>
                </div>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-neutral-100 text-neutral-800">
                  {del.status}
                </span>
              </div>

              <div className="pt-2.5 flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5 text-neutral-600 truncate max-w-xs">
                  <MapPin className="w-3.5 h-3.5 text-orange-600 shrink-0" />
                  <span className="truncate">{del.deliveryAddress}</span>
                </div>
                <span className="font-black text-orange-600 shrink-0">
                  ₱{Number(del.total).toFixed(2)}
                </span>
              </div>
            </Link>
          ))
        ) : (
          <div className="text-center py-16 bg-white rounded-3xl border border-neutral-200 p-6 text-xs text-neutral-500">
            No deliveries found in your dispatch record.
          </div>
        )}
      </div>
    </div>
  );
}
