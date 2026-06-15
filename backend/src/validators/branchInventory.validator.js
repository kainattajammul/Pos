import { body, param, query } from "express-validator";

export const branchInventoryContextRules = [
  param("shopId").isInt({ min: 1 }),
  param("branchUuid").isUUID(),
];

export const inventoryUuidRules = [
  ...branchInventoryContextRules,
  param("inventoryUuid").isUUID(),
];

export const transferUuidRules = [
  ...branchInventoryContextRules,
  param("transferUuid").isUUID(),
];

export const allocateRules = [
  ...branchInventoryContextRules,
  body("product_id").isUUID(),
  body("product_variant_id").optional().isUUID(),
  body("opening_quantity").optional().isInt({ min: 0 }),
  body("unit_cost").optional().isFloat({ min: 0 }),
  body("branch_selling_price").optional().isFloat({ min: 0 }),
];

export const bulkAllocateRules = [
  ...branchInventoryContextRules,
  body("items").isArray({ min: 1 }),
  body("items.*.product_id").isUUID(),
  body("items.*.opening_quantity").optional().isInt({ min: 0 }),
];

export const updateInventoryRules = [
  ...inventoryUuidRules,
  body("branch_selling_price").optional().isFloat({ min: 0 }),
  body("is_sellable").optional().isBoolean(),
  body("is_transferable").optional().isBoolean(),
  body("is_purchasable").optional().isBoolean(),
];

export const adjustStockRules = [
  ...inventoryUuidRules,
  body("adjustment_type").isIn(["increase", "decrease"]),
  body("quantity").isInt({ min: 1 }),
  body("reason_code").notEmpty(),
];

export const stockCountRules = [
  ...inventoryUuidRules,
  body("counted_quantity").isInt({ min: 0 }),
];

export const reorderRuleRules = [
  ...inventoryUuidRules,
  body("reorder_point").isInt({ min: 0 }),
  body("reorder_quantity").isInt({ min: 1 }),
  body("minimum_stock_level").optional().isInt({ min: 0 }),
  body("maximum_stock_level").optional().isInt({ min: 0 }),
];

export const createTransferRules = [
  ...branchInventoryContextRules,
  body("destination_branch_id").isUUID(),
  body("items").isArray({ min: 1 }),
  body("items.*.source_inventory_id").isUUID(),
  body("items.*.requested_quantity").isInt({ min: 1 }),
];

export const settingsUpdateRules = [
  ...branchInventoryContextRules,
  body("allocation_mode").optional().isIn(["shared", "dedicated"]),
  body("low_stock_threshold").optional().isInt({ min: 0 }),
  body("transfer_approval_required").optional().isBoolean(),
];

export const listStockLevelsRules = [
  ...branchInventoryContextRules,
  query("page").optional().isInt({ min: 1 }),
  query("limit").optional().isInt({ min: 1, max: 100 }),
];

export const productUuidRules = [
  ...branchInventoryContextRules,
  param("productUuid").isUUID(),
];

export const serviceUuidRules = [
  ...branchInventoryContextRules,
  param("serviceUuid").isUUID(),
];

export const alertUuidRules = [
  ...branchInventoryContextRules,
  param("alertUuid").isUUID(),
];

export const ruleUuidRules = [
  ...branchInventoryContextRules,
  param("ruleUuid").isUUID(),
];
