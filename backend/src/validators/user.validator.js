import { body, param } from "express-validator";

export const userIdParamRules = [
  param("id").isInt({ min: 1 }).withMessage("User id must be a positive integer"),
];

export const updateUserRules = [
  param("id").isInt({ min: 1 }).withMessage("User id must be a positive integer"),
  body("fullName").optional().trim().notEmpty().withMessage("Full name cannot be empty"),
  body("email").optional().trim().isEmail().withMessage("Valid email is required").normalizeEmail(),
  body("password")
    .optional()
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters"),
  body("phone").optional({ values: "null" }).trim(),
  body("roleId").optional().isInt({ min: 1 }),
  body("shopId").optional().isInt({ min: 1 }),
  body("status").optional().isIn(["active", "inactive", "suspended"]),
];
