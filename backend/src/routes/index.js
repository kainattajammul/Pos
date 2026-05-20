import { Router } from "express";
import authRoutes from "./auth.routes.js";
import userRoutes from "./user.routes.js";
import dashboardRoutes from "./dashboard.routes.js";

const router = Router();

router.use("/auth", authRoutes);
router.use("/users", userRoutes);
router.use("/dashboard", dashboardRoutes);

router.get("/health", (_req, res) => {
  res.json({ success: true, message: "POS API is running", data: { status: "ok" } });
});

export default router;
