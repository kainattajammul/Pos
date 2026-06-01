import { query } from "express-validator";

export const repairBookingContextRules = [
  query("deviceId")
    .isInt({ min: 1 })
    .withMessage("deviceId must be a positive integer"),
  query("repairTypeId")
    .isInt({ min: 1 })
    .withMessage("repairTypeId must be a positive integer"),
];

export const repairSearchRules = [
  query("shopId")
    .optional()
    .isInt({ min: 1 })
    .withMessage("shopId must be a positive integer"),
  query("query")
    .optional()
    .isString()
    .isLength({ max: 120 })
    .withMessage("query is too long"),
];
