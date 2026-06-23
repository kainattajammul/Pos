import { Prisma } from "@prisma/client";
import { prisma } from "../config/database.js";
import { ApiError } from "../utils/ApiError.js";
import { HTTP } from "../constants/httpStatus.js";
import { BranchFinanceModel } from "../models/branchFinance.model.js";
import { ensureBranch } from "./branchFinanceSettings.service.js";
import { writeAuditLog } from "./auditLog.service.js";
import { getClientMeta } from "../utils/branchHelpers.js";
import { startOfBusinessDay } from "../utils/financeHelpers.js";
import { decimalToString } from "../utils/inventoryDecimal.js";
import { COMPLETED_PAYMENT_STATUSES, COMPLETED_REFUND_STATUSES, PNL_EXPENSE_STATUSES } from "../constants/financeEnums.js";

export async function generateEndOfDay({ shopId, branchUuid, input, userId, req }) {
  const branch = await ensureBranch(shopId, branchUuid);
  const financeSettings = await BranchFinanceModel.getFinanceSettings(branch.id, shopId);
  const businessDate = input.business_date
    ? new Date(input.business_date)
    : startOfBusinessDay(financeSettings.timezone);
  const dayEnd = new Date(businessDate.getTime() + 24 * 60 * 60 * 1000);

  const existing = await prisma.branchEndOfDayClosing.findUnique({
    where: { branchId_businessDate: { branchId: branch.id, businessDate } },
  });
  if (existing && !["DRAFT", "REOPENED"].includes(existing.status)) {
    throw new ApiError(HTTP.CONFLICT, "End of day already generated for this date");
  }

  const [openingFloats, cashSales, cardSales, otherPayments, refunds, discounts, vatTotal, repairPayments, expenses, cashIn, cashOut, safeDrops, pettyCash] =
    await Promise.all([
      prisma.branchRegisterSession.aggregate({
        where: { branchId: branch.id, openedAt: { gte: businessDate, lt: dayEnd } },
        _sum: { openingFloat: true },
      }),
      prisma.branchPayment.aggregate({
        where: {
          branchId: branch.id,
          paymentMethod: "CASH",
          status: { in: COMPLETED_PAYMENT_STATUSES },
          paidAt: { gte: businessDate, lt: dayEnd },
        },
        _sum: { amount: true },
      }),
      prisma.branchPayment.aggregate({
        where: {
          branchId: branch.id,
          paymentMethod: "CARD",
          status: { in: COMPLETED_PAYMENT_STATUSES },
          paidAt: { gte: businessDate, lt: dayEnd },
        },
        _sum: { amount: true },
      }),
      prisma.branchPayment.aggregate({
        where: {
          branchId: branch.id,
          paymentMethod: { notIn: ["CASH", "CARD"] },
          status: { in: COMPLETED_PAYMENT_STATUSES },
          paidAt: { gte: businessDate, lt: dayEnd },
        },
        _sum: { amount: true },
      }),
      prisma.branchRefund.aggregate({
        where: {
          branchId: branch.id,
          status: { in: COMPLETED_REFUND_STATUSES },
          processedAt: { gte: businessDate, lt: dayEnd },
        },
        _sum: { amount: true },
      }),
      prisma.branchSale.aggregate({
        where: { branchId: branch.id, completedAt: { gte: businessDate, lt: dayEnd } },
        _sum: { discountTotal: true },
      }),
      prisma.branchSale.aggregate({
        where: { branchId: branch.id, completedAt: { gte: businessDate, lt: dayEnd } },
        _sum: { taxTotal: true },
      }),
      prisma.branchPayment.aggregate({
        where: {
          branchId: branch.id,
          repairTicketId: { not: null },
          status: { in: COMPLETED_PAYMENT_STATUSES },
          paidAt: { gte: businessDate, lt: dayEnd },
        },
        _sum: { amount: true },
      }),
      prisma.branchExpense.aggregate({
        where: {
          branchId: branch.id,
          status: { in: PNL_EXPENSE_STATUSES },
          expenseDate: businessDate,
        },
        _sum: { total: true },
      }),
      prisma.branchCashMovement.aggregate({
        where: { branchId: branch.id, movementType: "CASH_IN", createdAt: { gte: businessDate, lt: dayEnd } },
        _sum: { amount: true },
      }),
      prisma.branchCashMovement.aggregate({
        where: { branchId: branch.id, movementType: "CASH_OUT", createdAt: { gte: businessDate, lt: dayEnd } },
        _sum: { amount: true },
      }),
      prisma.branchCashMovement.aggregate({
        where: { branchId: branch.id, movementType: "SAFE_DROP", createdAt: { gte: businessDate, lt: dayEnd } },
        _sum: { amount: true },
      }),
      prisma.branchCashMovement.aggregate({
        where: { branchId: branch.id, movementType: "PETTY_CASH", createdAt: { gte: businessDate, lt: dayEnd } },
        _sum: { amount: true },
      }),
    ]);

  const opening = openingFloats._sum.openingFloat ?? new Prisma.Decimal(0);
  const cash = cashSales._sum.amount ?? new Prisma.Decimal(0);
  const cashDeposits = new Prisma.Decimal(0);
  const refundTotal = refunds._sum.amount ?? new Prisma.Decimal(0);
  const cashInTotal = cashIn._sum.amount ?? new Prisma.Decimal(0);
  const cashOutTotal = cashOut._sum.amount ?? new Prisma.Decimal(0);
  const safeDropTotal = safeDrops._sum.amount ?? new Prisma.Decimal(0);
  const pettyCashTotal = pettyCash._sum.amount ?? new Prisma.Decimal(0);

  const expectedCash = opening
    .add(cash)
    .add(cashDeposits)
    .add(cashInTotal)
    .sub(refundTotal)
    .sub(safeDropTotal)
    .sub(pettyCashTotal)
    .sub(cashOutTotal);

  const data = {
    shopId: Number(shopId),
    branchId: branch.id,
    businessDate,
    timezone: financeSettings.timezone,
    openingFloats: opening,
    cashSales: cash,
    cardSales: cardSales._sum.amount ?? new Prisma.Decimal(0),
    otherPayments: otherPayments._sum.amount ?? new Prisma.Decimal(0),
    cashDeposits,
    refunds: refundTotal,
    discounts: discounts._sum.discountTotal ?? new Prisma.Decimal(0),
    vatTotal: vatTotal._sum.taxTotal ?? new Prisma.Decimal(0),
    repairPayments: repairPayments._sum.amount ?? new Prisma.Decimal(0),
    expenses: expenses._sum.total ?? new Prisma.Decimal(0),
    cashIn: cashInTotal,
    cashOut: cashOutTotal,
    safeDrops: safeDropTotal,
    pettyCash: pettyCashTotal,
    expectedCash,
    generatedById: userId ?? null,
    status: "DRAFT",
  };

  const closing = existing
    ? await prisma.branchEndOfDayClosing.update({ where: { id: existing.id }, data })
    : await prisma.branchEndOfDayClosing.create({ data });

  await writeAuditLog({
    shopId,
    branchId: branch.id,
    userId,
    action: "branch_end_of_day.generated",
    entity: "branch_end_of_day_closing",
    entityId: closing.uuid,
    newValues: { business_date: businessDate.toISOString().slice(0, 10) },
    ...getClientMeta(req),
  });

  return formatClosing(closing);
}

function formatClosing(c) {
  return {
    id: c.uuid,
    business_date: c.businessDate.toISOString().slice(0, 10),
    status: c.status.toLowerCase(),
    expected_cash: decimalToString(c.expectedCash, 2),
    counted_cash: decimalToString(c.countedCash, 2),
    cash_difference: decimalToString(c.cashDifference, 2),
    cash_sales: decimalToString(c.cashSales, 2),
    card_sales: decimalToString(c.cardSales, 2),
    refunds: decimalToString(c.refunds, 2),
    expenses: decimalToString(c.expenses, 2),
  };
}

export async function closeEndOfDay({ shopId, branchUuid, closingUuid, input, userId, req }) {
  const branch = await ensureBranch(shopId, branchUuid);
  const closing = await prisma.branchEndOfDayClosing.findFirst({
    where: { uuid: closingUuid, branchId: branch.id, shopId: Number(shopId) },
  });
  if (!closing) throw new ApiError(HTTP.NOT_FOUND, "End of day closing not found");

  const countedCash = input.counted_cash != null ? new Prisma.Decimal(String(input.counted_cash)) : closing.countedCash;
  const cashDifference = countedCash != null ? countedCash.sub(closing.expectedCash) : null;

  const updated = await prisma.branchEndOfDayClosing.update({
    where: { id: closing.id },
    data: {
      status: "CLOSED",
      countedCash,
      cashDifference,
      discrepancyReason: input.discrepancy_reason ?? null,
      closedById: userId ?? null,
      closedAt: new Date(),
    },
  });

  await writeAuditLog({
    shopId,
    branchId: branch.id,
    userId,
    action: "branch_end_of_day.closed",
    entity: "branch_end_of_day_closing",
    entityId: closing.uuid,
    newValues: input,
    ...getClientMeta(req),
  });

  return formatClosing(updated);
}

export async function listEndOfDay({ shopId, branchUuid, query }) {
  const branch = await ensureBranch(shopId, branchUuid);
  const rows = await prisma.branchEndOfDayClosing.findMany({
    where: { branchId: branch.id, shopId: Number(shopId) },
    orderBy: { businessDate: "desc" },
    take: Number(query.limit) || 20,
    skip: ((Number(query.page) || 1) - 1) * (Number(query.limit) || 20),
  });
  return { data: rows.map(formatClosing) };
}
