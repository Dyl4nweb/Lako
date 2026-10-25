import { prisma } from "@/lib/prisma";
import { getCurrentSession } from "@/lib/auth/session";
import { Navbar } from "@/components/shared/Navbar";
import { AdminDashboardView } from "@/components/admin/AdminDashboardView";


export default async function AdminPage() {
  const session = await getCurrentSession();

  // Fetch all orders
  const orders = await prisma.order.findMany({
    include: {
      store: true,
      customer: true,
      rider: { include: { user: true } },
      orderItems: { include: { product: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  // Fetch all riders
  const riders = await prisma.riderProfile.findMany({
    include: {
      user: true,
    },
    orderBy: { createdAt: "asc" },
  });

  // Fetch all stores
  const stores = await prisma.store.findMany({
    include: {
      owner: true,
      products: true,
    },
    orderBy: { name: "asc" },
  });

  // Fetch double-entry ledger entries
  const ledgerEntries = await prisma.ledgerEntry.findMany({
    include: {
      order: {
        select: { orderNumber: true },
      },
    },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  // Fetch platform expenses
  const expenses = await prisma.expense.findMany({
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  // Calculate Key Performance Indicators (KPIs) (Master Plan Section 9.1 & 11)
  const deliveredOrders = orders.filter((o) => o.status === "DELIVERED");
  const gmv = orders.reduce((sum, o) => sum + o.totalAmount, 0);
  const platformRevenue = deliveredOrders.reduce(
    (sum, o) => sum + o.commissionAmount + o.platformMarginAmount,
    0
  );
  const cashInTransit = riders.reduce((sum, r) => sum + r.currentCashOnHand, 0);
  const merchantPayablesVault = deliveredOrders.reduce((sum, o) => sum + o.merchantPayoutAmount, 0);

  const activeOrdersCount = orders.filter(
    (o) =>
      o.status !== "DELIVERED" &&
      o.status !== "CANCELLED_BY_CUSTOMER" &&
      o.status !== "REJECTED_BY_STORE" &&
      o.status !== "RETURNED_TO_SELLER"
  ).length;

  return (
    <div className="min-h-screen flex flex-col bg-[#FBFBF9]">
      <Navbar session={session} />
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <AdminDashboardView
          kpis={{
            gmv,
            platformRevenue,
            cashInTransit,
            merchantPayablesVault,
            activeOrdersCount,
            totalOrdersCount: orders.length,
          }}
          orders={orders as any}
          riders={riders as any}
          stores={stores as any}
          ledgerEntries={ledgerEntries as any}
          expenses={expenses as any}
          session={session}
        />
      </main>
    </div>
  );
}
