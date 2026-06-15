import { Prisma } from "@prisma/client";
import { prisma } from "../config/database.js";
import { BranchFinanceModel } from "../models/branchFinance.model.js";
import { ensureBranch } from "./branchReportingSettings.service.js";
import { parsePagination, paginationMeta } from "../utils/financeHelpers.js";
import {
  money,
  noDataWarning,
  reportMeta,
  resolveReportPeriod,
} from "../utils/reportHelpers.js";
import {
  COMPLETED_PAYMENT_STATUSES,
  COMPLETED_REFUND_STATUSES,
  OPEN_INVOICE_STATUSES,
} from "../constants/financeEnums.js";
import { touchLastReportGenerated } from "./branchReportingSettings.service.js";

export async function getPaymentReport({ shopId, branchUuid, query }) {
  const branch = await ensureBranch(shopId, branchUuid);
  const financeSettings = await BranchFinanceModel.getFinanceSettings(branch.id, shopId);
  const period = resolveReportPeriod(query, financeSettings.timezone);
  const { page, limit, skip, direction } = parsePagination(query);

  const where = {
    shopId: Number(shopId),
    branchId: branch.id,
    paidAt: { gte: period.start, lte: period.end },
  };

  if (query.payment_method) where.paymentMethod = String(query.payment_method).toUpperCase();
  if (query.status) where.status = String(query.status).toUpperCase();

  const [
    successfulAgg,
    refundAgg,
    byMethod,
    byStatus,
    outstandingAgg,
    records,
    total,
  ] = await Promise.all([
    prisma.branchPayment.aggregate({
      where: { ...where, status: { in: COMPLETED_PAYMENT_STATUSES } },
      _sum: { amount: true },
      _count: true,
      _avg: { amount: true },
    }),
    prisma.branchRefund.aggregate({
      where: {
        branchId: branch.id,
        shopId: Number(shopId),
        status: { in: COMPLETED_REFUND_STATUSES },
        processedAt: { gte: period.start, lte: period.end },
      },
      _sum: { amount: true },
      _count: true,
    }),
    prisma.branchPayment.groupBy({
      by: ["paymentMethod"],
      where: { ...where, status: { in: COMPLETED_PAYMENT_STATUSES } },
      _sum: { amount: true },
      _count: true,
    }),
    prisma.branchPayment.groupBy({
      by: ["status"],
      where,
      _count: true,
    }),
    prisma.branchInvoice.aggregate({
      where: { branchId: branch.id, shopId: Number(shopId), status: { in: OPEN_INVOICE_STATUSES } },
      _sum: { amountDue: true },
      _count: true,
    }),
    prisma.branchPayment.findMany({
      where,
      skip,
      take: limit,
      orderBy: { paidAt: direction },
      include: {
        customer: { select: { uuid: true, displayName: true } },
      },
    }),
    prisma.branchPayment.count({ where }),
  ]);

  const successful = successfulAgg._sum.amount ?? new Prisma.Decimal(0);
  const refunds = refundAgg._sum.amount ?? new Prisma.Decimal(0);
  const netCollected = successful.sub(refunds);

  const failedCount = byStatus.find((s) => s.status === "FAILED")?._count ?? 0;
  const pendingCount = byStatus.find((s) => s.status === "PENDING")?._count ?? 0;

  const hasData = total > 0 || refundAgg._count > 0;
  const summary = {
    totalPaymentAmount: money(successful),
    successfulPaymentAmount: money(successful),
    refundTotal: money(refunds),
    netCollectedAmount: money(netCollected),
    pendingPayments: pendingCount,
    failedPayments: failedCount,
    outstandingInvoiceAmount: money(outstandingAgg._sum.amountDue),
    outstandingInvoiceCount: outstandingAgg._count,
    averagePaymentValue: money(successfulAgg._avg.amount),
    paymentCount: successfulAgg._count,
  };

  await touchLastReportGenerated(branch.id, shopId);

  return {
    hasData,
    summary,
    chart: {
      code: "PAYMENTS_BY_METHOD",
      labels: byMethod.map((m) => m.paymentMethod.toLowerCase()),
      series: [{ name: "Amount", data: byMethod.map((m) => money(m._sum.amount)) }],
      currency: financeSettings.currency,
      hasData: byMethod.length > 0,
    },
    records: records.map((p) => ({
      id: p.uuid,
      payment_number: p.paymentNumber,
      customer: p.customer ? { id: p.customer.uuid, name: p.customer.displayName } : null,
      method: p.paymentMethod.toLowerCase(),
      status: p.status.toLowerCase(),
      amount: money(p.amount),
      paid_at: p.paidAt?.toISOString() ?? null,
    })),
    meta: reportMeta(period, financeSettings.currency, paginationMeta(page, limit, total)),
    warnings: hasData ? [] : noDataWarning(),
  };
}

export async function getPaymentSummary(ctx) {
  const report = await getPaymentReport(ctx);
  return { hasData: report.hasData, summary: report.summary, meta: report.meta, warnings: report.warnings };
}

export async function getPaymentsByMethod({ shopId, branchUuid, query }) {
  const report = await getPaymentReport({ shopId, branchUuid, query });
  return {
    hasData: report.chart?.hasData ?? false,
    records: (report.chart?.labels ?? []).map((label, i) => ({
      method: label,
      amount: report.chart?.series?.[0]?.data?.[i] ?? "0.00",
    })),
    meta: report.meta,
    warnings: report.warnings,
  };
}

export async function getPaymentsByStatus({ shopId, branchUuid, query }) {
  const branch = await ensureBranch(shopId, branchUuid);
  const financeSettings = await BranchFinanceModel.getFinanceSettings(branch.id, shopId);
  const period = resolveReportPeriod(query, financeSettings.timezone);

  const groups = await prisma.branchPayment.groupBy({
    by: ["status"],
    where: {
      shopId: Number(shopId),
      branchId: branch.id,
      paidAt: { gte: period.start, lte: period.end },
    },
    _count: true,
    _sum: { amount: true },
  });

  return {
    hasData: groups.length > 0,
    records: groups.map((g) => ({
      status: g.status.toLowerCase(),
      count: g._count,
      amount: money(g._sum.amount),
    })),
    meta: reportMeta(period, financeSettings.currency),
    warnings: groups.length === 0 ? noDataWarning() : [],
  };
}

export async function getPaymentRefunds({ shopId, branchUuid, query }) {
  const branch = await ensureBranch(shopId, branchUuid);
  const financeSettings = await BranchFinanceModel.getFinanceSettings(branch.id, shopId);
  const period = resolveReportPeriod(query, financeSettings.timezone);
  const { page, limit, skip } = parsePagination(query);

  const where = {
    branchId: branch.id,
    shopId: Number(shopId),
    requestedAt: { gte: period.start, lte: period.end },
  };

  const [records, total] = await prisma.$transaction([
    prisma.branchRefund.findMany({ where, skip, take: limit, orderBy: { requestedAt: "desc" } }),
    prisma.branchRefund.count({ where }),
  ]);

  return {
    hasData: total > 0,
    records: records.map((r) => ({
      id: r.uuid,
      refund_number: r.refundNumber,
      amount: money(r.amount),
      status: r.status.toLowerCase(),
      requested_at: r.requestedAt?.toISOString() ?? null,
      processed_at: r.processedAt?.toISOString() ?? null,
    })),
    meta: reportMeta(period, financeSettings.currency, paginationMeta(page, limit, total)),
    warnings: total === 0 ? noDataWarning() : [],
  };
}

export async function getOutstandingPayments({ shopId, branchUuid }) {
  const branch = await ensureBranch(shopId, branchUuid);
  const financeSettings = await BranchFinanceModel.getFinanceSettings(branch.id, shopId);

  const invoices = await prisma.branchInvoice.findMany({
    where: { branchId: branch.id, shopId: Number(shopId), status: { in: OPEN_INVOICE_STATUSES } },
    include: { customer: { select: { uuid: true, displayName: true } } },
    orderBy: { dueDate: "asc" },
    take: 50,
  });

  return {
    hasData: invoices.length > 0,
    records: invoices.map((i) => ({
      id: i.uuid,
      invoice_number: i.invoiceNumber,
      customer: i.customer ? { id: i.customer.uuid, name: i.customer.displayName } : null,
      total: money(i.total),
      amount_due: money(i.amountDue),
      due_date: i.dueDate?.toISOString().slice(0, 10) ?? null,
      status: i.status.toLowerCase(),
    })),
    meta: { currency: financeSettings.currency, calculatedAt: new Date().toISOString() },
    warnings: invoices.length === 0 ? noDataWarning() : [],
  };
}
