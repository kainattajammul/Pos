import { Router } from "express";
import { RepairDevicePartController } from "../controllers/repairDevicePart.controller.js";
import { validateRequest } from "../middleware/validate.middleware.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import {
  repairCategoryImageUpload,
  handleMulterError,
} from "../middleware/upload.middleware.js";
import {
  createRepairDevicePartRules,
  listRepairDevicePartRules,
  repairDevicePartIdParamRules,
  updateRepairDevicePartRules,
  uploadDevicePartImageRules,
} from "../validators/repairDevicePart.validator.js";

const router = Router();

router.get(
  "/",
  listRepairDevicePartRules,
  validateRequest,
  asyncHandler(RepairDevicePartController.list),
);
router.post(
  "/upload-image",
  repairCategoryImageUpload,
  handleMulterError,
  uploadDevicePartImageRules,
  validateRequest,
  asyncHandler(RepairDevicePartController.uploadImage),
);
router.post(
  "/",
  createRepairDevicePartRules,
  validateRequest,
  asyncHandler(RepairDevicePartController.create),
);
router.put(
  "/:id",
  updateRepairDevicePartRules,
  validateRequest,
  asyncHandler(RepairDevicePartController.update),
);
router.delete(
  "/:id",
  repairDevicePartIdParamRules,
  validateRequest,
  asyncHandler(RepairDevicePartController.remove),
);

export default router;
