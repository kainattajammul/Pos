import { Router } from "express";
import { DashboardController } from "../controllers/dashboard.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const router = Router();

router.use(authenticate);

router.get("/summary", asyncHandler(DashboardController.summary));
router.get("/revenue", asyncHandler(DashboardController.revenue));
router.get("/monthly-sales", asyncHandler(DashboardController.monthlySales));
router.get("/repair-reports", asyncHandler(DashboardController.repairReports));
router.get("/recent-activities", asyncHandler(DashboardController.recentActivities));

export default router;
