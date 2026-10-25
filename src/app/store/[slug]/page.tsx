import { prisma } from "@/lib/prisma";
import { getCurrentSession } from "@/lib/auth/session";
import { Navbar } from "@/components/shared/Navbar";
import { StoreProfileView } from "@/components/customer/StoreProfileView";
import { notFound } from "next/navigation";


export default async function StorePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const session = await getCurrentSession();

  const store = await prisma.store.findUnique({
    where: { slug },
    include: {
      products: {
        where: { isAvailable: true },
        orderBy: { createdAt: "asc" },
      },
    },
  });

  if (!store) {
    notFound();
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#FBFBF9]">
      <Navbar session={session} />
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <StoreProfileView store={store as any} />
      </main>
    </div>
  );
}
