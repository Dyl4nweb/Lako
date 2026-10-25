import { OrderStatus, Role } from "@/types";

export const ALLOWED_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  PENDING: ["CONFIRMED", "CANCELLED"],
  CONFIRMED: ["ASSIGNED", "CANCELLED"],
  ASSIGNED: ["PICKED_UP", "CONFIRMED", "CANCELLED"],
  PICKED_UP: ["ON_THE_WAY"],
  ON_THE_WAY: ["DELIVERED"],
  DELIVERED: [],
  CANCELLED: [],
};

export function canTransitionOrder(
  currentStatus: OrderStatus,
  targetStatus: OrderStatus,
  userRole: Role
): { allowed: boolean; reason?: string } {
  if (currentStatus === targetStatus) {
    return { allowed: false, reason: "Order is already in this status." };
  }

  const allowedTargets = ALLOWED_TRANSITIONS[currentStatus] || [];
  if (!allowedTargets.includes(targetStatus)) {
    return {
      allowed: false,
      reason: `Cannot transition from ${currentStatus} to ${targetStatus}.`,
    };
  }

  // Role-based restrictions
  if (userRole === "CUSTOMER") {
    if (targetStatus !== "CANCELLED") {
      return { allowed: false, reason: "Customers may only cancel pending orders." };
    }
    if (currentStatus !== "PENDING" && currentStatus !== "CONFIRMED") {
      return {
        allowed: false,
        reason: "Orders that have already been assigned or dispatched cannot be cancelled by customer.",
      };
    }
  }

  if (userRole === "RIDER") {
    const riderAllowedTargets: OrderStatus[] = ["PICKED_UP", "ON_THE_WAY", "DELIVERED"];
    if (!riderAllowedTargets.includes(targetStatus)) {
      return {
        allowed: false,
        reason: "Riders are only permitted to update delivery progress (Picked Up, On the Way, Delivered).",
      };
    }
  }

  return { allowed: true };
}

export function shouldRestoreStock(fromStatus: OrderStatus, toStatus: OrderStatus): boolean {
  // If transitioning to CANCELLED from an active state that had deducted stock, restore stock.
  return toStatus === "CANCELLED" && fromStatus !== "CANCELLED";
}

export function getStatusStepIndex(status: OrderStatus): number {
  switch (status) {
    case "PENDING":
      return 1;
    case "CONFIRMED":
      return 2;
    case "ASSIGNED":
      return 3;
    case "PICKED_UP":
      return 4;
    case "ON_THE_WAY":
      return 5;
    case "DELIVERED":
      return 6;
    case "CANCELLED":
      return -1;
    default:
      return 0;
  }
}
