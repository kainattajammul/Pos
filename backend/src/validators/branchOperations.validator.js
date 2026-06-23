import { body, param, query } from "express-validator";

export const branchOpsContextRules = [
  param("shopId").isInt({ min: 1 }),
  param("branchUuid").isUUID(),
];

export const uuidParam = (name) => [...branchOpsContextRules, param(name).isUUID()];

export const operationsSettingsUpdateRules = [
  ...branchOpsContextRules,
  body("appointment_slots_per_day").optional().isInt({ min: 1 }),
  body("pickup_enabled").optional().isBoolean(),
  body("delivery_radius_km").optional().isFloat({ min: 0 }),
];

export const createRepairRules = [
  ...branchOpsContextRules,
  body("customer_issue").notEmpty(),
  body("priority").optional().isIn(["low", "normal", "high", "urgent"]),
];

export const createSaleRules = [
  ...branchOpsContextRules,
  body("line_items").isArray({ min: 1 }),
  body("line_items.*.item_type").isIn(["product", "service"]),
  body("line_items.*.name").notEmpty(),
  body("line_items.*.quantity").isInt({ min: 1 }),
  body("line_items.*.unit_price").isFloat({ min: 0 }),
];

export const createCustomerRules = [
  ...branchOpsContextRules,
  body("display_name").notEmpty(),
];

export const createAppointmentRules = [
  ...branchOpsContextRules,
  body("starts_at").isISO8601(),
  body("ends_at").isISO8601(),
  body("appointment_type").notEmpty(),
];

export const postcodeCheckRules = [
  ...branchOpsContextRules,
  body("postcode").notEmpty(),
  body("service_type").optional().isIn(["pickup", "delivery"]),
];

export const listQueryRules = [
  ...branchOpsContextRules,
  query("page").optional().isInt({ min: 1 }),
  query("limit").optional().isInt({ min: 1, max: 100 }),
];
