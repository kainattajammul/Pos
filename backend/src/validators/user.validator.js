import { body, param } from "express-validator";

export const createUserRules = [
  body("fullName").trim().notEmpty().withMessage("Full name is required"),
  body("email").trim().isEmail().withMessage("Valid email is required").normalizeEmail(),
  body("password")
    .isLength({ min: 8 })
    .withMessage("Password must be at least 8 characters"),
  body("shopId").isInt({ min: 1 }).withMessage("shopId is required and must be a positive integer"),
  body("phone").optional({ values: "null" }).trim(),
  body("accessPin")
    .trim()
    .matches(/^\d{4}$/)
    .withMessage("Access PIN must be exactly 4 digits"),
  body("roleId").optional().isInt({ min: 1 }).withMessage("roleId must be a positive integer"),
  body("status")
    .optional()
    .trim()
    .isIn(["ACTIVE", "INACTIVE", "SUSPENDED", "active", "inactive", "suspended"])
    .withMessage("status must be ACTIVE, INACTIVE, or SUSPENDED"),
];

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
  body("accessPin")
    .optional()
    .trim()
    .matches(/^\d{4}$/)
    .withMessage("Access PIN must be exactly 4 digits"),
  body().custom((_value, { req }) => {
    const { fullName, email, password, accessPin, phone } = req.body;
    const hasField = [fullName, email, password, accessPin, phone].some(
      (v) => v !== undefined && v !== null && v !== "",
    );
    if (!hasField) {
      throw new Error("At least one field is required to update");
    }
    return true;
  }),
];
