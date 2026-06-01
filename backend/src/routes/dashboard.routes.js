import { Router } from "express";
import { DashboardController } from "../controllers/dashboard.controller.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const router = Router();

/** Public — mock analytics only; no sensitive data (matches users list scope). */

router.get("/summary", asyncHandler(DashboardController.summary));
router.get("/revenue", asyncHandler(DashboardController.revenue));
router.get("/monthly-sales", asyncHandler(DashboardController.monthlySales));
router.get("/repair-reports", asyncHandler(DashboardController.repairReports));
router.get("/recent-activities", asyncHandler(DashboardController.recentActivities));

export default router;
