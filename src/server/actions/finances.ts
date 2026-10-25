"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getCurrentSession } from "@/lib/auth/session";
import { reconcileRiderCashRemittance, disburseMerchantSettlement } from "@/lib/ledger";

export async function logOperatingExpenseAction(input: {
  category: string;
  amount: number;
  description: string;
  receiptUrl?: string;
}) {
  const session = await getCurrentSession();
  if (!session || (session.role !== "ADMIN" && session.role !== "SUPER_ADMIN")) {
    throw new Error("Unauthorized to record platform expenses.");
  }

  const { category, amount, description, receiptUrl } = input;
  if (amount <= 0) throw new Error("Expense amount must be greater than zero.");
  if (!description) throw new Error("Description is required.");

  const expense = await prisma.expense.create({
    data: {
      category,
      amount,
      description,
      receiptUrl,
      loggedById: session.id,
    },
  });

  // Also post to double-entry ledger: DR 50xx (Expense) / CR 1020 (Platform Vault)
  let accountCode = "5010";
  if (category === "MARKETING") accountCode = "5020";
  if (category === "SPOILAGE") accountCode = "5030";

  await prisma.ledgerEntry.create({
    data: {
      accountCode,
      description: `Expense: ${description}`,
      debit: amount,
      credit: 0.0,
    },
  });

  await prisma.ledgerEntry.create({
    data: {
      accountCode: "1020",
      description: `Cash Outflow: ${description}`,
      debit: 0.0,
      credit: amount,
    },
  });

  revalidatePath("/admin");
  return expense;
}

export async function reconcileRiderCashAction(riderProfileId: string, amount: number) {
  const session = await getCurrentSession();
  if (!session || (session.role !== "ADMIN" && session.role !== "SUPER_ADMIN")) {
    throw new Error("Unauthorized.");
  }

  const rider = await prisma.riderProfile.findUnique({
    where: { id: riderProfileId },
    include: { user: true },
  });
  if (!rider) throw new Error("Rider not found.");

  await reconcileRiderCashRemittance(
    riderProfileId,
    rider.user.fullName,
    amount,
    session.id
  );

  revalidatePath("/admin");
  revalidatePath("/rider");
  return { success: true };
}

export async function disburseMerchantPayoutAction(storeId: string, amount: number) {
  const session = await getCurrentSession();
  if (!session || (session.role !== "ADMIN" && session.role !== "SUPER_ADMIN")) {
    throw new Error("Unauthorized.");
  }

  const store = await prisma.store.findUnique({ where: { id: storeId } });
  if (!store) throw new Error("Store not found.");

  await disburseMerchantSettlement(storeId, store.name, amount, session.id);

  revalidatePath("/admin");
  revalidatePath("/seller");
  return { success: true };
}
