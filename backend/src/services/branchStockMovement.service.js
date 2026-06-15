import { prisma } from "../config/database.js";
import { ApiError } from "../utils/ApiError.js";
import { HTTP } from "../constants/httpStatus.js";
import { quantityAvailable, assertQuantityNonNegative } from "../utils/inventoryQuantities.js";
import { multiplyDecimal, toDecimal } from "../utils/inventoryDecimal.js";
import { BranchStockMovementModel } from "../models/branchInventory.model.js";
import { evaluateAlertsForInventory } from "./branchLowStockAlert.service.js";

/**
 * Apply a stock field change with optimistic locking and movement ledger entry.
 * @param {object} params
 * @param {import('@prisma/client').Prisma.TransactionClient} params.tx
 */
export async function applyInventoryChange({
  tx,
  inventory,
  shopId,
  branchId,
  movementType,
  field,
  delta,
  allowNegative = false,
  unitCost = null,
  referenceType = null,
  referenceId = null,
  transferId = null,
  transferItemId = null,
  reasonCode = null,
  notes = null,
  performedById = null,
  approvedById = null,
}) {
  const before = inventory[field] ?? 0;
  const after = before + delta;
  assertQuantityNonNegative(after, field, allowNegative);

  const updated = await tx.branchInventory.updateMany({
    where: { id: inventory.id, version: inventory.version },
    data: {
      [field]: after,
      version: { increment: 1 },
      lastStockMovementAt: new Date(),
    },
  });

  if (updated.count !== 1) {
    throw new ApiError(HTTP.CONFLICT, "Inventory was modified concurrently; please retry");
  }

  const totalCost =
    unitCost != null && delta !== 0 ? multiplyDecimal(unitCost, Math.abs(delta)) : null;

  await BranchStockMovementModel.create(
    {
      shopId: Number(shopId),
      branchId: Number(branchId),
      branchInventoryId: inventory.id,
      movementType,
      quantity: Math.abs(delta),
      quantityBefore: before,
      quantityAfter: after,
      unitCost: unitCost != null ? toDecimal(unitCost) : null,
      totalCost,
      referenceType,
      referenceId: referenceId != null ? String(referenceId) : null,
      transferId: transferId != null ? Number(transferId) : null,
      transferItemId: transferItemId != null ? Number(transferItemId) : null,
      reasonCode,
      notes,
      performedById: performedById != null ? Number(performedById) : null,
      approvedById: approvedById != null ? Number(approvedById) : null,
    },
    tx,
  );

  const fresh = await tx.branchInventory.findUnique({
    where: { id: inventory.id },
    include: { reorderRule: true, product: true },
  });

  return fresh;
}

export async function reloadInventory(tx, inventoryId) {
  return tx.branchInventory.findUnique({
    where: { id: Number(inventoryId) },
    include: { reorderRule: true, product: true, productVariant: true },
  });
}

export async function afterStockChange(inventory, branchId, shopId) {
  if (!inventory) return;
  await evaluateAlertsForInventory(inventory, branchId, shopId);
}

export function hasStock(inventory) {
  return (
    inventory.quantityOnHand > 0 ||
    inventory.quantityReserved > 0 ||
    inventory.quantityIncoming > 0 ||
    inventory.quantityOutgoing > 0 ||
    inventory.quantityDamaged > 0 ||
    inventory.quantityInRepair > 0
  );
}

export function snapshotQuantities(inventory) {
  return {
    quantity_on_hand: inventory.quantityOnHand,
    quantity_reserved: inventory.quantityReserved,
    quantity_available: quantityAvailable(inventory),
    quantity_incoming: inventory.quantityIncoming,
    quantity_outgoing: inventory.quantityOutgoing,
  };
}
