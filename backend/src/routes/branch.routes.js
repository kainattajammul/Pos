import { Router } from "express";
import { BranchController } from "../controllers/branch.controller.js";
import { validateRequest } from "../middleware/validate.middleware.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import {
  authenticateUnlessDev,
  requirePermission,
  requireShopAccess,
} from "../middleware/branchAccess.middleware.js";
import { BRANCH_PERMISSIONS } from "../constants/branchPermissions.js";
import {
  branchActionRules,
  createBranchRules,
  createClosureRules,
  deleteClosureRules,
  listBranchRules,
  listClosureRules,
  patchBranchStatusRules,
  updateBranchRules,
  updateClosureRules,
  updateOpeningHoursRules,
} from "../validators/branch.validator.js";
import branchStaffRoutes from "./branchStaff.routes.js";
import branchInventoryRoutes from "./branchInventory.routes.js";
import branchOperationsRoutes from "./branchOperations.routes.js";
import branchFinanceRoutes from "./branchFinance.routes.js";
import branchCommunicationRoutes from "./branchCommunication.routes.js";
import branchReportingRoutes from "./branchReporting.routes.js";
import branchSystemRoutes from "./branchSystem.routes.js";

const router = Router({ mergeParams: true });

router.use(authenticateUnlessDev, requireShopAccess);

router.get(
  "/",
  requirePermission(BRANCH_PERMISSIONS.VIEW),
  listBranchRules,
  validateRequest,
  asyncHandler(BranchController.list),
);

router.post(
  "/",
  requirePermission(BRANCH_PERMISSIONS.CREATE),
  createBranchRules,
  validateRequest,
  asyncHandler(BranchController.create),
);

router.get(
  "/:branchUuid",
  requirePermission(BRANCH_PERMISSIONS.VIEW),
  branchActionRules,
  validateRequest,
  asyncHandler(BranchController.show),
);

router.put(
  "/:branchUuid",
  requirePermission(BRANCH_PERMISSIONS.UPDATE),
  updateBranchRules,
  validateRequest,
  asyncHandler(BranchController.update),
);

router.patch(
  "/:branchUuid",
  requirePermission(BRANCH_PERMISSIONS.UPDATE),
  updateBranchRules,
  validateRequest,
  asyncHandler(BranchController.update),
);

router.patch(
  "/:branchUuid/status",
  requirePermission(BRANCH_PERMISSIONS.MANAGE_STATUS),
  patchBranchStatusRules,
  validateRequest,
  asyncHandler(BranchController.patchStatus),
);

router.post(
  "/:branchUuid/activate",
  requirePermission(BRANCH_PERMISSIONS.MANAGE_STATUS),
  branchActionRules,
  validateRequest,
  asyncHandler(BranchController.activate),
);

router.post(
  "/:branchUuid/deactivate",
  requirePermission(BRANCH_PERMISSIONS.MANAGE_STATUS),
  branchActionRules,
  validateRequest,
  asyncHandler(BranchController.deactivate),
);

router.post(
  "/:branchUuid/archive",
  requirePermission(BRANCH_PERMISSIONS.ARCHIVE),
  branchActionRules,
  validateRequest,
  asyncHandler(BranchController.archive),
);

router.post(
  "/:branchUuid/restore",
  requirePermission(BRANCH_PERMISSIONS.RESTORE),
  branchActionRules,
  validateRequest,
  asyncHandler(BranchController.restore),
);

router.delete(
  "/:branchUuid",
  requirePermission(BRANCH_PERMISSIONS.DELETE),
  branchActionRules,
  validateRequest,
  asyncHandler(BranchController.delete),
);

router.get(
  "/:branchUuid/opening-status",
  requirePermission(BRANCH_PERMISSIONS.VIEW),
  branchActionRules,
  validateRequest,
  asyncHandler(BranchController.openingStatus),
);

router.put(
  "/:branchUuid/opening-hours",
  requirePermission(BRANCH_PERMISSIONS.MANAGE_OPENING_HOURS),
  updateOpeningHoursRules,
  validateRequest,
  asyncHandler(BranchController.updateOpeningHours),
);

router.get(
  "/:branchUuid/closures",
  requirePermission(BRANCH_PERMISSIONS.MANAGE_CLOSURES),
  listClosureRules,
  validateRequest,
  asyncHandler(BranchController.listClosures),
);

router.post(
  "/:branchUuid/closures",
  requirePermission(BRANCH_PERMISSIONS.MANAGE_CLOSURES),
  createClosureRules,
  validateRequest,
  asyncHandler(BranchController.createClosure),
);

router.put(
  "/:branchUuid/closures/:closureId",
  requirePermission(BRANCH_PERMISSIONS.MANAGE_CLOSURES),
  updateClosureRules,
  validateRequest,
  asyncHandler(BranchController.updateClosure),
);

router.delete(
  "/:branchUuid/closures/:closureId",
  requirePermission(BRANCH_PERMISSIONS.MANAGE_CLOSURES),
  deleteClosureRules,
  validateRequest,
  asyncHandler(BranchController.deleteClosure),
);

router.use("/:branchUuid", branchStaffRoutes);
router.use("/:branchUuid", branchInventoryRoutes);
router.use("/:branchUuid", branchOperationsRoutes);
router.use("/:branchUuid", branchFinanceRoutes);
router.use("/:branchUuid", branchCommunicationRoutes);
router.use("/:branchUuid", branchReportingRoutes);
router.use("/:branchUuid", branchSystemRoutes);

export default router;
