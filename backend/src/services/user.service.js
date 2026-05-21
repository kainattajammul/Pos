import { ApiError } from "../utils/ApiError.js";
import { HTTP } from "../constants/httpStatus.js";
import { prisma } from "../config/database.js";
import { UserModel } from "../models/user.model.js";
import { ShopModel } from "../models/shop.model.js";
import { hashPassword } from "../utils/password.js";
import { parseMemberStatus } from "../utils/memberStatus.js";

/**
 * Creates a user and links them to a shop (optional role assignment).
 * Uses a transaction so user + membership stay consistent.
 */
export async function createUser({
  fullName,
  email,
  password,
  phone,
  shopId,
  roleId,
  status,
}) {
  const existing = await UserModel.findByEmail(email);
  if (existing) {
    throw new ApiError(HTTP.CONFLICT, "Email is already in use");
  }

  const shop = await ShopModel.findById(shopId);
  if (!shop) {
    throw new ApiError(HTTP.NOT_FOUND, "Shop not found");
  }

  const memberStatus = parseMemberStatus(status);
  if (!memberStatus) {
    throw new ApiError(
      HTTP.BAD_REQUEST,
      "status must be ACTIVE, INACTIVE, or SUSPENDED",
    );
  }

  if (roleId != null) {
    const role = await ShopModel.findRoleInShop(roleId, shopId);
    if (!role) {
      throw new ApiError(HTTP.NOT_FOUND, "Role not found for this shop");
    }
  }

  const passwordHash = await hashPassword(password);

  const user = await prisma.$transaction(async (tx) => {
    const createdUser = await tx.user.create({
      data: {
        fullName,
        email,
        passwordHash,
        phone: phone ?? null,
      },
    });

    const membership = await tx.shopMember.create({
      data: {
        userId: createdUser.id,
        shopId: Number(shopId),
        status: memberStatus,
      },
    });

    if (roleId != null) {
      await tx.shopMemberRole.create({
        data: {
          shopId: Number(shopId),
          shopMemberId: membership.id,
          roleId: Number(roleId),
        },
      });
    }

    return createdUser;
  });

  return user;
}

/**
 * Partial update for users table fields only (fullName, email, phone, passwordHash).
 */
export async function updateUser(
  userId,
  { fullName, email, password, phone },
) {
  const existing = await UserModel.findById(userId);
  if (!existing) {
    throw new ApiError(HTTP.NOT_FOUND, "User not found");
  }

  if (email !== undefined && email !== existing.email) {
    const duplicate = await UserModel.findByEmail(email);
    if (duplicate && duplicate.id !== existing.id) {
      throw new ApiError(HTTP.CONFLICT, "Email is already in use");
    }
  }

  const data = {};

  if (fullName !== undefined) {
    data.fullName = fullName;
  }
  if (email !== undefined) {
    data.email = email;
  }
  if (phone !== undefined) {
    data.phone = phone === "" || phone === null ? null : phone;
  }
  if (password !== undefined && password !== "") {
    data.passwordHash = await hashPassword(password);
  }

  if (Object.keys(data).length === 0) {
    throw new ApiError(HTTP.BAD_REQUEST, "No valid fields provided to update");
  }

  return UserModel.update(userId, data);
}

/**
 * Hard-deletes a user and related shop memberships (roles unlinked first).
 * Order: branch_member_roles → shop_member_roles → shop_members → user.
 * Prisma schema uses onDelete: Cascade; explicit deletes keep behavior safe if DB FKs differ.
 */
export async function deleteUser(userId) {
  const id = Number(userId);
  if (!Number.isInteger(id) || id < 1) {
    throw new ApiError(HTTP.BAD_REQUEST, "Invalid user id");
  }

  const existing = await UserModel.findById(id);
  if (!existing) {
    throw new ApiError(HTTP.NOT_FOUND, "User not found");
  }

  await prisma.$transaction(async (tx) => {
    const memberships = await tx.shopMember.findMany({
      where: { userId: id },
      select: { id: true },
    });

    const memberIds = memberships.map((m) => m.id);

    if (memberIds.length > 0) {
      await tx.branchMemberRole.deleteMany({
        where: { shopMemberId: { in: memberIds } },
      });
      await tx.shopMemberRole.deleteMany({
        where: { shopMemberId: { in: memberIds } },
      });
      await tx.shopMember.deleteMany({
        where: { userId: id },
      });
    }

    await tx.user.delete({ where: { id } });
  });
}
