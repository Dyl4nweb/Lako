import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

export async function getServerSession() {
  const reqHeaders = await headers();
  try {
    const session = await auth.api.getSession({
      headers: reqHeaders,
    });
    return session;
  } catch (err) {
    console.error("Failed to fetch server session:", err);
    return null;
  }
}

export async function requireAuth(allowedRoles?: ("CUSTOMER" | "ADMIN" | "RIDER")[]) {
  const sessionData = await getServerSession();

  if (!sessionData || !sessionData.user) {
    redirect("/login");
  }

  const user = sessionData.user;
  const userRole = (user as unknown as { role?: string }).role || "CUSTOMER";

  if (allowedRoles && allowedRoles.length > 0 && !allowedRoles.includes(userRole as "CUSTOMER" | "ADMIN" | "RIDER")) {
    if (userRole === "ADMIN") redirect("/admin");
    if (userRole === "RIDER") redirect("/rider");
    redirect("/");
  }

  return { session: sessionData.session, user: { ...user, role: userRole } };
}

export async function requireAdmin() {
  return requireAuth(["ADMIN"]);
}

export async function requireRider() {
  return requireAuth(["RIDER"]);
}
