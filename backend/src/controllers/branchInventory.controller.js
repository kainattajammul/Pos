import * as AllocationService from "../services/branchInventoryAllocation.service.js";
import * as StockLevelService from "../services/branchStockLevel.service.js";
import * as ReorderService from "../services/branchReorderRule.service.js";
import * as AlertService from "../services/branchLowStockAlert.service.js";
import * as TransferService from "../services/branchStockTransfer.service.js";
import * as ProductAvailabilityService from "../services/branchProductAvailability.service.js";
import * as ServiceAvailabilityService from "../services/branchServiceAvailability.service.js";
import * as ValuationService from "../services/branchStockValuation.service.js";
import * as SettingsService from "../services/branchInventorySettings.service.js";
import { BRANCH_INVENTORY_PERMISSIONS as P } from "../constants/branchInventoryPermissions.js";

function ctx(req) {
  return {
    shopId: req.shopId,
    branchUuid: req.params.branchUuid,
    userId: req.authContext?.userId ?? req.user?.id,
    req,
    permissions: req.inventoryPermissions ?? {},
  };
}

function transferPermissions(req) {
  const perms = req.authContext?.permissions ?? [];
  return {
    canApprove: perms.includes(P.TRANSFER_APPROVE),
    canReject: perms.includes(P.TRANSFER_REJECT),
    canDispatch: perms.includes(P.TRANSFER_DISPATCH),
    canReceive: perms.includes(P.TRANSFER_RECEIVE),
    canCancel: perms.includes(P.TRANSFER_CANCEL),
  };
}

export const BranchInventoryController = {
  async getSettings(req, res) {
    const data = await SettingsService.getInventorySettings(ctx(req));
    res.json({ success: true, data });
  },

  async updateSettings(req, res) {
    const data = await SettingsService.updateInventorySettings({ ...ctx(req), input: req.body });
    res.json({ success: true, data });
  },

  async listInventory(req, res) {
    const result = await AllocationService.listInventory({ ...ctx(req), query: req.query });
    res.json({ success: true, ...result });
  },

  async allocate(req, res) {
    const data = await AllocationService.allocateProduct({
      ...ctx(req),
      productUuid: req.body.product_id,
      productVariantUuid: req.body.product_variant_id,
      openingQuantity: req.body.opening_quantity ?? 0,
      unitCost: req.body.unit_cost,
      branchSellingPrice: req.body.branch_selling_price,
      shelfLocation: req.body.shelf_location,
      binLocation: req.body.bin_location,
      isSellable: req.body.is_sellable,
      isTransferable: req.body.is_transferable,
      isPurchasable: req.body.is_purchasable,
    });
    res.status(201).json({ success: true, data });
  },

  async bulkAllocate(req, res) {
    const data = await AllocationService.bulkAllocate({
      ...ctx(req),
      items: req.body.items ?? [],
    });
    res.status(201).json({ success: true, data });
  },

  async getInventoryItem(req, res) {
    const data = await AllocationService.getInventoryItem({
      ...ctx(req),
      inventoryUuid: req.params.inventoryUuid,
    });
    res.json({ success: true, data });
  },

  async updateInventoryItem(req, res) {
    const data = await AllocationService.updateAllocation({
      ...ctx(req),
      inventoryUuid: req.params.inventoryUuid,
      patch: req.body,
    });
    res.json({ success: true, data });
  },

  async archiveInventoryItem(req, res) {
    const data = await AllocationService.archiveAllocation({
      ...ctx(req),
      inventoryUuid: req.params.inventoryUuid,
    });
    res.json({ success: true, data });
  },

  async listStockLevels(req, res) {
    const result = await StockLevelService.listStockLevels({ ...ctx(req), query: req.query });
    res.json({ success: true, ...result });
  },

  async listMovements(req, res) {
    const result = await StockLevelService.listMovements({
      ...ctx(req),
      inventoryUuid: req.params.inventoryUuid,
      query: req.query,
    });
    res.json({ success: true, ...result });
  },

  async adjustStock(req, res) {
    const data = await StockLevelService.adjustStock({
      ...ctx(req),
      inventoryUuid: req.params.inventoryUuid,
      adjustmentType: req.body.adjustment_type,
      quantity: req.body.quantity,
      reasonCode: req.body.reason_code,
      notes: req.body.notes,
    });
    res.json({ success: true, data });
  },

  async stockCount(req, res) {
    const data = await StockLevelService.stockCount({
      ...ctx(req),
      inventoryUuid: req.params.inventoryUuid,
      countedQuantity: req.body.counted_quantity,
      notes: req.body.notes,
    });
    res.json({ success: true, data });
  },

  async listReorderRules(req, res) {
    const result = await ReorderService.listReorderRules(ctx(req));
    res.json({ success: true, ...result });
  },

  async upsertReorderRule(req, res) {
    const data = await ReorderService.upsertReorderRule({
      ...ctx(req),
      inventoryUuid: req.params.inventoryUuid,
      input: req.body,
    });
    res.json({ success: true, data });
  },

  async bulkReorderRules(req, res) {
    const data = await ReorderService.bulkUpdateReorderRules({
      ...ctx(req),
      rules: req.body.rules ?? [],
    });
    res.json({ success: true, data });
  },

  async reorderSuggestions(req, res) {
    const result = await ReorderService.reorderSuggestions(ctx(req));
    res.json({ success: true, ...result });
  },

  async listAlerts(req, res) {
    const result = await AlertService.listAlerts({ ...ctx(req), query: req.query });
    res.json({ success: true, ...result });
  },

  async acknowledgeAlert(req, res) {
    const data = await AlertService.acknowledgeAlert({
      ...ctx(req),
      alertUuid: req.params.alertUuid,
    });
    res.json({ success: true, data });
  },

  async dismissAlert(req, res) {
    const data = await AlertService.dismissAlert({
      ...ctx(req),
      alertUuid: req.params.alertUuid,
    });
    res.json({ success: true, data });
  },

  async listTransfers(req, res) {
    const c = ctx(req);
    const result = await TransferService.listTransfers({
      ...c,
      query: req.query,
      permissions: transferPermissions(req),
    });
    res.json({ success: true, ...result });
  },

  async createTransfer(req, res) {
    const data = await TransferService.createTransfer({
      ...ctx(req),
      destinationBranchUuid: req.body.destination_branch_id,
      items: req.body.items ?? [],
      requestNotes: req.body.request_notes,
    });
    res.status(201).json({ success: true, data });
  },

  async getTransfer(req, res) {
    const c = ctx(req);
    const data = await TransferService.getTransfer(req.params.transferUuid, c.shopId, {
      userId: c.userId,
      permissions: transferPermissions(req),
    });
    res.json({ success: true, data });
  },

  async submitTransfer(req, res) {
    const data = await TransferService.submitTransfer({
      ...ctx(req),
      transferUuid: req.params.transferUuid,
    });
    res.json({ success: true, data });
  },

  async approveTransfer(req, res) {
    const data = await TransferService.approveTransfer({
      ...ctx(req),
      transferUuid: req.params.transferUuid,
      itemApprovals: req.body.items,
      approvalNotes: req.body.approval_notes,
    });
    res.json({ success: true, data });
  },

  async rejectTransfer(req, res) {
    const data = await TransferService.rejectTransfer({
      ...ctx(req),
      transferUuid: req.params.transferUuid,
      rejectionReason: req.body.rejection_reason,
    });
    res.json({ success: true, data });
  },

  async dispatchTransfer(req, res) {
    const data = await TransferService.dispatchTransfer({
      shopId: req.shopId,
      transferUuid: req.params.transferUuid,
      itemDispatches: req.body.items,
      dispatchNotes: req.body.dispatch_notes,
      userId: req.authContext?.userId ?? req.user?.id,
      req,
    });
    res.json({ success: true, data });
  },

  async receiveTransfer(req, res) {
    const data = await TransferService.receiveTransfer({
      shopId: req.shopId,
      transferUuid: req.params.transferUuid,
      itemReceipts: req.body.items,
      receivingNotes: req.body.receiving_notes,
      userId: req.authContext?.userId ?? req.user?.id,
      req,
    });
    res.json({ success: true, data });
  },

  async cancelTransfer(req, res) {
    const data = await TransferService.cancelTransfer({
      shopId: req.shopId,
      transferUuid: req.params.transferUuid,
      cancellationReason: req.body.cancellation_reason,
      userId: req.authContext?.userId ?? req.user?.id,
      req,
    });
    res.json({ success: true, data });
  },

  async listProductAvailability(req, res) {
    const result = await ProductAvailabilityService.listProductAvailability({
      ...ctx(req),
      query: req.query,
    });
    res.json({ success: true, ...result });
  },

  async getProductAvailability(req, res) {
    const data = await ProductAvailabilityService.getAvailability({
      ...ctx(req),
      productUuid: req.params.productUuid,
      variantUuid: req.query.product_variant_id,
    });
    res.json({ success: true, data });
  },

  async updateProductAvailability(req, res) {
    const data = await ProductAvailabilityService.updateAvailability({
      ...ctx(req),
      productUuid: req.params.productUuid,
      variantUuid: req.body.product_variant_id,
      input: req.body,
    });
    res.json({ success: true, data });
  },

  async listAvailabilityRules(req, res) {
    const result = await ProductAvailabilityService.listRules(ctx(req));
    res.json({ success: true, ...result });
  },

  async createAvailabilityRule(req, res) {
    const data = await ProductAvailabilityService.createRule({
      ...ctx(req),
      input: req.body,
    });
    res.status(201).json({ success: true, data });
  },

  async updateAvailabilityRule(req, res) {
    const data = await ProductAvailabilityService.updateRule({
      ...ctx(req),
      ruleUuid: req.params.ruleUuid,
      input: req.body,
    });
    res.json({ success: true, data });
  },

  async deleteAvailabilityRule(req, res) {
    const data = await ProductAvailabilityService.deleteRule({
      ...ctx(req),
      ruleUuid: req.params.ruleUuid,
    });
    res.json({ success: true, data });
  },

  async listServiceAvailability(req, res) {
    const result = await ServiceAvailabilityService.listServiceAvailability({
      ...ctx(req),
      query: req.query,
    });
    res.json({ success: true, ...result });
  },

  async getServiceAvailability(req, res) {
    const data = await ServiceAvailabilityService.getServiceAvailability({
      ...ctx(req),
      serviceUuid: req.params.serviceUuid,
    });
    res.json({ success: true, data });
  },

  async updateServiceAvailability(req, res) {
    const data = await ServiceAvailabilityService.updateServiceAvailability({
      ...ctx(req),
      serviceUuid: req.params.serviceUuid,
      input: req.body,
    });
    res.json({ success: true, data });
  },

  async bulkServiceAvailability(req, res) {
    const data = await ServiceAvailabilityService.bulkServiceAvailability({
      ...ctx(req),
      items: req.body.items ?? [],
    });
    res.json({ success: true, data });
  },

  async getValuation(req, res) {
    const result = await ValuationService.calculateBranchValuation(ctx(req));
    res.json(result);
  },

  async valuationHistory(req, res) {
    const result = await ValuationService.valuationHistory({
      ...ctx(req),
      query: req.query,
    });
    res.json({ success: true, ...result });
  },

  async createValuationSnapshot(req, res) {
    const data = await ValuationService.createValuationSnapshot(ctx(req));
    res.status(201).json({ success: true, data });
  },
};
