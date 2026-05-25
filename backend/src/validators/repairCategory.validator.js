import { body, param, query } from "express-validator";

export const listRepairCategoryRules = [
  query("shopId")
    .isInt({ min: 1 })
    .withMessage("shopId query parameter is required and must be a positive integer"),
];

export const searchIconsRules = [
  query("q").optional().isString().trim(),
  query("limit").optional().isInt({ min: 1, max: 64 }),
];

export const uploadImageRules = [
  body("shopId")
    .custom((value) => {
      const n = Number(value);
      return Number.isInteger(n) && n >= 1;
    })
    .withMessage("shopId is required and must be a positive integer"),
];

export const createRepairCategoryRules = [
  body("shopId")
    .isInt({ min: 1 })
    .withMessage("shopId is required and must be a positive integer"),
  body("name")
    .trim()
    .notEmpty()
    .withMessage("Category name is required")
    .isLength({ min: 2 })
    .withMessage("Category name must be at least 2 characters"),
  body("iconKey").optional().trim().isString(),
  body("imageUrl")
    .optional({ values: "null" })
    .custom((value) => !value || /^https?:\/\//i.test(String(value)))
    .withMessage("imageUrl must be a valid URL"),
  body("sortOrder").optional().isInt({ min: 0 }),
];

export const repairCategoryIdParamRules = [
  param("id").isInt({ min: 1 }).withMessage("Category id must be a positive integer"),
];

export const updateRepairCategoryRules = [
  ...repairCategoryIdParamRules,
  body("name")
    .optional()
    .trim()
    .isLength({ min: 2 })
    .withMessage("Category name must be at least 2 characters"),
  body("iconKey").optional().trim().isString(),
  body("imageUrl")
    .optional({ values: "null" })
    .custom((value) => value === null || value === "" || /^https?:\/\//i.test(value))
    .withMessage("imageUrl must be a valid URL or null"),
  body("sortOrder").optional().isInt({ min: 0 }),
  body().custom((_value, { req }) => {
    const { name, iconKey, imageUrl, sortOrder } = req.body;
    const hasField =
      name !== undefined ||
      iconKey !== undefined ||
      imageUrl !== undefined ||
      sortOrder !== undefined;
    if (!hasField) {
      throw new Error("At least one field is required to update");
    }
    return true;
  }),
];
