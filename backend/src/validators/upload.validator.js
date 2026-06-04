import { body } from "express-validator";

export const uploadImageRules = [
  body("prefix")
    .optional()
    .isString()
    .trim()
    .isLength({ max: 200 })
    .withMessage("prefix must be at most 200 characters"),
];
