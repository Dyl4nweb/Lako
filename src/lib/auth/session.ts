import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import { UserSession } from "@/types";

const SESSION_COOKIE_NAME = "movli_user_id";

export async function getCurrentSession(): Promise<UserSession | null> {
  const cookieStore = await cookies();
  let userId = cookieStore.get(SESSION_COOKIE_NAME)?.value;

  // Fallback to customer Teresa if no session cookie exists yet
  if (!userId) {
    const defaultUser = await prisma.user.findFirst({
      where: { role: "CUSTOMER" },
      include: { store: true, riderProfile: true },
    });
    if (!defaultUser) return null;
    return {
      id: defaultUser.id,
      email: defaultUser.email,
      fullName: defaultUser.fullName,
      role: defaultUser.role as any,
      phoneNumber: defaultUser.phoneNumber,
      avatarUrl: defaultUser.avatarUrl,
      storeId: defaultUser.store?.id,
      riderProfileId: defaultUser.riderProfile?.id,
    };
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { store: true, riderProfile: true },
  });

  if (!user || !user.isActive) return null;

  return {
    id: user.id,
    email: user.email,
    fullName: user.fullName,
    role: user.role as any,
    phoneNumber: user.phoneNumber,
    avatarUrl: user.avatarUrl,
    storeId: user.store?.id,
    riderProfileId: user.riderProfile?.id,
  };
}

export async function setSessionUser(userId: string) {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, userId, {
    path: "/",
    httpOnly: true,
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 30, // 30 days
  });
}

export async function clearSession() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
}

export async function getAllDemoUsers() {
  return await prisma.user.findMany({
    select: {
      id: true,
      email: true,
      fullName: true,
      role: true,
      phoneNumber: true,
      avatarUrl: true,
      store: { select: { id: true, name: true, slug: true } },
      riderProfile: { select: { id: true, plateNumber: true, isAvailable: true } },
    },
    orderBy: { role: "asc" },
  });
}
