import { Prisma } from "@prisma/client";
import { prisma } from "../config/database.js";
import { ApiError } from "../utils/ApiError.js";
import { HTTP } from "../constants/httpStatus.js";
import { BranchFinanceModel, BranchRefundModel } from "../models/branchFinance.model.js";
import { toPublicRefund } from "../mappers/branchFinance.mapper.js";
import { ensureBranch } from "./branchFinanceSettings.service.js";
import { writeAuditLog } from "./auditLog.service.js";
import { getClientMeta } from "../utils/branchHelpers.js";
import {
  generateDocumentNumber,
  getRefundableBalance,
  normalizePaymentMethod,
  parsePagination,
  paginationMeta,
} from "../utils/financeHelpers.js";
import { toDecimal } from "../utils/inventoryDecimal.js";
import { OPEN_REGISTER_SESSION_STATUSES } from "../constants/financeEnums.js";

export async function createRefund({ shopId, branchUuid, input, userId, req }) {
  const branch = await ensureBranch(shopId, branchUuid);
  const payment = await prisma.branchPayment.findFirst({
    where: { uuid: input.payment_id, branchId: branch.id, shopId: Number(shopId) },
  });
  if (!payment) throw new ApiError(HTTP.NOT_FOUND, "Payment not found");
  if (!["PAID", "PARTIALLY_REFUNDED"].includes(payment.status)) {
    throw new ApiError(HTTP.BAD_REQUEST, "Payment is not refundable");
  }

  const amount = toDecimal(input.amount);
  const refundable = await getRefundableBalance(payment.id);
  if (amount.gt(refundable)) throw new ApiError(HTTP.BAD_REQUEST, "Refund exceeds refundable balance");

  const settings = await BranchFinanceModel.getPaymentSettings(branch.id, shopId);
  const method = normalizePaymentMethod(input.refund_method ?? payment.paymentMethod);
  const needsApproval = settings.managerApprovalForRefunds;
  const status = needsApproval ? "PENDING_APPROVAL" : "APPROVED";

  const refund = await prisma.$transaction(async (tx) => {
    const prefix = `REF-${branch.branchCode}-${new Date().getFullYear()}-`;
    const refundNumber = await generateDocumentNumber(tx, tx.branchRefund, "refundNumber", prefix);

    return tx.branchRefund.create({
      data: {
        refundNumber,
        shopId: Number(shopId),
        branchId: branch.id,
        paymentId: payment.id,
        saleId: payment.saleId,
        repairTicketId: payment.repairTicketId,
        invoiceId: payment.invoiceId,
        customerId: payment.customerId,
        refundMethod: method,
        status,
        amount,
        currency: payment.currency,
        reason: input.reason ?? null,
        requestedById: userId ?? null,
        approvedById: needsApproval ? null : userId ?? null,
        approvedAt: needsApproval ? null : new Date(),
      },
      include: { payment: true },
    });
  });

  await writeAuditLog({
    shopId,
    branchId: branch.id,
    userId,
    action: "branch_refunds.requested",
    entity: "branch_refund",
    entityId: refund.uuid,
    newValues: input,
    ...getClientMeta(req),
  });

  return toPublicRefund(refund);
}

export async function approveRefund({ shopId, branchUuid, refundUuid, userId, req }) {
  const branch = await ensureBranch(shopId, branchUuid);
  const refund = await BranchRefundModel.findByUuid(refundUuid, branch.id, shopId);
  if (!refund) throw new ApiError(HTTP.NOT_FOUND, "Refund not found");
  if (!["REQUESTED", "PENDING_APPROVAL"].includes(refund.status)) {
    throw new ApiError(HTTP.CONFLICT, "Refund cannot be approved");
  }

  const updated = await prisma.branchRefund.update({
    where: { id: refund.id },
    data: { status: "APPROVED", approvedById: userId ?? null, approvedAt: new Date() },
    include: { payment: true },
  });

  await writeAuditLog({
    shopId,
    branchId: branch.id,
    userId,
    action: "branch_refunds.approved",
    entity: "branch_refund",
    entityId: refund.uuid,
    ...getClientMeta(req),
  });

  return toPublicRefund(updated);
}

export async function rejectRefund({ shopId, branchUuid, refundUuid, input, userId, req }) {
  const branch = await ensureBranch(shopId, branchUuid);
  const refund = await BranchRefundModel.findByUuid(refundUuid, branch.id, shopId);
  if (!refund) throw new ApiError(HTTP.NOT_FOUND, "Refund not found");

  const updated = await prisma.branchRefund.update({
    where: { id: refund.id },
    data: {
      status: "REJECTED",
      rejectionReason: input.reason ?? null,
      approvedById: userId ?? null,
    },
    include: { payment: true },
  });

  await writeAuditLog({
    shopId,
    branchId: branch.id,
    userId,
    action: "branch_refunds.rejected",
    entity: "branch_refund",
    entityId: refund.uuid,
    newValues: input,
    ...getClientMeta(req),
  });

  return toPublicRefund(updated);
}

export async function processRefund({ shopId, branchUuid, refundUuid, input, userId, req }) {
  const branch = await ensureBranch(shopId, branchUuid);
  const refund = await BranchRefundModel.findByUuid(refundUuid, branch.id, shopId);
  if (!refund) throw new ApiError(HTTP.NOT_FOUND, "Refund not found");
  if (!["APPROVED", "PROCESSING"].includes(refund.status)) {
    throw new ApiError(HTTP.CONFLICT, "Refund must be approved before processing");
  }

  const refundable = await getRefundableBalance(refund.paymentId);
  if (refund.amount.gt(refundable)) throw new ApiError(HTTP.BAD_REQUEST, "Refund exceeds refundable balance");

  const processed = await prisma.$transaction(async (tx) => {
    const updated = await tx.branchRefund.update({
      where: { id: refund.id },
      data: {
        status: "COMPLETED",
        processedById: userId ?? null,
        processedAt: new Date(),
        providerReference: input.provider_reference ?? null,
      },
      include: { payment: true },
    });

    const payment = await tx.branchPayment.findUnique({ where: { id: refund.paymentId } });
    const totalRefunded = await tx.branchRefund.aggregate({
      where: { paymentId: payment.id, status: { in: ["COMPLETED", "PARTIALLY_COMPLETED"] } },
      _sum: { amount: true },
    });
    const refundedTotal = totalRefunded._sum.amount ?? new Prisma.Decimal(0);
    const newStatus = refundedTotal.gte(payment.amount) ? "REFUNDED" : "PARTIALLY_REFUNDED";
    await tx.branchPayment.update({ where: { id: payment.id }, data: { status: newStatus } });

    if (refund.refundMethod === "CASH") {
      const session = await tx.branchRegisterSession.findFirst({
        where: { branchId: branch.id, status: { in: OPEN_REGISTER_SESSION_STATUSES } },
      });
      if (!session) throw new ApiError(HTTP.CONFLICT, "Open register session required for cash refund");
      await tx.branchCashMovement.create({
        data: {
          shopId: Number(shopId),
          branchId: branch.id,
          registerSessionId: session.id,
          movementType: "CASH_REFUND",
          amount: refund.amount,
          refundId: refund.id,
          performedById: userId ?? null,
        },
      });
    }

    if (payment.saleId) {
      await tx.branchSale.update({
        where: { id: payment.saleId },
        data: { status: newStatus === "REFUNDED" ? "REFUNDED" : "PARTIALLY_REFUNDED", paymentStatus: newStatus },
      });
    }

    return updated;
  });

  await writeAuditLog({
    shopId,
    branchId: branch.id,
    userId,
    action: "branch_refunds.processed",
    entity: "branch_refund",
    entityId: refund.uuid,
    ...getClientMeta(req),
  });

  return toPublicRefund(processed);
}

export async function listRefunds({ shopId, branchUuid, query }) {
  const branch = await ensureBranch(shopId, branchUuid);
  const { page, limit, skip, direction } = parsePagination(query);
  const where = { shopId: Number(shopId), branchId: branch.id };
  if (query.status) where.status = String(query.status).toUpperCase();

  const [rows, total] = await prisma.$transaction([
    BranchRefundModel.list(where, { skip, take: limit, orderBy: { requestedAt: direction } }),
    BranchRefundModel.count(where),
  ]);

  return { data: rows.map(toPublicRefund), meta: paginationMeta(page, limit, total) };
}
