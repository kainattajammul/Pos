import { body, param, query } from "express-validator";

export const branchFinanceContextRules = [
  param("shopId").isInt({ min: 1 }),
  param("branchUuid").isUUID(),
];

export const uuidParam = (name) => [...branchFinanceContextRules, param(name).isUUID()];

export const listQueryRules = [
  ...branchFinanceContextRules,
  query("page").optional().isInt({ min: 1 }),
  query("limit").optional().isInt({ min: 1, max: 100 }),
];

export const financeSettingsUpdateRules = [
  ...branchFinanceContextRules,
  body("register_id").optional().isString(),
  body("register_uuid").optional().isUUID(),
  body("vat_rate").optional().isString(),
  body("currency").optional().isString().isLength({ min: 3, max: 3 }),
  body("timezone").optional().isString(),
  body("end_of_day_required").optional().isBoolean(),
];

export const createRegisterRules = [
  ...branchFinanceContextRules,
  body("register_code").notEmpty(),
  body("name").notEmpty(),
];

export const openSessionRules = [
  ...branchFinanceContextRules,
  body("register_id").isUUID(),
  body("cash_drawer_id").isUUID(),
  body("opening_float").optional().isFloat({ min: 0 }),
];

export const closeSessionRules = [
  ...uuidParam("sessionUuid"),
  body("counted_cash").isFloat({ min: 0 }),
];

export const createPaymentRules = [
  ...branchFinanceContextRules,
  body("payment_method").notEmpty(),
  body("amount").isFloat({ min: 0.01 }),
];

export const createRefundRules = [
  ...branchFinanceContextRules,
  body("payment_id").isUUID(),
  body("amount").isFloat({ min: 0.01 }),
];

export const createInvoiceRules = [
  ...branchFinanceContextRules,
  body("line_items").isArray({ min: 1 }),
  body("line_items.*.name").notEmpty(),
  body("line_items.*.quantity").isFloat({ min: 0.0001 }),
  body("line_items.*.unit_price").isFloat({ min: 0 }),
];

export const createExpenseRules = [
  ...branchFinanceContextRules,
  body("category").notEmpty(),
  body("expense_date").isISO8601(),
  body("description").notEmpty(),
  body("subtotal").isFloat({ min: 0 }),
];

export const cashMovementRules = [
  ...uuidParam("sessionUuid"),
  body("movement_type").notEmpty(),
  body("amount").isFloat({ min: 0.01 }),
];
