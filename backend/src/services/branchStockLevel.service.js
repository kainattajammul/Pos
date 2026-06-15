import { prisma } from "../config/database.js";
import { ApiError } from "../utils/ApiError.js";
import { HTTP } from "../constants/httpStatus.js";
import { quantityAvailable, isLowStock, isOutOfStock } from "../utils/inventoryQuantities.js";
import { BranchInventoryModel } from "../models/branchInventory.model.js";
import { toPublicInventoryItem } from "../mappers/branchInventory.mapper.js";
import { ensureBranch } from "./branchInventoryAllocation.service.js";

export async function listStockLevels({ shopId, branchUuid, query }) {
  const branch = await ensureBranch(shopId, branchUuid);
  const page = Math.max(1, Number(query.page) || 1);
  const limit = Math.min(100, Math.max(1, Number(query.limit) || 25));
  const skip = (page - 1) * limit;

  const where = {
    shopId: Number(shopId),
    branchId: branch.id,
    archivedAt: null,
    isAllocated: true,
  };

  if (query.category) {
    where.product = { category: { slug: query.category } };
  }
  if (query.brand) {
    where.product = { ...(where.product ?? {}), brand: { equals: query.brand, mode: "insensitive" } };
  }
  if (query.product_status) {
    where.product = { ...(where.product ?? {}), status: query.product_status.toUpperCase() };
  }
  if (query.search) {
    where.OR = [
      { product: { name: { contains: query.search, mode: "insensitive" } } },
      { sku: { contains: query.search, mode: "insensitive" } },
      { barcode: { contains: query.search, mode: "insensitive" } },
    ];
  }

  let orderBy = { updatedAt: "desc" };
  if (query.sort === "name") orderBy = { product: { name: "asc" } };
  if (query.sort === "updated") orderBy = { updatedAt: "desc" };

  const rows = await BranchInventoryModel.list(where, { skip, take: limit, orderBy });
  let mapped = rows.map((r) => toPublicInventoryItem(r));

  if (query.low_stock === "true") {
    mapped = mapped.filter((r) => r.is_low_stock);
  }
  if (query.out_of_stock === "true") {
    mapped = mapped.filter((r) => r.is_out_of_stock);
  }

  if (query.sort === "available") {
    mapped.sort((a, b) => b.quantity_available - a.quantity_available);
  }
  if (query.sort === "stock_value") {
    mapped.sort((a, b) => Number(b.total_stock_value ?? 0) - Number(a.total_stock_value ?? 0));
  }

  const total = await BranchInventoryModel.count(where);

  return {
    data: mapped,
    pagination: { page, limit, total, total_pages: Math.ceil(total / limit) },
  };
}

export async function adjustStock({
  shopId,
  branchUuid,
  inventoryUuid,
  adjustmentType,
  quantity,
  reasonCode,
  notes,
  userId,
  req,
}) {
  const branch = await ensureBranch(shopId, branchUuid);
  const inventory = await BranchInventoryModel.findByUuid(inventoryUuid, branch.id, shopId);
  if (!inventory) throw new ApiError(HTTP.NOT_FOUND, "Inventory record not found");
  if (!reasonCode) throw new ApiError(HTTP.BAD_REQUEST, "Adjustment reason is required");

  const settings = await prisma.branchInventorySettings.findUnique({ where: { branchId: branch.id } });
  const allowNegative = settings?.allowNegativeStock ?? false;

  const { applyInventoryChange, afterStockChange } = await import("./branchStockMovement.service.js");
  const { writeAuditLog } = await import("./auditLog.service.js");
  const { getClientMeta } = await import("../utils/branchHelpers.js");
  const { snapshotQuantities } = await import("./branchStockMovement.service.js");

  const movementType =
    adjustmentType === "decrease" ? "STOCK_ADJUSTMENT_DECREASE" : "STOCK_ADJUSTMENT_INCREASE";
  const delta = adjustmentType === "decrease" ? -Math.abs(quantity) : Math.abs(quantity);
  const before = snapshotQuantities(inventory);

  const updated = await prisma.$transaction(async (tx) => {
    const fresh = await tx.branchInventory.findUnique({ where: { id: inventory.id } });
    return applyInventoryChange({
      tx,
      inventory: fresh,
      shopId,
      branchId: branch.id,
      movementType,
      field: "quantityOnHand",
      delta,
      allowNegative,
      reasonCode,
      notes,
      performedById: userId,
      referenceType: "adjustment",
      referenceId: inventory.uuid,
    });
  });

  const meta = getClientMeta(req);
  await writeAuditLog({
    shopId,
    branchId: branch.id,
    userId,
    action: "branch_inventory.adjusted",
    entity: "branch_inventory",
    entityId: inventoryUuid,
    oldValues: before,
    newValues: snapshotQuantities(updated),
    reason: reasonCode,
    ...meta,
  });

  await afterStockChange(updated, branch.id, shopId);
  return toPublicInventoryItem(updated);
}

export async function stockCount({
  shopId,
  branchUuid,
  inventoryUuid,
  countedQuantity,
  notes,
  userId,
  req,
}) {
  const branch = await ensureBranch(shopId, branchUuid);
  const inventory = await BranchInventoryModel.findByUuid(inventoryUuid, branch.id, shopId);
  if (!inventory) throw new ApiError(HTTP.NOT_FOUND, "Inventory record not found");

  const delta = countedQuantity - inventory.quantityOnHand;
  if (delta === 0) {
    await prisma.branchInventory.update({
      where: { id: inventory.id },
      data: { lastCountedAt: new Date() },
    });
    return toPublicInventoryItem({ ...inventory, lastCountedAt: new Date() });
  }

  const adjustmentType = delta > 0 ? "increase" : "decrease";
  return adjustStock({
    shopId,
    branchUuid,
    inventoryUuid,
    adjustmentType,
    quantity: Math.abs(delta),
    reasonCode: "STOCK_COUNT_CORRECTION",
    notes,
    userId,
    req,
  });
}

export async function listMovements({ shopId, branchUuid, inventoryUuid, query }) {
  const branch = await ensureBranch(shopId, branchUuid);
  const inventory = await BranchInventoryModel.findByUuid(inventoryUuid, branch.id, shopId);
  if (!inventory) throw new ApiError(HTTP.NOT_FOUND, "Inventory record not found");

  const page = Math.max(1, Number(query.page) || 1);
  const limit = Math.min(100, Math.max(1, Number(query.limit) || 25));
  const skip = (page - 1) * limit;

  const { BranchStockMovementModel } = await import("../models/branchInventory.model.js");
  const [rows, total] = await Promise.all([
    BranchStockMovementModel.listByInventory(inventory.id, { skip, take: limit }),
    BranchStockMovementModel.countByInventory(inventory.id),
  ]);

  return {
    data: rows.map((m) => ({
      id: m.uuid,
      movement_type: m.movementType.toLowerCase(),
      quantity: m.quantity,
      quantity_before: m.quantityBefore,
      quantity_after: m.quantityAfter,
      reason_code: m.reasonCode,
      notes: m.notes,
      created_at: m.createdAt.toISOString(),
    })),
    pagination: { page, limit, total, total_pages: Math.ceil(total / limit) },
  };
}
