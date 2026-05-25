import { body, param, query } from "express-validator";
import { REPAIR_PART_IMAGE_VARIANTS } from "../data/defaultRepairDeviceParts.js";

export const listRepairDevicePartRules = [
  query("shopId")
    .isInt({ min: 1 })
    .withMessage("shopId query parameter is required and must be a positive integer"),
  query("repairCategoryId")
    .isInt({ min: 1 })
    .withMessage("repairCategoryId query parameter is required and must be a positive integer"),
  query("repairManufacturerId")
    .isInt({ min: 1 })
    .withMessage("repairManufacturerId query parameter is required and must be a positive integer"),
  query("repairDeviceId")
    .isInt({ min: 1 })
    .withMessage("repairDeviceId query parameter is required and must be a positive integer"),
];

export const createRepairDevicePartRules = [
  body("shopId")
    .isInt({ min: 1 })
    .withMessage("shopId is required and must be a positive integer"),
  body("repairCategoryId")
    .isInt({ min: 1 })
    .withMessage("repairCategoryId is required and must be a positive integer"),
  body("repairManufacturerId")
    .isInt({ min: 1 })
    .withMessage("repairManufacturerId is required and must be a positive integer"),
  body("repairDeviceId")
    .isInt({ min: 1 })
    .withMessage("repairDeviceId is required and must be a positive integer"),
  body("name")
    .trim()
    .notEmpty()
    .withMessage("Part name is required")
    .isLength({ min: 2 })
    .withMessage("Part name must be at least 2 characters"),
  body("price")
    .isFloat({ min: 0 })
    .withMessage("Price must be a non-negative number"),
  body("onHand")
    .optional()
    .isInt({ min: 0 })
    .withMessage("On hand must be a non-negative integer"),
  body("imageVariant")
    .optional()
    .trim()
    .isIn(REPAIR_PART_IMAGE_VARIANTS)
    .withMessage(`imageVariant must be one of: ${REPAIR_PART_IMAGE_VARIANTS.join(", ")}`),
  body("imageUrl")
    .optional({ values: "null" })
    .custom((value) => !value || /^https?:\/\//i.test(String(value)))
    .withMessage("imageUrl must be a valid URL"),
  body("sortOrder").optional().isInt({ min: 0 }),
];

export const uploadDevicePartImageRules = [
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
  body("repairDeviceId")
    .custom((value) => {
      const n = Number(value);
      return Number.isInteger(n) && n >= 1;
    })
    .withMessage("repairDeviceId is required and must be a positive integer"),
];

export const repairDevicePartIdParamRules = [
  param("id").isInt({ min: 1 }).withMessage("Part id must be a positive integer"),
];

export const updateRepairDevicePartRules = [
  ...repairDevicePartIdParamRules,
  body("name")
    .optional()
    .trim()
    .isLength({ min: 2 })
    .withMessage("Part name must be at least 2 characters"),
  body("price")
    .optional()
    .isFloat({ min: 0 })
    .withMessage("Price must be a non-negative number"),
  body("onHand")
    .optional()
    .isInt({ min: 0 })
    .withMessage("On hand must be a non-negative integer"),
  body("imageVariant")
    .optional()
    .trim()
    .isIn(REPAIR_PART_IMAGE_VARIANTS)
    .withMessage(`imageVariant must be one of: ${REPAIR_PART_IMAGE_VARIANTS.join(", ")}`),
  body("imageUrl")
    .optional({ values: "null" })
    .custom((value) => value === null || value === "" || /^https?:\/\//i.test(value))
    .withMessage("imageUrl must be a valid URL or null"),
  body("sortOrder").optional().isInt({ min: 0 }),
  body().custom((_value, { req }) => {
    const { name, price, onHand, imageVariant, imageUrl, sortOrder } = req.body;
    const hasField =
      name !== undefined ||
      price !== undefined ||
      onHand !== undefined ||
      imageVariant !== undefined ||
      imageUrl !== undefined ||
      sortOrder !== undefined;
    if (!hasField) {
      throw new Error("At least one field is required to update");
    }
    return true;
  }),
];
