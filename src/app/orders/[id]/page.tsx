import { prisma } from "@/lib/prisma";
import { getCurrentSession } from "@/lib/auth/session";
import { Navbar } from "@/components/shared/Navbar";
import { OrderLiveTrackerView } from "@/components/customer/OrderLiveTrackerView";
import { notFound } from "next/navigation";


export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await getCurrentSession();

  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      store: true,
      rider: {
        include: {
          user: true,
        },
      },
      orderItems: {
        include: {
          product: true,
        },
      },
      statusHistory: {
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!order) {
    notFound();
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#FBFBF9]">
      <Navbar session={session} />
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 py-8">
        <OrderLiveTrackerView order={order as any} session={session} />
      </main>
    </div>
  );
}
