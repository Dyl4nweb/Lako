import React from "react";
import { OrderStatus } from "@/types";
import { CheckCircle2, Clock, Package, Bike, Home, AlertTriangle, XCircle } from "lucide-react";

interface StepperProps {
  status: OrderStatus;
}

const STEPS = [
  { key: "PENDING", label: "Order Placed", icon: Clock },
  { key: "PREPARING", label: "Store Preparing", icon: Package },
  { key: "READY_FOR_PICKUP", label: "Ready for Pickup", icon: CheckCircle2 },
  { key: "IN_TRANSIT", label: "Courier In Transit", icon: Bike },
  { key: "DELIVERED", label: "Delivered", icon: Home },
];

export function OrderStatusStepper({ status }: StepperProps) {
  const isCancelled = status === "CANCELLED_BY_CUSTOMER" || status === "REJECTED_BY_STORE";
  const isFailed = status === "FAILED_DELIVERY" || status === "RETURNED_TO_SELLER";

  if (isCancelled) {
    return (
      <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-800 flex items-center gap-3">
        <XCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
        <div>
          <div className="font-bold text-sm">
            {status === "CANCELLED_BY_CUSTOMER" ? "Order Cancelled by Customer" : "Order Declined by Store"}
          </div>
          <div className="text-xs text-red-600">Stock has been restored to merchant inventory.</div>
        </div>
      </div>
    );
  }

  if (isFailed) {
    return (
      <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 flex items-center gap-3">
        <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0" />
        <div>
          <div className="font-bold text-sm">
            {status === "FAILED_DELIVERY" ? "Delivery Handover Unsuccessful" : "Goods Returned to Merchant"}
          </div>
          <div className="text-xs text-amber-600">Customer was unreachable or refused COD.</div>
        </div>
      </div>
    );
  }

  const getStepIndex = (st: OrderStatus): number => {
    switch (st) {
      case "PENDING":
        return 0;
      case "ACCEPTED":
      case "PREPARING":
        return 1;
      case "READY_FOR_PICKUP":
      case "ASSIGNED":
        return 2;
      case "PICKED_UP":
      case "IN_TRANSIT":
        return 3;
      case "DELIVERED":
        return 4;
      default:
        return 0;
    }
  };

  const currentIndex = getStepIndex(status);

  return (
    <div className="w-full py-4">
      <div className="flex items-center justify-between relative">
        {/* Connecting progress bar line */}
        <div className="absolute top-1/2 left-0 right-0 h-1 bg-zinc-200 -translate-y-1/2 z-0" />
        <div
          className="absolute top-1/2 left-0 h-1 bg-movli -translate-y-1/2 z-0 transition-all duration-500"
          style={{ width: `${(currentIndex / (STEPS.length - 1)) * 100}%` }}
        />

        {STEPS.map((step, idx) => {
          const isDone = idx < currentIndex;
          const isCurrent = idx === currentIndex;
          const Icon = step.icon;

          return (
            <div key={step.key} className="flex flex-col items-center relative z-10">
              <div
                className={`w-9 h-9 rounded-full flex items-center justify-center transition-all duration-300 ${
                  isDone
                    ? "bg-movli text-white shadow-md shadow-movli/30"
                    : isCurrent
                    ? "bg-movli text-white ring-4 ring-movli/20 scale-110"
                    : "bg-white border-2 border-zinc-300 text-zinc-400"
                }`}
              >
                <Icon className="w-4 h-4" />
              </div>
              <span
                className={`text-[11px] mt-2 font-semibold text-center whitespace-nowrap ${
                  isCurrent ? "text-movli font-bold" : isDone ? "text-slate-deep" : "text-zinc-400"
                }`}
              >
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
