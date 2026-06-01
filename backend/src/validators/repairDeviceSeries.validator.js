import { body, param, query } from "express-validator";

export const listRepairDeviceSeriesRules = [
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

export const createRepairDeviceSeriesRules = [
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
    .withMessage("Series name is required")
    .isLength({ min: 2 })
    .withMessage("Series name must be at least 2 characters"),
  body("sortOrder").optional().isInt({ min: 0 }),
];

export const repairDeviceSeriesIdParamRules = [
  param("id").isInt({ min: 1 }).withMessage("Series id must be a positive integer"),
];

export const updateRepairDeviceSeriesRules = [
  ...repairDeviceSeriesIdParamRules,
  body("name")
    .optional()
    .trim()
    .isLength({ min: 2 })
    .withMessage("Series name must be at least 2 characters"),
  body("sortOrder").optional().isInt({ min: 0 }),
  body().custom((_value, { req }) => {
    const { name, sortOrder } = req.body;
    if (name === undefined && sortOrder === undefined) {
      throw new Error("At least one field is required to update");
    }
    return true;
  }),
];
