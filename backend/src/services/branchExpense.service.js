import { Prisma } from "@prisma/client";
import { prisma } from "../config/database.js";
import { ApiError } from "../utils/ApiError.js";
import { HTTP } from "../constants/httpStatus.js";
import { BranchExpenseModel } from "../models/branchFinance.model.js";
import { toPublicExpense } from "../mappers/branchFinance.mapper.js";
import { ensureBranch } from "./branchFinanceSettings.service.js";
import { writeAuditLog } from "./auditLog.service.js";
import { getClientMeta } from "../utils/branchHelpers.js";
import { generateDocumentNumber, normalizePaymentMethod, parsePagination, paginationMeta } from "../utils/financeHelpers.js";
import { toDecimal } from "../utils/inventoryDecimal.js";

export async function createExpense({ shopId, branchUuid, input, userId, req }) {
  const branch = await ensureBranch(shopId, branchUuid);
  const subtotal = toDecimal(input.subtotal);
  const taxAmount = toDecimal(input.tax_amount ?? 0);
  const total = input.total != null ? toDecimal(input.total) : subtotal.add(taxAmount);

  const expense = await prisma.$transaction(async (tx) => {
    const prefix = `EXP-${branch.branchCode}-${new Date().getFullYear()}-`;
    const expenseNumber = await generateDocumentNumber(tx, tx.branchExpense, "expenseNumber", prefix);
    return tx.branchExpense.create({
      data: {
        expenseNumber,
        shopId: Number(shopId),
        branchId: branch.id,
        category: input.category,
        supplier: input.supplier ?? null,
        expenseDate: new Date(input.expense_date),
        description: input.description,
        subtotal,
        taxAmount,
        total,
        currency: input.currency?.toUpperCase() ?? "GBP",
        paymentMethod: input.payment_method ? normalizePaymentMethod(input.payment_method) : null,
        paymentReference: input.payment_reference ?? null,
        receiptUrl: input.receipt_url ?? null,
        status: "DRAFT",
        notes: input.notes ?? null,
        submittedById: userId ?? null,
      },
    });
  });

  await writeAuditLog({
    shopId,
    branchId: branch.id,
    userId,
    action: "branch_expenses.created",
    entity: "branch_expense",
    entityId: expense.uuid,
    newValues: input,
    ...getClientMeta(req),
  });

  return toPublicExpense(expense);
}

export async function submitExpense({ shopId, branchUuid, expenseUuid, userId, req }) {
  const branch = await ensureBranch(shopId, branchUuid);
  const expense = await BranchExpenseModel.findByUuid(expenseUuid, branch.id, shopId);
  if (!expense) throw new ApiError(HTTP.NOT_FOUND, "Expense not found");
  if (expense.status !== "DRAFT") throw new ApiError(HTTP.CONFLICT, "Only draft expenses can be submitted");

  const updated = await prisma.branchExpense.update({
    where: { id: expense.id },
    data: { status: "PENDING_APPROVAL", submittedById: userId ?? null },
  });

  await writeAuditLog({
    shopId,
    branchId: branch.id,
    userId,
    action: "branch_expenses.submitted",
    entity: "branch_expense",
    entityId: expense.uuid,
    ...getClientMeta(req),
  });

  return toPublicExpense(updated);
}

export async function approveExpense({ shopId, branchUuid, expenseUuid, userId, req }) {
  const branch = await ensureBranch(shopId, branchUuid);
  const expense = await BranchExpenseModel.findByUuid(expenseUuid, branch.id, shopId);
  if (!expense) throw new ApiError(HTTP.NOT_FOUND, "Expense not found");

  const updated = await prisma.branchExpense.update({
    where: { id: expense.id },
    data: { status: "APPROVED", approvedById: userId ?? null },
  });

  await writeAuditLog({
    shopId,
    branchId: branch.id,
    userId,
    action: "branch_expenses.approved",
    entity: "branch_expense",
    entityId: expense.uuid,
    ...getClientMeta(req),
  });

  return toPublicExpense(updated);
}

export async function listExpenses({ shopId, branchUuid, query }) {
  const branch = await ensureBranch(shopId, branchUuid);
  const { page, limit, skip, direction } = parsePagination(query);
  const where = { shopId: Number(shopId), branchId: branch.id };
  if (query.status) where.status = String(query.status).toUpperCase();
  if (query.category) where.category = query.category;

  const [rows, total] = await prisma.$transaction([
    BranchExpenseModel.list(where, { skip, take: limit, orderBy: { expenseDate: direction } }),
    BranchExpenseModel.count(where),
  ]);

  return { data: rows.map(toPublicExpense), meta: paginationMeta(page, limit, total) };
}
