import { ApiError } from "../utils/ApiError.js";
import { HTTP } from "../constants/httpStatus.js";
import { prisma } from "../config/database.js";
import { RoleModel } from "../models/role.model.js";
import { ShopModel } from "../models/shop.model.js";

export async function getAllRoles() {
  return RoleModel.findAll();
}

/**
 * Creates a role scoped to a shop. Role names must be unique per shop.
 */
export async function createRole({ shopId, name }) {
  const trimmedName = name.trim();

  if (trimmedName.length < 2) {
    throw new ApiError(HTTP.BAD_REQUEST, "Role name must be at least 2 characters");
  }

  const shop = await ShopModel.findById(shopId);
  if (!shop) {
    throw new ApiError(HTTP.NOT_FOUND, "Shop not found");
  }

  const existing = await RoleModel.findByShopAndName(shopId, trimmedName);
  if (existing) {
    throw new ApiError(
      HTTP.CONFLICT,
      "A role with this name already exists for this shop",
    );
  }

  return RoleModel.create({
    shopId: Number(shopId),
    name: trimmedName,
  });
}

/**
 * Updates a role. At least one of name or shopId must be provided.
 */
export async function updateRole(id, { name, shopId }) {
  const role = await RoleModel.findById(id);
  if (!role) {
    throw new ApiError(HTTP.NOT_FOUND, "Role not found");
  }

  const hasName = name !== undefined && name !== null && String(name).trim() !== "";
  const hasShopId = shopId !== undefined && shopId !== null && shopId !== "";

  if (!hasName && !hasShopId) {
    throw new ApiError(HTTP.BAD_REQUEST, "At least one field is required to update");
  }

  const data = {};

  if (hasName) {
    const trimmedName = String(name).trim();
    if (trimmedName.length < 2) {
      throw new ApiError(HTTP.BAD_REQUEST, "Role name must be at least 2 characters");
    }
    data.name = trimmedName;
  }

  if (hasShopId) {
    const nextShopId = Number(shopId);
    const shop = await ShopModel.findById(nextShopId);
    if (!shop) {
      throw new ApiError(HTTP.NOT_FOUND, "Shop not found");
    }
    data.shopId = nextShopId;
  }

  const targetShopId = data.shopId ?? role.shopId;
  const targetName = data.name ?? role.name;

  const duplicate = await RoleModel.findByShopAndName(targetShopId, targetName, id);
  if (duplicate) {
    throw new ApiError(
      HTTP.CONFLICT,
      "A role with this name already exists for this shop",
    );
  }

  return RoleModel.update(id, data);
}

/**
 * Deletes a role and unlinks related assignments first.
 * Order: branch_member_roles → shop_member_roles → role_permissions → role.
 */
export async function deleteRole(roleId) {
  const id = Number(roleId);
  if (!Number.isInteger(id) || id < 1) {
    throw new ApiError(HTTP.BAD_REQUEST, "Invalid role id");
  }

  const existing = await RoleModel.findById(id);
  if (!existing) {
    throw new ApiError(HTTP.NOT_FOUND, "Role not found");
  }

  await prisma.$transaction(async (tx) => {
    await tx.branchMemberRole.deleteMany({ where: { roleId: id } });
    await tx.shopMemberRole.deleteMany({ where: { roleId: id } });
    await tx.rolePermission.deleteMany({ where: { roleId: id } });
    await tx.role.delete({ where: { id } });
  });
}
