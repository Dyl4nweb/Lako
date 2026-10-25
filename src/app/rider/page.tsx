import { prisma } from "@/lib/prisma";
import { getCurrentSession } from "@/lib/auth/session";
import { Navbar } from "@/components/shared/Navbar";
import { RiderTerminalView } from "@/components/rider/RiderTerminalView";
import { redirect } from "next/navigation";


export default async function RiderPage() {
  const session = await getCurrentSession();

  // Find active rider profile
  let riderUserId = session?.id;
  let rider = await prisma.riderProfile.findFirst({
    where: { userId: riderUserId },
    include: {
      user: true,
      assignedOrders: {
        include: {
          store: true,
          customer: true,
          orderItems: { include: { product: true } },
        },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  // If logged in as customer or admin, fallback to Mark Dizon for testing
  if (!rider) {
    rider = await prisma.riderProfile.findFirst({
      include: {
        user: true,
        assignedOrders: {
          include: {
            store: true,
            customer: true,
            orderItems: { include: { product: true } },
          },
          orderBy: { createdAt: "desc" },
        },
      },
    });
  }

  if (!rider) {
    redirect("/");
  }

  // Calculate rider metrics
  const deliveredOrders = rider.assignedOrders.filter((o) => o.status === "DELIVERED");
  const totalWagesEarned = deliveredOrders.reduce((sum, o) => sum + o.riderPayoutAmount, 0);

  return (
    <div className="min-h-screen flex flex-col bg-[#FBFBF9]">
      <Navbar session={session} />
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 py-6">
        <RiderTerminalView
          rider={rider as any}
          financials={{
            totalWagesEarned,
            completedDropsCount: deliveredOrders.length,
          }}
          session={session}
        />
      </main>
    </div>
  );
}
