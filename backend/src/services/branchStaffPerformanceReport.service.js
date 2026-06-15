import { Prisma } from "@prisma/client";
import { prisma } from "../config/database.js";
import { BranchFinanceModel } from "../models/branchFinance.model.js";
import { ensureBranch } from "./branchReportingSettings.service.js";
import { parsePagination, paginationMeta } from "../utils/financeHelpers.js";
import { money, noDataWarning, reportMeta, resolveReportPeriod, COMPLETED_SALE_STATUSES, COMPLETED_REPAIR_STATUSES } from "../utils/reportHelpers.js";
import { touchLastReportGenerated } from "./branchReportingSettings.service.js";

export async function getStaffPerformanceReport({ shopId, branchUuid, query }) {
  const branch = await ensureBranch(shopId, branchUuid);
  const financeSettings = await BranchFinanceModel.getFinanceSettings(branch.id, shopId);
  const period = resolveReportPeriod(query, financeSettings.timezone);
  const { page, limit, skip } = parsePagination(query);

  const assignments = await prisma.branchStaffAssignment.findMany({
    where: {
      branchId: branch.id,
      shopId: Number(shopId),
      status: "ACTIVE",
      ...(query.staff_id ? { userId: Number(query.staff_id) } : {}),
    },
    include: {
      user: { select: { id: true, displayName: true, email: true } },
      roleAssignments: { include: { role: { select: { name: true } } } },
    },
    skip,
    take: limit,
  });

  const total = await prisma.branchStaffAssignment.count({
    where: { branchId: branch.id, shopId: Number(shopId), status: "ACTIVE" },
  });

  const records = [];
  for (const assignment of assignments) {
    const userId = assignment.userId;

    const [salesAgg, salesCount, repairsAssigned, repairsCompleted, commissions, performance, shifts] =
      await Promise.all([
        prisma.branchSale.aggregate({
          where: {
            branchId: branch.id,
            shopId: Number(shopId),
            cashierId: userId,
            status: { in: COMPLETED_SALE_STATUSES },
            completedAt: { gte: period.start, lte: period.end },
          },
          _sum: { total: true, discountTotal: true },
        }),
        prisma.branchSale.count({
          where: {
            branchId: branch.id,
            shopId: Number(shopId),
            cashierId: userId,
            status: { in: COMPLETED_SALE_STATUSES },
            completedAt: { gte: period.start, lte: period.end },
          },
        }),
        prisma.branchRepairTicket.count({
          where: {
            branchId: branch.id,
            shopId: Number(shopId),
            assignedTechnicianId: userId,
            createdAt: { gte: period.start, lte: period.end },
          },
        }),
        prisma.branchRepairTicket.count({
          where: {
            branchId: branch.id,
            shopId: Number(shopId),
            assignedTechnicianId: userId,
            status: { in: COMPLETED_REPAIR_STATUSES },
            completedAt: { gte: period.start, lte: period.end },
          },
        }),
        prisma.branchCommission.aggregate({
          where: {
            branchId: branch.id,
            shopId: Number(shopId),
            userId,
            status: { in: ["APPROVED", "PAID"] },
            createdAt: { gte: period.start, lte: period.end },
          },
          _sum: { commissionAmount: true },
        }),
        prisma.branchStaffPerformance.findFirst({
          where: {
            staffAssignmentId: assignment.id,
            periodStart: { lte: period.end },
            periodEnd: { gte: period.start },
          },
          orderBy: { calculatedAt: "desc" },
        }),
        prisma.branchStaffShift.count({
          where: {
            staffAssignmentId: assignment.id,
            shiftDate: { gte: period.start, lte: period.end },
          },
        }),
      ]);

    const salesRevenue = salesAgg._sum.total ?? new Prisma.Decimal(0);
    const avgSale = salesCount > 0 ? money(salesRevenue.div(salesCount)) : null;
    const completionRate =
      repairsAssigned > 0 ? Number(((repairsCompleted / repairsAssigned) * 100).toFixed(2)) : null;

    const monthlyTarget = await prisma.branchTarget.findFirst({
      where: {
        branchId: branch.id,
        shopId: Number(shopId),
        staffId: userId,
        isActive: true,
        periodStart: { lte: period.end },
        periodEnd: { gte: period.start },
      },
      orderBy: { periodStart: "desc" },
    });

    const targetValue = monthlyTarget?.targetValue ?? performance?.targetValue ?? null;
    const achievedValue = performance?.achievedValue ?? salesRevenue;
    const targetPct =
      targetValue && !new Prisma.Decimal(targetValue).isZero()
        ? Number(achievedValue.div(targetValue).mul(100).toFixed(2))
        : null;

    records.push({
      assignment_id: assignment.uuid,
      staff: {
        id: assignment.user.id,
        name: assignment.user.displayName,
        email: assignment.user.email,
      },
      roles: assignment.roleAssignments.map((r) => r.role.name),
      sales_count: salesCount,
      sales_revenue: money(salesRevenue),
      average_sale_value: avgSale,
      discount_amount: money(salesAgg._sum.discountTotal),
      repairs_assigned: repairsAssigned,
      repairs_completed: repairsCompleted,
      repair_completion_rate: completionRate,
      commission_earned: money(commissions._sum.commissionAmount),
      shift_count: shifts,
      scheduled_hours: null,
      worked_hours: null,
      attendance_rate: null,
      target_value: targetValue != null ? money(targetValue) : null,
      target_achieved: money(achievedValue),
      target_achievement_percentage: targetPct,
    });
  }

  const hasData = records.some(
    (r) => r.sales_count > 0 || r.repairs_assigned > 0 || r.shift_count > 0,
  );

  await touchLastReportGenerated(branch.id, shopId);

  return {
    hasData,
    summary: {
      staff_count: records.length,
      total_sales_revenue: money(
        records.reduce((sum, r) => sum.add(new Prisma.Decimal(r.sales_revenue)), new Prisma.Decimal(0)),
      ),
      total_repairs_completed: records.reduce((sum, r) => sum + r.repairs_completed, 0),
    },
    records,
    meta: reportMeta(period, financeSettings.currency, paginationMeta(page, limit, total)),
    warnings: hasData ? [] : noDataWarning(),
    ranking_method: "sales_revenue",
  };
}

export async function getStaffPerformanceRanking({ shopId, branchUuid, query }) {
  const report = await getStaffPerformanceReport({ shopId, branchUuid, query });
  const metric = String(query.metric || "sales_revenue");

  const ranked = [...report.records]
    .filter((r) => {
      if (metric === "sales_revenue") return Number(r.sales_revenue) > 0;
      if (metric === "repairs_completed") return r.repairs_completed > 0;
      return true;
    })
    .sort((a, b) => {
      if (metric === "repairs_completed") return b.repairs_completed - a.repairs_completed;
      return Number(b.sales_revenue) - Number(a.sales_revenue);
    })
    .map((r, index) => ({ rank: index + 1, ...r }));

  return {
    hasData: ranked.length > 0,
    records: ranked,
    ranking_method: metric,
    meta: report.meta,
    warnings: ranked.length === 0 ? noDataWarning() : [],
  };
}
