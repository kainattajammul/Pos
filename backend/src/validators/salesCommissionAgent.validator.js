import { body, param } from "express-validator";

const optionalString = (field) =>
  body(field).optional({ values: "null" }).trim();

export const createSalesCommissionAgentRules = [
  body("name")
    .trim()
    .notEmpty()
    .withMessage("Name is required")
    .isLength({ max: 200 })
    .withMessage("Name is too long"),
  optionalString("email").isEmail().withMessage("Enter a valid email address"),
  optionalString("contactNumber").isLength({ max: 40 }),
  optionalString("address").isLength({ max: 500 }),
  body("salesCommissionPercent")
    .optional({ values: "null" })
    .isFloat({ min: 0, max: 100 })
    .withMessage("Sales commission percentage must be between 0 and 100"),
];

export const salesCommissionAgentIdParamRules = [
  param("id").isInt({ min: 1 }).withMessage("Agent id must be a positive integer"),
];

export const updateSalesCommissionAgentRules = [
  ...salesCommissionAgentIdParamRules,
  body("name")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("Name cannot be empty")
    .isLength({ max: 200 }),
  optionalString("email").isEmail().withMessage("Enter a valid email address"),
  optionalString("contactNumber").isLength({ max: 40 }),
  optionalString("address").isLength({ max: 500 }),
  body("salesCommissionPercent")
    .optional({ values: "null" })
    .isFloat({ min: 0, max: 100 })
    .withMessage("Sales commission percentage must be between 0 and 100"),
];
