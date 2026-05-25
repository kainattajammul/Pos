import { Router } from "express";
import { RepairDeviceController } from "../controllers/repairDevice.controller.js";
import { validateRequest } from "../middleware/validate.middleware.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import {
  repairCategoryImageUpload,
  handleMulterError,
} from "../middleware/upload.middleware.js";
import {
  createRepairDeviceRules,
  listRepairDeviceRules,
  repairDeviceIdParamRules,
  updateRepairDeviceRules,
  uploadDeviceImageRules,
} from "../validators/repairDevice.validator.js";

const router = Router();

router.get(
  "/",
  listRepairDeviceRules,
  validateRequest,
  asyncHandler(RepairDeviceController.list),
);
router.post(
  "/upload-image",
  repairCategoryImageUpload,
  handleMulterError,
  uploadDeviceImageRules,
  validateRequest,
  asyncHandler(RepairDeviceController.uploadImage),
);
router.post(
  "/",
  createRepairDeviceRules,
  validateRequest,
  asyncHandler(RepairDeviceController.create),
);
router.put(
  "/:id",
  updateRepairDeviceRules,
  validateRequest,
  asyncHandler(RepairDeviceController.update),
);
router.delete(
  "/:id",
  repairDeviceIdParamRules,
  validateRequest,
  asyncHandler(RepairDeviceController.remove),
);

export default router;
