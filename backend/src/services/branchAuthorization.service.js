import { prisma } from "../config/database.js";
import { ApiError } from "../utils/ApiError.js";
import { HTTP } from "../constants/httpStatus.js";
import { ShopMemberModel } from "../models/branch.model.js";
import { ACTIVE_STAFF_STATUSES } from "../constants/branchStaffEnums.js";

function isExpired(date) {
  return date && new Date(date) <= new Date();
}

export async function getShopPermissionKeys(userId, shopId) {
  return ShopMemberModel.userPermissionKeys(userId, shopId);
}

export async function getStaffAssignment(userId, branchId, shopId) {
  return prisma.branchStaffAssignment.findFirst({
    where: {
      userId: Number(userId),
      branchId: Number(branchId),
      shopId: Number(shopId),
      archivedAt: null,
    },
    include: {
      roles: {
        include: {
          role: {
            include: { permissions: { include: { permission: true } } },
          },
        },
      },
      permissions: { include: { permission: true } },
    },
  });
}

export async function getEffectivePermissions(userId, branchId, shopId, options = {}) {
  const sources = await getPermissionSources(userId, branchId, shopId, options);
  const allowed = new Set();
  const denied = new Set();

  for (const source of sources) {
    if (source.effect === "deny") denied.add(source.key);
    else allowed.add(source.key);
  }

  for (const key of denied) allowed.delete(key);

  return {
    permissions: [...allowed],
    sources,
    denied: [...denied],
  };
}

export async function getPermissionSources(userId, branchId, shopId, options = {}) {
  const sources = [];
  const shopPermissions = options.shopPermissions
    ?? await getShopPermissionKeys(userId, shopId);

  if (options.isSuperAdmin) {
    return [{ key: "*", source: "super_admin", effect: "allow" }];
  }

  for (const key of shopPermissions) {
    sources.push({ key, source: "shop_role", effect: "allow" });
  }

  const assignment = await getStaffAssignment(userId, branchId, shopId);
  if (!assignment || !ACTIVE_STAFF_STATUSES.includes(assignment.status)) {
    return sources;
  }

  for (const staffRole of assignment.roles) {
    for (const rp of staffRole.role.permissions) {
      sources.push({
        key: rp.permission.key,
        source: `branch_role:${staffRole.role.code ?? staffRole.role.name}`,
        effect: "allow",
      });
    }
  }

  for (const override of assignment.permissions) {
    if (isExpired(override.expiresAt)) continue;
    sources.push({
      key: override.permission.key,
      source: "direct_permission",
      effect: override.effect.toLowerCase(),
    });
  }

  return sources;
}

export async function hasPermission(userId, branchId, shopId, permissionKey, options = {}) {
  const { permissions } = await getEffectivePermissions(userId, branchId, shopId, options);
  if (permissions.includes("*")) return true;
  return permissions.includes(permissionKey);
}

export async function authorize(userId, branchId, shopId, permissionKey, options = {}) {
  const allowed = await hasPermission(userId, branchId, shopId, permissionKey, options);
  if (!allowed) {
    throw new ApiError(HTTP.FORBIDDEN, "You do not have permission to perform this action.", [
      { code: "BRANCH_PERMISSION_DENIED", permission: permissionKey },
    ]);
  }
  return true;
}

export async function assertCanGrantPermissions(granterUserId, branchId, shopId, permissionKeys, options = {}) {
  for (const key of permissionKeys) {
    const allowed = await hasPermission(granterUserId, branchId, shopId, key, options);
    if (!allowed) {
      throw new ApiError(
        HTTP.FORBIDDEN,
        `Cannot grant permission you do not have: ${key}`,
      );
    }
  }
}
