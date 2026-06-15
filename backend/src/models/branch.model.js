import { prisma } from "../config/database.js";
import { isBranchNumericId, isBranchUuid } from "../utils/branchHelpers.js";

const branchInclude = {
  openingHours: { orderBy: { dayOfWeek: "asc" } },
  closures: { orderBy: { startsAt: "asc" } },
  createdBy: { select: { id: true, fullName: true, email: true } },
  updatedBy: { select: { id: true, fullName: true, email: true } },
};

export const BranchModel = {
  branchInclude,

  async findByUuid(uuid, shopId) {
    return prisma.branch.findFirst({
      where: {
        uuid,
        shopId: Number(shopId),
        deletedAt: null,
      },
      include: branchInclude,
    });
  },

  async resolveByIdentifier(identifier, shopId) {
    const value = String(identifier ?? "").trim();
    if (isBranchUuid(value)) {
      return this.findByUuid(value, shopId);
    }
    if (isBranchNumericId(value)) {
      return this.findById(Number(value), shopId);
    }
    return null;
  },

  async findById(id, shopId) {
    return prisma.branch.findFirst({
      where: {
        id: Number(id),
        shopId: Number(shopId),
        deletedAt: null,
      },
      include: branchInclude,
    });
  },

  async findByCode(shopId, branchCode, excludeId) {
    return prisma.branch.findFirst({
      where: {
        shopId: Number(shopId),
        branchCode,
        deletedAt: null,
        ...(excludeId ? { id: { not: Number(excludeId) } } : {}),
      },
    });
  },

  async findPrimary(shopId, excludeId) {
    return prisma.branch.findFirst({
      where: {
        shopId: Number(shopId),
        isPrimary: true,
        deletedAt: null,
        ...(excludeId ? { id: { not: Number(excludeId) } } : {}),
      },
    });
  },

  async list({ shopId, where, orderBy, skip, take }) {
    return prisma.branch.findMany({
      where: {
        shopId: Number(shopId),
        deletedAt: null,
        ...where,
      },
      orderBy,
      skip,
      take,
      include: {
        createdBy: { select: { id: true, fullName: true, email: true } },
        updatedBy: { select: { id: true, fullName: true, email: true } },
      },
    });
  },

  async count({ shopId, where }) {
    return prisma.branch.count({
      where: {
        shopId: Number(shopId),
        deletedAt: null,
        ...where,
      },
    });
  },

  async create(data, openingHoursRows) {
    return prisma.$transaction(async (tx) => {
      const branch = await tx.branch.create({ data, include: branchInclude });
      if (openingHoursRows?.length) {
        await tx.branchOpeningHour.createMany({
          data: openingHoursRows.map((row) => ({
            ...row,
            branchId: branch.id,
            shopId: branch.shopId,
          })),
        });
      }
      return tx.branch.findUnique({
        where: { id: branch.id },
        include: branchInclude,
      });
    });
  },

  async update(id, shopId, data) {
    return prisma.branch.update({
      where: { id: Number(id), shopId: Number(shopId) },
      data,
      include: branchInclude,
    });
  },

  async replaceOpeningHours(branchId, shopId, rows) {
    return prisma.$transaction(async (tx) => {
      await tx.branchOpeningHour.deleteMany({
        where: { branchId: Number(branchId), shopId: Number(shopId) },
      });
      if (rows.length) {
        await tx.branchOpeningHour.createMany({
          data: rows.map((row) => ({
            ...row,
            branchId: Number(branchId),
            shopId: Number(shopId),
          })),
        });
      }
      return tx.branch.findFirst({
        where: { id: Number(branchId), shopId: Number(shopId) },
        include: branchInclude,
      });
    });
  },

  async softDelete(id, shopId) {
    return prisma.branch.update({
      where: { id: Number(id), shopId: Number(shopId) },
      data: { deletedAt: new Date() },
    });
  },
};

export const BranchClosureModel = {
  async findById(id, branchId, shopId) {
    return prisma.branchClosure.findFirst({
      where: {
        id: Number(id),
        branchId: Number(branchId),
        shopId: Number(shopId),
      },
    });
  },

  async listUpcoming(branchId, shopId, fromDate = new Date()) {
    return prisma.branchClosure.findMany({
      where: {
        branchId: Number(branchId),
        shopId: Number(shopId),
        endsAt: { gte: fromDate },
      },
      orderBy: { startsAt: "asc" },
      include: {
        createdBy: { select: { id: true, fullName: true, email: true } },
      },
    });
  },

  async create(data) {
    return prisma.branchClosure.create({
      data,
      include: {
        createdBy: { select: { id: true, fullName: true, email: true } },
      },
    });
  },

  async update(id, branchId, shopId, data) {
    return prisma.branchClosure.update({
      where: { id: Number(id), branchId: Number(branchId), shopId: Number(shopId) },
      data,
      include: {
        createdBy: { select: { id: true, fullName: true, email: true } },
      },
    });
  },

  async remove(id, branchId, shopId) {
    return prisma.branchClosure.delete({
      where: { id: Number(id), branchId: Number(branchId), shopId: Number(shopId) },
    });
  },

  async findActiveNow(branchId, shopId, at = new Date()) {
    return prisma.branchClosure.findFirst({
      where: {
        branchId: Number(branchId),
        shopId: Number(shopId),
        startsAt: { lte: at },
        endsAt: { gte: at },
      },
    });
  },
};

export const AuditLogModel = {
  async create(data) {
    return prisma.auditLog.create({ data });
  },
};

export const ShopMemberModel = {
  async findActiveMembership(userId, shopId) {
    return prisma.shopMember.findFirst({
      where: {
        userId: Number(userId),
        shopId: Number(shopId),
        status: "ACTIVE",
      },
      include: {
        shopRoles: {
          include: {
            role: {
              include: {
                permissions: { include: { permission: true } },
              },
            },
          },
        },
      },
    });
  },

  async userPermissionKeys(userId, shopId) {
    const membership = await this.findActiveMembership(userId, shopId);
    if (!membership) return [];
    const keys = new Set();
    for (const smr of membership.shopRoles) {
      for (const rp of smr.role.permissions) {
        keys.add(rp.permission.key);
      }
    }
    return [...keys];
  },
};
