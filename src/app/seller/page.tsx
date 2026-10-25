import { prisma } from "@/lib/prisma";
import { getCurrentSession } from "@/lib/auth/session";
import { Navbar } from "@/components/shared/Navbar";
import { SellerDashboardView } from "@/components/seller/SellerDashboardView";
import { redirect } from "next/navigation";


export default async function SellerPage() {
  const session = await getCurrentSession();

  // If not seller or admin, find or fallback to the first seller (Aling Senang)
  let storeId = session?.storeId;
  if (!storeId) {
    const firstStore = await prisma.store.findFirst();
    storeId = firstStore?.id;
  }

  if (!storeId) {
    redirect("/");
  }

  const store = await prisma.store.findUnique({
    where: { id: storeId },
    include: {
      products: {
        orderBy: { createdAt: "asc" },
      },
      orders: {
        include: {
          customer: true,
          rider: { include: { user: true } },
          orderItems: { include: { product: true } },
        },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!store) {
    redirect("/");
  }

  // Calculate seller financial metrics
  const deliveredOrders = store.orders.filter((o) => o.status === "DELIVERED");
  const grossSales = deliveredOrders.reduce((sum, o) => sum + o.subtotalAmount, 0);
  const totalCommission = deliveredOrders.reduce((sum, o) => sum + o.commissionAmount, 0);
  const netReceivable = deliveredOrders.reduce((sum, o) => sum + o.merchantPayoutAmount, 0);

  return (
    <div className="min-h-screen flex flex-col bg-[#FBFBF9]">
      <Navbar session={session} />
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <SellerDashboardView
          store={store as any}
          financials={{
            grossSales,
            totalCommission,
            netReceivable,
            completedDropsCount: deliveredOrders.length,
          }}
          session={session}
        />
      </main>
    </div>
  );
}
