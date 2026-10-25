import React from "react";
import { OrderStatus } from "@/types";
import { CheckCircle2, Clock, Bike, PackageCheck, AlertCircle, ShoppingBag, Truck } from "lucide-react";

interface OrderStatusStepperProps {
  status: OrderStatus;
  confirmedAt?: Date | null;
  assignedAt?: Date | null;
  pickedUpAt?: Date | null;
  onTheWayAt?: Date | null;
  deliveredAt?: Date | null;
  cancelledAt?: Date | null;
  cancellationReason?: string | null;
}

export function OrderStatusStepper({
  status,
  confirmedAt,
  assignedAt,
  pickedUpAt,
  onTheWayAt,
  deliveredAt,
  cancelledAt,
  cancellationReason,
}: OrderStatusStepperProps) {
  if (status === "CANCELLED") {
    return (
      <div className="bg-red-50 border border-red-200 rounded-2xl p-4 sm:p-5 text-red-900">
        <div className="flex items-center gap-3">
          <AlertCircle className="w-6 h-6 text-red-600 shrink-0" />
          <div>
            <h4 className="text-sm font-bold">This Order Was Cancelled</h4>
            <p className="text-xs text-red-700 mt-0.5">
              {cancellationReason || "The order was cancelled and any reserved stock has been safely restored."}
            </p>
            {cancelledAt && (
              <p className="text-[11px] text-red-500 mt-1">
                Cancelled on {new Date(cancelledAt).toLocaleString("en-PH")}
              </p>
            )}
          </div>
        </div>
      </div>
    );
  }

  const steps = [
    {
      id: "PENDING",
      label: "Order Placed",
      icon: ShoppingBag,
      timestamp: null,
      desc: "Awaiting store confirmation",
    },
    {
      id: "CONFIRMED",
      label: "Confirmed",
      icon: CheckCircle2,
      timestamp: confirmedAt,
      desc: "Store accepted your order",
    },
    {
      id: "ASSIGNED",
      label: "Rider Assigned",
      icon: Bike,
      timestamp: assignedAt,
      desc: "Rider dispatched to store",
    },
    {
      id: "PICKED_UP",
      label: "Order Picked Up",
      icon: Clock,
      timestamp: pickedUpAt,
      desc: "Rider received packages",
    },
    {
      id: "ON_THE_WAY",
      label: "On the Way",
      icon: Truck,
      timestamp: onTheWayAt,
      desc: "Heading to your delivery address",
    },
    {
      id: "DELIVERED",
      label: "Delivered",
      icon: PackageCheck,
      timestamp: deliveredAt,
      desc: "Completed and handed to you",
    },
  ];

  const statusOrder: OrderStatus[] = [
    "PENDING",
    "CONFIRMED",
    "ASSIGNED",
    "PICKED_UP",
    "ON_THE_WAY",
    "DELIVERED",
  ];

  const currentIdx = statusOrder.indexOf(status);

  return (
    <div className="w-full bg-white rounded-2xl border border-neutral-200/80 p-5 shadow-xs">
      <h3 className="text-sm font-bold text-neutral-900 mb-6 flex items-center gap-2">
        <span>Delivery Lifecycle Tracker</span>
        <span className="text-xs font-normal text-neutral-500">• Cash on Delivery</span>
      </h3>

      <div className="relative">
        {/* Horizontal Progress Bar for Desktop */}
        <div className="hidden md:grid grid-cols-6 gap-2 relative">
          {/* Connector Line behind steps */}
          <div className="absolute top-5 left-[8%] right-[8%] h-0.5 bg-neutral-200 -z-0">
            <div
              className="h-full bg-orange-600 transition-all duration-500"
              style={{
                width: `${Math.max(0, (currentIdx / (steps.length - 1)) * 100)}%`,
              }}
            />
          </div>

          {steps.map((step, idx) => {
            const isCompleted = idx <= currentIdx;
            const isCurrent = idx === currentIdx;
            const StepIcon = step.icon;

            return (
              <div key={step.id} className="flex flex-col items-center text-center relative z-10">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
                    isCurrent
                      ? "bg-orange-600 border-orange-600 text-white ring-4 ring-orange-100 shadow-md scale-110"
                      : isCompleted
                      ? "bg-orange-600 border-orange-600 text-white"
                      : "bg-white border-neutral-300 text-neutral-400"
                  }`}
                >
                  <StepIcon className="w-5 h-5" />
                </div>

                <span
                  className={`mt-2 text-xs font-bold leading-tight ${
                    isCurrent
                      ? "text-orange-600"
                      : isCompleted
                      ? "text-neutral-900"
                      : "text-neutral-400"
                  }`}
                >
                  {step.label}
                </span>

                <span className="text-[10px] text-neutral-500 mt-0.5 line-clamp-1 max-w-[110px]">
                  {step.desc}
                </span>

                {step.timestamp && (
                  <span className="text-[9px] text-orange-600 font-medium mt-1">
                    {new Date(step.timestamp).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                )}
              </div>
            );
          })}
        </div>

        {/* Vertical Stepper for Mobile Phones */}
        <div className="md:hidden space-y-4">
          {steps.map((step, idx) => {
            const isCompleted = idx <= currentIdx;
            const isCurrent = idx === currentIdx;
            const StepIcon = step.icon;

            return (
              <div key={step.id} className="flex items-start gap-3">
                <div className="flex flex-col items-center">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center border-2 shrink-0 ${
                      isCurrent
                        ? "bg-orange-600 border-orange-600 text-white ring-3 ring-orange-100"
                        : isCompleted
                        ? "bg-orange-600 border-orange-600 text-white"
                        : "bg-white border-neutral-300 text-neutral-400"
                    }`}
                  >
                    <StepIcon className="w-4 h-4" />
                  </div>
                  {idx < steps.length - 1 && (
                    <div
                      className={`w-0.5 h-6 mt-1 ${
                        idx < currentIdx ? "bg-orange-600" : "bg-neutral-200"
                      }`}
                    />
                  )}
                </div>

                <div className="pt-0.5">
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-xs font-bold ${
                        isCurrent
                          ? "text-orange-600"
                          : isCompleted
                          ? "text-neutral-900"
                          : "text-neutral-400"
                      }`}
                    >
                      {step.label}
                    </span>
                    {step.timestamp && (
                      <span className="text-[10px] text-neutral-500">
                        {new Date(step.timestamp).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-neutral-500">{step.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
