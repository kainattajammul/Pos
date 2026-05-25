import { Router } from "express";
import { RepairManufacturerController } from "../controllers/repairManufacturer.controller.js";
import { validateRequest } from "../middleware/validate.middleware.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import {
  repairCategoryImageUpload,
  handleMulterError,
} from "../middleware/upload.middleware.js";
import {
  createRepairManufacturerRules,
  listRepairManufacturerRules,
  repairManufacturerIdParamRules,
  searchIconsRules,
  updateRepairManufacturerRules,
  uploadManufacturerImageRules,
} from "../validators/repairManufacturer.validator.js";

const router = Router();

router.get(
  "/icons/search",
  searchIconsRules,
  validateRequest,
  asyncHandler(RepairManufacturerController.searchIcons),
);
router.get(
  "/",
  listRepairManufacturerRules,
  validateRequest,
  asyncHandler(RepairManufacturerController.list),
);
router.post(
  "/upload-image",
  repairCategoryImageUpload,
  handleMulterError,
  uploadManufacturerImageRules,
  validateRequest,
  asyncHandler(RepairManufacturerController.uploadImage),
);
router.post(
  "/",
  createRepairManufacturerRules,
  validateRequest,
  asyncHandler(RepairManufacturerController.create),
);
router.put(
  "/:id",
  updateRepairManufacturerRules,
  validateRequest,
  asyncHandler(RepairManufacturerController.update),
);
router.delete(
  "/:id",
  repairManufacturerIdParamRules,
  validateRequest,
  asyncHandler(RepairManufacturerController.remove),
);

export default router;
