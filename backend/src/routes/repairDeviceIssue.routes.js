import { Router } from "express";
import { RepairDeviceIssueController } from "../controllers/repairDeviceIssue.controller.js";
import { validateRequest } from "../middleware/validate.middleware.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import {
  repairCategoryImageUpload,
  handleMulterError,
} from "../middleware/upload.middleware.js";
import {
  createRepairDeviceIssueRules,
  listRepairDeviceIssueRules,
  repairDeviceIssueIdParamRules,
  searchIssueIconsRules,
  updateRepairDeviceIssueRules,
  uploadDeviceIssueImageRules,
} from "../validators/repairDeviceIssue.validator.js";

const router = Router();

router.get(
  "/icons/search",
  searchIssueIconsRules,
  validateRequest,
  asyncHandler(RepairDeviceIssueController.searchIcons),
);
router.get(
  "/",
  listRepairDeviceIssueRules,
  validateRequest,
  asyncHandler(RepairDeviceIssueController.list),
);
router.post(
  "/upload-image",
  repairCategoryImageUpload,
  handleMulterError,
  uploadDeviceIssueImageRules,
  validateRequest,
  asyncHandler(RepairDeviceIssueController.uploadImage),
);
router.post(
  "/",
  createRepairDeviceIssueRules,
  validateRequest,
  asyncHandler(RepairDeviceIssueController.create),
);
router.put(
  "/:id",
  updateRepairDeviceIssueRules,
  validateRequest,
  asyncHandler(RepairDeviceIssueController.update),
);
router.delete(
  "/:id",
  repairDeviceIssueIdParamRules,
  validateRequest,
  asyncHandler(RepairDeviceIssueController.remove),
);

export default router;
