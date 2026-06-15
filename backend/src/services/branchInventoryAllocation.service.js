import { prisma } from "../config/database.js";
import { ApiError } from "../utils/ApiError.js";
import { HTTP } from "../constants/httpStatus.js";
import { BranchModel } from "../models/branch.model.js";
import {
  BranchInventoryModel,
  BranchInventorySettingsModel,
  ProductModel,
} from "../models/branchInventory.model.js";
import { writeAuditLog } from "./auditLog.service.js";
import { getClientMeta } from "../utils/branchHelpers.js";
import {
  applyInventoryChange,
  afterStockChange,
  hasStock,
  reloadInventory,
} from "./branchStockMovement.service.js";
import { weightedAverageCost } from "../utils/inventoryDecimal.js";
import { toPublicInventoryItem } from "../mappers/branchInventory.mapper.js";

async function ensureBranch(shopId, branchUuid) {
  const branch = await BranchModel.findByUuid(branchUuid, shopId);
  if (!branch) throw new ApiError(HTTP.NOT_FOUND, "Branch not found");
  return branch;
}

async function resolveProduct(shopId, productUuid, variantUuid) {
  const product = await ProductModel.findByUuid(productUuid, shopId);
  if (!product) throw new ApiError(HTTP.NOT_FOUND, "Product not found");
  if (product.status === "ARCHIVED") {
    throw new ApiError(HTTP.BAD_REQUEST, "Archived products cannot be allocated");
  }

  let variant = null;
  if (variantUuid) {
    variant = await ProductModel.findVariantByUuid(variantUuid, shopId);
    if (!variant || variant.productId !== product.id) {
      throw new ApiError(HTTP.NOT_FOUND, "Product variant not found");
    }
  } else if (product.variants?.length === 1) {
    variant = product.variants[0];
  }

  return { product, variant };
}

export async function allocateProduct({
  shopId,
  branchUuid,
  productUuid,
  productVariantUuid,
  openingQuantity = 0,
  unitCost = null,
  branchSellingPrice = null,
  shelfLocation = null,
  binLocation = null,
  isSellable = true,
  isTransferable = true,
  isPurchasable = true,
  userId,
  req,
}) {
  const branch = await ensureBranch(shopId, branchUuid);
  const { product, variant } = await resolveProduct(shopId, productUuid, productVariantUuid);

  const existing = await BranchInventoryModel.findAllocation(
    branch.id,
    product.id,
    variant?.id ?? null,
  );
  if (existing) throw new ApiError(HTTP.CONFLICT, "Product is already allocated to this branch");

  const settings = await BranchInventorySettingsModel.getOrCreate(branch.id, shopId);

  const result = await prisma.$transaction(async (tx) => {
    const inventory = await BranchInventoryModel.create(
      {
        shopId: Number(shopId),
        branchId: branch.id,
        productId: product.id,
        productVariantId: variant?.id ?? null,
        sku: variant?.sku ?? product.sku,
        barcode: variant?.barcode ?? product.barcode,
        branchSellingPrice: branchSellingPrice != null ? branchSellingPrice : null,
        shelfLocation,
        binLocation,
        isSellable,
        isTransferable,
        isPurchasable,
        averageCost: unitCost != null ? unitCost : product.standardCost,
        latestPurchaseCost: unitCost,
      },
      tx,
    );

    let final = inventory;
    if (openingQuantity > 0) {
      final = await applyInventoryChange({
        tx,
        inventory,
        shopId,
        branchId: branch.id,
        movementType: "OPENING_BALANCE",
        field: "quantityOnHand",
        delta: openingQuantity,
        allowNegative: settings.allowNegativeStock,
        unitCost: unitCost ?? product.standardCost,
        referenceType: "allocation",
        referenceId: inventory.uuid,
        performedById: userId,
      });
      if (unitCost != null) {
        final = await tx.branchInventory.update({
          where: { id: inventory.id },
          data: {
            averageCost: weightedAverageCost(0, null, openingQuantity, unitCost),
            latestPurchaseCost: unitCost,
          },
          include: { product: { include: { category: true } }, productVariant: true, reorderRule: true, branch: true },
        });
      }
    }

    return final;
  });

  const meta = getClientMeta(req);
  await writeAuditLog({
    shopId,
    branchId: branch.id,
    userId,
    action: "branch_inventory.allocated",
    entity: "branch_inventory",
    entityId: result.uuid,
    newValues: { product_id: product.uuid, opening_quantity: openingQuantity },
    ...meta,
  });

  await afterStockChange(result, branch.id, shopId);
  return toPublicInventoryItem(result);
}

export async function bulkAllocate({ shopId, branchUuid, items, userId, req }) {
  const branch = await ensureBranch(shopId, branchUuid);
  const created = [];

  await prisma.$transaction(async (tx) => {
    for (const item of items) {
      const { product, variant } = await resolveProduct(
        shopId,
        item.product_id,
        item.product_variant_id,
      );
      const existing = await tx.branchInventory.findFirst({
        where: {
          branchId: branch.id,
          productId: product.id,
          productVariantId: variant?.id ?? null,
          archivedAt: null,
        },
      });
      if (existing) continue;

      const inv = await tx.branchInventory.create({
        data: {
          shopId: Number(shopId),
          branchId: branch.id,
          productId: product.id,
          productVariantId: variant?.id ?? null,
          sku: variant?.sku ?? product.sku,
          barcode: variant?.barcode ?? product.barcode,
          branchSellingPrice: item.branch_selling_price ?? null,
          shelfLocation: item.shelf_location ?? null,
          binLocation: item.bin_location ?? null,
        },
      });

      if (item.opening_quantity > 0) {
        await applyInventoryChange({
          tx,
          inventory: inv,
          shopId,
          branchId: branch.id,
          movementType: "OPENING_BALANCE",
          field: "quantityOnHand",
          delta: item.opening_quantity,
          unitCost: item.unit_cost ?? product.standardCost,
          performedById: userId,
        });
      }
      created.push(inv.uuid);
    }
  });

  const meta = getClientMeta(req);
  await writeAuditLog({
    shopId,
    branchId: branch.id,
    userId,
    action: "branch_inventory.bulk_allocated",
    entity: "branch_inventory",
    newValues: { count: created.length, inventory_ids: created },
    ...meta,
  });

  return { allocated_count: created.length, inventory_ids: created };
}

export async function updateAllocation({
  shopId,
  branchUuid,
  inventoryUuid,
  patch,
  userId,
  req,
}) {
  const branch = await ensureBranch(shopId, branchUuid);
  const existing = await BranchInventoryModel.findByUuid(inventoryUuid, branch.id, shopId);
  if (!existing) throw new ApiError(HTTP.NOT_FOUND, "Inventory record not found");

  const data = {};
  if (patch.branch_selling_price !== undefined) data.branchSellingPrice = patch.branch_selling_price;
  if (patch.shelf_location !== undefined) data.shelfLocation = patch.shelf_location;
  if (patch.bin_location !== undefined) data.binLocation = patch.bin_location;
  if (patch.is_sellable !== undefined) data.isSellable = patch.is_sellable;
  if (patch.is_transferable !== undefined) data.isTransferable = patch.is_transferable;
  if (patch.is_purchasable !== undefined) data.isPurchasable = patch.is_purchasable;

  const updated = await prisma.branchInventory.update({
    where: { id: existing.id },
    data,
    include: {
      product: { include: { category: true } },
      productVariant: true,
      reorderRule: true,
      branch: true,
    },
  });

  const meta = getClientMeta(req);
  await writeAuditLog({
    shopId,
    branchId: branch.id,
    userId,
    action: "branch_inventory.updated",
    entity: "branch_inventory",
    entityId: inventoryUuid,
    oldValues: patch,
    newValues: data,
    ...meta,
  });

  return toPublicInventoryItem(updated);
}

export async function archiveAllocation({ shopId, branchUuid, inventoryUuid, userId, req }) {
  const branch = await ensureBranch(shopId, branchUuid);
  const existing = await BranchInventoryModel.findByUuid(inventoryUuid, branch.id, shopId);
  if (!existing) throw new ApiError(HTTP.NOT_FOUND, "Inventory record not found");

  if (hasStock(existing)) {
    throw new ApiError(
      HTTP.BAD_REQUEST,
      "Cannot deallocate while stock exists; transfer, adjust, or write off stock first",
    );
  }

  const archived = await BranchInventoryModel.archive(existing.id);

  const meta = getClientMeta(req);
  await writeAuditLog({
    shopId,
    branchId: branch.id,
    userId,
    action: "branch_inventory.archived",
    entity: "branch_inventory",
    entityId: inventoryUuid,
    ...meta,
  });

  return toPublicInventoryItem(archived);
}

export async function listInventory({ shopId, branchUuid, query }) {
  const branch = await ensureBranch(shopId, branchUuid);
  const page = Math.max(1, Number(query.page) || 1);
  const limit = Math.min(100, Math.max(1, Number(query.limit) || 25));
  const skip = (page - 1) * limit;

  const where = {
    shopId: Number(shopId),
    branchId: branch.id,
    archivedAt: query.include_archived === "true" ? undefined : null,
  };

  if (query.allocated === "true") where.isAllocated = true;
  if (query.allocated === "false") where.isAllocated = false;

  if (query.search) {
    where.OR = [
      { product: { name: { contains: query.search, mode: "insensitive" } } },
      { sku: { contains: query.search, mode: "insensitive" } },
      { barcode: { contains: query.search, mode: "insensitive" } },
    ];
  }

  const [rows, total] = await Promise.all([
    BranchInventoryModel.list(where, { skip, take: limit, orderBy: { updatedAt: "desc" } }),
    BranchInventoryModel.count(where),
  ]);

  return {
    data: rows.map((r) => toPublicInventoryItem(r)),
    pagination: { page, limit, total, total_pages: Math.ceil(total / limit) },
  };
}

export async function getInventoryItem({ shopId, branchUuid, inventoryUuid }) {
  const branch = await ensureBranch(shopId, branchUuid);
  const row = await BranchInventoryModel.findByUuid(inventoryUuid, branch.id, shopId);
  if (!row) throw new ApiError(HTTP.NOT_FOUND, "Inventory record not found");
  return toPublicInventoryItem(row);
}

export { ensureBranch, resolveProduct, reloadInventory };
