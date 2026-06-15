import { ApiResponse } from "../utils/ApiResponse.js";
import { HTTP } from "../constants/httpStatus.js";
import {
  activateBranch,
  archiveBranch,
  createBranch,
  deactivateBranch,
  deleteBranch,
  getBranchOpeningStatus,
  getBranchProfile,
  listBranches,
  patchBranchStatus,
  restoreBranch,
  updateBranch,
  updateBranchOpeningHours,
} from "../services/branch.service.js";
import {
  createBranchClosure,
  deleteBranchClosure,
  listBranchClosures,
  updateBranchClosure,
} from "../services/branchClosure.service.js";
import {
  toPublicBranchListItem,
  toPublicBranchProfile,
  toPublicClosure,
} from "../utils/branchMapper.js";
import { getClientMeta } from "../utils/branchHelpers.js";

function auditContext(req) {
  return {
    userId: req.user?.id ?? null,
    ...getClientMeta(req),
  };
}

export const BranchController = {
  async list(req, res) {
    const result = await listBranches(req.shopId, req.query);
    const permissions = req.shopPermissions;

    return ApiResponse.success(res, {
      message: "Branches retrieved successfully.",
      data: result.rows.map(({ branch, openingStatus }) =>
        toPublicBranchListItem(branch, openingStatus, permissions),
      ),
      meta: result.meta,
    });
  },

  async show(req, res) {
    const { branch, openingStatus, upcomingClosures } = await getBranchProfile(
      req.shopId,
      req.params.branchUuid,
    );

    return ApiResponse.success(res, {
      message: "Branch retrieved successfully.",
      data: toPublicBranchProfile(branch, openingStatus, upcomingClosures),
    });
  },

  async create(req, res) {
    const { branch, openingStatus } = await createBranch(
      req.shopId,
      req.body,
      auditContext(req),
    );

    return ApiResponse.success(res, {
      statusCode: HTTP.CREATED,
      message: "Branch created successfully.",
      data: toPublicBranchProfile(branch, openingStatus, []),
    });
  },

  async update(req, res) {
    const { branch, openingStatus } = await updateBranch(
      req.shopId,
      req.params.branchUuid,
      req.body,
      auditContext(req),
    );

    return ApiResponse.success(res, {
      message: "Branch updated successfully.",
      data: toPublicBranchProfile(branch, openingStatus, branch.closures ?? []),
    });
  },

  async patchStatus(req, res) {
    const { branch, openingStatus } = await patchBranchStatus(
      req.shopId,
      req.params.branchUuid,
      req.body,
      auditContext(req),
    );

    return ApiResponse.success(res, {
      message: "Branch status updated successfully.",
      data: toPublicBranchProfile(branch, openingStatus, branch.closures ?? []),
    });
  },

  async activate(req, res) {
    const { branch, openingStatus } = await activateBranch(
      req.shopId,
      req.params.branchUuid,
      auditContext(req),
    );

    return ApiResponse.success(res, {
      message: "Branch activated successfully.",
      data: toPublicBranchProfile(branch, openingStatus, branch.closures ?? []),
    });
  },

  async deactivate(req, res) {
    const { branch, openingStatus } = await deactivateBranch(
      req.shopId,
      req.params.branchUuid,
      auditContext(req),
    );

    return ApiResponse.success(res, {
      message: "Branch deactivated successfully.",
      data: toPublicBranchProfile(branch, openingStatus, branch.closures ?? []),
    });
  },

  async archive(req, res) {
    const { branch, openingStatus } = await archiveBranch(
      req.shopId,
      req.params.branchUuid,
      auditContext(req),
    );

    return ApiResponse.success(res, {
      message: "Branch archived successfully.",
      data: toPublicBranchProfile(branch, openingStatus, branch.closures ?? []),
    });
  },

  async restore(req, res) {
    const { branch, openingStatus } = await restoreBranch(
      req.shopId,
      req.params.branchUuid,
      auditContext(req),
    );

    return ApiResponse.success(res, {
      message: "Branch restored successfully.",
      data: toPublicBranchProfile(branch, openingStatus, branch.closures ?? []),
    });
  },

  async delete(req, res) {
    const data = await deleteBranch(
      req.shopId,
      req.params.branchUuid,
      auditContext(req),
    );

    return ApiResponse.success(res, {
      message: "Branch deleted successfully.",
      data,
    });
  },

  async openingStatus(req, res) {
    const openingStatus = await getBranchOpeningStatus(
      req.shopId,
      req.params.branchUuid,
    );

    return ApiResponse.success(res, {
      message: "Branch opening status retrieved successfully.",
      data: openingStatus,
    });
  },

  async updateOpeningHours(req, res) {
    const { branch, openingStatus } = await updateBranchOpeningHours(
      req.shopId,
      req.params.branchUuid,
      req.body,
      auditContext(req),
    );

    return ApiResponse.success(res, {
      message: "Opening hours updated successfully.",
      data: toPublicBranchProfile(branch, openingStatus, branch.closures ?? []),
    });
  },

  async listClosures(req, res) {
    const closures = await listBranchClosures(req.shopId, req.params.branchUuid);

    return ApiResponse.success(res, {
      message: "Branch closures retrieved successfully.",
      data: closures.map(toPublicClosure),
    });
  },

  async createClosure(req, res) {
    const closure = await createBranchClosure(
      req.shopId,
      req.params.branchUuid,
      req.body,
      auditContext(req),
    );

    return ApiResponse.success(res, {
      statusCode: HTTP.CREATED,
      message: "Branch closure created successfully.",
      data: toPublicClosure(closure),
    });
  },

  async updateClosure(req, res) {
    const closure = await updateBranchClosure(
      req.shopId,
      req.params.branchUuid,
      req.params.closureId,
      req.body,
      auditContext(req),
    );

    return ApiResponse.success(res, {
      message: "Branch closure updated successfully.",
      data: toPublicClosure(closure),
    });
  },

  async deleteClosure(req, res) {
    await deleteBranchClosure(
      req.shopId,
      req.params.branchUuid,
      req.params.closureId,
      auditContext(req),
    );

    return ApiResponse.success(res, {
      message: "Branch closure deleted successfully.",
    });
  },
};
