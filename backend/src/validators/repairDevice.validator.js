import { body, param, query } from "express-validator";

const ICON_VARIANTS = ["mobile", "tablet", "laptop", "desktop", "drone", "jewelry"];

export const listRepairDeviceRules = [
  query("shopId")
    .isInt({ min: 1 })
    .withMessage("shopId query parameter is required and must be a positive integer"),
  query("repairCategoryId")
    .isInt({ min: 1 })
    .withMessage("repairCategoryId query parameter is required and must be a positive integer"),
  query("repairManufacturerId")
    .isInt({ min: 1 })
    .withMessage("repairManufacturerId query parameter is required and must be a positive integer"),
];

export const uploadDeviceImageRules = [
  body("shopId")
    .custom((value) => {
      const n = Number(value);
      return Number.isInteger(n) && n >= 1;
    })
    .withMessage("shopId is required and must be a positive integer"),
  body("repairCategoryId")
    .custom((value) => {
      const n = Number(value);
      return Number.isInteger(n) && n >= 1;
    })
    .withMessage("repairCategoryId is required and must be a positive integer"),
  body("repairManufacturerId")
    .custom((value) => {
      const n = Number(value);
      return Number.isInteger(n) && n >= 1;
    })
    .withMessage("repairManufacturerId is required and must be a positive integer"),
];

export const createRepairDeviceRules = [
  body("shopId")
    .isInt({ min: 1 })
    .withMessage("shopId is required and must be a positive integer"),
  body("repairCategoryId")
    .isInt({ min: 1 })
    .withMessage("repairCategoryId is required and must be a positive integer"),
  body("repairManufacturerId")
    .isInt({ min: 1 })
    .withMessage("repairManufacturerId is required and must be a positive integer"),
  body("name")
    .trim()
    .notEmpty()
    .withMessage("Device name is required")
    .isLength({ min: 2 })
    .withMessage("Device name must be at least 2 characters"),
  body("imageUrl")
    .optional({ values: "null" })
    .custom((value) => !value || /^https?:\/\//i.test(String(value)))
    .withMessage("imageUrl must be a valid URL"),
  body("iconVariant")
    .optional({ values: "null" })
    .isIn(ICON_VARIANTS)
    .withMessage(`iconVariant must be one of: ${ICON_VARIANTS.join(", ")}`),
  body("sortOrder").optional().isInt({ min: 0 }),
];

export const repairDeviceIdParamRules = [
  param("id").isInt({ min: 1 }).withMessage("Device id must be a positive integer"),
];

export const updateRepairDeviceRules = [
  ...repairDeviceIdParamRules,
  body("name")
    .optional()
    .trim()
    .isLength({ min: 2 })
    .withMessage("Device name must be at least 2 characters"),
  body("imageUrl")
    .optional({ values: "null" })
    .custom((value) => value === null || value === "" || /^https?:\/\//i.test(value))
    .withMessage("imageUrl must be a valid URL or null"),
  body("iconVariant")
    .optional({ values: "null" })
    .isIn(ICON_VARIANTS)
    .withMessage(`iconVariant must be one of: ${ICON_VARIANTS.join(", ")}`),
  body("sortOrder").optional().isInt({ min: 0 }),
  body().custom((_value, { req }) => {
    const { name, imageUrl, iconVariant, sortOrder } = req.body;
    const hasField =
      name !== undefined ||
      imageUrl !== undefined ||
      iconVariant !== undefined ||
      sortOrder !== undefined;
    if (!hasField) {
      throw new Error("At least one field is required to update");
    }
    return true;
  }),
];
