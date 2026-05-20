import { body } from "express-validator";

export const registerRules = [
  body("fullName").trim().notEmpty().withMessage("Full name is required"),
  body("email").trim().isEmail().withMessage("Valid email is required").normalizeEmail(),
  body("password")
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters"),
  body("phone").optional({ values: "null" }).trim().isLength({ min: 6 }).withMessage("Phone is too short"),
  body("roleId").optional().isInt({ min: 1 }).withMessage("roleId must be a positive integer"),
  body("shopId").optional().isInt({ min: 1 }).withMessage("shopId must be a positive integer"),
];

export const loginRules = [
  body("email").trim().isEmail().withMessage("Valid email is required").normalizeEmail(),
  body("password").notEmpty().withMessage("Password is required"),
];
