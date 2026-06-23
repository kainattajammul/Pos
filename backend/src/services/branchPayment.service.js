import { Prisma } from "@prisma/client";
import { prisma } from "../config/database.js";
import { ApiError } from "../utils/ApiError.js";
import { HTTP } from "../constants/httpStatus.js";
import { BranchFinanceModel, BranchPaymentModel } from "../models/branchFinance.model.js";
import { toPublicPayment, toPublicPaymentSettings } from "../mappers/branchFinance.mapper.js";
import { ensureBranch } from "./branchFinanceSettings.service.js";
import { writeAuditLog } from "./auditLog.service.js";
import { getClientMeta } from "../utils/branchHelpers.js";
import {
  generateDocumentNumber,
  normalizePaymentMethod,
  parsePagination,
  paginationMeta,
} from "../utils/financeHelpers.js";
import { toDecimal } from "../utils/inventoryDecimal.js";
import { OPEN_REGISTER_SESSION_STATUSES } from "../constants/financeEnums.js";

const METHOD_SETTING_MAP = {
  CASH: "cashEnabled",
  CARD: "cardEnabled",
  BANK_TRANSFER: "bankTransferEnabled",
  PAYPAL: "paypalEnabled",
  APPLE_PAY: "applePayEnabled",
  GOOGLE_PAY: "googlePayEnabled",
  STORE_CREDIT: "storeCreditEnabled",
  GIFT_CARD: "giftCardEnabled",
};

export async function getPaymentSettings({ shopId, branchUuid }) {
  const branch = await ensureBranch(shopId, branchUuid);
  const settings = await BranchFinanceModel.getPaymentSettings(branch.id, shopId);
  return toPublicPaymentSettings(settings);
}

export async function updatePaymentSettings({ shopId, branchUuid, input, userId, req }) {
  const branch = await ensureBranch(shopId, branchUuid);
  await BranchFinanceModel.getPaymentSettings(branch.id, shopId);

  const fieldMap = {
    cash_enabled: "cashEnabled",
    card_enabled: "cardEnabled",
    bank_transfer_enabled: "bankTransferEnabled",
    paypal_enabled: "paypalEnabled",
    apple_pay_enabled: "applePayEnabled",
    google_pay_enabled: "googlePayEnabled",
    store_credit_enabled: "storeCreditEnabled",
    gift_card_enabled: "giftCardEnabled",
    split_payments_enabled: "splitPaymentsEnabled",
    partial_payments_enabled: "partialPaymentsEnabled",
    deferred_payments_enabled: "deferredPaymentsEnabled",
    repair_deposits_enabled: "repairDepositsEnabled",
    refund_to_original_method: "refundToOriginalMethod",
    manager_approval_for_refunds: "managerApprovalForRefunds",
    manager_approval_for_voids: "managerApprovalForVoids",
    automatic_receipts: "automaticReceipts",
    receipt_required: "receiptRequired",
    require_open_session_for_cash: "requireOpenSessionForCash",
  };

  const data = {};
  for (const [apiKey, dbKey] of Object.entries(fieldMap)) {
    if (input[apiKey] != null) data[dbKey] = Boolean(input[apiKey]);
  }
  if (input.minimum_deposit_percent != null) {
    data.minimumDepositPercent = toDecimal(input.minimum_deposit_percent);
  }
  if (input.maximum_cash_payment !== undefined) {
    data.maximumCashPayment = input.maximum_cash_payment != null ? toDecimal(input.maximum_cash_payment) : null;
  }

  const updated = await prisma.branchPaymentSettings.update({
    where: { branchId: branch.id },
    data,
  });

  await writeAuditLog({
    shopId,
    branchId: branch.id,
    userId,
    action: "branch_payment_settings.updated",
    entity: "branch_payment_settings",
    entityId: String(branch.id),
    newValues: input,
    ...getClientMeta(req),
  });

  return toPublicPaymentSettings(updated);
}

async function validatePaymentMethod(branchId, shopId, method) {
  const settings = await BranchFinanceModel.getPaymentSettings(branchId, shopId);
  const key = METHOD_SETTING_MAP[method];
  if (key && !settings[key]) {
    throw new ApiError(HTTP.BAD_REQUEST, `Payment method ${method.toLowerCase()} is disabled`);
  }
  return settings;
}

export async function createPayment({ shopId, branchUuid, input, userId, req }) {
  const branch = await ensureBranch(shopId, branchUuid);
  const method = normalizePaymentMethod(input.payment_method);
  const settings = await validatePaymentMethod(branch.id, shopId, method);
  const amount = toDecimal(input.amount);
  if (amount.lte(0)) throw new ApiError(HTTP.BAD_REQUEST, "Payment amount must be positive");

  const financeSettings = await BranchFinanceModel.getFinanceSettings(branch.id, shopId);

  let sale = null;
  let invoice = null;
  let repair = null;
  let customerId = null;
  let registerSessionId = null;

  if (input.sale_id) {
    sale = await prisma.branchSale.findFirst({
      where: { uuid: input.sale_id, branchId: branch.id, shopId: Number(shopId) },
    });
    if (!sale) throw new ApiError(HTTP.NOT_FOUND, "Sale not found");
    customerId = sale.customerId;

    const paid = await prisma.branchPayment.aggregate({
      where: { saleId: sale.id, status: { in: ["PAID", "PARTIALLY_REFUNDED"] } },
      _sum: { amount: true },
    });
    const outstanding = sale.total.sub(paid._sum.amount ?? new Prisma.Decimal(0));
    if (amount.gt(outstanding)) throw new ApiError(HTTP.BAD_REQUEST, "Payment exceeds outstanding balance");
  }

  if (input.invoice_id) {
    invoice = await prisma.branchInvoice.findFirst({
      where: { uuid: input.invoice_id, branchId: branch.id, shopId: Number(shopId) },
    });
    if (!invoice) throw new ApiError(HTTP.NOT_FOUND, "Invoice not found");
    if (amount.gt(invoice.amountDue)) throw new ApiError(HTTP.BAD_REQUEST, "Payment exceeds invoice amount due");
    customerId = invoice.customerId;
  }

  if (input.repair_ticket_id) {
    repair = await prisma.branchRepairTicket.findFirst({
      where: { uuid: input.repair_ticket_id, branchId: branch.id, shopId: Number(shopId) },
    });
    if (!repair) throw new ApiError(HTTP.NOT_FOUND, "Repair ticket not found");
    customerId = repair.customerId;
  }

  if (method === "CASH" && settings.requireOpenSessionForCash) {
    const session = input.register_session_id
      ? await prisma.branchRegisterSession.findFirst({
          where: {
            uuid: input.register_session_id,
            branchId: branch.id,
            status: { in: OPEN_REGISTER_SESSION_STATUSES },
          },
        })
      : await prisma.branchRegisterSession.findFirst({
          where: { branchId: branch.id, status: { in: OPEN_REGISTER_SESSION_STATUSES } },
        });
    if (!session) throw new ApiError(HTTP.CONFLICT, "Open register session required for cash payments");
    registerSessionId = session.id;
  }

  if (settings.maximumCashPayment && method === "CASH" && amount.gt(settings.maximumCashPayment)) {
    throw new ApiError(HTTP.BAD_REQUEST, "Cash payment exceeds maximum allowed");
  }

  const payment = await prisma.$transaction(async (tx) => {
    if (input.idempotency_key) {
      const existing = await tx.branchPayment.findUnique({ where: { idempotencyKey: input.idempotency_key } });
      if (existing) return existing;
    }

    const prefix = `PAY-${branch.branchCode}-${new Date().getFullYear()}-`;
    const paymentNumber = await generateDocumentNumber(tx, tx.branchPayment, "paymentNumber", prefix);

    const created = await tx.branchPayment.create({
      data: {
        paymentNumber,
        shopId: Number(shopId),
        branchId: branch.id,
        registerSessionId,
        saleId: sale?.id ?? null,
        repairTicketId: repair?.id ?? null,
        invoiceId: invoice?.id ?? null,
        customerId,
        paymentMethod: method,
        status: "PAID",
        amount,
        currency: input.currency?.toUpperCase() ?? financeSettings.currency,
        provider: input.provider ?? null,
        providerReference: input.provider_reference ?? null,
        transactionReference: input.transaction_reference ?? null,
        metadata: input.metadata ?? null,
        idempotencyKey: input.idempotency_key ?? null,
        receivedById: userId ?? null,
        paidAt: new Date(),
      },
      include: { customer: true, sale: true, invoice: true },
    });

    if (method === "CASH" && registerSessionId) {
      await tx.branchCashMovement.create({
        data: {
          shopId: Number(shopId),
          branchId: branch.id,
          registerSessionId,
          movementType: "CASH_SALE",
          amount,
          paymentId: created.id,
          performedById: userId ?? null,
        },
      });
    }

    if (sale) {
      const paidAgg = await tx.branchPayment.aggregate({
        where: { saleId: sale.id, status: { in: ["PAID", "PARTIALLY_REFUNDED"] } },
        _sum: { amount: true },
      });
      const totalPaid = paidAgg._sum.amount ?? new Prisma.Decimal(0);
      const paymentStatus = totalPaid.gte(sale.total) ? "PAID" : "PARTIALLY_PAID";
      await tx.branchSale.update({
        where: { id: sale.id },
        data: { paymentStatus, status: paymentStatus === "PAID" ? "COMPLETED" : sale.status, completedAt: paymentStatus === "PAID" ? new Date() : sale.completedAt },
      });
    }

    if (invoice) {
      const newPaid = invoice.amountPaid.add(amount);
      const newDue = invoice.total.sub(newPaid);
      let status = invoice.status;
      if (newDue.lte(0)) status = "PAID";
      else if (newPaid.gt(0)) status = "PARTIALLY_PAID";
      await tx.branchInvoice.update({
        where: { id: invoice.id },
        data: { amountPaid: newPaid, amountDue: newDue.lt(0) ? new Prisma.Decimal(0) : newDue, status, paidAt: newDue.lte(0) ? new Date() : null },
      });
    }

    return created;
  });

  await writeAuditLog({
    shopId,
    branchId: branch.id,
    userId,
    action: "branch_payments.created",
    entity: "branch_payment",
    entityId: payment.uuid,
    newValues: input,
    ...getClientMeta(req),
  });

  const full = await BranchPaymentModel.findByUuid(payment.uuid, branch.id, shopId);
  return toPublicPayment(full);
}

export async function listPayments({ shopId, branchUuid, query }) {
  const branch = await ensureBranch(shopId, branchUuid);
  const { page, limit, skip, direction } = parsePagination(query);
  const where = { shopId: Number(shopId), branchId: branch.id };
  if (query.status) where.status = String(query.status).toUpperCase();
  if (query.payment_method) where.paymentMethod = normalizePaymentMethod(query.payment_method);
  if (query.from || query.to) {
    where.paidAt = {};
    if (query.from) where.paidAt.gte = new Date(query.from);
    if (query.to) where.paidAt.lte = new Date(query.to);
  }

  const [rows, total] = await prisma.$transaction([
    BranchPaymentModel.list(where, { skip, take: limit, orderBy: { paidAt: direction } }),
    BranchPaymentModel.count(where),
  ]);

  return { data: rows.map(toPublicPayment), meta: paginationMeta(page, limit, total) };
}

export async function voidPayment({ shopId, branchUuid, paymentUuid, input, userId, req }) {
  const branch = await ensureBranch(shopId, branchUuid);
  const payment = await BranchPaymentModel.findByUuid(paymentUuid, branch.id, shopId);
  if (!payment) throw new ApiError(HTTP.NOT_FOUND, "Payment not found");
  if (payment.status === "VOIDED") throw new ApiError(HTTP.CONFLICT, "Payment already voided");

  const updated = await prisma.branchPayment.update({
    where: { id: payment.id },
    data: { status: "VOIDED", failureReason: input.reason ?? null },
    include: { customer: true, sale: true, invoice: true },
  });

  await writeAuditLog({
    shopId,
    branchId: branch.id,
    userId,
    action: "branch_payments.voided",
    entity: "branch_payment",
    entityId: payment.uuid,
    newValues: input,
    ...getClientMeta(req),
  });

  return toPublicPayment(updated);
}
