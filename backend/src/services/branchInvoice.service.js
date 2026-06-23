import { Prisma } from "@prisma/client";
import { prisma } from "../config/database.js";
import { ApiError } from "../utils/ApiError.js";
import { HTTP } from "../constants/httpStatus.js";
import { BranchFinanceModel, BranchInvoiceModel } from "../models/branchFinance.model.js";
import { toPublicInvoice } from "../mappers/branchFinance.mapper.js";
import { ensureBranch } from "./branchFinanceSettings.service.js";
import { writeAuditLog } from "./auditLog.service.js";
import { getClientMeta } from "../utils/branchHelpers.js";
import {
  calculateInvoiceTotals,
  calculateLineTotals,
  generateDocumentNumber,
  parsePagination,
  paginationMeta,
} from "../utils/financeHelpers.js";
import { toDecimal } from "../utils/inventoryDecimal.js";

export async function createInvoice({ shopId, branchUuid, input, userId, req }) {
  const branch = await ensureBranch(shopId, branchUuid);
  const financeSettings = await BranchFinanceModel.getFinanceSettings(branch.id, shopId);
  const taxProfile = await BranchFinanceModel.getTaxProfile(branch.id, shopId);

  const lineInputs = input.line_items ?? [];
  if (lineInputs.length === 0) throw new ApiError(HTTP.BAD_REQUEST, "Invoice requires line items");

  const lineItems = lineInputs.map((item) => {
    const taxRate = item.tax_rate ?? taxProfile.defaultTaxRate;
    const totals = calculateLineTotals({
      quantity: item.quantity,
      unitPrice: item.unit_price,
      discountAmount: item.discount_amount ?? 0,
      taxRate,
    });
    return {
      itemType: item.item_type ?? "service",
      name: item.name,
      description: item.description ?? null,
      quantity: toDecimal(item.quantity),
      unitPrice: toDecimal(item.unit_price),
      discountAmount: toDecimal(item.discount_amount ?? 0),
      taxAmount: totals.taxAmount,
      lineTotal: totals.lineTotal,
    };
  });

  const totals = calculateInvoiceTotals(lineItems);

  let customerId = null;
  if (input.customer_id) {
    const customer = await prisma.customer.findFirst({
      where: { uuid: input.customer_id, shopId: Number(shopId) },
    });
    if (!customer) throw new ApiError(HTTP.NOT_FOUND, "Customer not found");
    customerId = customer.id;
  }

  const invoice = await prisma.$transaction(async (tx) => {
    const prefix = `INV-${branch.branchCode}-${new Date().getFullYear()}-`;
    const invoiceNumber = await generateDocumentNumber(tx, tx.branchInvoice, "invoiceNumber", prefix);

    return tx.branchInvoice.create({
      data: {
        invoiceNumber,
        shopId: Number(shopId),
        branchId: branch.id,
        customerId,
        status: "DRAFT",
        currency: input.currency?.toUpperCase() ?? financeSettings.currency,
        subtotal: totals.subtotal,
        discountTotal: totals.discountTotal,
        taxTotal: totals.taxTotal,
        total: totals.total,
        amountPaid: new Prisma.Decimal(0),
        amountDue: totals.total,
        notes: input.notes ?? null,
        terms: input.terms ?? null,
        taxSnapshot: {
          tax_type: taxProfile.taxType,
          default_tax_rate: taxProfile.defaultTaxRate.toString(),
          tax_label: taxProfile.taxLabel,
        },
        lineItems: { create: lineItems },
      },
      include: { lineItems: true, customer: true },
    });
  });

  await writeAuditLog({
    shopId,
    branchId: branch.id,
    userId,
    action: "branch_invoices.created",
    entity: "branch_invoice",
    entityId: invoice.uuid,
    newValues: input,
    ...getClientMeta(req),
  });

  return toPublicInvoice(invoice);
}

export async function issueInvoice({ shopId, branchUuid, invoiceUuid, userId, req }) {
  const branch = await ensureBranch(shopId, branchUuid);
  const invoice = await BranchInvoiceModel.findByUuid(invoiceUuid, branch.id, shopId);
  if (!invoice) throw new ApiError(HTTP.NOT_FOUND, "Invoice not found");
  if (invoice.status !== "DRAFT") throw new ApiError(HTTP.CONFLICT, "Only draft invoices can be issued");

  const updated = await prisma.branchInvoice.update({
    where: { id: invoice.id },
    data: {
      status: "ISSUED",
      issueDate: new Date(),
      issuedAt: new Date(),
      issuedById: userId ?? null,
      dueDate: invoice.dueDate ?? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    },
    include: { lineItems: true, customer: true },
  });

  await writeAuditLog({
    shopId,
    branchId: branch.id,
    userId,
    action: "branch_invoices.issued",
    entity: "branch_invoice",
    entityId: invoice.uuid,
    ...getClientMeta(req),
  });

  return toPublicInvoice(updated);
}

export async function voidInvoice({ shopId, branchUuid, invoiceUuid, input, userId, req }) {
  const branch = await ensureBranch(shopId, branchUuid);
  const invoice = await BranchInvoiceModel.findByUuid(invoiceUuid, branch.id, shopId);
  if (!invoice) throw new ApiError(HTTP.NOT_FOUND, "Invoice not found");
  if (invoice.amountPaid.gt(0)) throw new ApiError(HTTP.CONFLICT, "Cannot void invoice with payments");

  const updated = await prisma.branchInvoice.update({
    where: { id: invoice.id },
    data: { status: "VOIDED", voidedAt: new Date(), notes: input.reason ? `${invoice.notes ?? ""}\nVoid: ${input.reason}` : invoice.notes },
    include: { lineItems: true, customer: true },
  });

  await writeAuditLog({
    shopId,
    branchId: branch.id,
    userId,
    action: "branch_invoices.voided",
    entity: "branch_invoice",
    entityId: invoice.uuid,
    newValues: input,
    ...getClientMeta(req),
  });

  return toPublicInvoice(updated);
}

export async function listInvoices({ shopId, branchUuid, query }) {
  const branch = await ensureBranch(shopId, branchUuid);
  const { page, limit, skip, direction } = parsePagination(query);
  const where = { shopId: Number(shopId), branchId: branch.id };
  if (query.status) where.status = String(query.status).toUpperCase();
  if (query.search) {
    where.OR = [
      { invoiceNumber: { contains: query.search, mode: "insensitive" } },
    ];
  }

  const [rows, total] = await prisma.$transaction([
    BranchInvoiceModel.list(where, { skip, take: limit, orderBy: { createdAt: direction } }),
    BranchInvoiceModel.count(where),
  ]);

  return { data: rows.map(toPublicInvoice), meta: paginationMeta(page, limit, total) };
}

export async function getInvoice({ shopId, branchUuid, invoiceUuid }) {
  const branch = await ensureBranch(shopId, branchUuid);
  const invoice = await BranchInvoiceModel.findByUuid(invoiceUuid, branch.id, shopId);
  if (!invoice) throw new ApiError(HTTP.NOT_FOUND, "Invoice not found");
  return toPublicInvoice(invoice);
}
