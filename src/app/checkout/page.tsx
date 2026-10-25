import { getCurrentSession } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import { Navbar } from "@/components/shared/Navbar";
import { CheckoutView } from "@/components/customer/CheckoutView";


export default async function CheckoutPage() {
  const session = await getCurrentSession();

  let savedAddresses: any[] = [];
  if (session) {
    savedAddresses = await prisma.address.findMany({
      where: { userId: session.id },
      orderBy: { isDefault: "desc" },
    });
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#FBFBF9]">
      <Navbar session={session} />
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 py-8">
        <CheckoutView session={session} savedAddresses={savedAddresses} />
      </main>
    </div>
  );
}
