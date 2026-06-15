import { Router } from "express";
import { ApiResponse } from "../utils/ApiResponse.js";
import authRoutes from "./auth.routes.js";
import userRoutes from "./user.routes.js";
import roleRoutes from "./role.routes.js";
import repairCategoryRoutes from "./repairCategory.routes.js";
import repairManufacturerRoutes from "./repairManufacturer.routes.js";
import repairDeviceRoutes from "./repairDevice.routes.js";
import repairDeviceSeriesRoutes from "./repairDeviceSeries.routes.js";
import repairDeviceIssueRoutes from "./repairDeviceIssue.routes.js";
import repairDevicePartRoutes from "./repairDevicePart.routes.js";
import salesCommissionAgentRoutes from "./salesCommissionAgent.routes.js";
import repairSearchRoutes from "./repairSearch.routes.js";
import dashboardRoutes from "./dashboard.routes.js";
import uploadRoutes from "./upload.routes.js";
import branchRoutes from "./branch.routes.js";

const router = Router();

/** Base URL — browsers and tools often probe `/api/v1` without a sub-path */
router.get("/", (_req, res) => {
  return ApiResponse.success(res, {
    message: "POS API v1",
    data: {
      status: "ok",
      docs: {
        health: "/api/v1/health",
        auth: "/api/v1/auth",
        users: "/api/v1/users",
        roles: "/api/v1/roles",
        repairCategories: "/api/v1/repair-categories",
        repairManufacturers: "/api/v1/repair-manufacturers",
        repairDevices: "/api/v1/repair-devices",
        repairDeviceSeries: "/api/v1/repair-device-series",
        repairDeviceIssues: "/api/v1/repair-device-issues",
        repairDeviceParts: "/api/v1/repair-device-parts",
        salesCommissionAgents: "/api/v1/sales-commission-agents",
        repairs: "/api/v1/repairs",
        dashboard: "/api/v1/dashboard",
        upload: "/api/v1/upload",
        shops: "/api/v1/shops/:shopId/branches",
        branchStaff: "/api/v1/shops/:shopId/branches/:branchUuid/staff",
      },
    },
  });
});

router.use("/upload", uploadRoutes);
router.use("/auth", authRoutes);
router.use("/users", userRoutes);
router.use("/roles", roleRoutes);
router.use("/repair-categories", repairCategoryRoutes);
router.use("/repair-manufacturers", repairManufacturerRoutes);
router.use("/repair-devices", repairDeviceRoutes);
router.use("/repair-device-series", repairDeviceSeriesRoutes);
router.use("/repair-device-issues", repairDeviceIssueRoutes);
router.use("/repair-device-parts", repairDevicePartRoutes);
router.use("/sales-commission-agents", salesCommissionAgentRoutes);
router.use("/repairs", repairSearchRoutes);
router.use("/dashboard", dashboardRoutes);
router.use("/shops/:shopId/branches", branchRoutes);

router.get("/health", (_req, res) => {
  res.json({ success: true, message: "POS API is running", data: { status: "ok" } });
});

export default router;
