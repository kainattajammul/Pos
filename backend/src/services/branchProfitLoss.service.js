import { Prisma } from "@prisma/client";
import { prisma } from "../config/database.js";
import { ensureBranch } from "./branchFinanceSettings.service.js";
import { BranchFinanceModel } from "../models/branchFinance.model.js";
import { toPublicProfitLoss } from "../mappers/branchFinance.mapper.js";
import { PNL_EXPENSE_STATUSES } from "../constants/financeEnums.js";

export async function getProfitLoss({ shopId, branchUuid, query }) {
  const branch = await ensureBranch(shopId, branchUuid);
  const financeSettings = await BranchFinanceModel.getFinanceSettings(branch.id, shopId);

  const periodStart = query.from ? new Date(query.from) : new Date(new Date().getFullYear(), new Date().getMonth(), 1);
  const periodEnd = query.to ? new Date(query.to) : new Date();

  const saleAgg = await prisma.branchSale.aggregate({
    where: {
      branchId: branch.id,
      shopId: Number(shopId),
      status: { in: ["COMPLETED", "PARTIALLY_REFUNDED", "REFUNDED"] },
      completedAt: { gte: periodStart, lte: periodEnd },
    },
    _sum: { subtotal: true, taxTotal: true, discountTotal: true, total: true, costTotal: true },
  });

  const repairAgg = await prisma.branchRepairTicket.aggregate({
    where: {
      branchId: branch.id,
      shopId: Number(shopId),
      status: { in: ["COMPLETED", "COLLECTED", "DELIVERED"] },
      completedAt: { gte: periodStart, lte: periodEnd },
    },
    _sum: { finalCost: true },
  });

  const refundAgg = await prisma.branchRefund.aggregate({
    where: {
      branchId: branch.id,
      shopId: Number(shopId),
      status: { in: ["COMPLETED", "PARTIALLY_COMPLETED"] },
      processedAt: { gte: periodStart, lte: periodEnd },
    },
    _sum: { amount: true },
  });

  const expenseAgg = await prisma.branchExpense.aggregate({
    where: {
      branchId: branch.id,
      shopId: Number(shopId),
      status: { in: PNL_EXPENSE_STATUSES },
      expenseDate: { gte: periodStart, lte: periodEnd },
    },
    _sum: { total: true },
  });

  const commissionAgg = await prisma.branchCommission.aggregate({
    where: {
      branchId: branch.id,
      shopId: Number(shopId),
      status: { in: ["APPROVED", "PAID"] },
      createdAt: { gte: periodStart, lte: periodEnd },
    },
    _sum: { commissionAmount: true },
  });

  const repairPartsAgg = await prisma.branchRepairPart.aggregate({
    where: {
      repairTicket: {
        branchId: branch.id,
        shopId: Number(shopId),
        completedAt: { gte: periodStart, lte: periodEnd },
      },
      isUsed: true,
    },
    _sum: { unitCost: true },
  });

  const productRevenue = saleAgg._sum.subtotal ?? new Prisma.Decimal(0);
  const repairRevenue = repairAgg._sum.finalCost ?? new Prisma.Decimal(0);
  const grossRevenue = productRevenue.add(repairRevenue);
  const refunds = refundAgg._sum.amount ?? new Prisma.Decimal(0);
  const discounts = saleAgg._sum.discountTotal ?? new Prisma.Decimal(0);
  const netRevenue = grossRevenue.sub(refunds).sub(discounts);

  const costOfGoodsSold = saleAgg._sum.costTotal;
  const repairPartsCost = repairPartsAgg._sum.unitCost;
  const operatingExpenses = expenseAgg._sum.total ?? new Prisma.Decimal(0);
  const commissionExpenses = commissionAgg._sum.commissionAmount ?? new Prisma.Decimal(0);

  const warnings = [];
  if (costOfGoodsSold == null) warnings.push("Cost of goods sold unavailable for some sales");
  if (repairPartsCost == null) warnings.push("Repair parts cost unavailable for some repairs");

  const cogs = costOfGoodsSold ?? new Prisma.Decimal(0);
  const partsCost = repairPartsCost ?? new Prisma.Decimal(0);
  const grossProfit = costOfGoodsSold != null || repairPartsCost != null
    ? netRevenue.sub(cogs).sub(partsCost)
    : null;
  const operatingProfit = grossProfit != null
    ? grossProfit.sub(operatingExpenses).sub(commissionExpenses)
    : null;
  const profitMarginPercent =
    operatingProfit != null && netRevenue.gt(0)
      ? operatingProfit.div(netRevenue).mul(100)
      : null;

  return toPublicProfitLoss({
    periodStart: periodStart.toISOString(),
    periodEnd: periodEnd.toISOString(),
    currency: financeSettings.currency,
    grossRevenue,
    netRevenue,
    refunds,
    discounts,
    costOfGoodsSold,
    repairPartsCost,
    operatingExpenses,
    commissionExpenses,
    grossProfit,
    operatingProfit,
    profitMarginPercent,
    warnings,
    breakdown: {
      product_revenue: productRevenue,
      repair_revenue: repairRevenue,
    },
  });
}
