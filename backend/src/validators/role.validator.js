import { body, param } from "express-validator";

export const createRoleRules = [
  body("name")
    .trim()
    .notEmpty()
    .withMessage("Role name is required")
    .isLength({ min: 2 })
    .withMessage("Role name must be at least 2 characters"),
  body("shopId")
    .isInt({ min: 1 })
    .withMessage("shopId is required and must be a positive integer"),
];

export const roleIdParamRules = [
  param("id").isInt({ min: 1 }).withMessage("Role id must be a positive integer"),
];

export const updateRoleRules = [
  param("id").isInt({ min: 1 }).withMessage("Role id must be a positive integer"),
  body("name")
    .optional()
    .trim()
    .isLength({ min: 2 })
    .withMessage("Role name must be at least 2 characters"),
  body("shopId")
    .optional()
    .isInt({ min: 1 })
    .withMessage("shopId must be a positive integer"),
  body().custom((_value, { req }) => {
    const { name, shopId } = req.body;
    const hasName = name !== undefined && name !== null && String(name).trim() !== "";
    const hasShopId = shopId !== undefined && shopId !== null && shopId !== "";
    if (!hasName && !hasShopId) {
      throw new Error("At least one field is required to update");
    }
    return true;
  }),
];
