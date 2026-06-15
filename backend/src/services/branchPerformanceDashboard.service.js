import { Prisma } from "@prisma/client";
import { prisma } from "../config/database.js";
import { BranchFinanceModel } from "../models/branchFinance.model.js";
import { ensureBranch } from "./branchReportingSettings.service.js";
import { toPublicBranchContext, toKpiMetric } from "../mappers/branchReporting.mapper.js";
import {
  COMPLETED_REPAIR_STATUSES,
  COMPLETED_SALE_STATUSES,
  money,
  noDataWarning,
  resolveReportPeriod,
} from "../utils/reportHelpers.js";
import {
  COMPLETED_PAYMENT_STATUSES,
  COMPLETED_REFUND_STATUSES,
  OPEN_INVOICE_STATUSES,
} from "../constants/financeEnums.js";
import { calculateBranchValuation } from "./branchStockValuation.service.js";
import { getProfitLoss } from "./branchProfitLoss.service.js";
import { touchLastReportGenerated } from "./branchReportingSettings.service.js";
import { quantityAvailable } from "../utils/inventoryQuantities.js";

async function aggregateSales(branchId, shopId, start, end) {
  const agg = await prisma.branchSale.aggregate({
    where: {
      branchId,
      shopId,
      status: { in: COMPLETED_SALE_STATUSES },
      completedAt: { gte: start, lte: end },
    },
    _sum: { total: true, discountTotal: true },
    _count: true,
  });
  return {
    gross: agg._sum.total ?? new Prisma.Decimal(0),
    discounts: agg._sum.discountTotal ?? new Prisma.Decimal(0),
    count: agg._count,
  };
}

async function aggregateRefunds(branchId, shopId, start, end) {
  const agg = await prisma.branchRefund.aggregate({
    where: {
      branchId,
      shopId,
      status: { in: COMPLETED_REFUND_STATUSES },
      processedAt: { gte: start, lte: end },
    },
    _sum: { amount: true },
  });
  return agg._sum.amount ?? new Prisma.Decimal(0);
}

async function aggregateRepairs(branchId, shopId, start, end) {
  const [created, completed, inProgress, overdue] = await Promise.all([
    prisma.branchRepairTicket.count({
      where: { branchId, shopId, createdAt: { gte: start, lte: end } },
    }),
    prisma.branchRepairTicket.count({
      where: {
        branchId,
        shopId,
        status: { in: COMPLETED_REPAIR_STATUSES },
        completedAt: { gte: start, lte: end },
      },
    }),
    prisma.branchRepairTicket.count({
      where: {
        branchId,
        shopId,
        status: { in: ["IN_PROGRESS", "DIAGNOSING", "AWAITING_APPROVAL", "RECEIVED"] },
      },
    }),
    prisma.branchRepairTicket.count({
      where: {
        branchId,
        shopId,
        estimatedCompletionAt: { lt: new Date() },
        status: { notIn: [...COMPLETED_REPAIR_STATUSES, "CANCELLED", "UNREPAIRABLE"] },
      },
    }),
  ]);
  return { created, completed, inProgress, overdue };
}

async function aggregatePayments(branchId, shopId, start, end) {
  const agg = await prisma.branchPayment.aggregate({
    where: {
      branchId,
      shopId,
      status: { in: COMPLETED_PAYMENT_STATUSES },
      paidAt: { gte: start, lte: end },
    },
    _sum: { amount: true },
  });
  return agg._sum.amount ?? new Prisma.Decimal(0);
}

export async function getPerformanceDashboard({ shopId, branchUuid, query, includeFinancials = false }) {
  const branch = await ensureBranch(shopId, branchUuid);
  const financeSettings = await BranchFinanceModel.getFinanceSettings(branch.id, shopId);
  const timezone = financeSettings.timezone ?? branch.timezone ?? "Europe/London";
  const period = resolveReportPeriod(query, timezone);

  const [
    currentSales,
    previousSales,
    currentRefunds,
    previousRefunds,
    currentRepairs,
    previousRepairs,
    currentPayments,
    previousPayments,
    openInvoices,
    valuation,
  ] = await Promise.all([
    aggregateSales(branch.id, Number(shopId), period.start, period.end),
    period.comparisonStart
      ? aggregateSales(branch.id, Number(shopId), period.comparisonStart, period.comparisonEnd)
      : Promise.resolve({ gross: null, discounts: null, count: null }),
    aggregateRefunds(branch.id, Number(shopId), period.start, period.end),
    period.comparisonStart
      ? aggregateRefunds(branch.id, Number(shopId), period.comparisonStart, period.comparisonEnd)
      : Promise.resolve(null),
    aggregateRepairs(branch.id, Number(shopId), period.start, period.end),
    period.comparisonStart
      ? aggregateRepairs(branch.id, Number(shopId), period.comparisonStart, period.comparisonEnd)
      : Promise.resolve({ created: null, completed: null, inProgress: null, overdue: null }),
    aggregatePayments(branch.id, Number(shopId), period.start, period.end),
    period.comparisonStart
      ? aggregatePayments(branch.id, Number(shopId), period.comparisonStart, period.comparisonEnd)
      : Promise.resolve(null),
    prisma.branchInvoice.count({
      where: { branchId: branch.id, shopId: Number(shopId), status: { in: OPEN_INVOICE_STATUSES } },
    }),
    calculateBranchValuation({ shopId, branchUuid }).catch(() => null),
  ]);

  const netSales = currentSales.gross.sub(currentRefunds).sub(currentSales.discounts);
  const prevNetSales =
    previousSales.gross != null && previousRefunds != null
      ? previousSales.gross.sub(previousRefunds).sub(previousSales.discounts ?? 0)
      : null;

  const avgTxn =
    currentSales.count > 0
      ? money(currentSales.gross.div(currentSales.count))
      : "0.00";

  const completionRate =
    currentRepairs.created > 0
      ? Number(((currentRepairs.completed / currentRepairs.created) * 100).toFixed(2))
      : 0;

  const prevCompletionRate =
    previousRepairs.created > 0 && previousRepairs.completed != null
      ? Number(((previousRepairs.completed / previousRepairs.created) * 100).toFixed(2))
      : null;

  const warnings = [];
  const hasData =
    currentSales.count > 0 ||
    currentRepairs.created > 0 ||
    currentPayments.gt(0);

  if (!hasData) warnings.push(...noDataWarning());

  const reportingSettings = await prisma.branchReportingSettings.findUnique({
    where: { branchId: branch.id },
  });

  const valuationSummary = valuation?.data?.summary ?? null;

  let lowStockCount = 0;
  let outOfStockCount = 0;
  const invRows = await prisma.branchInventory.findMany({
    where: { shopId: Number(shopId), branchId: branch.id, archivedAt: null, isAllocated: true },
    include: { reorderRule: true },
  });
  for (const inv of invRows) {
    const available = quantityAvailable(inv);
    if (available <= 0) outOfStockCount += 1;
    else if (inv.reorderRule && available <= inv.reorderRule.reorderPoint) lowStockCount += 1;
  }

  const kpis = {
    grossSales: toKpiMetric(money(currentSales.gross), previousSales.gross != null ? money(previousSales.gross) : null, { isMoney: true }),
    netSales: toKpiMetric(money(netSales), prevNetSales != null ? money(prevNetSales) : null, { isMoney: true }),
    salesTransactionCount: toKpiMetric(currentSales.count, previousSales.count),
    averageTransactionValue: toKpiMetric(avgTxn, null, { isMoney: true }),
    refundTotal: toKpiMetric(money(currentRefunds), previousRefunds != null ? money(previousRefunds) : null, { isMoney: true }),
    repairsCreated: toKpiMetric(currentRepairs.created, previousRepairs.created),
    repairsCompleted: toKpiMetric(currentRepairs.completed, previousRepairs.completed),
    repairCompletionRate: toKpiMetric(completionRate, prevCompletionRate),
    repairsInProgress: { value: currentRepairs.inProgress, previousValue: null, percentageChange: null, trend: null },
    overdueRepairs: { value: currentRepairs.overdue, previousValue: null, percentageChange: null, trend: null },
    paymentsReceived: toKpiMetric(money(currentPayments), previousPayments != null ? money(previousPayments) : null, { isMoney: true }),
    outstandingInvoices: { value: openInvoices, previousValue: null, percentageChange: null, trend: null },
    inventoryValue: {
      value: valuationSummary?.total_cost_value ?? "0.00",
      previousValue: null,
      percentageChange: null,
      trend: null,
      reasonCode: valuationSummary ? null : "NO_VALUATION_DATA",
    },
    lowStockItemCount: { value: lowStockCount, previousValue: null, percentageChange: null, trend: null },
    outOfStockItemCount: { value: outOfStockCount, previousValue: null, percentageChange: null, trend: null },
    salesTargetMonthly: { value: money(reportingSettings?.salesTargetMonthly ?? 0), previousValue: null, percentageChange: null, trend: null },
    repairTargetMonthly: { value: reportingSettings?.repairTargetMonthly ?? 0, previousValue: null, percentageChange: null, trend: null },
  };

  let financials = null;
  if (includeFinancials) {
    const pnl = await getProfitLoss({ shopId, branchUuid, query: { from: period.start.toISOString(), to: period.end.toISOString() } });
    financials = pnl;
    if (pnl.warnings?.length) warnings.push(...pnl.warnings.map((w) => ({ code: "INCOMPLETE_COST_DATA", message: w })));
  }

  await touchLastReportGenerated(branch.id, shopId);

  return {
    hasData,
    branch: toPublicBranchContext(branch, financeSettings, period),
    kpis,
    financials,
    warnings,
    calculatedAt: new Date().toISOString(),
  };
}

export async function getPerformanceDashboardCharts({ shopId, branchUuid, query }) {
  const branch = await ensureBranch(shopId, branchUuid);
  const financeSettings = await BranchFinanceModel.getFinanceSettings(branch.id, shopId);
  const timezone = financeSettings.timezone ?? "Europe/London";
  const period = resolveReportPeriod(query, timezone);
  const groupBy = String(query.group_by || query.groupBy || "day");

  const sales = await prisma.branchSale.findMany({
    where: {
      branchId: branch.id,
      shopId: Number(shopId),
      status: "COMPLETED",
      completedAt: { gte: period.start, lte: period.end },
    },
    select: { completedAt: true, total: true, channel: true },
    orderBy: { completedAt: "asc" },
  });

  const repairs = await prisma.branchRepairTicket.findMany({
    where: {
      branchId: branch.id,
      shopId: Number(shopId),
      createdAt: { gte: period.start, lte: period.end },
    },
    select: { createdAt: true, status: true },
  });

  const salesByDay = new Map();
  for (const sale of sales) {
    const key = sale.completedAt.toISOString().slice(0, 10);
    const cur = salesByDay.get(key) ?? { total: new Prisma.Decimal(0), count: 0 };
    cur.total = cur.total.add(sale.total);
    cur.count += 1;
    salesByDay.set(key, cur);
  }

  const repairsByDay = new Map();
  for (const repair of repairs) {
    const key = repair.createdAt.toISOString().slice(0, 10);
    repairsByDay.set(key, (repairsByDay.get(key) ?? 0) + 1);
  }

  const labels = [...new Set([...salesByDay.keys(), ...repairsByDay.keys()])].sort();

  const charts = [
    {
      code: "SALES_OVER_TIME",
      labels,
      series: [
        { name: "Net sales", data: labels.map((l) => money(salesByDay.get(l)?.total ?? 0)) },
        { name: "Transactions", data: labels.map((l) => salesByDay.get(l)?.count ?? 0) },
      ],
      grouping_interval: groupBy,
      currency: financeSettings.currency,
      timezone,
      hasData: sales.length > 0,
    },
    {
      code: "REPAIRS_OVER_TIME",
      labels,
      series: [{ name: "Tickets created", data: labels.map((l) => repairsByDay.get(l) ?? 0) }],
      grouping_interval: groupBy,
      timezone,
      hasData: repairs.length > 0,
    },
  ];

  const statusCounts = await prisma.branchRepairTicket.groupBy({
    by: ["status"],
    where: { branchId: branch.id, shopId: Number(shopId), createdAt: { gte: period.start, lte: period.end } },
    _count: true,
  });

  charts.push({
    code: "REPAIR_STATUS_DISTRIBUTION",
    labels: statusCounts.map((s) => s.status.toLowerCase()),
    series: [{ name: "Tickets", data: statusCounts.map((s) => s._count) }],
    grouping_interval: "status",
    timezone,
    hasData: statusCounts.length > 0,
  });

  return {
    charts,
    warnings: sales.length === 0 && repairs.length === 0 ? noDataWarning() : [],
    calculatedAt: new Date().toISOString(),
  };
}

export async function getPerformanceDashboardComparison({ shopId, branchUuid, query }) {
  const current = await getPerformanceDashboard({ shopId, branchUuid, query, includeFinancials: false });
  return {
    hasData: current.hasData,
    branch: current.branch,
    comparisons: {
      netSales: current.kpis.netSales,
      grossSales: current.kpis.grossSales,
      salesTransactionCount: current.kpis.salesTransactionCount,
      repairsCompleted: current.kpis.repairsCompleted,
      repairsCreated: current.kpis.repairsCreated,
      repairCompletionRate: current.kpis.repairCompletionRate,
      paymentsReceived: current.kpis.paymentsReceived,
      refundTotal: current.kpis.refundTotal,
    },
    warnings: current.warnings,
    calculatedAt: current.calculatedAt,
  };
}
