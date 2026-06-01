import { Router } from "express";
import { RepairDeviceSeriesController } from "../controllers/repairDeviceSeries.controller.js";
import { validateRequest } from "../middleware/validate.middleware.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import {
  createRepairDeviceSeriesRules,
  listRepairDeviceSeriesRules,
  repairDeviceSeriesIdParamRules,
  updateRepairDeviceSeriesRules,
} from "../validators/repairDeviceSeries.validator.js";

const router = Router();

router.get(
  "/",
  listRepairDeviceSeriesRules,
  validateRequest,
  asyncHandler(RepairDeviceSeriesController.list),
);
router.post(
  "/",
  createRepairDeviceSeriesRules,
  validateRequest,
  asyncHandler(RepairDeviceSeriesController.create),
);
router.put(
  "/:id",
  updateRepairDeviceSeriesRules,
  validateRequest,
  asyncHandler(RepairDeviceSeriesController.update),
);
router.delete(
  "/:id",
  repairDeviceSeriesIdParamRules,
  validateRequest,
  asyncHandler(RepairDeviceSeriesController.remove),
);

export default router;
