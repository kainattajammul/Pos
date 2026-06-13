import { Router } from "express";
import { RepairCategoryController } from "../controllers/repairCategory.controller.js";
import { validateRequest } from "../middleware/validate.middleware.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import {
  imageUpload,
  handleMulterError,
} from "../middleware/upload.middleware.js";
import {
  createRepairCategoryRules,
  listRepairCategoryRules,
  repairCategoryIdParamRules,
  searchIconsRules,
  updateRepairCategoryRules,
  uploadImageRules,
} from "../validators/repairCategory.validator.js";

const router = Router();

/** Public — repair POS category picker (auth can be added later) */
router.get(
  "/icons/search",
  searchIconsRules,
  validateRequest,
  asyncHandler(RepairCategoryController.searchIcons),
);
router.get(
  "/",
  listRepairCategoryRules,
  validateRequest,
  asyncHandler(RepairCategoryController.list),
);
router.post(
  "/upload-image",
  imageUpload,
  handleMulterError,
  uploadImageRules,
  validateRequest,
  asyncHandler(RepairCategoryController.uploadImage),
);
router.post(
  "/",
  createRepairCategoryRules,
  validateRequest,
  asyncHandler(RepairCategoryController.create),
);
router.put(
  "/:id",
  updateRepairCategoryRules,
  validateRequest,
  asyncHandler(RepairCategoryController.update),
);
router.delete(
  "/:id",
  repairCategoryIdParamRules,
  validateRequest,
  asyncHandler(RepairCategoryController.remove),
);

export default router;
