import { Prisma } from "@prisma/client";
import { prisma } from "../config/database.js";
import { BranchFinanceModel } from "../models/branchFinance.model.js";
import { ensureBranch } from "./branchReportingSettings.service.js";
import { parsePagination, paginationMeta } from "../utils/financeHelpers.js";
import {
  COMPLETED_SALE_STATUSES,
  money,
  noDataWarning,
  reportMeta,
  resolveReportPeriod,
} from "../utils/reportHelpers.js";
import { getSalesSummary as getOperationsSalesSummary } from "./branchSalesSummary.service.js";
import { touchLastReportGenerated } from "./branchReportingSettings.service.js";

export async function getSalesReport({ shopId, branchUuid, query, includeCosts = false }) {
  const branch = await ensureBranch(shopId, branchUuid);
  const financeSettings = await BranchFinanceModel.getFinanceSettings(branch.id, shopId);
  const period = resolveReportPeriod(query, financeSettings.timezone);
  const { page, limit, skip, direction } = parsePagination(query);

  const where = {
    shopId: Number(shopId),
    branchId: branch.id,
    status: { in: COMPLETED_SALE_STATUSES },
    completedAt: { gte: period.start, lte: period.end },
  };

  if (query.channel) where.channel = String(query.channel).toUpperCase();
  if (query.staff_id || query.cashier_id) {
    where.cashierId = Number(query.staff_id || query.cashier_id);
  }

  const summaryData = await getOperationsSalesSummary({
    shopId,
    branchUuid,
    query: { from: period.start.toISOString(), to: period.end.toISOString() },
  });

  const refundAgg = await prisma.branchRefund.aggregate({
    where: {
      branchId: branch.id,
      shopId: Number(shopId),
      status: { in: ["COMPLETED", "PARTIALLY_COMPLETED"] },
      processedAt: { gte: period.start, lte: period.end },
    },
    _sum: { amount: true },
  });

  const refunds = refundAgg._sum.amount ?? new Prisma.Decimal(0);
  const grossSales = new Prisma.Decimal(summaryData.total_revenue);
  const netSales = grossSales.sub(refunds).sub(new Prisma.Decimal(summaryData.discount_total));

  const [records, total] = await prisma.$transaction([
    prisma.branchSale.findMany({
      where,
      skip,
      take: limit,
      orderBy: { completedAt: direction },
      include: {
        customer: { select: { uuid: true, displayName: true } },
      },
    }),
    prisma.branchSale.count({ where }),
  ]);

  const hasData = total > 0;
  const summary = {
    grossSales: money(grossSales),
    netSales: money(netSales),
    discounts: summaryData.discount_total,
    refunds: money(refunds),
    taxTotal: summaryData.tax_total,
    transactionCount: summaryData.sales_count,
    averageTransactionValue: summaryData.average_sale_value,
    unitsSold: null,
  };

  if (includeCosts) {
    summary.costOfGoodsSold = summaryData.total_cost;
    summary.grossProfit = summaryData.gross_profit;
  }

  const cashierIds = [...new Set(records.map((s) => s.cashierId).filter(Boolean))];
  const cashiers = cashierIds.length
    ? await prisma.user.findMany({ where: { id: { in: cashierIds } }, select: { id: true, displayName: true } })
    : [];
  const cashierMap = new Map(cashiers.map((u) => [u.id, u.displayName]));

  await touchLastReportGenerated(branch.id, shopId);

  return {
    hasData,
    summary,
    chart: {
      code: "SALES_BY_CHANNEL",
      labels: summaryData.by_channel.map((c) => c.channel),
      series: [{ name: "Revenue", data: summaryData.by_channel.map((c) => c.total) }],
      currency: financeSettings.currency,
      hasData: summaryData.by_channel.length > 0,
    },
    records: records.map((s) => ({
      id: s.uuid,
      sale_number: s.saleNumber,
      customer: s.customer ? { id: s.customer.uuid, name: s.customer.displayName } : null,
      cashier: s.cashierId ? { id: s.cashierId, name: cashierMap.get(s.cashierId) ?? null } : null,
      channel: s.channel.toLowerCase(),
      status: s.status.toLowerCase(),
      subtotal: money(s.subtotal),
      discount: money(s.discountTotal),
      tax: money(s.taxTotal),
      total: money(s.total),
      completed_at: s.completedAt?.toISOString() ?? null,
    })),
    meta: reportMeta(period, financeSettings.currency, paginationMeta(page, limit, total)),
    warnings: hasData ? [] : noDataWarning(),
  };
}

export async function getSalesByChannel({ shopId, branchUuid, query }) {
  const report = await getSalesReport({ shopId, branchUuid, query, includeCosts: false });
  return {
    hasData: report.chart?.hasData ?? false,
    records: (report.chart?.labels ?? []).map((label, i) => ({
      channel: label,
      revenue: report.chart?.series?.[0]?.data?.[i] ?? "0.00",
    })),
    meta: report.meta,
    warnings: report.warnings,
  };
}

export async function getSalesByStaff({ shopId, branchUuid, query }) {
  const branch = await ensureBranch(shopId, branchUuid);
  const financeSettings = await BranchFinanceModel.getFinanceSettings(branch.id, shopId);
  const period = resolveReportPeriod(query, financeSettings.timezone);

  const groups = await prisma.branchSale.groupBy({
    by: ["cashierId"],
    where: {
      shopId: Number(shopId),
      branchId: branch.id,
      status: { in: COMPLETED_SALE_STATUSES },
      completedAt: { gte: period.start, lte: period.end },
      cashierId: { not: null },
    },
    _sum: { total: true },
    _count: true,
  });

  const staffIds = groups.map((g) => g.cashierId);
  const users = staffIds.length
    ? await prisma.user.findMany({ where: { id: { in: staffIds } }, select: { id: true, displayName: true } })
    : [];
  const userMap = new Map(users.map((u) => [u.id, u.displayName]));

  return {
    hasData: groups.length > 0,
    records: groups.map((g) => ({
      staff_id: g.cashierId,
      staff_name: userMap.get(g.cashierId) ?? "Unknown",
      sales_count: g._count,
      revenue: money(g._sum.total),
    })),
    meta: reportMeta(period, financeSettings.currency),
    warnings: groups.length === 0 ? noDataWarning() : [],
  };
}

export async function getSalesReportSummary(ctx) {
  const report = await getSalesReport({ ...ctx, includeCosts: ctx.includeCosts ?? false });
  return { hasData: report.hasData, summary: report.summary, meta: report.meta, warnings: report.warnings };
}

export async function getSalesTrend({ shopId, branchUuid, query }) {
  const result = await getSalesReport({ shopId, branchUuid, query, includeCosts: false });
  return { chart: result.chart, meta: result.meta, warnings: result.warnings };
}

export async function getSalesByProduct({ shopId, branchUuid, query }) {
  const branch = await ensureBranch(shopId, branchUuid);
  const financeSettings = await BranchFinanceModel.getFinanceSettings(branch.id, shopId);
  const period = resolveReportPeriod(query, financeSettings.timezone);

  const items = await prisma.branchSaleLineItem.groupBy({
    by: ["name"],
    where: {
      sale: {
        shopId: Number(shopId),
        branchId: branch.id,
        status: "COMPLETED",
        completedAt: { gte: period.start, lte: period.end },
      },
    },
    _sum: { quantity: true, lineTotal: true },
    orderBy: { _sum: { lineTotal: "desc" } },
    take: Number(query.limit) || 20,
  });

  return {
    hasData: items.length > 0,
    records: items.map((i) => ({
      name: i.name,
      quantity_sold: i._sum.quantity ?? 0,
      revenue: money(i._sum.lineTotal),
    })),
    meta: reportMeta(period, financeSettings.currency),
    warnings: items.length === 0 ? noDataWarning() : [],
  };
}
