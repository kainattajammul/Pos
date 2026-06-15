import { prisma } from "../config/database.js";
import { ApiError } from "../utils/ApiError.js";
import { HTTP } from "../constants/httpStatus.js";
import { BranchModel } from "../models/branch.model.js";
import {
  BranchInventoryModel,
  BranchStockTransferModel,
  ProductModel,
} from "../models/branchInventory.model.js";
import {
  assertTransition,
  isTerminalStatus,
  canEditTransfer,
  resolveActionStatus,
} from "./branchStockTransferStateMachine.service.js";
import {
  applyInventoryChange,
  afterStockChange,
  reloadInventory,
} from "./branchStockMovement.service.js";
import { toPublicTransferSummary } from "../mappers/branchInventory.mapper.js";
import { writeAuditLog } from "./auditLog.service.js";
import { getClientMeta } from "../utils/branchHelpers.js";
import { quantityAvailable } from "../utils/inventoryQuantities.js";

async function generateTransferNumber(tx) {
  const year = new Date().getFullYear();
  const prefix = `TRF-${year}-`;
  const last = await tx.branchStockTransfer.findFirst({
    where: { transferNumber: { startsWith: prefix } },
    orderBy: { transferNumber: "desc" },
  });
  const seq = last ? Number(last.transferNumber.split("-").pop()) + 1 : 1;
  return `${prefix}${String(seq).padStart(6, "0")}`;
}

async function recordHistory(tx, transferId, fromStatus, toStatus, action, userId, notes) {
  await tx.branchStockTransferHistory.create({
    data: {
      transferId,
      fromStatus,
      toStatus,
      action,
      notes,
      performedById: userId,
    },
  });
}

async function getTransferOrThrow(uuid, shopId) {
  const transfer = await BranchStockTransferModel.findByUuid(uuid, shopId);
  if (!transfer) throw new ApiError(HTTP.NOT_FOUND, "Transfer not found");
  return transfer;
}

async function resolveBranch(shopId, branchUuid) {
  const branch = await BranchModel.findByUuid(branchUuid, shopId);
  if (!branch) throw new ApiError(HTTP.NOT_FOUND, "Branch not found");
  return branch;
}

async function ensureSecurityRule(shopId, branchId, ruleKey) {
  const rule = await prisma.branchSecurityRule.findFirst({
    where: { shopId: Number(shopId), branchId: Number(branchId), ruleKey },
  });
  return rule?.value?.enabled === true;
}

export async function createTransfer({
  shopId,
  branchUuid,
  destinationBranchUuid,
  items,
  requestNotes,
  userId,
  req,
}) {
  const sourceBranch = await resolveBranch(shopId, branchUuid);
  const destBranch = await resolveBranch(shopId, destinationBranchUuid);

  if (sourceBranch.id === destBranch.id) {
    throw new ApiError(HTTP.BAD_REQUEST, "Source and destination branches must differ");
  }

  const settings = await prisma.branchInventorySettings.findUnique({
    where: { branchId: sourceBranch.id },
  });

  const transfer = await prisma.$transaction(async (tx) => {
    const transferNumber = await generateTransferNumber(tx);
    const created = await tx.branchStockTransfer.create({
      data: {
        transferNumber,
        shopId: Number(shopId),
        sourceBranchId: sourceBranch.id,
        destinationBranchId: destBranch.id,
        status: "DRAFT",
        requestedById: userId,
        requestNotes,
      },
    });

    for (const item of items) {
      if (item.requested_quantity <= 0) {
        throw new ApiError(HTTP.BAD_REQUEST, "Requested quantity must be positive");
      }

      const inventory = await tx.branchInventory.findFirst({
        where: {
          uuid: item.source_inventory_id,
          branchId: sourceBranch.id,
          shopId: Number(shopId),
          archivedAt: null,
        },
      });
      if (!inventory) throw new ApiError(HTTP.NOT_FOUND, "Source inventory not found");
      if (!inventory.isTransferable) {
        throw new ApiError(HTTP.BAD_REQUEST, "Product is not transferable from this branch");
      }

      await tx.branchStockTransferItem.create({
        data: {
          transferId: created.id,
          productId: inventory.productId,
          productVariantId: inventory.productVariantId,
          sourceInventoryId: inventory.id,
          requestedQuantity: item.requested_quantity,
          notes: item.notes,
          unitCost: inventory.averageCost ?? inventory.latestPurchaseCost,
        },
      });
    }

    await recordHistory(tx, created.id, null, "DRAFT", "created", userId, requestNotes);
    return created;
  });

  const meta = getClientMeta(req);
  await writeAuditLog({
    shopId,
    branchId: sourceBranch.id,
    userId,
    action: "branch_inventory.transfer.created",
    entity: "branch_stock_transfer",
    entityId: transfer.uuid,
    ...meta,
  });

  return getTransfer(shopId, transfer.uuid, { userId });
}

export async function getTransfer(shopId, transferUuid, { userId, permissions } = {}) {
  const transfer = await getTransferOrThrow(transferUuid, shopId);
  return toPublicTransferSummary(transfer, { userId, permissions });
}

export async function listTransfers({ shopId, branchUuid, query, userId, permissions }) {
  const branch = await resolveBranch(shopId, branchUuid);
  const page = Math.max(1, Number(query.page) || 1);
  const limit = Math.min(100, Math.max(1, Number(query.limit) || 25));
  const skip = (page - 1) * limit;

  const direction = query.direction ?? "all";
  const where = { shopId: Number(shopId) };
  if (direction === "outgoing") where.sourceBranchId = branch.id;
  else if (direction === "incoming") where.destinationBranchId = branch.id;
  else {
    where.OR = [{ sourceBranchId: branch.id }, { destinationBranchId: branch.id }];
  }
  if (query.status) where.status = query.status.toUpperCase();

  const [rows, total] = await Promise.all([
    BranchStockTransferModel.list(where, { skip, take: limit }),
    BranchStockTransferModel.count(where),
  ]);

  return {
    data: rows.map((t) => toPublicTransferSummary(t, { userId, permissions })),
    pagination: { page, limit, total, total_pages: Math.ceil(total / limit) },
  };
}

export async function submitTransfer({ shopId, branchUuid, transferUuid, userId, req }) {
  const transfer = await getTransferOrThrow(transferUuid, shopId);
  if (transfer.requestedById !== userId) {
    throw new ApiError(HTTP.FORBIDDEN, "Only the requester can submit this transfer");
  }

  const settings = await prisma.branchInventorySettings.findUnique({
    where: { branchId: transfer.sourceBranchId },
  });
  const nextStatus = settings?.transferApprovalRequired ? "PENDING_APPROVAL" : "APPROVED";

  return transitionTransfer({
    shopId,
    transfer,
    toStatus: transfer.status === "DRAFT" ? "REQUESTED" : transfer.status,
    userId,
    req,
    action: "submit",
    afterSubmit: async (tx, t) => {
      assertTransition(t.status, "REQUESTED");
      await tx.branchStockTransfer.update({
        where: { id: t.id },
        data: { status: "REQUESTED" },
      });
      await recordHistory(tx, t.id, t.status, "REQUESTED", "submitted", userId, null);

      assertTransition("REQUESTED", nextStatus);
      await tx.branchStockTransfer.update({
        where: { id: t.id },
        data: { status: nextStatus },
      });
      await recordHistory(tx, t.id, "REQUESTED", nextStatus, "submitted_for_approval", userId, null);

      if (nextStatus === "APPROVED") {
        await reserveApprovedStock(tx, t, t.items, userId);
      }
    },
  });
}

async function reserveApprovedStock(tx, transfer, items, userId, approvals) {
  for (const item of items) {
    const approvedQty = approvals?.find((a) => a.item_id === item.uuid)?.approved_quantity ?? item.requestedQuantity;
    if (!approvedQty || approvedQty <= 0) continue;

    const inv = await reloadInventory(tx, item.sourceInventoryId);
    const available = quantityAvailable(inv);
    if (available < approvedQty) {
      throw new ApiError(HTTP.BAD_REQUEST, `Insufficient available stock for ${item.productId}`);
    }

    await applyInventoryChange({
      tx,
      inventory: inv,
      shopId: transfer.shopId,
      branchId: transfer.sourceBranchId,
      movementType: "TRANSFER_APPROVED",
      field: "quantityReserved",
      delta: approvedQty,
      transferId: transfer.id,
      transferItemId: item.id,
      performedById: userId,
    });

    await applyInventoryChange({
      tx,
      inventory: inv,
      shopId: transfer.shopId,
      branchId: transfer.sourceBranchId,
      movementType: "TRANSFER_APPROVED",
      field: "quantityOutgoing",
      delta: approvedQty,
      transferId: transfer.id,
      transferItemId: item.id,
      performedById: userId,
    });

    await tx.branchStockTransferItem.update({
      where: { id: item.id },
      data: { approvedQuantity: approvedQty },
    });
  }
}

export async function approveTransfer({
  shopId,
  branchUuid,
  transferUuid,
  itemApprovals,
  approvalNotes,
  userId,
  req,
}) {
  const transfer = await getTransferOrThrow(transferUuid, shopId);

  const preventSelf = await ensureSecurityRule(
    shopId,
    transfer.sourceBranchId,
    "prevent_self_transfer_approval",
  );
  if (preventSelf && transfer.requestedById === userId) {
    throw new ApiError(HTTP.FORBIDDEN, "Cannot approve your own transfer request");
  }

  const toStatus = resolveActionStatus("approve", transfer, itemApprovals);

  await prisma.$transaction(async (tx) => {
    const fresh = await tx.branchStockTransfer.findUnique({
      where: { id: transfer.id },
      include: { items: true },
    });
    assertTransition(fresh.status, toStatus);

    await reserveApprovedStock(tx, fresh, fresh.items, userId, itemApprovals);

    await tx.branchStockTransfer.update({
      where: { id: fresh.id },
      data: {
        status: toStatus,
        approvedById: userId,
        approvedAt: new Date(),
        approvalNotes,
      },
    });
    await recordHistory(tx, fresh.id, fresh.status, toStatus, "approved", userId, approvalNotes);
  });

  await writeAuditLog({
    shopId,
    branchId: transfer.sourceBranchId,
    userId,
    action: toStatus === "PARTIALLY_APPROVED" ? "branch_inventory.transfer.partially_approved" : "branch_inventory.transfer.approved",
    entity: "branch_stock_transfer",
    entityId: transferUuid,
    ...getClientMeta(req),
  });

  return getTransfer(shopId, transferUuid, { userId });
}

export async function rejectTransfer({ shopId, transferUuid, rejectionReason, userId, req }) {
  const transfer = await getTransferOrThrow(transferUuid, shopId);
  assertTransition(transfer.status, "REJECTED");

  await prisma.$transaction(async (tx) => {
    await tx.branchStockTransfer.update({
      where: { id: transfer.id },
      data: {
        status: "REJECTED",
        rejectedById: userId,
        rejectedAt: new Date(),
        rejectionReason,
      },
    });
    await recordHistory(tx, transfer.id, transfer.status, "REJECTED", "rejected", userId, rejectionReason);
  });

  await writeAuditLog({
    shopId,
    branchId: transfer.sourceBranchId,
    userId,
    action: "branch_inventory.transfer.rejected",
    entity: "branch_stock_transfer",
    entityId: transferUuid,
    reason: rejectionReason,
    ...getClientMeta(req),
  });

  return getTransfer(shopId, transferUuid, { userId });
}

export async function dispatchTransfer({
  shopId,
  transferUuid,
  itemDispatches,
  dispatchNotes,
  userId,
  req,
}) {
  const transfer = await getTransferOrThrow(transferUuid, shopId);
  assertTransition(transfer.status, "DISPATCHED");

  await prisma.$transaction(async (tx) => {
    const fresh = await tx.branchStockTransfer.findUnique({
      where: { id: transfer.id },
      include: { items: true, destinationBranch: true },
    });

    for (const item of fresh.items) {
      const dispatchInput = itemDispatches?.find((d) => d.item_id === item.uuid);
      const dispatchQty = dispatchInput?.dispatched_quantity ?? item.approvedQuantity ?? 0;
      if (dispatchQty <= 0) continue;
      if (dispatchQty > (item.approvedQuantity ?? 0)) {
        throw new ApiError(HTTP.BAD_REQUEST, "Dispatched quantity exceeds approved quantity");
      }

      let sourceInv = await reloadInventory(tx, item.sourceInventoryId);
      await applyInventoryChange({
        tx,
        inventory: sourceInv,
        shopId: transfer.shopId,
        branchId: transfer.sourceBranchId,
        movementType: "TRANSFER_DISPATCHED",
        field: "quantityOnHand",
        delta: -dispatchQty,
        transferId: transfer.id,
        transferItemId: item.id,
        performedById: userId,
      });

      sourceInv = await reloadInventory(tx, item.sourceInventoryId);
      const reservedRelease = Math.min(sourceInv.quantityReserved, dispatchQty);
      if (reservedRelease > 0) {
        await applyInventoryChange({
          tx,
          inventory: sourceInv,
          shopId: transfer.shopId,
          branchId: transfer.sourceBranchId,
          movementType: "RESERVATION_RELEASE",
          field: "quantityReserved",
          delta: -reservedRelease,
          transferId: transfer.id,
          transferItemId: item.id,
          performedById: userId,
        });
      }

      sourceInv = await reloadInventory(tx, item.sourceInventoryId);
      const outgoingClear = Math.min(sourceInv.quantityOutgoing, dispatchQty);
      if (outgoingClear > 0) {
        await applyInventoryChange({
          tx,
          inventory: sourceInv,
          shopId: transfer.shopId,
          branchId: transfer.sourceBranchId,
          movementType: "TRANSFER_DISPATCHED",
          field: "quantityOutgoing",
          delta: -outgoingClear,
          transferId: transfer.id,
          transferItemId: item.id,
          performedById: userId,
        });
      }

      let destInv = item.destinationInventoryId
        ? await reloadInventory(tx, item.destinationInventoryId)
        : null;

      if (!destInv) {
        destInv = await tx.branchInventory.create({
          data: {
            shopId: transfer.shopId,
            branchId: transfer.destinationBranchId,
            productId: item.productId,
            productVariantId: item.productVariantId,
            sku: sourceInv.sku,
            barcode: sourceInv.barcode,
          },
        });
        await tx.branchStockTransferItem.update({
          where: { id: item.id },
          data: { destinationInventoryId: destInv.id },
        });
      }

      await applyInventoryChange({
        tx,
        inventory: destInv,
        shopId: transfer.shopId,
        branchId: transfer.destinationBranchId,
        movementType: "TRANSFER_DISPATCHED",
        field: "quantityIncoming",
        delta: dispatchQty,
        transferId: transfer.id,
        transferItemId: item.id,
        performedById: userId,
      });

      await tx.branchStockTransferItem.update({
        where: { id: item.id },
        data: { dispatchedQuantity: dispatchQty },
      });
    }

    await tx.branchStockTransfer.update({
      where: { id: fresh.id },
      data: {
        status: "DISPATCHED",
        dispatchedById: userId,
        dispatchedAt: new Date(),
        dispatchNotes,
      },
    });
    await recordHistory(tx, fresh.id, fresh.status, "DISPATCHED", "dispatched", userId, dispatchNotes);
  });

  await writeAuditLog({
    shopId,
    branchId: transfer.sourceBranchId,
    userId,
    action: "branch_inventory.transfer.dispatched",
    entity: "branch_stock_transfer",
    entityId: transferUuid,
    ...getClientMeta(req),
  });

  return getTransfer(shopId, transferUuid, { userId });
}

export async function receiveTransfer({
  shopId,
  transferUuid,
  itemReceipts,
  receivingNotes,
  userId,
  req,
}) {
  const transfer = await getTransferOrThrow(transferUuid, shopId);
  if (!["DISPATCHED", "PARTIALLY_RECEIVED"].includes(transfer.status)) {
    throw new ApiError(HTTP.BAD_REQUEST, "Transfer is not ready for receiving");
  }

  let finalStatus = "RECEIVED";

  await prisma.$transaction(async (tx) => {
    const fresh = await tx.branchStockTransfer.findUnique({
      where: { id: transfer.id },
      include: { items: true },
    });

    let anyPartial = false;

    for (const item of fresh.items) {
      const receipt = itemReceipts?.find((r) => r.item_id === item.uuid);
      const received = receipt?.received_quantity ?? item.dispatchedQuantity ?? 0;
      const damaged = receipt?.damaged_quantity ?? 0;
      const rejected = receipt?.rejected_quantity ?? 0;
      const dispatched = item.dispatchedQuantity ?? 0;

      if (received + damaged + rejected > dispatched) {
        throw new ApiError(HTTP.BAD_REQUEST, "Received quantities exceed dispatched quantity");
      }
      if (received < dispatched) anyPartial = true;

      const destInv = await reloadInventory(tx, item.destinationInventoryId);
      if (received > 0) {
        await applyInventoryChange({
          tx,
          inventory: destInv,
          shopId: transfer.shopId,
          branchId: transfer.destinationBranchId,
          movementType: "TRANSFER_RECEIVED",
          field: "quantityOnHand",
          delta: received,
          unitCost: item.unitCost,
          transferId: transfer.id,
          transferItemId: item.id,
          performedById: userId,
        });
      }

      if (dispatched > 0) {
        await applyInventoryChange({
          tx,
          inventory: destInv,
          shopId: transfer.shopId,
          branchId: transfer.destinationBranchId,
          movementType: "TRANSFER_RECEIVED",
          field: "quantityIncoming",
          delta: -dispatched,
          transferId: transfer.id,
          transferItemId: item.id,
          performedById: userId,
        });
      }

      const sourceInv = await reloadInventory(tx, item.sourceInventoryId);
      if (dispatched > 0) {
        await applyInventoryChange({
          tx,
          inventory: sourceInv,
          shopId: transfer.shopId,
          branchId: transfer.sourceBranchId,
          movementType: "TRANSFER_RECEIVED",
          field: "quantityOutgoing",
          delta: -dispatched,
          transferId: transfer.id,
          transferItemId: item.id,
          performedById: userId,
        });
      }

      if (damaged > 0) {
        await applyInventoryChange({
          tx,
          inventory: destInv,
          shopId: transfer.shopId,
          branchId: transfer.destinationBranchId,
          movementType: "DAMAGE",
          field: "quantityDamaged",
          delta: damaged,
          transferId: transfer.id,
          transferItemId: item.id,
          performedById: userId,
        });
      }

      await tx.branchStockTransferItem.update({
        where: { id: item.id },
        data: {
          receivedQuantity: received,
          damagedQuantity: damaged,
          rejectedQuantity: rejected,
        },
      });

      await afterStockChange(destInv, transfer.destinationBranchId, transfer.shopId);
    }

    finalStatus = anyPartial ? "PARTIALLY_RECEIVED" : "RECEIVED";
    if (finalStatus === "PARTIALLY_RECEIVED" && !anyPartial) finalStatus = "RECEIVED";

    await tx.branchStockTransfer.update({
      where: { id: fresh.id },
      data: {
        status: finalStatus,
        receivedById: userId,
        receivedAt: new Date(),
        receivingNotes,
      },
    });
    await recordHistory(tx, fresh.id, fresh.status, finalStatus, "received", userId, receivingNotes);
  });

  await writeAuditLog({
    shopId,
    branchId: transfer.destinationBranchId,
    userId,
    action:
      finalStatus === "PARTIALLY_RECEIVED"
        ? "branch_inventory.transfer.partially_received"
        : "branch_inventory.transfer.received",
    entity: "branch_stock_transfer",
    entityId: transferUuid,
    ...getClientMeta(req),
  });

  return getTransfer(shopId, transferUuid, { userId });
}

export async function cancelTransfer({ shopId, transferUuid, cancellationReason, userId, req }) {
  const transfer = await getTransferOrThrow(transferUuid, shopId);
  assertTransition(transfer.status, "CANCELLED");

  await prisma.$transaction(async (tx) => {
    const fresh = await tx.branchStockTransfer.findUnique({
      where: { id: transfer.id },
      include: { items: true },
    });

    for (const item of fresh.items) {
      const reserved = item.approvedQuantity ?? 0;
      if (reserved <= 0) continue;
      const inv = await reloadInventory(tx, item.sourceInventoryId);

      await applyInventoryChange({
        tx,
        inventory: inv,
        shopId: transfer.shopId,
        branchId: transfer.sourceBranchId,
        movementType: "TRANSFER_CANCELLED",
        field: "quantityReserved",
        delta: -reserved,
        transferId: transfer.id,
        transferItemId: item.id,
        performedById: userId,
      });
      await applyInventoryChange({
        tx,
        inventory: inv,
        shopId: transfer.shopId,
        branchId: transfer.sourceBranchId,
        movementType: "TRANSFER_CANCELLED",
        field: "quantityOutgoing",
        delta: -reserved,
        transferId: transfer.id,
        transferItemId: item.id,
        performedById: userId,
      });
    }

    await tx.branchStockTransfer.update({
      where: { id: fresh.id },
      data: {
        status: "CANCELLED",
        cancelledById: userId,
        cancelledAt: new Date(),
        cancellationReason,
      },
    });
    await recordHistory(tx, fresh.id, fresh.status, "CANCELLED", "cancelled", userId, cancellationReason);
  });

  await writeAuditLog({
    shopId,
    branchId: transfer.sourceBranchId,
    userId,
    action: "branch_inventory.transfer.cancelled",
    entity: "branch_stock_transfer",
    entityId: transferUuid,
    reason: cancellationReason,
    ...getClientMeta(req),
  });

  return getTransfer(shopId, transferUuid, { userId });
}

async function transitionTransfer({ shopId, transfer, userId, req, action, afterSubmit }) {
  await prisma.$transaction(async (tx) => {
    await afterSubmit(tx, transfer);
  });
  return getTransfer(shopId, transfer.uuid, { userId });
}

export { canEditTransfer, isTerminalStatus };
