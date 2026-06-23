import { Prisma } from "@prisma/client";
import { prisma } from "../config/database.js";

const { Decimal } = Prisma;

export async function generateDocumentNumber(tx, delegate, field, prefix) {
  const last = await delegate.findFirst({
    where: { [field]: { startsWith: prefix } },
    orderBy: { [field]: "desc" },
  });
  const seq = last ? Number(String(last[field]).split("-").pop()) + 1 : 1;
  return `${prefix}${String(seq).padStart(6, "0")}`;
}

export function parsePagination(query, { defaultLimit = 20, maxLimit = 100 } = {}) {
  const page = Math.max(1, Number(query.page) || 1);
  const limit = Math.min(maxLimit, Math.max(1, Number(query.limit) || defaultLimit));
  const sort = String(query.sort || "created_at");
  const direction = String(query.direction || "desc").toLowerCase() === "asc" ? "asc" : "desc";
  return { page, limit, skip: (page - 1) * limit, sort, direction };
}

export function paginationMeta(page, limit, total) {
  return {
    page,
    limit,
    total,
    totalPages: total === 0 ? 0 : Math.ceil(total / limit),
  };
}

export function startOfBusinessDay(timezone = "Europe/London") {
  const now = new Date();
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  const [y, m, d] = formatter.format(now).split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d, 0, 0, 0, 0));
}

export function endOfBusinessDay(timezone = "Europe/London") {
  const start = startOfBusinessDay(timezone);
  return new Date(start.getTime() + 24 * 60 * 60 * 1000 - 1);
}

export function calculateLineTotals({ quantity, unitPrice, discountAmount = 0, taxRate = 0 }) {
  const qty = new Decimal(String(quantity));
  const price = new Decimal(String(unitPrice));
  const discount = new Decimal(String(discountAmount || 0));
  const gross = price.mul(qty);
  const net = gross.sub(discount);
  const tax = net.mul(new Decimal(String(taxRate || 0))).div(100);
  const lineTotal = net.add(tax);
  return {
    subtotal: net,
    taxAmount: tax,
    lineTotal,
  };
}

export function calculateInvoiceTotals(lineItems) {
  let subtotal = new Decimal(0);
  let taxTotal = new Decimal(0);
  let discountTotal = new Decimal(0);

  for (const item of lineItems) {
    const qty = new Decimal(String(item.quantity));
    const price = new Decimal(String(item.unitPrice));
    const discount = new Decimal(String(item.discountAmount || 0));
    const tax = new Decimal(String(item.taxAmount || 0));
    const gross = price.mul(qty);
    subtotal = subtotal.add(gross.sub(discount));
    discountTotal = discountTotal.add(discount);
    taxTotal = taxTotal.add(tax);
  }

  const total = subtotal.add(taxTotal);
  return { subtotal, discountTotal, taxTotal, total };
}

export async function getRefundableBalance(paymentId, tx = prisma) {
  const payment = await tx.branchPayment.findUnique({
    where: { id: Number(paymentId) },
    include: { refunds: { where: { status: { in: ["COMPLETED", "PARTIALLY_COMPLETED", "APPROVED", "PROCESSING"] } } } },
  });
  if (!payment) return new Decimal(0);
  let refunded = new Decimal(0);
  for (const r of payment.refunds) {
    refunded = refunded.add(r.amount);
  }
  return payment.amount.sub(refunded);
}

export function normalizePaymentMethod(method) {
  return String(method ?? "CASH").toUpperCase().replace(/-/g, "_");
}

export function isValidCurrency(code) {
  return /^[A-Z]{3}$/.test(String(code ?? "").toUpperCase());
}
