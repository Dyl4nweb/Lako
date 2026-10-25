"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { updateOrderStatus } from "@/server/actions/orders";
import { XCircle, Loader2 } from "lucide-react";

interface OrderCancellationButtonProps {
  orderId: string;
  isEligible: boolean;
}

export function OrderCancellationButton({
  orderId,
  isEligible,
}: OrderCancellationButtonProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isEligible) return null;

  const handleCancel = async () => {
    const confirmed = window.confirm(
      "Are you sure you want to cancel this order? Any reserved stock will be returned to the store."
    );
    if (!confirmed) return;

    setLoading(true);
    setError(null);

    const res = await updateOrderStatus({
      orderId,
      targetStatus: "CANCELLED",
      note: "Cancelled by customer before dispatch.",
    });

    if (!res.success) {
      setError(res.error || "Failed to cancel order.");
      setLoading(false);
    } else {
      router.refresh();
    }
  };

  return (
    <div className="space-y-2">
      {error && <p className="text-xs text-red-600 font-medium">{error}</p>}
      <button
        type="button"
        onClick={handleCancel}
        disabled={loading}
        className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-red-200 text-xs font-bold text-red-600 hover:bg-red-50 hover:border-red-300 disabled:opacity-50 transition-colors"
      >
        {loading ? (
          <>
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Cancelling Order...</span>
          </>
        ) : (
          <>
            <XCircle className="w-4 h-4" />
            <span>Cancel This Order</span>
          </>
        )}
      </button>
    </div>
  );
}
