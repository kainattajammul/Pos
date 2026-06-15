import { ApiError } from "../utils/ApiError.js";
import { HTTP } from "../constants/httpStatus.js";
import { prisma } from "../config/database.js";
import { BranchModel } from "../models/branch.model.js";
import {
  BranchRoleModel,
  BranchShiftModel,
  BranchStaffModel,
  BranchUserPermissionModel,
} from "../models/branchStaff.model.js";
import { permissionEffectToDb } from "../constants/branchStaffEnums.js";
import { writeAuditLog } from "./auditLog.service.js";
import { toPublicBranchRole } from "../utils/branchStaffMapper.js";
import {
  assertCanGrantPermissions,
  getEffectivePermissions,
} from "./branchAuthorization.service.js";
import { permissionEffectFromDb } from "../constants/branchStaffEnums.js";

async function ensureBranch(shopId, branchUuid) {
  const branch = await BranchModel.findByUuid(branchUuid, shopId);
  if (!branch) throw new ApiError(HTTP.NOT_FOUND, "Branch not found");
  return branch;
}

export async function listBranchRoles(shopId, branchUuid) {
  await ensureBranch(shopId, branchUuid);
  const roles = await BranchRoleModel.list(shopId, "BRANCH");
  return roles.map(toPublicBranchRole);
}

export async function createBranchRole(shopId, branchUuid, payload, auditContext) {
  await ensureBranch(shopId, branchUuid);
  const existing = await BranchRoleModel.findByCode(payload.code, shopId);
  if (existing) throw new ApiError(HTTP.CONFLICT, "Role code already exists");

  const permissionIds = payload.permission_keys?.length
    ? (
        await prisma.permission.findMany({
          where: { key: { in: payload.permission_keys } },
          select: { id: true },
        })
      ).map((p) => p.id)
    : [];

  const role = await BranchRoleModel.create(
    {
      shopId: Number(shopId),
      name: payload.name,
      code: payload.code,
      description: payload.description ?? null,
      isSystem: false,
      isActive: true,
      scope: "BRANCH",
    },
    permissionIds,
  );

  await writeAuditLog({
    shopId,
    userId: auditContext.userId,
    action: "branch_role.created",
    entity: "branch_role",
    entityId: role.uuid,
    newValues: role,
    ipAddress: auditContext.ipAddress,
    userAgent: auditContext.userAgent,
  });

  return toPublicBranchRole(role);
}

export async function updateBranchRole(shopId, branchUuid, roleUuid, payload, auditContext) {
  await ensureBranch(shopId, branchUuid);
  const role = await BranchRoleModel.findByUuid(roleUuid, shopId);
  if (!role) throw new ApiError(HTTP.NOT_FOUND, "Role not found");
  if (role.isSystem && payload.code && payload.code !== role.code) {
    throw new ApiError(HTTP.CONFLICT, "System roles cannot change code");
  }

  const permissionIds = payload.permission_keys
    ? (
        await prisma.permission.findMany({
          where: { key: { in: payload.permission_keys } },
          select: { id: true },
        })
      ).map((p) => p.id)
    : undefined;

  const updated = await BranchRoleModel.update(
    role.id,
    shopId,
    {
      ...(payload.name !== undefined ? { name: payload.name } : {}),
      ...(payload.description !== undefined ? { description: payload.description } : {}),
      ...(payload.is_active !== undefined ? { isActive: payload.is_active } : {}),
    },
    permissionIds,
  );

  await writeAuditLog({
    shopId,
    userId: auditContext.userId,
    action: "branch_role.updated",
    entity: "branch_role",
    entityId: role.uuid,
    oldValues: role,
    newValues: updated,
    ipAddress: auditContext.ipAddress,
    userAgent: auditContext.userAgent,
  });

  return toPublicBranchRole(updated);
}

export async function deleteBranchRole(shopId, branchUuid, roleUuid, auditContext) {
  await ensureBranch(shopId, branchUuid);
  const role = await BranchRoleModel.findByUuid(roleUuid, shopId);
  if (!role) throw new ApiError(HTTP.NOT_FOUND, "Role not found");
  if (role.isSystem) throw new ApiError(HTTP.CONFLICT, "System roles cannot be deleted");

  await BranchRoleModel.remove(role.id, shopId);

  await writeAuditLog({
    shopId,
    userId: auditContext.userId,
    action: "branch_role.deleted",
    entity: "branch_role",
    entityId: role.uuid,
    oldValues: role,
    ipAddress: auditContext.ipAddress,
    userAgent: auditContext.userAgent,
  });
}

export async function listBranchPermissions() {
  const permissions = await prisma.permission.findMany({
    where: { module: { startsWith: "branch" } },
    orderBy: { key: "asc" },
  });
  return permissions.map((p) => ({ key: p.key, module: p.module }));
}

export async function getStaffPermissions(shopId, branchUuid, assignmentUuid) {
  const branch = await ensureBranch(shopId, branchUuid);
  const assignment = await BranchStaffModel.findByUuid(assignmentUuid, branch.id, shopId);
  if (!assignment) throw new ApiError(HTTP.NOT_FOUND, "Staff assignment not found");

  const rows = await BranchUserPermissionModel.listForAssignment(assignment.id, shopId);
  return rows.map((r) => ({
    key: r.permission.key,
    effect: permissionEffectFromDb(r.effect),
    expires_at: r.expiresAt?.toISOString() ?? null,
  }));
}

export async function updateStaffPermissions(
  shopId,
  branchUuid,
  assignmentUuid,
  payload,
  auditContext,
  authContext,
) {
  const branch = await ensureBranch(shopId, branchUuid);
  const assignment = await BranchStaffModel.findByUuid(assignmentUuid, branch.id, shopId);
  if (!assignment) throw new ApiError(HTTP.NOT_FOUND, "Staff assignment not found");

  const allowKeys = (payload.permissions ?? [])
    .filter((p) => p.effect === "allow")
    .map((p) => p.key);
  await assertCanGrantPermissions(
    auditContext.userId,
    branch.id,
    shopId,
    allowKeys,
    { shopPermissions: authContext.shopPermissions },
  );

  const permissions = await prisma.permission.findMany({
    where: { key: { in: (payload.permissions ?? []).map((p) => p.key) } },
  });
  const keyToId = Object.fromEntries(permissions.map((p) => [p.key, p.id]));

  const rows = (payload.permissions ?? []).map((p) => ({
    permissionId: keyToId[p.key],
    effect: permissionEffectToDb(p.effect),
    expiresAt: p.expires_at ? new Date(p.expires_at) : null,
  })).filter((r) => r.permissionId);

  await BranchUserPermissionModel.replaceForAssignment(
    assignment.id,
    shopId,
    rows,
    auditContext.userId,
  );

  await writeAuditLog({
    shopId,
    branchId: branch.id,
    userId: auditContext.userId,
    action: "branch_staff.permissions.updated",
    entity: "branch_staff_assignment",
    entityId: assignment.uuid,
    newValues: payload.permissions,
    ipAddress: auditContext.ipAddress,
    userAgent: auditContext.userAgent,
  });

  return getStaffPermissions(shopId, branchUuid, assignmentUuid);
}

export async function getStaffEffectivePermissions(shopId, branchUuid, assignmentUuid, authContext) {
  const branch = await ensureBranch(shopId, branchUuid);
  const assignment = await BranchStaffModel.findByUuid(assignmentUuid, branch.id, shopId);
  if (!assignment) throw new ApiError(HTTP.NOT_FOUND, "Staff assignment not found");

  return getEffectivePermissions(assignment.userId, branch.id, shopId, {
    shopPermissions: authContext.shopPermissions,
  });
}
