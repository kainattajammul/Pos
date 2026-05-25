import { Router } from "express";
import { ApiResponse } from "../utils/ApiResponse.js";
import authRoutes from "./auth.routes.js";
import userRoutes from "./user.routes.js";
import roleRoutes from "./role.routes.js";
import repairCategoryRoutes from "./repairCategory.routes.js";
import repairManufacturerRoutes from "./repairManufacturer.routes.js";
import repairDeviceRoutes from "./repairDevice.routes.js";
import dashboardRoutes from "./dashboard.routes.js";

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
        dashboard: "/api/v1/dashboard",
      },
    },
  });
});

router.use("/auth", authRoutes);
router.use("/users", userRoutes);
router.use("/roles", roleRoutes);
router.use("/repair-categories", repairCategoryRoutes);
router.use("/repair-manufacturers", repairManufacturerRoutes);
router.use("/repair-devices", repairDeviceRoutes);
router.use("/dashboard", dashboardRoutes);

router.get("/health", (_req, res) => {
  res.json({ success: true, message: "POS API is running", data: { status: "ok" } });
});

export default router;
