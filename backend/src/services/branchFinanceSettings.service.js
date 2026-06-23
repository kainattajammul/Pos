import { Prisma } from "@prisma/client";
import { prisma } from "../config/database.js";
import { ApiError } from "../utils/ApiError.js";
import { HTTP } from "../constants/httpStatus.js";
import { BranchFinanceModel } from "../models/branchFinance.model.js";
import { toPublicFinanceSettings } from "../mappers/branchFinance.mapper.js";
import { writeAuditLog } from "./auditLog.service.js";
import { getClientMeta, isValidIanaTimezone } from "../utils/branchHelpers.js";
import {
  COMPLETED_PAYMENT_STATUSES,
  COMPLETED_REFUND_STATUSES,
  OPEN_INVOICE_STATUSES,
  OPEN_REGISTER_SESSION_STATUSES,
} from "../constants/financeEnums.js";
import { startOfBusinessDay } from "../utils/financeHelpers.js";
import { isValidCurrency } from "../utils/financeHelpers.js";
import { toDecimal } from "../utils/inventoryDecimal.js";

export async function ensureBranch(shopId, branchUuid) {
  const branch = await BranchFinanceModel.ensureBranch(shopId, branchUuid);
  if (!branch) throw new ApiError(HTTP.NOT_FOUND, "Branch not found");
  return branch;
}

async function computeFinanceStats(branchId, shopId, timezone) {
  const dayStart = startOfBusinessDay(timezone);
  const dayEnd = new Date(dayStart.getTime() + 24 * 60 * 60 * 1000);

  const [paymentsAgg, refundsAgg, openInvoices, openSession] = await Promise.all([
    prisma.branchPayment.aggregate({
      where: {
        branchId,
        shopId,
        status: { in: COMPLETED_PAYMENT_STATUSES },
        paidAt: { gte: dayStart, lt: dayEnd },
      },
      _sum: { amount: true },
    }),
    prisma.branchRefund.aggregate({
      where: {
        branchId,
        shopId,
        status: { in: COMPLETED_REFUND_STATUSES },
        processedAt: { gte: dayStart, lt: dayEnd },
      },
      _sum: { amount: true },
    }),
    prisma.branchInvoice.count({
      where: {
        branchId,
        shopId,
        status: { in: OPEN_INVOICE_STATUSES },
      },
    }),
    prisma.branchRegisterSession.findFirst({
      where: {
        branchId,
        shopId,
        status: { in: OPEN_REGISTER_SESSION_STATUSES },
      },
    }),
  ]);

  return {
    paymentsToday: paymentsAgg._sum.amount ?? new Prisma.Decimal(0),
    refundsToday: refundsAgg._sum.amount ?? new Prisma.Decimal(0),
    openInvoices,
    cashDrawerAssigned: Boolean(openSession),
  };
}

export async function getFinanceSettings({ shopId, branchUuid }) {
  const branch = await ensureBranch(shopId, branchUuid);
  const settings = await BranchFinanceModel.getFinanceSettings(branch.id, shopId);
  const stats = await computeFinanceStats(branch.id, Number(shopId), settings.timezone);
  const register = settings.defaultRegister;
  return toPublicFinanceSettings(settings, stats, register);
}

export async function updateFinanceSettings({ shopId, branchUuid, input, userId, req }) {
  const branch = await ensureBranch(shopId, branchUuid);
  await BranchFinanceModel.getFinanceSettings(branch.id, shopId);

  const data = {};
  if (input.vat_rate != null) {
    const rate = toDecimal(String(input.vat_rate).replace("%", ""));
    data.vatRate = rate;
    data.vatRateLabel = String(input.vat_rate).includes("%") ? String(input.vat_rate) : `${input.vat_rate}%`;
  }
  if (input.currency != null) {
    const currency = String(input.currency).toUpperCase();
    if (!isValidCurrency(currency)) throw new ApiError(HTTP.BAD_REQUEST, "Invalid currency code");
    data.currency = currency;
  }
  if (input.timezone != null) {
    if (!isValidIanaTimezone(input.timezone)) throw new ApiError(HTTP.BAD_REQUEST, "Invalid timezone");
    data.timezone = input.timezone;
  }
  if (input.end_of_day_required != null) data.endOfDayRequired = Boolean(input.end_of_day_required);

  if (input.register_id != null || input.register_uuid != null) {
    let register = null;
    if (input.register_uuid) {
      register = await prisma.branchRegister.findFirst({
        where: { uuid: input.register_uuid, branchId: branch.id, shopId: Number(shopId), archivedAt: null },
      });
    } else if (input.register_id) {
      register = await prisma.branchRegister.findFirst({
        where: {
          registerCode: String(input.register_id),
          branchId: branch.id,
          shopId: Number(shopId),
          archivedAt: null,
        },
      });
    }
    if (input.register_id && !register && String(input.register_id).trim()) {
      throw new ApiError(HTTP.NOT_FOUND, "Register not found");
    }
    data.defaultRegisterId = register?.id ?? null;
  }

  const updated = await prisma.branchFinanceSettings.update({
    where: { branchId: branch.id },
    data,
    include: { defaultRegister: true },
  });

  await writeAuditLog({
    shopId,
    branchId: branch.id,
    userId,
    action: "branch_finance.settings.updated",
    entity: "branch_finance_settings",
    entityId: String(branch.id),
    newValues: input,
    ...getClientMeta(req),
  });

  const stats = await computeFinanceStats(branch.id, Number(shopId), updated.timezone);
  return toPublicFinanceSettings(updated, stats, updated.defaultRegister);
}

export { computeFinanceStats };
