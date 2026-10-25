import { prisma } from "@/lib/prisma";

export const CHART_OF_ACCOUNTS = {
  CASH_IN_TRANSIT: { code: "1010", name: "Cash in Transit (Rider Cash Bag)" },
  PLATFORM_VAULT: { code: "1020", name: "Platform Bank / Cash Vault" },
  AP_MERCHANT: { code: "2010", name: "Accounts Payable: Merchants" },
  AP_RIDER: { code: "2020", name: "Accounts Payable: Riders" },
  REV_COMMISSION: { code: "4010", name: "Revenue: Marketplace Commission (5%)" },
  REV_DELIVERY_MARGIN: { code: "4020", name: "Revenue: Delivery Margin (PHP 10)" },
  EXP_TECH: { code: "5010", name: "Expense: Tech & Cloud Infrastructure" },
  EXP_MARKETING: { code: "5020", name: "Expense: Marketing & Acquisition" },
  EXP_BAD_DEBT: { code: "5030", name: "Expense: Spoiled Goods / Bad Debt" },
} as const;

export interface PostOrderLedgerParams {
  orderId: string;
  orderNumber: string;
  totalCOD: number;
  merchantPayout: number;
  riderPayout: number;
  commission: number;
  deliveryMargin: number;
  merchantName: string;
  riderName: string;
}

/**
 * Executes balanced double-entry ledger mutation upon successful order delivery.
 * DR 1010 (Cash in Transit) = totalCOD
 * CR 2010 (AP: Merchant) = merchantPayout
 * CR 2020 (AP: Rider) = riderPayout
 * CR 4010 (Revenue: Commission) = commission
 * CR 4020 (Revenue: Delivery Margin) = deliveryMargin
 * Debits strictly EQUAL Credits.
 */
export async function postOrderDeliveryJournal(params: PostOrderLedgerParams) {
  const {
    orderId,
    orderNumber,
    totalCOD,
    merchantPayout,
    riderPayout,
    commission,
    deliveryMargin,
    merchantName,
    riderName,
  } = params;

  return await prisma.$transaction(async (tx) => {
    // 1. Debit Cash in Transit (Rider pocket holds customer cash)
    await tx.ledgerEntry.create({
      data: {
        orderId,
        accountCode: CHART_OF_ACCOUNTS.CASH_IN_TRANSIT.code,
        description: `COD Collected - Order #${orderNumber} (${riderName})`,
        debit: totalCOD,
        credit: 0.0,
      },
    });

    // 2. Credit Accounts Payable: Merchant
    await tx.ledgerEntry.create({
      data: {
        orderId,
        accountCode: CHART_OF_ACCOUNTS.AP_MERCHANT.code,
        description: `Net Payable to Store: ${merchantName}`,
        debit: 0.0,
        credit: merchantPayout,
      },
    });

    // 3. Credit Accounts Payable: Rider
    await tx.ledgerEntry.create({
      data: {
        orderId,
        accountCode: CHART_OF_ACCOUNTS.AP_RIDER.code,
        description: `Delivery Wage Earned: ${riderName}`,
        debit: 0.0,
        credit: riderPayout,
      },
    });

    // 4. Credit Marketplace Commission Revenue
    await tx.ledgerEntry.create({
      data: {
        orderId,
        accountCode: CHART_OF_ACCOUNTS.REV_COMMISSION.code,
        description: `5% Platform Take-Rate - Order #${orderNumber}`,
        debit: 0.0,
        credit: commission,
      },
    });

    // 5. Credit Delivery Margin Revenue
    await tx.ledgerEntry.create({
      data: {
        orderId,
        accountCode: CHART_OF_ACCOUNTS.REV_DELIVERY_MARGIN.code,
        description: `Platform Delivery Fee Retention (₱45 - ₱35)`,
        debit: 0.0,
        credit: deliveryMargin,
      },
    });

    // Also update rider's physical cash-on-hand accumulator
    const order = await tx.order.findUnique({ where: { id: orderId } });
    if (order?.riderId) {
      await tx.riderProfile.update({
        where: { id: order.riderId },
        data: {
          currentCashOnHand: {
            increment: totalCOD,
          },
        },
      });
    }
  });
}

/**
 * Reconcile rider cash remittance to Platform Vault at end of shift/day
 * DR 1020 (Platform Vault) = amount
 * CR 1010 (Cash in Transit) = amount
 */
export async function reconcileRiderCashRemittance(
  riderProfileId: string,
  riderName: string,
  amount: number,
  adminUserId: string
) {
  return await prisma.$transaction(async (tx) => {
    // 1. DR Platform Vault
    await tx.ledgerEntry.create({
      data: {
        accountCode: CHART_OF_ACCOUNTS.PLATFORM_VAULT.code,
        description: `Rider Cash Remittance Received: ${riderName}`,
        debit: amount,
        credit: 0.0,
      },
    });

    // 2. CR Cash in Transit
    await tx.ledgerEntry.create({
      data: {
        accountCode: CHART_OF_ACCOUNTS.CASH_IN_TRANSIT.code,
        description: `Rider Cash Bag Cleared: ${riderName}`,
        debit: 0.0,
        credit: amount,
      },
    });

    // 3. Decrement rider cash on hand
    await tx.riderProfile.update({
      where: { id: riderProfileId },
      data: {
        currentCashOnHand: {
          decrement: amount,
        },
      },
    });

    // 4. Audit Log
    await tx.auditLog.create({
      data: {
        userId: adminUserId,
        action: "RECONCILE_RIDER_CASH",
        resourceType: "RIDER_PROFILE",
        resourceId: riderProfileId,
        detailsJson: JSON.stringify({ amount, riderName }),
      },
    });
  });
}

/**
 * Disburse settlement to Merchant
 * DR 2010 (AP: Merchant) = amount
 * CR 1020 (Platform Vault) = amount
 */
export async function disburseMerchantSettlement(
  storeId: string,
  storeName: string,
  amount: number,
  adminUserId: string
) {
  return await prisma.$transaction(async (tx) => {
    await tx.ledgerEntry.create({
      data: {
        accountCode: CHART_OF_ACCOUNTS.AP_MERCHANT.code,
        description: `Merchant Payout Disbursed: ${storeName}`,
        debit: amount,
        credit: 0.0,
      },
    });

    await tx.ledgerEntry.create({
      data: {
        accountCode: CHART_OF_ACCOUNTS.PLATFORM_VAULT.code,
        description: `Bank Wire/GCash Settlement Outflow: ${storeName}`,
        debit: 0.0,
        credit: amount,
      },
    });

    await tx.auditLog.create({
      data: {
        userId: adminUserId,
        action: "DISBURSE_MERCHANT_PAYOUT",
        resourceType: "STORE",
        resourceId: storeId,
        detailsJson: JSON.stringify({ amount, storeName }),
      },
    });
  });
}
