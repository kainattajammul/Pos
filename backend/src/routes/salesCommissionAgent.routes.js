import { Router } from "express";
import { SalesCommissionAgentController } from "../controllers/salesCommissionAgent.controller.js";
import { validateRequest } from "../middleware/validate.middleware.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import {
  createSalesCommissionAgentRules,
  salesCommissionAgentIdParamRules,
  updateSalesCommissionAgentRules,
} from "../validators/salesCommissionAgent.validator.js";

const router = Router();

/** Public — sales commission agents CRUD */
router.get("/", asyncHandler(SalesCommissionAgentController.getAll));
router.get(
  "/:id",
  salesCommissionAgentIdParamRules,
  validateRequest,
  asyncHandler(SalesCommissionAgentController.getOne),
);
router.post(
  "/",
  createSalesCommissionAgentRules,
  validateRequest,
  asyncHandler(SalesCommissionAgentController.create),
);
router.put(
  "/:id",
  updateSalesCommissionAgentRules,
  validateRequest,
  asyncHandler(SalesCommissionAgentController.update),
);
router.delete(
  "/:id",
  salesCommissionAgentIdParamRules,
  validateRequest,
  asyncHandler(SalesCommissionAgentController.remove),
);

export default router;
