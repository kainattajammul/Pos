import { prisma } from "../config/database.js";
import { BranchFinanceModel } from "../models/branchFinance.model.js";
import { ensureBranch } from "./branchReportingSettings.service.js";
import { parsePagination, paginationMeta } from "../utils/financeHelpers.js";
import {
  COMPLETED_REPAIR_STATUSES,
  money,
  noDataWarning,
  reportMeta,
  resolveReportPeriod,
} from "../utils/reportHelpers.js";
import { touchLastReportGenerated } from "./branchReportingSettings.service.js";

export async function getRepairReport({ shopId, branchUuid, query }) {
  const branch = await ensureBranch(shopId, branchUuid);
  const financeSettings = await BranchFinanceModel.getFinanceSettings(branch.id, shopId);
  const period = resolveReportPeriod(query, financeSettings.timezone);
  const { page, limit, skip, direction } = parsePagination(query);

  const where = {
    shopId: Number(shopId),
    branchId: branch.id,
    createdAt: { gte: period.start, lte: period.end },
  };

  if (query.status) where.status = String(query.status).toUpperCase();
  if (query.technician_id) where.assignedTechnicianId = Number(query.technician_id);
  if (query.overdue_only === "true") {
    where.estimatedCompletionAt = { lt: new Date() };
    where.status = { notIn: [...COMPLETED_REPAIR_STATUSES, "CANCELLED", "UNREPAIRABLE"] };
  }

  const [statusGroups, created, completed, revenueAgg, records, total, turnaround] = await Promise.all([
    prisma.branchRepairTicket.groupBy({
      by: ["status"],
      where,
      _count: true,
    }),
    prisma.branchRepairTicket.count({ where }),
    prisma.branchRepairTicket.count({
      where: { ...where, status: { in: COMPLETED_REPAIR_STATUSES }, completedAt: { gte: period.start, lte: period.end } },
    }),
    prisma.branchRepairTicket.aggregate({
      where: { ...where, status: { in: COMPLETED_REPAIR_STATUSES } },
      _sum: { finalCost: true },
      _avg: { finalCost: true },
    }),
    prisma.branchRepairTicket.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: direction },
      include: {
        customer: { select: { uuid: true, displayName: true } },
      },
    }),
    prisma.branchRepairTicket.count({ where }),
    prisma.$queryRaw`
      SELECT AVG(EXTRACT(EPOCH FROM ("completed_at" - "created_at")) / 60) AS avg_minutes
      FROM branch_repair_tickets
      WHERE shop_id = ${Number(shopId)}
        AND branch_id = ${branch.id}
        AND completed_at IS NOT NULL
        AND created_at >= ${period.start}
        AND created_at <= ${period.end}
        AND status IN ('COMPLETED', 'COLLECTED', 'DELIVERED')
    `.catch(() => [{ avg_minutes: null }]),
  ]);

  const eligible = created - (statusGroups.find((s) => s.status === "CANCELLED")?._count ?? 0);
  const completionRate = eligible > 0 ? Number(((completed / eligible) * 100).toFixed(2)) : 0;
  const avgTurnaround = turnaround[0]?.avg_minutes != null ? Math.round(Number(turnaround[0].avg_minutes)) : null;

  const hasData = total > 0;
  const summary = {
    ticketsCreated: created,
    repairsCompleted: completed,
    repairCompletionRate: completionRate,
    averageRepairValue: money(revenueAgg._avg.finalCost),
    repairRevenue: money(revenueAgg._sum.finalCost),
    averageTurnaroundMinutes: avgTurnaround,
    overdueRepairs: await prisma.branchRepairTicket.count({
      where: {
        branchId: branch.id,
        shopId: Number(shopId),
        estimatedCompletionAt: { lt: new Date() },
        status: { notIn: [...COMPLETED_REPAIR_STATUSES, "CANCELLED", "UNREPAIRABLE"] },
      },
    }),
  };

  const techIds = [...new Set(records.map((r) => r.assignedTechnicianId).filter(Boolean))];
  const techs = techIds.length
    ? await prisma.user.findMany({ where: { id: { in: techIds } }, select: { id: true, displayName: true } })
    : [];
  const techMap = new Map(techs.map((t) => [t.id, t.displayName]));

  await touchLastReportGenerated(branch.id, shopId);

  return {
    hasData,
    summary,
    chart: {
      code: "REPAIRS_BY_STATUS",
      labels: statusGroups.map((s) => s.status.toLowerCase()),
      series: [{ name: "Tickets", data: statusGroups.map((s) => s._count) }],
      hasData: statusGroups.length > 0,
    },
    records: records.map((r) => ({
      id: r.uuid,
      ticket_number: r.ticketNumber,
      customer: r.customer ? { id: r.customer.uuid, name: r.customer.displayName } : null,
      technician: r.assignedTechnicianId
        ? { id: r.assignedTechnicianId, name: techMap.get(r.assignedTechnicianId) ?? null }
        : null,
      service: null,
      status: r.status.toLowerCase(),
      priority: r.priority?.toLowerCase() ?? null,
      estimated_cost: r.estimatedCost != null ? money(r.estimatedCost) : null,
      final_cost: r.finalCost != null ? money(r.finalCost) : null,
      created_at: r.createdAt.toISOString(),
      completed_at: r.completedAt?.toISOString() ?? null,
    })),
    meta: reportMeta(period, financeSettings.currency, paginationMeta(page, limit, total)),
    warnings: hasData ? [] : noDataWarning(),
  };
}

export async function getRepairsByTechnician({ shopId, branchUuid, query }) {
  const branch = await ensureBranch(shopId, branchUuid);
  const financeSettings = await BranchFinanceModel.getFinanceSettings(branch.id, shopId);
  const period = resolveReportPeriod(query, financeSettings.timezone);

  const groups = await prisma.branchRepairTicket.groupBy({
    by: ["assignedTechnicianId"],
    where: {
      shopId: Number(shopId),
      branchId: branch.id,
      createdAt: { gte: period.start, lte: period.end },
      assignedTechnicianId: { not: null },
    },
    _count: true,
  });

  const techIds = groups.map((g) => g.assignedTechnicianId);
  const techs = techIds.length
    ? await prisma.user.findMany({ where: { id: { in: techIds } }, select: { id: true, displayName: true } })
    : [];
  const techMap = new Map(techs.map((t) => [t.id, t.displayName]));

  return {
    hasData: groups.length > 0,
    records: groups.map((g) => ({
      technician_id: g.assignedTechnicianId,
      technician_name: techMap.get(g.assignedTechnicianId) ?? "Unknown",
      ticket_count: g._count,
    })),
    meta: reportMeta(period, financeSettings.currency),
    warnings: groups.length === 0 ? noDataWarning() : [],
  };
}

export async function getRepairSummary(ctx) {
  const report = await getRepairReport(ctx);
  return { hasData: report.hasData, summary: report.summary, meta: report.meta, warnings: report.warnings };
}

export async function getRepairTrend({ shopId, branchUuid, query }) {
  const branch = await ensureBranch(shopId, branchUuid);
  const financeSettings = await BranchFinanceModel.getFinanceSettings(branch.id, shopId);
  const period = resolveReportPeriod(query, financeSettings.timezone);

  const repairs = await prisma.branchRepairTicket.findMany({
    where: {
      branchId: branch.id,
      shopId: Number(shopId),
      createdAt: { gte: period.start, lte: period.end },
    },
    select: { createdAt: true },
    orderBy: { createdAt: "asc" },
  });

  const byDay = new Map();
  for (const r of repairs) {
    const key = r.createdAt.toISOString().slice(0, 10);
    byDay.set(key, (byDay.get(key) ?? 0) + 1);
  }
  const labels = [...byDay.keys()].sort();

  return {
    hasData: repairs.length > 0,
    chart: {
      code: "REPAIRS_OVER_TIME",
      labels,
      series: [{ name: "Tickets created", data: labels.map((l) => byDay.get(l) ?? 0) }],
      grouping_interval: "day",
      hasData: repairs.length > 0,
    },
    meta: reportMeta(period, financeSettings.currency),
    warnings: repairs.length === 0 ? noDataWarning() : [],
  };
}

export async function getRepairsByStatus({ shopId, branchUuid, query }) {
  const report = await getRepairReport({ shopId, branchUuid, query });
  return {
    hasData: report.chart?.hasData ?? false,
    records: (report.chart?.labels ?? []).map((label, i) => ({
      status: label,
      count: report.chart?.series?.[0]?.data?.[i] ?? 0,
    })),
    meta: report.meta,
    warnings: report.warnings,
  };
}
