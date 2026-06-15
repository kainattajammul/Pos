import { quantityAvailable, isLowStock, isOutOfStock } from "../utils/inventoryQuantities.js";
import { decimalToString, multiplyDecimal } from "../utils/inventoryDecimal.js";
import {
  TRANSFER_STATUS_LABELS,
  VALUATION_METHOD_API,
  ALLOCATION_MODE_API,
  ALERT_SEVERITY,
} from "../constants/inventoryEnums.js";

export function toApiTransferStatus(status) {
  const value = status.toLowerCase();
  return { value, label: TRANSFER_STATUS_LABELS[status] ?? status };
}

export function toApiValuationMethod(method) {
  return VALUATION_METHOD_API[method] ?? method.toLowerCase();
}

export function toApiAllocationMode(mode) {
  return ALLOCATION_MODE_API[mode] ?? mode.toLowerCase();
}

export function toPublicInventoryItem(row, { permissions = {} } = {}) {
  const available = quantityAvailable(row);
  const reorderPoint = row.reorderRule?.reorderPoint ?? null;
  const unitCost = row.averageCost ?? row.latestPurchaseCost ?? row.product?.standardCost ?? null;
  const sellingPrice = row.branchSellingPrice ?? row.productVariant?.salePrice ?? row.product?.salePrice ?? null;
  const stockValue = unitCost != null ? multiplyDecimal(unitCost, row.quantityOnHand) : null;

  return {
    id: row.uuid,
    product_id: row.product?.uuid,
    product_variant_id: row.productVariant?.uuid ?? null,
    product_name: row.product?.name,
    variant_name: row.productVariant?.name ?? null,
    sku: row.sku ?? row.productVariant?.sku ?? row.product?.sku,
    barcode: row.barcode ?? row.productVariant?.barcode ?? row.product?.barcode,
    category: row.product?.category?.name ?? null,
    image: row.product?.imageUrl ?? null,
    branch_name: row.branch?.name,
    quantity_on_hand: row.quantityOnHand,
    quantity_reserved: row.quantityReserved,
    quantity_available: available,
    quantity_incoming: row.quantityIncoming,
    quantity_outgoing: row.quantityOutgoing,
    quantity_damaged: row.quantityDamaged,
    quantity_in_repair: row.quantityInRepair,
    reorder_level: reorderPoint,
    reorder_quantity: row.reorderRule?.reorderQuantity ?? null,
    is_low_stock: reorderPoint != null ? isLowStock(available, reorderPoint) : false,
    is_out_of_stock: isOutOfStock(available),
    shelf_location: row.shelfLocation,
    bin_location: row.binLocation,
    unit_cost: decimalToString(unitCost),
    average_cost: decimalToString(row.averageCost),
    selling_price: decimalToString(sellingPrice, 2),
    total_stock_value: decimalToString(stockValue, 2),
    is_allocated: row.isAllocated,
    is_sellable: row.isSellable,
    is_transferable: row.isTransferable,
    last_movement_date: row.lastStockMovementAt?.toISOString() ?? null,
    last_stock_count_date: row.lastCountedAt?.toISOString() ?? null,
    available_actions: {
      can_update: Boolean(permissions.canUpdate),
      can_adjust: Boolean(permissions.canAdjust),
      can_archive: Boolean(permissions.canAllocate),
    },
  };
}

export function toPublicTransferSummary(transfer, { userId, permissions = {} } = {}) {
  const items = transfer.items ?? [];
  const sum = (field) => items.reduce((acc, i) => acc + (i[field] ?? 0), 0);

  const status = toApiTransferStatus(transfer.status);
  const isRequester = userId && transfer.requestedById === userId;
  const terminal = ["RECEIVED", "REJECTED", "CANCELLED"].includes(transfer.status);

  return {
    id: transfer.uuid,
    transfer_number: transfer.transferNumber,
    source_branch: transfer.sourceBranch
      ? { id: transfer.sourceBranch.uuid, name: transfer.sourceBranch.name }
      : null,
    destination_branch: transfer.destinationBranch
      ? { id: transfer.destinationBranch.uuid, name: transfer.destinationBranch.name }
      : null,
    status,
    items_count: items.length,
    requested_quantity: sum("requestedQuantity"),
    approved_quantity: items.some((i) => i.approvedQuantity != null) ? sum("approvedQuantity") : null,
    dispatched_quantity: items.some((i) => i.dispatchedQuantity != null) ? sum("dispatchedQuantity") : null,
    received_quantity: items.some((i) => i.receivedQuantity != null) ? sum("receivedQuantity") : null,
    requested_by: { id: String(transfer.requestedById) },
    requested_at: transfer.requestedAt.toISOString(),
    available_actions: {
      can_edit: !terminal && transfer.status === "DRAFT" && isRequester,
      can_submit: transfer.status === "DRAFT" && isRequester,
      can_approve: permissions.canApprove && ["PENDING_APPROVAL", "REQUESTED"].includes(transfer.status),
      can_reject: permissions.canReject && ["PENDING_APPROVAL", "REQUESTED", "APPROVED", "PARTIALLY_APPROVED"].includes(transfer.status),
      can_dispatch: permissions.canDispatch && ["APPROVED", "PARTIALLY_APPROVED", "READY_FOR_DISPATCH"].includes(transfer.status),
      can_receive: permissions.canReceive && ["DISPATCHED", "PARTIALLY_RECEIVED"].includes(transfer.status),
      can_cancel: permissions.canCancel && !terminal,
    },
  };
}

export function toPublicAlert(alert, inventory) {
  return {
    id: alert.uuid,
    alert_type: alert.alertType.toLowerCase(),
    status: alert.status.toLowerCase(),
    severity: ALERT_SEVERITY[alert.alertType] ?? "medium",
    product_name: inventory?.product?.name,
    sku: inventory?.sku ?? inventory?.product?.sku,
    current_quantity: alert.currentQuantity,
    reorder_point: alert.reorderPoint,
    message: alert.message,
    triggered_at: alert.triggeredAt.toISOString(),
    suggested_action:
      alert.alertType === "OUT_OF_STOCK" ? "Reorder or transfer stock" : "Review reorder rules",
  };
}

export function toPublicInventorySettings(settings, stockLevel) {
  return {
    allocation_mode: toApiAllocationMode(settings.allocationMode),
    stock_level: stockLevel,
    low_stock_threshold: settings.lowStockThreshold,
    reorder_rules: settings.reorderRulesText ?? "",
    transfer_approval_required: settings.transferApprovalRequired,
    valuation_method: toApiValuationMethod(settings.valuationMethod),
    currency: settings.currency,
  };
}
