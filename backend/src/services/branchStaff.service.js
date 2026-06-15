import { ApiError } from "../utils/ApiError.js";
import { HTTP } from "../constants/httpStatus.js";
import { prisma } from "../config/database.js";
import { BranchModel } from "../models/branch.model.js";
import {
  BranchShiftModel,
  BranchStaffModel,
  BranchStaffRoleModel,
} from "../models/branchStaff.model.js";
import { staffStatusToDb } from "../constants/branchStaffEnums.js";
import { SYSTEM_BRANCH_ROLE_CODES } from "../constants/branchStaffEnums.js";
import { writeAuditLog } from "./auditLog.service.js";
import {
  buildStaffAvailableActions,
  toPublicStaffDetail,
  toPublicStaffListItem,
} from "../utils/branchStaffMapper.js";
import {
  assertCanGrantPermissions,
  getEffectivePermissions,
} from "./branchAuthorization.service.js";
import { getClientMeta } from "../utils/branchHelpers.js";

async function ensureBranch(shopId, branchUuid) {
  const branch = await BranchModel.findByUuid(branchUuid, shopId);
  if (!branch) throw new ApiError(HTTP.NOT_FOUND, "Branch not found");
  return branch;
}

async function ensureShopMember(userId, shopId) {
  const member = await prisma.shopMember.findFirst({
    where: { userId: Number(userId), shopId: Number(shopId), status: "ACTIVE" },
  });
  if (!member) {
    throw new ApiError(HTTP.BAD_REQUEST, "User must be an active shop member before branch assignment");
  }
  return member;
}

function assertAssignmentEditable(assignment) {
  if (assignment.status === "ARCHIVED" || assignment.archivedAt) {
    throw new ApiError(HTTP.CONFLICT, "Archived assignments cannot be updated. Restore first.");
  }
}

function buildStaffListWhere(query) {
  const where = {};
  if (query.status) where.status = staffStatusToDb(query.status);
  if (query.archived === "true") {
    where.status = "ARCHIVED";
  } else if (query.archived !== "true" && query.include_archived !== "true") {
    where.archivedAt = null;
  }
  if (query.is_primary === "true") where.isPrimaryBranch = true;
  if (query.role) {
    where.roles = { some: { role: { code: String(query.role) } } };
  }
  const search = String(query.search ?? "").trim();
  if (search) {
    where.OR = [
      { employeeCode: { contains: search, mode: "insensitive" } },
      { user: { fullName: { contains: search, mode: "insensitive" } } },
      { user: { email: { contains: search.toLowerCase(), mode: "insensitive" } } },
    ];
  }
  return where;
}

function buildStaffOrder(query) {
  const sort = query.sort ?? "created_at";
  const direction = query.direction === "asc" ? "asc" : "desc";
  const map = {
    name: { user: { fullName: direction } },
    created_at: { createdAt: direction },
    assignment_date: { startDate: direction },
  };
  return map[sort] ?? { createdAt: direction };
}

export async function listBranchStaff(shopId, branchUuid, query, authContext) {
  const branch = await ensureBranch(shopId, branchUuid);
  const page = Math.max(1, Number(query.page) || 1);
  const limit = Math.min(100, Math.max(1, Number(query.limit) || 20));
  const skip = (page - 1) * limit;
  const where = buildStaffListWhere(query);
  const orderBy = buildStaffOrder(query);

  const [rows, total] = await Promise.all([
    BranchStaffModel.list({ branchId: branch.id, shopId, where, orderBy, skip, take: limit }),
    BranchStaffModel.count({ branchId: branch.id, shopId, where }),
  ]);

  const data = await Promise.all(
    rows.map(async (assignment) => {
      const [nextShift, latestPerformance, availableActions] = await Promise.all([
        BranchShiftModel.nextShiftForAssignment(assignment.id, shopId),
        prisma.branchStaffPerformance.findFirst({
          where: { staffAssignmentId: assignment.id, shopId: Number(shopId) },
          orderBy: { periodEnd: "desc" },
        }),
        buildStaffAvailableActions(
          assignment,
          authContext.userId,
          shopId,
          branch.id,
          authContext.shopPermissions,
        ),
      ]);

      return toPublicStaffListItem(assignment, {
        nextShift,
        performanceSummary: latestPerformance
          ? {
              repairs_completed: latestPerformance.repairsCompleted || null,
              customer_rating:
                latestPerformance.customerRating != null
                  ? Number(latestPerformance.customerRating)
                  : null,
              target_percentage:
                latestPerformance.targetPercentage != null
                  ? Number(latestPerformance.targetPercentage)
                  : null,
            }
          : null,
        availableActions,
      });
    }),
  );

  return {
    rows: data,
    meta: { page, limit, total, totalPages: Math.ceil(total / limit) || 1 },
    branchStaffSummary: {
      assigned_staff_count: total,
      roles_enabled: [...new Set(rows.flatMap((r) => r.roles.map((x) => x.role.name)))],
      rota_enabled: true,
    },
  };
}

export async function getBranchStaff(shopId, branchUuid, assignmentUuid, authContext) {
  const branch = await ensureBranch(shopId, branchUuid);
  const assignment = await BranchStaffModel.findByUuid(assignmentUuid, branch.id, shopId);
  if (!assignment) throw new ApiError(HTTP.NOT_FOUND, "Staff assignment not found");

  const effectivePermissions = await getEffectivePermissions(
    assignment.userId,
    branch.id,
    shopId,
    { shopPermissions: authContext.shopPermissions },
  );

  const availableActions = await buildStaffAvailableActions(
    assignment,
    authContext.userId,
    shopId,
    branch.id,
    authContext.shopPermissions,
  );

  return toPublicStaffDetail(assignment, { effectivePermissions, availableActions });
}

export async function assignBranchStaff(shopId, branchUuid, payload, auditContext, authContext) {
  const branch = await ensureBranch(shopId, branchUuid);
  const user = await prisma.user.findFirst({
    where: {
      OR: [{ uuid: payload.user_id }, { id: Number(payload.user_id) || -1 }],
    },
  });
  if (!user) throw new ApiError(HTTP.NOT_FOUND, "User not found");

  const shopMember = await ensureShopMember(user.id, shopId);
  const existing = await BranchStaffModel.findByUserAndBranch(user.id, branch.id, shopId);
  if (existing && existing.status !== "ARCHIVED") {
    throw new ApiError(HTTP.CONFLICT, "This user is already assigned to the branch.");
  }

  if (payload.role_ids?.length) {
    await assertCanGrantPermissions(
      auditContext.userId,
      branch.id,
      shopId,
      ["branch_roles.assign"],
      { shopPermissions: authContext.shopPermissions },
    );
  }

  const resolvedRoleIds = payload.role_ids?.length
    ? (
        await prisma.role.findMany({
          where: { uuid: { in: payload.role_ids }, shopId: Number(shopId) },
          select: { id: true },
        })
      ).map((r) => r.id)
    : [];

  if (payload.is_primary_branch) {
    await BranchStaffModel.clearPrimaryForUser(user.id, shopId);
  }

  const assignment = await BranchStaffModel.create(
    {
      shopId: Number(shopId),
      branchId: branch.id,
      userId: user.id,
      shopMemberId: shopMember.id,
      employmentTitle: payload.employment_title ?? null,
      employeeCode: payload.employee_code ?? null,
      status: staffStatusToDb(payload.status ?? "active"),
      isPrimaryBranch: Boolean(payload.is_primary_branch),
      startDate: payload.start_date ? new Date(payload.start_date) : new Date(),
      endDate: payload.end_date ? new Date(payload.end_date) : null,
      assignedById: auditContext.userId ?? null,
    },
    resolvedRoleIds,
  );

  await writeAuditLog({
    shopId,
    branchId: branch.id,
    userId: auditContext.userId,
    action: "branch_staff.assigned",
    entity: "branch_staff_assignment",
    entityId: assignment.uuid,
    newValues: { user_id: user.uuid, branch_uuid: branchUuid },
    ipAddress: auditContext.ipAddress,
    userAgent: auditContext.userAgent,
  });

  return getBranchStaff(shopId, branchUuid, assignment.uuid, authContext);
}

export async function updateBranchStaff(shopId, branchUuid, assignmentUuid, payload, auditContext, authContext) {
  const branch = await ensureBranch(shopId, branchUuid);
  const assignment = await BranchStaffModel.findByUuid(assignmentUuid, branch.id, shopId);
  if (!assignment) throw new ApiError(HTTP.NOT_FOUND, "Staff assignment not found");
  assertAssignmentEditable(assignment);

  const data = {};
  if (payload.employment_title !== undefined) data.employmentTitle = payload.employment_title;
  if (payload.employee_code !== undefined) data.employeeCode = payload.employee_code;
  if (payload.start_date !== undefined) data.startDate = payload.start_date ? new Date(payload.start_date) : null;
  if (payload.end_date !== undefined) data.endDate = payload.end_date ? new Date(payload.end_date) : null;
  if (payload.is_primary_branch !== undefined) {
    data.isPrimaryBranch = Boolean(payload.is_primary_branch);
    if (data.isPrimaryBranch) {
      await BranchStaffModel.clearPrimaryForUser(assignment.userId, shopId, assignment.id);
    }
  }

  await BranchStaffModel.update(assignment.id, shopId, data);

  await writeAuditLog({
    shopId,
    branchId: branch.id,
    userId: auditContext.userId,
    action: "branch_staff.updated",
    entity: "branch_staff_assignment",
    entityId: assignment.uuid,
    oldValues: assignment,
    newValues: data,
    ipAddress: auditContext.ipAddress,
    userAgent: auditContext.userAgent,
  });

  return getBranchStaff(shopId, branchUuid, assignmentUuid, authContext);
}

async function transitionStaffStatus(shopId, branchUuid, assignmentUuid, status, action, auditContext, authContext) {
  const branch = await ensureBranch(shopId, branchUuid);
  const assignment = await BranchStaffModel.findByUuid(assignmentUuid, branch.id, shopId);
  if (!assignment) throw new ApiError(HTTP.NOT_FOUND, "Staff assignment not found");

  const data = { status };
  if (status === "ARCHIVED") {
    data.archivedAt = new Date();
    data.status = "ARCHIVED";
  } else if (status === "INACTIVE") {
    data.status = "INACTIVE";
  } else if (status === "ACTIVE") {
    data.status = "ACTIVE";
    data.archivedAt = null;
  }

  await BranchStaffModel.update(assignment.id, shopId, data);

  await writeAuditLog({
    shopId,
    branchId: branch.id,
    userId: auditContext.userId,
    action,
    entity: "branch_staff_assignment",
    entityId: assignment.uuid,
    oldValues: { status: assignment.status },
    newValues: data,
    ipAddress: auditContext.ipAddress,
    userAgent: auditContext.userAgent,
  });

  return getBranchStaff(shopId, branchUuid, assignmentUuid, authContext);
}

export const activateBranchStaff = (shopId, branchUuid, assignmentUuid, auditContext, authContext) =>
  transitionStaffStatus(shopId, branchUuid, assignmentUuid, "ACTIVE", "branch_staff.activated", auditContext, authContext);

export const deactivateBranchStaff = (shopId, branchUuid, assignmentUuid, auditContext, authContext) =>
  transitionStaffStatus(shopId, branchUuid, assignmentUuid, "INACTIVE", "branch_staff.deactivated", auditContext, authContext);

export const archiveBranchStaff = (shopId, branchUuid, assignmentUuid, auditContext, authContext) =>
  transitionStaffStatus(shopId, branchUuid, assignmentUuid, "ARCHIVED", "branch_staff.archived", auditContext, authContext);

export const restoreBranchStaff = (shopId, branchUuid, assignmentUuid, auditContext, authContext) =>
  transitionStaffStatus(shopId, branchUuid, assignmentUuid, "INACTIVE", "branch_staff.restored", auditContext, authContext);

export async function listBranchManagers(shopId, branchUuid) {
  const branch = await ensureBranch(shopId, branchUuid);
  const rows = await BranchStaffModel.listByRoleCode(branch.id, shopId, SYSTEM_BRANCH_ROLE_CODES.MANAGER);
  return rows.map((a) => toPublicStaffListItem(a));
}

export async function listBranchCashiers(shopId, branchUuid) {
  const branch = await ensureBranch(shopId, branchUuid);
  const rows = await BranchStaffModel.listByRoleCode(branch.id, shopId, SYSTEM_BRANCH_ROLE_CODES.CASHIER);
  return rows.map((a) => toPublicStaffListItem(a));
}

export async function listBranchTechnicians(shopId, branchUuid) {
  const branch = await ensureBranch(shopId, branchUuid);
  const rows = await BranchStaffModel.listByRoleCode(branch.id, shopId, SYSTEM_BRANCH_ROLE_CODES.TECHNICIAN);
  return rows.map((a) => toPublicStaffListItem(a));
}

export async function assignStaffRole(shopId, branchUuid, assignmentUuid, roleUuid, auditContext, authContext) {
  const branch = await ensureBranch(shopId, branchUuid);
  const assignment = await BranchStaffModel.findByUuid(assignmentUuid, branch.id, shopId);
  if (!assignment) throw new ApiError(HTTP.NOT_FOUND, "Staff assignment not found");
  assertAssignmentEditable(assignment);
  if (!["ACTIVE", "INVITED"].includes(assignment.status)) {
    throw new ApiError(HTTP.CONFLICT, "Staff assignment must be active to assign roles");
  }

  const role = await prisma.role.findFirst({
    where: { uuid: roleUuid, shopId: Number(shopId), scope: "BRANCH" },
  });
  if (!role) throw new ApiError(HTTP.NOT_FOUND, "Role not found");

  const existing = await BranchStaffRoleModel.findRoleAssignment(assignment.id, role.id, shopId);
  if (existing) throw new ApiError(HTTP.CONFLICT, "Role already assigned");

  await BranchStaffRoleModel.assign(assignment.id, shopId, role.id, auditContext.userId);

  await writeAuditLog({
    shopId,
    branchId: branch.id,
    userId: auditContext.userId,
    action: "branch_staff.role.assigned",
    entity: "branch_staff_role_assignment",
    entityId: role.uuid,
    newValues: { assignment_uuid: assignmentUuid, role_code: role.code },
    ipAddress: auditContext.ipAddress,
    userAgent: auditContext.userAgent,
  });

  return getBranchStaff(shopId, branchUuid, assignmentUuid, authContext);
}

export async function removeStaffRole(shopId, branchUuid, assignmentUuid, roleUuid, auditContext, authContext) {
  const branch = await ensureBranch(shopId, branchUuid);
  const assignment = await BranchStaffModel.findByUuid(assignmentUuid, branch.id, shopId);
  if (!assignment) throw new ApiError(HTTP.NOT_FOUND, "Staff assignment not found");

  const role = await prisma.role.findFirst({ where: { uuid: roleUuid, shopId: Number(shopId) } });
  if (!role) throw new ApiError(HTTP.NOT_FOUND, "Role not found");

  await BranchStaffRoleModel.remove(assignment.id, role.id, shopId);

  await writeAuditLog({
    shopId,
    branchId: branch.id,
    userId: auditContext.userId,
    action: "branch_staff.role.removed",
    entity: "branch_staff_role_assignment",
    entityId: role.uuid,
    ipAddress: auditContext.ipAddress,
    userAgent: auditContext.userAgent,
  });

  return getBranchStaff(shopId, branchUuid, assignmentUuid, authContext);
}

export function staffAuditContext(req) {
  return {
    userId: req.user?.id ?? req.authContext?.userId ?? null,
    ...getClientMeta(req),
  };
}
