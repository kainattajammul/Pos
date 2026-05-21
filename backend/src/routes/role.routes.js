import { Router } from "express";
import { RoleController } from "../controllers/role.controller.js";
import { validateRequest } from "../middleware/validate.middleware.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import {
  createRoleRules,
  roleIdParamRules,
  updateRoleRules,
} from "../validators/role.validator.js";

const router = Router();

/** Public — list / create roles (no auth until frontend auth is wired) */
router.get("/", asyncHandler(RoleController.getAll));
router.post("/", createRoleRules, validateRequest, asyncHandler(RoleController.create));
router.put("/:id", updateRoleRules, validateRequest, asyncHandler(RoleController.update));
router.delete("/:id", roleIdParamRules, validateRequest, asyncHandler(RoleController.remove));

export default router;
