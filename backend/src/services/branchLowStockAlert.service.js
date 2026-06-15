import { prisma } from "../config/database.js";
import { quantityAvailable } from "../utils/inventoryQuantities.js";
import { toPublicAlert } from "../mappers/branchInventory.mapper.js";

async function resolveOpenAlert(branchInventoryId, alertType) {
  return prisma.branchLowStockAlert.findFirst({
    where: {
      branchInventoryId: Number(branchInventoryId),
      alertType,
      status: { in: ["OPEN", "ACKNOWLEDGED"] },
    },
  });
}

export async function evaluateAlertsForInventory(inventory, branchId, shopId) {
  if (!inventory) return;

  const available = quantityAvailable(inventory);
  const reorderPoint = inventory.reorderRule?.reorderPoint ?? null;
  const ruleEnabled = inventory.reorderRule?.isEnabled ?? false;

  const checks = [];

  if (available <= 0) {
    checks.push({ type: "OUT_OF_STOCK", message: "Product is out of stock" });
  } else if (ruleEnabled && reorderPoint != null && available <= reorderPoint) {
    checks.push({
      type: "LOW_STOCK",
      message: `Available stock (${available}) is at or below reorder point (${reorderPoint})`,
      reorderPoint,
    });
  }

  if (available < 0) {
    checks.push({ type: "NEGATIVE_STOCK", message: "Negative available stock detected" });
  }

  for (const check of checks) {
    const existing = await resolveOpenAlert(inventory.id, check.type);
    if (!existing) {
      await prisma.branchLowStockAlert.create({
        data: {
          shopId: Number(shopId),
          branchId: Number(branchId),
          branchInventoryId: inventory.id,
          alertType: check.type,
          status: "OPEN",
          currentQuantity: available,
          reorderPoint: check.reorderPoint ?? null,
          message: check.message,
        },
      });
    } else {
      await prisma.branchLowStockAlert.update({
        where: { id: existing.id },
        data: { currentQuantity: available, message: check.message },
      });
    }
  }

  const activeTypes = checks.map((c) => c.type);
  const openAlerts = await prisma.branchLowStockAlert.findMany({
    where: {
      branchInventoryId: inventory.id,
      status: { in: ["OPEN", "ACKNOWLEDGED"] },
    },
  });

  for (const alert of openAlerts) {
    const stillActive = activeTypes.includes(alert.alertType);
    const recovered =
      alert.alertType === "LOW_STOCK" &&
      reorderPoint != null &&
      available > reorderPoint;
    const outRecovered = alert.alertType === "OUT_OF_STOCK" && available > 0;

    if (!stillActive || recovered || outRecovered) {
      await prisma.branchLowStockAlert.update({
        where: { id: alert.id },
        data: { status: "RESOLVED", resolvedAt: new Date() },
      });
    }
  }
}

export async function listAlerts({ shopId, branchUuid, query }) {
  const { ensureBranch } = await import("./branchInventoryAllocation.service.js");
  const branch = await ensureBranch(shopId, branchUuid);

  const where = {
    shopId: Number(shopId),
    branchId: branch.id,
    status: query.status ? query.status.toUpperCase() : undefined,
  };

  const alerts = await prisma.branchLowStockAlert.findMany({
    where,
    include: {
      inventory: { include: { product: true, productVariant: true } },
    },
    orderBy: { triggeredAt: "desc" },
    take: Math.min(100, Number(query.limit) || 50),
  });

  const openCount = await prisma.branchLowStockAlert.count({
    where: { shopId: Number(shopId), branchId: branch.id, status: "OPEN" },
  });

  return {
    open_count: openCount,
    data: alerts.map((a) => toPublicAlert(a, a.inventory)),
  };
}

export async function acknowledgeAlert({ shopId, branchUuid, alertUuid, userId, req }) {
  const { ensureBranch } = await import("./branchInventoryAllocation.service.js");
  const branch = await ensureBranch(shopId, branchUuid);

  const alert = await prisma.branchLowStockAlert.findFirst({
    where: { uuid: alertUuid, branchId: branch.id, shopId: Number(shopId) },
  });
  if (!alert) throw new Error("Alert not found");
  if (alert.status !== "OPEN") throw new Error("Only open alerts can be acknowledged");

  const updated = await prisma.branchLowStockAlert.update({
    where: { id: alert.id },
    data: {
      status: "ACKNOWLEDGED",
      acknowledgedAt: new Date(),
      acknowledgedById: userId,
    },
    include: { inventory: { include: { product: true } } },
  });

  const { writeAuditLog } = await import("./auditLog.service.js");
  const { getClientMeta } = await import("../utils/branchHelpers.js");
  await writeAuditLog({
    shopId,
    branchId: branch.id,
    userId,
    action: "branch_inventory.alert.acknowledged",
    entity: "branch_low_stock_alert",
    entityId: alertUuid,
    ...getClientMeta(req),
  });

  return toPublicAlert(updated, updated.inventory);
}

export async function dismissAlert({ shopId, branchUuid, alertUuid, userId, req }) {
  const { ensureBranch } = await import("./branchInventoryAllocation.service.js");
  const branch = await ensureBranch(shopId, branchUuid);

  const alert = await prisma.branchLowStockAlert.findFirst({
    where: { uuid: alertUuid, branchId: branch.id, shopId: Number(shopId) },
  });
  if (!alert) throw new Error("Alert not found");

  const updated = await prisma.branchLowStockAlert.update({
    where: { id: alert.id },
    data: { status: "DISMISSED", resolvedAt: new Date(), resolvedById: userId },
    include: { inventory: { include: { product: true } } },
  });

  const { writeAuditLog } = await import("./auditLog.service.js");
  const { getClientMeta } = await import("../utils/branchHelpers.js");
  await writeAuditLog({
    shopId,
    branchId: branch.id,
    userId,
    action: "branch_inventory.alert.dismissed",
    entity: "branch_low_stock_alert",
    entityId: alertUuid,
    ...getClientMeta(req),
  });

  return toPublicAlert(updated, updated.inventory);
}
