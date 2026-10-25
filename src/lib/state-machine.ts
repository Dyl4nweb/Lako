import { OrderStatus, Role } from "@/types";

export interface TransitionRule {
  allowedNextStates: OrderStatus[];
  allowedRoles: Role[];
  description: string;
}

export const ORDER_STATE_MACHINE: Record<OrderStatus, TransitionRule> = {
  PENDING: {
    allowedNextStates: ["ACCEPTED", "REJECTED_BY_STORE", "CANCELLED_BY_CUSTOMER"],
    allowedRoles: ["SELLER", "ADMIN", "SUPER_ADMIN", "CUSTOMER"],
    description: "Order placed by customer, stock reserved. Awaiting merchant confirmation.",
  },
  ACCEPTED: {
    allowedNextStates: ["PREPARING"],
    allowedRoles: ["SELLER", "ADMIN", "SUPER_ADMIN"],
    description: "Merchant accepted order with estimated preparation time.",
  },
  PREPARING: {
    allowedNextStates: ["READY_FOR_PICKUP"],
    allowedRoles: ["SELLER", "ADMIN", "SUPER_ADMIN"],
    description: "Store is packaging goods or kitchen is cooking.",
  },
  READY_FOR_PICKUP: {
    allowedNextStates: ["ASSIGNED"],
    allowedRoles: ["ADMIN", "SUPER_ADMIN"],
    description: "Order packaged. Awaiting dispatcher to assign dedicated courier.",
  },
  ASSIGNED: {
    allowedNextStates: ["PICKED_UP"],
    allowedRoles: ["RIDER", "ADMIN", "SUPER_ADMIN"],
    description: "Courier dispatched to merchant location.",
  },
  PICKED_UP: {
    allowedNextStates: ["IN_TRANSIT"],
    allowedRoles: ["RIDER", "ADMIN", "SUPER_ADMIN"],
    description: "Courier verified items and received package from merchant.",
  },
  IN_TRANSIT: {
    allowedNextStates: ["DELIVERED", "FAILED_DELIVERY"],
    allowedRoles: ["RIDER", "ADMIN", "SUPER_ADMIN"],
    description: "Courier en route to customer delivery address.",
  },
  DELIVERED: {
    allowedNextStates: [],
    allowedRoles: [],
    description: "Handover completed, POD uploaded, cash collected.",
  },
  FAILED_DELIVERY: {
    allowedNextStates: ["RETURNED_TO_SELLER"],
    allowedRoles: ["RIDER", "ADMIN", "SUPER_ADMIN"],
    description: "Customer unreachable or refused order. Items must be returned to store.",
  },
  RETURNED_TO_SELLER: {
    allowedNextStates: [],
    allowedRoles: [],
    description: "Undelivered goods returned to store and acknowledged.",
  },
  CANCELLED_BY_CUSTOMER: {
    allowedNextStates: [],
    allowedRoles: [],
    description: "Customer cancelled before merchant began preparation. Stock restored.",
  },
  REJECTED_BY_STORE: {
    allowedNextStates: [],
    allowedRoles: [],
    description: "Store declined due to closing or stock shortage. Stock restored.",
  },
};

export function canTransition(
  currentState: OrderStatus,
  targetState: OrderStatus,
  userRole: Role
): { allowed: boolean; reason?: string } {
  const rule = ORDER_STATE_MACHINE[currentState];
  if (!rule) {
    return { allowed: false, reason: `Unknown order state: ${currentState}` };
  }

  if (!rule.allowedNextStates.includes(targetState)) {
    return {
      allowed: false,
      reason: `Cannot transition order directly from ${currentState} to ${targetState}. Valid transitions are: ${rule.allowedNextStates.join(", ") || "None (Terminal State)"}.`,
    };
  }

  // Super admin and regular admin have operational authority
  if (userRole === "SUPER_ADMIN" || userRole === "ADMIN") {
    return { allowed: true };
  }

  // Customer can only cancel their own order while it is PENDING
  if (userRole === "CUSTOMER" && targetState === "CANCELLED_BY_CUSTOMER") {
    if (currentState === "PENDING") return { allowed: true };
    return { allowed: false, reason: "Orders cannot be cancelled once the merchant has accepted the order." };
  }

  if (!rule.allowedRoles.includes(userRole)) {
    return {
      allowed: false,
      reason: `Role '${userRole}' does not possess permission to execute transition to ${targetState}.`,
    };
  }

  return { allowed: true };
}
