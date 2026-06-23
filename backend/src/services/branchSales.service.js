import { Prisma } from "@prisma/client";
import { prisma } from "../config/database.js";
import { ApiError } from "../utils/ApiError.js";
import { HTTP } from "../constants/httpStatus.js";
import { BranchSaleModel, CustomerModel } from "../models/branchOperations.model.js";
import { ensureBranch } from "./branchOperationsSettings.service.js";
import { writeAuditLog } from "./auditLog.service.js";
import { getClientMeta } from "../utils/branchHelpers.js";
import { toPublicSaleSummary } from "../mappers/branchOperations.mapper.js";
import {
  addDecimal,
  multiplyDecimal,
  subtractDecimal,
  toDecimal,
} from "../utils/inventoryDecimal.js";
import { quantityAvailable } from "../utils/inventoryQuantities.js";
import {
  applyInventoryChange,
  afterStockChange,
  reloadInventory,
} from "./branchStockMovement.service.js";
import { ensureBranchCustomerLink } from "./branchCustomer.service.js";
import { logCustomerActivity } from "./branchCustomerActivity.service.js";

async function generateSaleNumber(tx, branchCode) {
  const year = new Date().getFullYear();
  const prefix = `SL-${branchCode}-${year}-`;
  const last = await tx.branchSale.findFirst({
    where: { saleNumber: { startsWith: prefix } },
    orderBy: { saleNumber: "desc" },
  });
  const seq = last ? Number(last.saleNumber.split("-").pop()) + 1 : 1;
  return `${prefix}${String(seq).padStart(6, "0")}`;
}

function calculateLineTotal(unitPrice, quantity, discountAmount = 0, taxAmount = 0) {
  const gross = multiplyDecimal(unitPrice, quantity);
  return addDecimal(subtractDecimal(gross, discountAmount), taxAmount);
}

function calculateSaleTotals(lineItems, { discountTotal = 0, vatRate = null } = {}) {
  let subtotal = new Prisma.Decimal(0);
  let taxTotal = new Prisma.Decimal(0);
  let costTotal = new Prisma.Decimal(0);

  for (const item of lineItems) {
    const lineGross = multiplyDecimal(item.unitPrice, item.quantity);
    const lineNet = subtractDecimal(lineGross, item.discountAmount ?? 0);
    subtotal = addDecimal(subtotal, lineNet);
    taxTotal = addDecimal(taxTotal, item.taxAmount ?? 0);
    if (item.unitCost != null) {
      costTotal = addDecimal(costTotal, multiplyDecimal(item.unitCost, item.quantity));
    }
  }

  const discount = toDecimal(discountTotal ?? 0);
  const total = subtractDecimal(addDecimal(subtotal, taxTotal), discount);

  return { subtotal, taxTotal, costTotal, discountTotal: discount, total, vatRate: vatRate != null ? toDecimal(vatRate) : null };
}

async function resolveCustomer(shopId, customerUuid) {
  if (!customerUuid) return null;
  const customer = await CustomerModel.findByUuid(customerUuid, shopId);
  if (!customer) throw new ApiError(HTTP.NOT_FOUND, "Customer not found");
  return customer;
}

export async function createSale({ shopId, branchUuid, input, userId, req }) {
  const branch = await ensureBranch(shopId, branchUuid);
  const customer = await resolveCustomer(shopId, input.customer_id);

  if (input.idempotency_key) {
    const existing = await prisma.branchSale.findUnique({
      where: { idempotencyKey: input.idempotency_key },
      include: { lineItems: true, payments: true, customer: true },
    });
    if (existing && existing.branchId === branch.id) {
      return toPublicSaleSummary(existing);
    }
  }

  const sale = await prisma.$transaction(async (tx) => {
    const saleNumber = await generateSaleNumber(tx, branch.branchCode);
    const created = await tx.branchSale.create({
      data: {
        saleNumber,
        shopId: Number(shopId),
        branchId: branch.id,
        customerId: customer?.id ?? null,
        cashierId: userId,
        status: "DRAFT",
        channel: (input.channel ?? "IN_STORE").toUpperCase(),
        notes: input.notes ?? null,
        vatRate: input.vat_rate != null ? toDecimal(input.vat_rate) : null,
        idempotencyKey: input.idempotency_key ?? null,
      },
    });

    if (input.line_items?.length) {
      for (const item of input.line_items) {
        if (item.quantity <= 0) throw new ApiError(HTTP.BAD_REQUEST, "Line item quantity must be positive");

        let inventory = null;
        if (item.branch_inventory_id) {
          inventory = await tx.branchInventory.findFirst({
            where: {
              uuid: item.branch_inventory_id,
              branchId: branch.id,
              shopId: Number(shopId),
              archivedAt: null,
            },
          });
          if (!inventory) throw new ApiError(HTTP.NOT_FOUND, "Inventory item not found");
          if (!inventory.isSellable) {
            throw new ApiError(HTTP.BAD_REQUEST, "Product is not sellable at this branch");
          }
        }

        const unitPrice = toDecimal(item.unit_price);
        const discountAmount = toDecimal(item.discount_amount ?? 0);
        const taxAmount = toDecimal(item.tax_amount ?? 0);
        const lineTotal = calculateLineTotal(unitPrice, item.quantity, discountAmount, taxAmount);

        await tx.branchSaleLineItem.create({
          data: {
            saleId: created.id,
            itemType: item.item_type ?? "product",
            productId: inventory?.productId ?? null,
            productVariantId: inventory?.productVariantId ?? null,
            branchInventoryId: inventory?.id ?? null,
            serviceId: item.service_id ?? null,
            name: item.name,
            sku: item.sku ?? inventory?.sku ?? null,
            quantity: item.quantity,
            unitPrice,
            unitCost: item.unit_cost != null ? toDecimal(item.unit_cost) : inventory?.averageCost,
            discountAmount,
            taxAmount,
            lineTotal,
          },
        });
      }
    }

    return tx.branchSale.findUnique({
      where: { id: created.id },
      include: { lineItems: true, customer: true },
    });
  });

  if (customer) {
    await ensureBranchCustomerLink({ shopId, branchId: branch.id, customerId: customer.id });
    await logCustomerActivity({
      shopId,
      branchId: branch.id,
      customerId: customer.id,
      activityType: "SALE_CREATED",
      title: `Sale ${sale.saleNumber} created`,
      referenceType: "sale",
      referenceId: sale.uuid,
      performedById: userId,
    });
  }

  await writeAuditLog({
    shopId,
    branchId: branch.id,
    userId,
    action: "branch_sales.created",
    entity: "branch_sale",
    entityId: sale.uuid,
    ...getClientMeta(req),
  });

  return toPublicSaleSummary(sale);
}

export async function completeSale({ shopId, branchUuid, saleUuid, payments, userId, req }) {
  const branch = await ensureBranch(shopId, branchUuid);
  const sale = await BranchSaleModel.findByUuid(saleUuid, branch.id, shopId);
  if (!sale) throw new ApiError(HTTP.NOT_FOUND, "Sale not found");
  if (sale.status !== "DRAFT" && sale.status !== "PENDING") {
    throw new ApiError(HTTP.BAD_REQUEST, "Only draft or pending sales can be completed");
  }

  const settings = await prisma.branchInventorySettings.findUnique({
    where: { branchId: branch.id },
  });

  const completed = await prisma.$transaction(async (tx) => {
    const fresh = await tx.branchSale.findUnique({
      where: { id: sale.id },
      include: { lineItems: true },
    });
    if (fresh.status !== "DRAFT" && fresh.status !== "PENDING") {
      throw new ApiError(HTTP.CONFLICT, "Sale status changed; please retry");
    }

    for (const item of fresh.lineItems) {
      if (!item.branchInventoryId || item.itemType !== "product") continue;

      const inv = await reloadInventory(tx, item.branchInventoryId);
      const available = quantityAvailable(inv);
      if (available < item.quantity) {
        throw new ApiError(HTTP.BAD_REQUEST, `Insufficient stock for ${item.name}`);
      }

      await applyInventoryChange({
        tx,
        inventory: inv,
        shopId,
        branchId: branch.id,
        movementType: "SALE",
        field: "quantityOnHand",
        delta: -item.quantity,
        allowNegative: settings?.allowNegativeStock ?? false,
        unitCost: item.unitCost,
        referenceType: "sale",
        referenceId: fresh.uuid,
        performedById: userId,
      });
    }

    const totals = calculateSaleTotals(fresh.lineItems, {
      discountTotal: fresh.discountTotal,
      vatRate: fresh.vatRate,
    });

    let paymentTotal = new Prisma.Decimal(0);
    if (payments?.length) {
      for (const p of payments) {
        const amount = toDecimal(p.amount);
        paymentTotal = addDecimal(paymentTotal, amount);
        await tx.branchSalePayment.create({
          data: {
            saleId: fresh.id,
            paymentMethod: p.payment_method,
            amount,
            reference: p.reference ?? null,
          },
        });
      }
    }

    const paymentStatus =
      paymentTotal.gte(totals.total) ? "PAID" : paymentTotal.gt(0) ? "PARTIALLY_PAID" : "UNPAID";

    const updated = await tx.branchSale.update({
      where: { id: fresh.id },
      data: {
        status: "COMPLETED",
        paymentStatus,
        fulfilmentStatus: "FULFILLED",
        subtotal: totals.subtotal,
        taxTotal: totals.taxTotal,
        costTotal: totals.costTotal,
        discountTotal: totals.discountTotal,
        total: totals.total,
        completedAt: new Date(),
        version: { increment: 1 },
      },
      include: { lineItems: true, payments: true, customer: true },
    });

    if (fresh.customerId) {
      await tx.branchCustomer.upsert({
        where: {
          branchId_customerId: { branchId: branch.id, customerId: fresh.customerId },
        },
        create: {
          shopId: Number(shopId),
          branchId: branch.id,
          customerId: fresh.customerId,
          totalSalesCount: 1,
          totalSpend: totals.total,
        },
        update: {
          totalSalesCount: { increment: 1 },
          totalSpend: { increment: totals.total },
          lastInteractionAt: new Date(),
        },
      });
    }

    return updated;
  });

  for (const item of completed.lineItems) {
    if (item.branchInventoryId) {
      const inv = await prisma.branchInventory.findUnique({ where: { id: item.branchInventoryId } });
      if (inv) await afterStockChange(inv, branch.id, shopId);
    }
  }

  if (completed.customerId) {
    await logCustomerActivity({
      shopId,
      branchId: branch.id,
      customerId: completed.customerId,
      activityType: "SALE_COMPLETED",
      title: `Sale ${completed.saleNumber} completed`,
      referenceType: "sale",
      referenceId: completed.uuid,
      performedById: userId,
    });
  }

  await writeAuditLog({
    shopId,
    branchId: branch.id,
    userId,
    action: "branch_sales.completed",
    entity: "branch_sale",
    entityId: saleUuid,
    newValues: { total: completed.total.toString() },
    ...getClientMeta(req),
  });

  return toPublicSaleSummary(completed);
}

export async function listSales({ shopId, branchUuid, query }) {
  const branch = await ensureBranch(shopId, branchUuid);
  const page = Math.max(1, Number(query.page) || 1);
  const limit = Math.min(100, Math.max(1, Number(query.limit) || 25));
  const skip = (page - 1) * limit;

  const where = { shopId: Number(shopId), branchId: branch.id };
  if (query.status) where.status = query.status.toUpperCase();
  if (query.from) where.createdAt = { ...(where.createdAt ?? {}), gte: new Date(query.from) };
  if (query.to) where.createdAt = { ...(where.createdAt ?? {}), lte: new Date(query.to) };

  const [rows, total] = await Promise.all([
    prisma.branchSale.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: "desc" },
      include: { customer: true },
    }),
    prisma.branchSale.count({ where }),
  ]);

  return {
    data: rows.map((s) => toPublicSaleSummary(s)),
    pagination: { page, limit, total, total_pages: Math.ceil(total / limit) },
  };
}

export async function getSale({ shopId, branchUuid, saleUuid }) {
  const branch = await ensureBranch(shopId, branchUuid);
  const sale = await BranchSaleModel.findByUuid(saleUuid, branch.id, shopId);
  if (!sale) throw new ApiError(HTTP.NOT_FOUND, "Sale not found");
  return toPublicSaleSummary(sale);
}

export async function cancelSale({ shopId, branchUuid, saleUuid, reason, userId, req }) {
  const branch = await ensureBranch(shopId, branchUuid);
  const sale = await BranchSaleModel.findByUuid(saleUuid, branch.id, shopId);
  if (!sale) throw new ApiError(HTTP.NOT_FOUND, "Sale not found");
  if (!["DRAFT", "PENDING"].includes(sale.status)) {
    throw new ApiError(HTTP.BAD_REQUEST, "Only draft or pending sales can be cancelled");
  }

  const cancelled = await prisma.branchSale.update({
    where: { id: sale.id },
    data: { status: "CANCELLED", cancelledAt: new Date(), version: { increment: 1 } },
    include: { customer: true },
  });

  await writeAuditLog({
    shopId,
    branchId: branch.id,
    userId,
    action: "branch_sales.cancelled",
    entity: "branch_sale",
    entityId: saleUuid,
    reason,
    ...getClientMeta(req),
  });

  return toPublicSaleSummary(cancelled);
}
