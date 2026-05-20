import { Router } from "express";
import { AuthController } from "../controllers/auth.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";
import { validateRequest } from "../middleware/validate.middleware.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { loginRules, registerRules } from "../validators/auth.validator.js";

const router = Router();

router.post("/register", registerRules, validateRequest, asyncHandler(AuthController.register));
router.post("/login", loginRules, validateRequest, asyncHandler(AuthController.login));
router.post("/refresh", asyncHandler(AuthController.refresh));
router.post("/logout", asyncHandler(AuthController.logout));
router.get("/me", authenticate, asyncHandler(AuthController.me));

export default router;
