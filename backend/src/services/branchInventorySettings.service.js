import { prisma } from "../config/database.js";
import { BranchInventorySettingsModel } from "../models/branchInventory.model.js";
import { toPublicInventorySettings } from "../mappers/branchInventory.mapper.js";
import { ensureBranch } from "./branchInventoryAllocation.service.js";
import { writeAuditLog } from "./auditLog.service.js";
import { getClientMeta } from "../utils/branchHelpers.js";

export async function getInventorySettings({ shopId, branchUuid }) {
  const branch = await ensureBranch(shopId, branchUuid);
  const settings = await BranchInventorySettingsModel.getOrCreate(branch.id, shopId);

  const agg = await prisma.branchInventory.aggregate({
    where: { branchId: branch.id, archivedAt: null, isAllocated: true },
    _sum: { quantityOnHand: true },
  });

  return toPublicInventorySettings(settings, agg._sum.quantityOnHand ?? 0);
}

export async function updateInventorySettings({ shopId, branchUuid, input, userId, req }) {
  const branch = await ensureBranch(shopId, branchUuid);
  await BranchInventorySettingsModel.getOrCreate(branch.id, shopId);

  const data = {};
  if (input.allocation_mode) {
    data.allocationMode = input.allocation_mode.toUpperCase();
  }
  if (input.low_stock_threshold != null) data.lowStockThreshold = input.low_stock_threshold;
  if (input.reorder_rules !== undefined) data.reorderRulesText = input.reorder_rules;
  if (input.transfer_approval_required != null) {
    data.transferApprovalRequired = input.transfer_approval_required;
  }
  if (input.valuation_method) {
    data.valuationMethod = input.valuation_method.toUpperCase().replace(/-/g, "_");
  }

  const updated = await BranchInventorySettingsModel.update(branch.id, data);

  await writeAuditLog({
    shopId,
    branchId: branch.id,
    userId,
    action: "branch_inventory.settings.updated",
    entity: "branch_inventory_settings",
    entityId: String(branch.id),
    newValues: input,
    ...getClientMeta(req),
  });

  const agg = await prisma.branchInventory.aggregate({
    where: { branchId: branch.id, archivedAt: null, isAllocated: true },
    _sum: { quantityOnHand: true },
  });

  return toPublicInventorySettings(updated, agg._sum.quantityOnHand ?? 0);
}
