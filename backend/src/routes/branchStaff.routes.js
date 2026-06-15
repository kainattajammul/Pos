import { Router } from "express";
import { body, param } from "express-validator";
import { BranchStaffController } from "../controllers/branchStaff.controller.js";
import { validateRequest } from "../middleware/validate.middleware.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import {
  authenticateRequest,
  requireBranchContext,
  requireBranchPermission,
} from "../middleware/branchStaffAccess.middleware.js";
import { BRANCH_STAFF_PERMISSIONS } from "../constants/branchStaffPermissions.js";
import {
  assignStaffRules,
  assignmentUuidRules,
  branchStaffContextRules,
  copyWeekRules,
  createRoleRules,
  createShiftRules,
  listPerformanceRules,
  listRotaRules,
  listStaffRules,
  publishRotaRules,
  roleUuidRules,
  shiftUuidRules,
  updatePermissionsRules,
  updateRoleRules,
  updateSecurityRuleRules,
  updateShiftRules,
  updateStaffRules,
} from "../validators/branchStaff.validator.js";

const router = Router({ mergeParams: true });

router.use(authenticateRequest, requireBranchContext);

const P = BRANCH_STAFF_PERMISSIONS;

const assignRoleRules = [
  ...assignmentUuidRules,
  body("role_id").isUUID().withMessage("role_id must be a valid UUID"),
];

const deleteRoleRules = [
  ...branchStaffContextRules,
  param("roleUuid").isUUID(),
];

// Staff assignments
router.get(
  "/staff",
  requireBranchPermission(P.VIEW),
  listStaffRules,
  validateRequest,
  asyncHandler(BranchStaffController.listStaff),
);
router.post(
  "/staff",
  requireBranchPermission(P.ASSIGN),
  assignStaffRules,
  validateRequest,
  asyncHandler(BranchStaffController.assignStaff),
);
router.get(
  "/staff/:assignmentUuid",
  requireBranchPermission(P.VIEW),
  assignmentUuidRules,
  validateRequest,
  asyncHandler(BranchStaffController.showStaff),
);
router.patch(
  "/staff/:assignmentUuid",
  requireBranchPermission(P.UPDATE),
  updateStaffRules,
  validateRequest,
  asyncHandler(BranchStaffController.updateStaff),
);
router.post(
  "/staff/:assignmentUuid/activate",
  requireBranchPermission(P.UPDATE),
  assignmentUuidRules,
  validateRequest,
  asyncHandler(BranchStaffController.activateStaff),
);
router.post(
  "/staff/:assignmentUuid/deactivate",
  requireBranchPermission(P.DEACTIVATE),
  assignmentUuidRules,
  validateRequest,
  asyncHandler(BranchStaffController.deactivateStaff),
);
router.post(
  "/staff/:assignmentUuid/archive",
  requireBranchPermission(P.ARCHIVE),
  assignmentUuidRules,
  validateRequest,
  asyncHandler(BranchStaffController.archiveStaff),
);
router.post(
  "/staff/:assignmentUuid/restore",
  requireBranchPermission(P.RESTORE),
  assignmentUuidRules,
  validateRequest,
  asyncHandler(BranchStaffController.restoreStaff),
);

router.get(
  "/managers",
  requireBranchPermission(P.VIEW),
  branchStaffContextRules,
  validateRequest,
  asyncHandler(BranchStaffController.listManagers),
);
router.get(
  "/cashiers",
  requireBranchPermission(P.VIEW),
  branchStaffContextRules,
  validateRequest,
  asyncHandler(BranchStaffController.listCashiers),
);
router.get(
  "/technicians",
  requireBranchPermission(P.VIEW),
  branchStaffContextRules,
  validateRequest,
  asyncHandler(BranchStaffController.listTechnicians),
);

router.get(
  "/roles",
  requireBranchPermission(P.ROLES_VIEW),
  branchStaffContextRules,
  validateRequest,
  asyncHandler(BranchStaffController.listRoles),
);
router.post(
  "/roles",
  requireBranchPermission(P.ROLES_CREATE),
  createRoleRules,
  validateRequest,
  asyncHandler(BranchStaffController.createRole),
);
router.patch(
  "/roles/:roleUuid",
  requireBranchPermission(P.ROLES_UPDATE),
  updateRoleRules,
  validateRequest,
  asyncHandler(BranchStaffController.updateRole),
);
router.delete(
  "/roles/:roleUuid",
  requireBranchPermission(P.ROLES_DELETE),
  deleteRoleRules,
  validateRequest,
  asyncHandler(BranchStaffController.deleteRole),
);

router.post(
  "/staff/:assignmentUuid/roles",
  requireBranchPermission(P.ROLES_ASSIGN),
  assignRoleRules,
  validateRequest,
  asyncHandler(BranchStaffController.assignRole),
);
router.delete(
  "/staff/:assignmentUuid/roles/:roleUuid",
  requireBranchPermission(P.ROLES_ASSIGN),
  roleUuidRules,
  validateRequest,
  asyncHandler(BranchStaffController.removeRole),
);

router.get(
  "/permissions",
  requireBranchPermission(P.PERMISSIONS_VIEW),
  branchStaffContextRules,
  validateRequest,
  asyncHandler(BranchStaffController.listPermissions),
);
router.get(
  "/staff/:assignmentUuid/permissions",
  requireBranchPermission(P.PERMISSIONS_VIEW),
  assignmentUuidRules,
  validateRequest,
  asyncHandler(BranchStaffController.getStaffPermissions),
);
router.put(
  "/staff/:assignmentUuid/permissions",
  requireBranchPermission(P.PERMISSIONS_ASSIGN),
  updatePermissionsRules,
  validateRequest,
  asyncHandler(BranchStaffController.updateStaffPermissions),
);
router.get(
  "/staff/:assignmentUuid/effective-permissions",
  requireBranchPermission(P.PERMISSIONS_VIEW),
  assignmentUuidRules,
  validateRequest,
  asyncHandler(BranchStaffController.effectivePermissions),
);

router.get(
  "/rota",
  requireBranchPermission(P.SCHEDULE_VIEW),
  listRotaRules,
  validateRequest,
  asyncHandler(BranchStaffController.listRota),
);
router.post(
  "/rota/shifts",
  requireBranchPermission(P.SCHEDULE_CREATE),
  createShiftRules,
  validateRequest,
  asyncHandler(BranchStaffController.createShift),
);
router.patch(
  "/rota/shifts/:shiftUuid",
  requireBranchPermission(P.SCHEDULE_UPDATE),
  updateShiftRules,
  validateRequest,
  asyncHandler(BranchStaffController.updateShift),
);
router.delete(
  "/rota/shifts/:shiftUuid",
  requireBranchPermission(P.SCHEDULE_DELETE),
  shiftUuidRules,
  validateRequest,
  asyncHandler(BranchStaffController.deleteShift),
);
router.post(
  "/rota/publish",
  requireBranchPermission(P.SCHEDULE_PUBLISH),
  publishRotaRules,
  validateRequest,
  asyncHandler(BranchStaffController.publishRota),
);
router.post(
  "/rota/copy-week",
  requireBranchPermission(P.SCHEDULE_CREATE),
  copyWeekRules,
  validateRequest,
  asyncHandler(BranchStaffController.copyWeek),
);

router.get(
  "/staff-performance",
  requireBranchPermission(P.PERFORMANCE_VIEW),
  listPerformanceRules,
  validateRequest,
  asyncHandler(BranchStaffController.listPerformance),
);
router.get(
  "/staff/:assignmentUuid/performance",
  requireBranchPermission(P.PERFORMANCE_VIEW),
  assignmentUuidRules,
  listPerformanceRules,
  validateRequest,
  asyncHandler(BranchStaffController.staffPerformance),
);

router.get(
  "/security-rules",
  requireBranchPermission(P.SECURITY_VIEW),
  branchStaffContextRules,
  validateRequest,
  asyncHandler(BranchStaffController.listSecurityRules),
);
router.patch(
  "/security-rules",
  requireBranchPermission(P.SECURITY_MANAGE),
  updateSecurityRuleRules,
  validateRequest,
  asyncHandler(BranchStaffController.patchSecurityRules),
);
router.patch(
  "/security-rules/:ruleKey",
  requireBranchPermission(P.SECURITY_MANAGE),
  updateSecurityRuleRules,
  validateRequest,
  asyncHandler(BranchStaffController.patchSecurityRule),
);

export default router;
