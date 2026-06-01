import { Router } from "express";
import { RepairSearchController } from "../controllers/repairSearch.controller.js";
import { validateRequest } from "../middleware/validate.middleware.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import {
  repairBookingContextRules,
  repairSearchRules,
} from "../validators/repairSearch.validator.js";

const router = Router();

/** Public — repair POS search (devices + priced services from DB) */
router.get(
  "/search",
  repairSearchRules,
  validateRequest,
  asyncHandler(RepairSearchController.search),
);
router.get(
  "/booking-context",
  repairBookingContextRules,
  validateRequest,
  asyncHandler(RepairSearchController.bookingContext),
);

export default router;
