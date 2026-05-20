import { Router } from "express";
import { UserController } from "../controllers/user.controller.js";
import { authenticate } from "../middleware/auth.middleware.js";
import { validateRequest } from "../middleware/validate.middleware.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { updateUserRules, userIdParamRules } from "../validators/user.validator.js";

const router = Router();

router.use(authenticate);

router.get("/", asyncHandler(UserController.getAll));
router.get("/:id", userIdParamRules, validateRequest, asyncHandler(UserController.getOne));
router.put("/:id", updateUserRules, validateRequest, asyncHandler(UserController.update));
router.delete("/:id", userIdParamRules, validateRequest, asyncHandler(UserController.remove));

export default router;
