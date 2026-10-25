import React from "react";
import prisma from "@/lib/prisma";
import { requireRider } from "@/lib/server-auth";
import { PackageCheck, Clock, MapPin, Banknote, Calendar } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function RiderHistoryPage() {
  const { user } = await requireRider();

  let completedDeliveries: {
    id: string;
    orderNumber: string;
    customerName: string;
    deliveryAddress: string;
    deliveredAt: Date | null;
    total: unknown;
    paymentCollectionStatus: string;
    items: {
      id: string;
      productName: string;
      quantity: number;
    }[];
  }[] = [];

  try {
    completedDeliveries = (await prisma.order.findMany({
      where: {
        assignedRiderId: user.id,
        status: "DELIVERED",
      },
      include: {
        items: true,
      },
      orderBy: { deliveredAt: "desc" },
    })) as unknown as typeof completedDeliveries;
  } catch (err) {
    console.error("Failed to load rider history:", err);
  }

  const totalCollected = completedDeliveries
    .filter((d) => d.paymentCollectionStatus === "COLLECTED")
    .reduce((sum, d) => sum + Number(d.total), 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl sm:text-2xl font-black text-neutral-900 tracking-tight">
          Delivery History
        </h1>
        <p className="text-xs text-neutral-500 mt-0.5">
          Archived records of all completed deliveries and COD reconciliations
        </p>
      </div>

      {/* Summary card */}
      <div className="bg-white rounded-3xl border border-neutral-200/80 p-5 shadow-xs flex items-center justify-between">
        <div>
          <span className="text-xs font-bold text-neutral-400">Total Completed</span>
          <p className="text-2xl font-black text-neutral-900">
            {completedDeliveries.length} parcels
          </p>
        </div>

        <div className="text-right">
          <span className="text-xs font-bold text-neutral-400">COD Cash Handled</span>
          <p className="text-2xl font-black text-emerald-600">
            ₱{totalCollected.toLocaleString("en-PH", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
        </div>
      </div>

      {/* List */}
      <div className="space-y-3">
        {completedDeliveries.length > 0 ? (
          completedDeliveries.map((del) => (
            <div
              key={del.id}
              className="bg-white rounded-3xl border border-neutral-200/80 p-5 shadow-xs space-y-2.5"
            >
              <div className="flex items-center justify-between border-b border-neutral-100 pb-2.5">
                <div>
                  <span className="text-[11px] font-bold text-neutral-400">
                    Order #{del.orderNumber}
                  </span>
                  <h3 className="text-sm font-bold text-neutral-900">{del.customerName}</h3>
                </div>

                <div className="text-right">
                  <span className="text-sm font-black text-emerald-600 block">
                    ₱{Number(del.total).toFixed(2)}
                  </span>
                  <span className="text-[10px] uppercase font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                    {del.paymentCollectionStatus}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs text-neutral-500">
                <span className="truncate max-w-xs">{del.deliveryAddress}</span>
                <span>
                  {del.deliveredAt ? new Date(del.deliveredAt).toLocaleDateString("en-PH") : "Completed"}
                </span>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-16 bg-white rounded-3xl border border-neutral-200 p-6 text-xs text-neutral-500">
            No completed delivery records yet.
          </div>
        )}
      </div>
    </div>
  );
}
