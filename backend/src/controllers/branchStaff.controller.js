import { ApiResponse } from "../utils/ApiResponse.js";
import { HTTP } from "../constants/httpStatus.js";
import {
  activateBranchStaff,
  archiveBranchStaff,
  assignBranchStaff,
  assignStaffRole,
  deactivateBranchStaff,
  getBranchStaff,
  listBranchCashiers,
  listBranchManagers,
  listBranchStaff,
  listBranchTechnicians,
  removeStaffRole,
  restoreBranchStaff,
  staffAuditContext,
  updateBranchStaff,
} from "../services/branchStaff.service.js";
import {
  createBranchRole,
  deleteBranchRole,
  getStaffEffectivePermissions,
  getStaffPermissions,
  listBranchPermissions,
  listBranchRoles,
  updateBranchRole,
  updateStaffPermissions,
} from "../services/branchRole.service.js";
import {
  copyWeekRota,
  createShift,
  deleteShift,
  listRota,
  publishRota,
  updateShift,
} from "../services/branchRota.service.js";
import {
  getStaffPerformance,
  listBranchPerformance,
} from "../services/branchStaffPerformance.service.js";
import {
  getRules,
  updateRule,
  updateRules,
} from "../services/branchSecurity.service.js";

export const BranchStaffController = {
  async listStaff(req, res) {
    const result = await listBranchStaff(req.shopId, req.branchUuid, req.query, req.authContext);
    return ApiResponse.success(res, {
      message: "Branch staff retrieved successfully.",
      data: result.rows,
      meta: result.meta,
      summary: result.branchStaffSummary,
    });
  },

  async showStaff(req, res) {
    const data = await getBranchStaff(
      req.shopId,
      req.branchUuid,
      req.params.assignmentUuid,
      req.authContext,
    );
    return ApiResponse.success(res, { message: "Branch staff member retrieved.", data });
  },

  async assignStaff(req, res) {
    const data = await assignBranchStaff(
      req.shopId,
      req.branchUuid,
      req.body,
      staffAuditContext(req),
      req.authContext,
    );
    return ApiResponse.success(res, {
      statusCode: HTTP.CREATED,
      message: "Branch staff member assigned successfully.",
      data,
    });
  },

  async updateStaff(req, res) {
    const data = await updateBranchStaff(
      req.shopId,
      req.branchUuid,
      req.params.assignmentUuid,
      req.body,
      staffAuditContext(req),
      req.authContext,
    );
    return ApiResponse.success(res, { message: "Branch staff updated successfully.", data });
  },

  async activateStaff(req, res) {
    const data = await activateBranchStaff(
      req.shopId,
      req.branchUuid,
      req.params.assignmentUuid,
      staffAuditContext(req),
      req.authContext,
    );
    return ApiResponse.success(res, { message: "Branch staff activated.", data });
  },

  async deactivateStaff(req, res) {
    const data = await deactivateBranchStaff(
      req.shopId,
      req.branchUuid,
      req.params.assignmentUuid,
      staffAuditContext(req),
      req.authContext,
    );
    return ApiResponse.success(res, { message: "Branch staff deactivated.", data });
  },

  async archiveStaff(req, res) {
    const data = await archiveBranchStaff(
      req.shopId,
      req.branchUuid,
      req.params.assignmentUuid,
      staffAuditContext(req),
      req.authContext,
    );
    return ApiResponse.success(res, { message: "Branch staff archived.", data });
  },

  async restoreStaff(req, res) {
    const data = await restoreBranchStaff(
      req.shopId,
      req.branchUuid,
      req.params.assignmentUuid,
      staffAuditContext(req),
      req.authContext,
    );
    return ApiResponse.success(res, { message: "Branch staff restored.", data });
  },

  async listManagers(req, res) {
    const data = await listBranchManagers(req.shopId, req.branchUuid);
    return ApiResponse.success(res, { message: "Branch managers retrieved.", data });
  },

  async listCashiers(req, res) {
    const data = await listBranchCashiers(req.shopId, req.branchUuid);
    return ApiResponse.success(res, { message: "Branch cashiers retrieved.", data });
  },

  async listTechnicians(req, res) {
    const data = await listBranchTechnicians(req.shopId, req.branchUuid);
    return ApiResponse.success(res, { message: "Branch technicians retrieved.", data });
  },

  async listRoles(req, res) {
    const data = await listBranchRoles(req.shopId, req.branchUuid);
    return ApiResponse.success(res, { message: "Branch roles retrieved.", data });
  },

  async createRole(req, res) {
    const data = await createBranchRole(
      req.shopId,
      req.branchUuid,
      req.body,
      staffAuditContext(req),
    );
    return ApiResponse.success(res, {
      statusCode: HTTP.CREATED,
      message: "Branch role created.",
      data,
    });
  },

  async updateRole(req, res) {
    const data = await updateBranchRole(
      req.shopId,
      req.branchUuid,
      req.params.roleUuid,
      req.body,
      staffAuditContext(req),
    );
    return ApiResponse.success(res, { message: "Branch role updated.", data });
  },

  async deleteRole(req, res) {
    await deleteBranchRole(
      req.shopId,
      req.branchUuid,
      req.params.roleUuid,
      staffAuditContext(req),
    );
    return ApiResponse.success(res, { message: "Branch role deleted." });
  },

  async assignRole(req, res) {
    const data = await assignStaffRole(
      req.shopId,
      req.branchUuid,
      req.params.assignmentUuid,
      req.body.role_id,
      staffAuditContext(req),
      req.authContext,
    );
    return ApiResponse.success(res, { message: "Role assigned to staff member.", data });
  },

  async removeRole(req, res) {
    const data = await removeStaffRole(
      req.shopId,
      req.branchUuid,
      req.params.assignmentUuid,
      req.params.roleUuid,
      staffAuditContext(req),
      req.authContext,
    );
    return ApiResponse.success(res, { message: "Role removed from staff member.", data });
  },

  async listPermissions(req, res) {
    const data = await listBranchPermissions();
    return ApiResponse.success(res, { message: "Branch permissions retrieved.", data });
  },

  async getStaffPermissions(req, res) {
    const data = await getStaffPermissions(
      req.shopId,
      req.branchUuid,
      req.params.assignmentUuid,
    );
    return ApiResponse.success(res, { message: "Staff permissions retrieved.", data });
  },

  async updateStaffPermissions(req, res) {
    const data = await updateStaffPermissions(
      req.shopId,
      req.branchUuid,
      req.params.assignmentUuid,
      req.body,
      staffAuditContext(req),
      req.authContext,
    );
    return ApiResponse.success(res, { message: "Staff permissions updated.", data });
  },

  async effectivePermissions(req, res) {
    const data = await getStaffEffectivePermissions(
      req.shopId,
      req.branchUuid,
      req.params.assignmentUuid,
      req.authContext,
    );
    return ApiResponse.success(res, { message: "Effective permissions retrieved.", data });
  },

  async listRota(req, res) {
    const data = await listRota(req.shopId, req.branchUuid, req.query);
    return ApiResponse.success(res, { message: "Branch rota retrieved.", data });
  },

  async createShift(req, res) {
    const data = await createShift(
      req.shopId,
      req.branchUuid,
      req.body,
      staffAuditContext(req),
    );
    return ApiResponse.success(res, {
      statusCode: HTTP.CREATED,
      message: "Shift created.",
      data,
    });
  },

  async updateShift(req, res) {
    const data = await updateShift(
      req.shopId,
      req.branchUuid,
      req.params.shiftUuid,
      req.body,
      staffAuditContext(req),
    );
    return ApiResponse.success(res, { message: "Shift updated.", data });
  },

  async deleteShift(req, res) {
    await deleteShift(req.shopId, req.branchUuid, req.params.shiftUuid, staffAuditContext(req));
    return ApiResponse.success(res, { message: "Shift cancelled." });
  },

  async publishRota(req, res) {
    const data = await publishRota(
      req.shopId,
      req.branchUuid,
      req.body,
      staffAuditContext(req),
    );
    return ApiResponse.success(res, { message: "Rota published.", data });
  },

  async copyWeek(req, res) {
    const data = await copyWeekRota(
      req.shopId,
      req.branchUuid,
      req.body,
      staffAuditContext(req),
    );
    return ApiResponse.success(res, { message: "Week rota copied.", data });
  },

  async listPerformance(req, res) {
    const data = await listBranchPerformance(req.shopId, req.branchUuid, req.query);
    return ApiResponse.success(res, { message: "Branch staff performance retrieved.", data });
  },

  async staffPerformance(req, res) {
    const data = await getStaffPerformance(
      req.shopId,
      req.branchUuid,
      req.params.assignmentUuid,
      req.query,
    );
    return ApiResponse.success(res, { message: "Staff performance retrieved.", data });
  },

  async listSecurityRules(req, res) {
    const data = await getRules(req.shopId, req.branchUuid);
    return ApiResponse.success(res, { message: "Security rules retrieved.", data });
  },

  async patchSecurityRules(req, res) {
    const data = await updateRules(
      req.shopId,
      req.branchUuid,
      req.body,
      staffAuditContext(req),
    );
    return ApiResponse.success(res, { message: "Security rules updated.", data });
  },

  async patchSecurityRule(req, res) {
    const data = await updateRule(
      req.shopId,
      req.branchUuid,
      req.params.ruleKey,
      req.body,
      staffAuditContext(req),
    );
    return ApiResponse.success(res, { message: "Security rule updated.", data });
  },
};
