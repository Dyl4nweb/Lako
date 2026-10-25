"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getCurrentSession, setSessionUser } from "@/lib/auth/session";

export async function assignRiderToOrderAction(orderId: string, riderProfileId: string) {
  const session = await getCurrentSession();
  if (!session || (session.role !== "ADMIN" && session.role !== "SUPER_ADMIN")) {
    throw new Error("Only dispatch admins can assign couriers.");
  }

  const order = await prisma.order.findUnique({ where: { id: orderId } });
  if (!order) throw new Error("Order not found.");

  const rider = await prisma.riderProfile.findUnique({
    where: { id: riderProfileId },
    include: { user: true },
  });
  if (!rider) throw new Error("Rider profile not found.");

  await prisma.$transaction(async (tx) => {
    await tx.order.update({
      where: { id: orderId },
      data: {
        riderId: riderProfileId,
        status: "ASSIGNED",
      },
    });

    await tx.orderStatusHistory.create({
      data: {
        orderId,
        status: "ASSIGNED",
        changedById: session.id,
        notes: `Dispatcher assigned courier ${rider.user.fullName} (${rider.vehicleType} - ${rider.plateNumber})`,
      },
    });

    await tx.auditLog.create({
      data: {
        userId: session.id,
        action: "DISPATCH_RIDER_ASSIGNMENT",
        resourceType: "ORDER",
        resourceId: orderId,
        detailsJson: JSON.stringify({ riderProfileId, riderName: rider.user.fullName }),
      },
    });
  });

  revalidatePath("/");
  revalidatePath("/admin");
  revalidatePath("/rider");
  revalidatePath(`/orders/${orderId}`);

  return { success: true };
}

export async function toggleRiderDutyStatusAction(isAvailable: boolean) {
  const session = await getCurrentSession();
  if (!session || (!session.riderProfileId && session.role !== "SUPER_ADMIN")) {
    throw new Error("Only active couriers can toggle duty status.");
  }

  const profile = await prisma.riderProfile.findFirst({
    where: { userId: session.id },
  });

  if (!profile) throw new Error("Rider profile not found.");

  const updated = await prisma.riderProfile.update({
    where: { id: profile.id },
    data: { isAvailable },
  });

  revalidatePath("/rider");
  revalidatePath("/admin");

  return updated;
}

export async function switchDemoUserAction(targetUserId: string) {
  await setSessionUser(targetUserId);
  revalidatePath("/", "layout");
}
