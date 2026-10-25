import { prisma } from "@/lib/prisma";
import { getCurrentSession } from "@/lib/auth/session";
import { Navbar } from "@/components/shared/Navbar";
import { notFound } from "next/navigation";
import { SuperAdminView } from "@/components/admin/SuperAdminView";


export default async function SuperAdminPage() {
  const session = await getCurrentSession();

  // Stealth Routing Guard (Master Plan Section 10 & 17.3):
  // Return synthetic 404 Not Found if user is not SUPER_ADMIN
  if (!session || session.role !== "SUPER_ADMIN") {
    notFound();
  }

  // Fetch security audit logs
  const auditLogs = await prisma.auditLog.findMany({
    include: { user: { select: { fullName: true, email: true, role: true } } },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  // Fetch all accounts
  const allUsers = await prisma.user.findMany({
    orderBy: { role: "asc" },
  });

  return (
    <div className="min-h-screen flex flex-col bg-[#0F1318] text-zinc-100">
      <Navbar session={session} />
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <SuperAdminView
          session={session}
          auditLogs={auditLogs as any}
          users={allUsers as any}
        />
      </main>
    </div>
  );
}
