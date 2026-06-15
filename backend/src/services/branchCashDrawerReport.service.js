import { Prisma } from "@prisma/client";
import { prisma } from "../config/database.js";
import { BranchFinanceModel } from "../models/branchFinance.model.js";
import { ensureBranch } from "./branchReportingSettings.service.js";
import { parsePagination, paginationMeta } from "../utils/financeHelpers.js";
import { money, noDataWarning, reportMeta, resolveReportPeriod } from "../utils/reportHelpers.js";
import { touchLastReportGenerated } from "./branchReportingSettings.service.js";

const CASH_MOVEMENT_TYPES = ["CASH_SALE", "CASH_REFUND", "CASH_IN", "CASH_OUT", "SAFE_DROP", "PETTY_CASH", "OPENING_FLOAT"];

export async function getCashDrawerReport({ shopId, branchUuid, query }) {
  const branch = await ensureBranch(shopId, branchUuid);
  const financeSettings = await BranchFinanceModel.getFinanceSettings(branch.id, shopId);
  const period = resolveReportPeriod(query, financeSettings.timezone);
  const { page, limit, skip, direction } = parsePagination(query);

  const sessionWhere = {
    shopId: Number(shopId),
    branchId: branch.id,
    openedAt: { gte: period.start, lte: period.end },
  };

  if (query.register_id) sessionWhere.registerId = Number(query.register_id);
  if (query.discrepancy_only === "true") sessionWhere.cashDifference = { not: 0 };
  if (query.forced_closure_only === "true") sessionWhere.status = "FORCED_CLOSED";

  const [sessions, total, openSessions, agg] = await Promise.all([
    prisma.branchRegisterSession.findMany({
      where: sessionWhere,
      skip,
      take: limit,
      orderBy: { openedAt: direction },
      include: {
        register: { select: { name: true, registerCode: true } },
      },
    }),
    prisma.branchRegisterSession.count({ where: sessionWhere }),
    prisma.branchRegisterSession.count({
      where: { branchId: branch.id, shopId: Number(shopId), status: { in: ["OPEN", "SUSPENDED", "PENDING_CLOSE"] } },
    }),
    prisma.branchRegisterSession.aggregate({
      where: sessionWhere,
      _sum: { openingFloat: true, expectedCash: true, countedCash: true, cashDifference: true },
      _count: true,
    }),
  ]);

  const movements = await prisma.branchCashMovement.groupBy({
    by: ["movementType"],
    where: {
      branchId: branch.id,
      shopId: Number(shopId),
      createdAt: { gte: period.start, lte: period.end },
      movementType: { in: CASH_MOVEMENT_TYPES },
    },
    _sum: { amount: true },
  });

  const cashSales = movements.find((m) => m.movementType === "CASH_SALE")?._sum.amount ?? new Prisma.Decimal(0);
  const cashRefunds = movements.find((m) => m.movementType === "CASH_REFUND")?._sum.amount ?? new Prisma.Decimal(0);
  const cashIn = movements.find((m) => m.movementType === "CASH_IN")?._sum.amount ?? new Prisma.Decimal(0);
  const cashOut = movements.find((m) => m.movementType === "CASH_OUT")?._sum.amount ?? new Prisma.Decimal(0);
  const safeDrops = movements.find((m) => m.movementType === "SAFE_DROP")?._sum.amount ?? new Prisma.Decimal(0);

  const discrepancySessions = await prisma.branchRegisterSession.count({
    where: { ...sessionWhere, cashDifference: { not: 0 } },
  });

  const hasData = total > 0;
  const summary = {
    registerSessionsOpened: agg._count,
    registersStillOpen: openSessions,
    openingFloat: money(agg._sum.openingFloat),
    cashSales: money(cashSales),
    cashRefunds: money(cashRefunds),
    cashIn: money(cashIn),
    cashOut: money(cashOut),
    safeDrops: money(safeDrops),
    expectedCash: money(agg._sum.expectedCash),
    countedCash: money(agg._sum.countedCash),
    cashDifference: money(agg._sum.cashDifference),
    sessionsWithDiscrepancies: discrepancySessions,
  };

  const staffIds = [...new Set(sessions.map((s) => s.assignedStaffId).filter(Boolean))];
  const staffUsers = staffIds.length
    ? await prisma.user.findMany({ where: { id: { in: staffIds } }, select: { id: true, displayName: true } })
    : [];
  const staffMap = new Map(staffUsers.map((u) => [u.id, u.displayName]));

  await touchLastReportGenerated(branch.id, shopId);

  return {
    hasData,
    summary,
    records: sessions.map((s) => ({
      id: s.uuid,
      register: s.register ? { code: s.register.registerCode, name: s.register.name } : null,
      staff: s.assignedStaffId ? { id: s.assignedStaffId, name: staffMap.get(s.assignedStaffId) ?? null } : null,
      status: s.status.toLowerCase(),
      opening_float: money(s.openingFloat),
      expected_cash: money(s.expectedCash),
      counted_cash: money(s.countedCash),
      cash_difference: money(s.cashDifference),
      opened_at: s.openedAt.toISOString(),
      closed_at: s.closedAt?.toISOString() ?? null,
    })),
    meta: reportMeta(period, financeSettings.currency, paginationMeta(page, limit, total)),
    warnings: hasData ? [] : noDataWarning(),
  };
}

export async function getCashDrawerDiscrepancies({ shopId, branchUuid, query }) {
  return getCashDrawerReport({
    shopId,
    branchUuid,
    query: { ...query, discrepancy_only: "true" },
  });
}

export async function getEndOfDayReport({ shopId, branchUuid, query }) {
  const branch = await ensureBranch(shopId, branchUuid);
  const financeSettings = await BranchFinanceModel.getFinanceSettings(branch.id, shopId);
  const period = resolveReportPeriod(query, financeSettings.timezone);

  const closings = await prisma.branchEndOfDayClosing.findMany({
    where: {
      branchId: branch.id,
      shopId: Number(shopId),
      businessDate: { gte: period.start, lte: period.end },
    },
    orderBy: { businessDate: "desc" },
    take: Number(query.limit) || 31,
  });

  return {
    hasData: closings.length > 0,
    records: closings.map((c) => ({
      id: c.uuid,
      business_date: c.businessDate.toISOString().slice(0, 10),
      status: c.status.toLowerCase(),
      cash_sales: money(c.cashSales),
      card_sales: money(c.cardSales),
      refunds: money(c.refunds),
      expected_cash: money(c.expectedCash),
      counted_cash: money(c.countedCash),
      cash_difference: money(c.cashDifference),
    })),
    meta: reportMeta(period, financeSettings.currency),
    warnings: closings.length === 0 ? noDataWarning() : [],
  };
}
