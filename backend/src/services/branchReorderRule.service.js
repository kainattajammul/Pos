import { prisma } from "../config/database.js";
import { ApiError } from "../utils/ApiError.js";
import { HTTP } from "../constants/httpStatus.js";
import { quantityAvailable } from "../utils/inventoryQuantities.js";
import { ensureBranch } from "./branchInventoryAllocation.service.js";
import { BranchInventoryModel } from "../models/branchInventory.model.js";

function validateRuleLevels({ minimumStockLevel, maximumStockLevel, reorderPoint, reorderQuantity }) {
  if (reorderQuantity <= 0) {
    throw new ApiError(HTTP.BAD_REQUEST, "Reorder quantity must be positive");
  }
  if (reorderPoint < 0) {
    throw new ApiError(HTTP.BAD_REQUEST, "Reorder point cannot be negative");
  }
  if (
    minimumStockLevel != null &&
    maximumStockLevel != null &&
    maximumStockLevel < minimumStockLevel
  ) {
    throw new ApiError(HTTP.BAD_REQUEST, "Maximum stock cannot be lower than minimum stock");
  }
}

export function suggestedReorderQuantity(inventory, rule) {
  const available = quantityAvailable(inventory);
  if (rule.maximumStockLevel != null) {
    return Math.max(0, rule.maximumStockLevel - available);
  }
  return rule.reorderQuantity;
}

export async function upsertReorderRule({
  shopId,
  branchUuid,
  inventoryUuid,
  input,
  userId,
  req,
}) {
  const branch = await ensureBranch(shopId, branchUuid);
  const inventory = await BranchInventoryModel.findByUuid(inventoryUuid, branch.id, shopId);
  if (!inventory) throw new ApiError(HTTP.NOT_FOUND, "Inventory record not found");

  validateRuleLevels(input);

  const rule = await prisma.branchStockReorderRule.upsert({
    where: { branchInventoryId: inventory.id },
    create: {
      shopId: Number(shopId),
      branchId: branch.id,
      branchInventoryId: inventory.id,
      isEnabled: input.is_enabled ?? true,
      reorderPoint: input.reorder_point,
      reorderQuantity: input.reorder_quantity,
      minimumStockLevel: input.minimum_stock_level ?? null,
      maximumStockLevel: input.maximum_stock_level ?? null,
      safetyStockLevel: input.safety_stock_level ?? null,
      leadTimeDays: input.lead_time_days ?? null,
      autoCreateRequest: input.auto_create_request ?? false,
      createdById: userId,
      updatedById: userId,
    },
    update: {
      isEnabled: input.is_enabled ?? true,
      reorderPoint: input.reorder_point,
      reorderQuantity: input.reorder_quantity,
      minimumStockLevel: input.minimum_stock_level ?? null,
      maximumStockLevel: input.maximum_stock_level ?? null,
      safetyStockLevel: input.safety_stock_level ?? null,
      leadTimeDays: input.lead_time_days ?? null,
      autoCreateRequest: input.auto_create_request ?? false,
      updatedById: userId,
    },
  });

  const { writeAuditLog } = await import("./auditLog.service.js");
  const { getClientMeta } = await import("../utils/branchHelpers.js");
  await writeAuditLog({
    shopId,
    branchId: branch.id,
    userId,
    action: "branch_inventory.reorder_rule.updated",
    entity: "branch_stock_reorder_rule",
    entityId: rule.uuid,
    newValues: input,
    ...getClientMeta(req),
  });

  const { evaluateAlertsForInventory } = await import("./branchLowStockAlert.service.js");
  await evaluateAlertsForInventory(
    { ...inventory, reorderRule: rule },
    branch.id,
    shopId,
  );

  return {
    id: rule.uuid,
    reorder_point: rule.reorderPoint,
    reorder_quantity: rule.reorderQuantity,
    suggested_reorder_quantity: suggestedReorderQuantity(inventory, rule),
  };
}

export async function listReorderRules({ shopId, branchUuid }) {
  const branch = await ensureBranch(shopId, branchUuid);
  const rules = await prisma.branchStockReorderRule.findMany({
    where: { shopId: Number(shopId), branchId: branch.id },
    include: { inventory: { include: { product: true, productVariant: true } } },
  });

  return {
    data: rules.map((r) => ({
      id: r.uuid,
      inventory_id: r.inventory.uuid,
      product_name: r.inventory.product.name,
      reorder_point: r.reorderPoint,
      reorder_quantity: r.reorderQuantity,
      suggested_reorder_quantity: suggestedReorderQuantity(r.inventory, r),
      is_enabled: r.isEnabled,
    })),
  };
}

export async function bulkUpdateReorderRules({ shopId, branchUuid, rules, userId, req }) {
  const results = [];
  for (const rule of rules) {
    const result = await upsertReorderRule({
      shopId,
      branchUuid,
      inventoryUuid: rule.inventory_id,
      input: rule,
      userId,
      req,
    });
    results.push(result);
  }
  return { updated_count: results.length, data: results };
}

export async function reorderSuggestions({ shopId, branchUuid }) {
  const branch = await ensureBranch(shopId, branchUuid);
  const inventories = await prisma.branchInventory.findMany({
    where: { shopId: Number(shopId), branchId: branch.id, archivedAt: null, isAllocated: true },
    include: { reorderRule: true, product: true, productVariant: true },
  });

  const suggestions = inventories
    .filter((inv) => inv.reorderRule?.isEnabled)
    .map((inv) => {
      const available = quantityAvailable(inv);
      const point = inv.reorderRule.reorderPoint;
      if (available > point) return null;
      return {
        inventory_id: inv.uuid,
        product_name: inv.product.name,
        quantity_available: available,
        reorder_point: point,
        suggested_quantity: suggestedReorderQuantity(inv, inv.reorderRule),
      };
    })
    .filter(Boolean);

  return { data: suggestions };
}
