export const BRANCH_INVENTORY_PERMISSIONS = {
  VIEW: "branch_inventory.view",
  ALLOCATE: "branch_inventory.allocate",
  UPDATE: "branch_inventory.update",
  ADJUST: "branch_inventory.adjust",
  STOCK_COUNT: "branch_inventory.stock_count",

  REORDER_VIEW: "branch_inventory.reorder_rules.view",
  REORDER_MANAGE: "branch_inventory.reorder_rules.manage",

  ALERTS_VIEW: "branch_inventory.alerts.view",
  ALERTS_ACKNOWLEDGE: "branch_inventory.alerts.acknowledge",
  ALERTS_DISMISS: "branch_inventory.alerts.dismiss",

  TRANSFER_VIEW: "branch_inventory.transfer.view",
  TRANSFER_REQUEST: "branch_inventory.transfer.request",
  TRANSFER_APPROVE: "branch_inventory.transfer.approve",
  TRANSFER_REJECT: "branch_inventory.transfer.reject",
  TRANSFER_DISPATCH: "branch_inventory.transfer.dispatch",
  TRANSFER_RECEIVE: "branch_inventory.transfer.receive",
  TRANSFER_CANCEL: "branch_inventory.transfer.cancel",

  PRODUCT_AVAILABILITY_VIEW: "branch_inventory.product_availability.view",
  PRODUCT_AVAILABILITY_MANAGE: "branch_inventory.product_availability.manage",

  SERVICE_AVAILABILITY_VIEW: "branch_inventory.service_availability.view",
  SERVICE_AVAILABILITY_MANAGE: "branch_inventory.service_availability.manage",

  VALUATION_VIEW: "branch_inventory.valuation.view",
  VALUATION_EXPORT: "branch_inventory.valuation.export",
};

export const BRANCH_INVENTORY_PERMISSION_SEED = Object.entries(BRANCH_INVENTORY_PERMISSIONS).map(
  ([, key]) => ({
    key,
    module: key.split(".")[0],
  }),
);
