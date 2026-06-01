import { Router } from "express";
import { UserController } from "../controllers/user.controller.js";
import { validateRequest } from "../middleware/validate.middleware.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import {
  createUserRules,
  updateUserRules,
  userIdParamRules,
} from "../validators/user.validator.js";

const router = Router();

/** Public list — matches create/update/delete scope until auth is wired on the frontend */
router.get("/", asyncHandler(UserController.getAll));

/** Public — create / update / delete / fetch single user */
router.post("/", createUserRules, validateRequest, asyncHandler(UserController.create));
router.get("/:id", userIdParamRules, validateRequest, asyncHandler(UserController.getOne));
router.put("/:id", updateUserRules, validateRequest, asyncHandler(UserController.update));
router.delete("/:id", userIdParamRules, validateRequest, asyncHandler(UserController.remove));

export default router;
