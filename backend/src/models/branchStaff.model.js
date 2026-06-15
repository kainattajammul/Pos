import { prisma } from "../config/database.js";

const staffInclude = {
  user: { select: { id: true, uuid: true, fullName: true, email: true, phone: true } },
  roles: {
    include: {
      role: {
        select: { id: true, uuid: true, name: true, code: true, scope: true },
      },
    },
  },
  permissions: {
    include: { permission: { select: { id: true, key: true, module: true } } },
  },
  assignedBy: { select: { id: true, fullName: true, email: true } },
};

export const BranchStaffModel = {
  staffInclude,

  async findByUuid(uuid, branchId, shopId) {
    return prisma.branchStaffAssignment.findFirst({
      where: {
        uuid,
        branchId: Number(branchId),
        shopId: Number(shopId),
      },
      include: staffInclude,
    });
  },

  async findById(id, branchId, shopId) {
    return prisma.branchStaffAssignment.findFirst({
      where: {
        id: Number(id),
        branchId: Number(branchId),
        shopId: Number(shopId),
      },
      include: staffInclude,
    });
  },

  async findByUserAndBranch(userId, branchId, shopId) {
    return prisma.branchStaffAssignment.findFirst({
      where: {
        userId: Number(userId),
        branchId: Number(branchId),
        shopId: Number(shopId),
      },
      include: staffInclude,
    });
  },

  async list({ branchId, shopId, where, orderBy, skip, take }) {
    return prisma.branchStaffAssignment.findMany({
      where: {
        branchId: Number(branchId),
        shopId: Number(shopId),
        ...where,
      },
      orderBy,
      skip,
      take,
      include: staffInclude,
    });
  },

  async count({ branchId, shopId, where }) {
    return prisma.branchStaffAssignment.count({
      where: {
        branchId: Number(branchId),
        shopId: Number(shopId),
        ...where,
      },
    });
  },

  async create(data, roleIds = []) {
    return prisma.$transaction(async (tx) => {
      const assignment = await tx.branchStaffAssignment.create({
        data,
        include: staffInclude,
      });
      if (roleIds.length) {
        await tx.branchStaffRoleAssignment.createMany({
          data: roleIds.map((roleId) => ({
            shopId: assignment.shopId,
            staffAssignmentId: assignment.id,
            roleId: Number(roleId),
            assignedById: data.assignedById ?? null,
          })),
        });
      }
      return tx.branchStaffAssignment.findUnique({
        where: { id: assignment.id },
        include: staffInclude,
      });
    });
  },

  async update(id, shopId, data) {
    return prisma.branchStaffAssignment.update({
      where: { id: Number(id), shopId: Number(shopId) },
      data,
      include: staffInclude,
    });
  },

  async clearPrimaryForUser(userId, shopId, excludeId) {
    return prisma.branchStaffAssignment.updateMany({
      where: {
        userId: Number(userId),
        shopId: Number(shopId),
        isPrimaryBranch: true,
        ...(excludeId ? { id: { not: Number(excludeId) } } : {}),
      },
      data: { isPrimaryBranch: false },
    });
  },

  async listByRoleCode(branchId, shopId, roleCode) {
    return prisma.branchStaffAssignment.findMany({
      where: {
        branchId: Number(branchId),
        shopId: Number(shopId),
        status: { in: ["ACTIVE", "INVITED"] },
        archivedAt: null,
        roles: { some: { role: { code: roleCode } } },
      },
      include: staffInclude,
    });
  },
};

export const BranchStaffRoleModel = {
  async assign(staffAssignmentId, shopId, roleId, assignedById, isPrimary = false) {
    return prisma.branchStaffRoleAssignment.create({
      data: {
        shopId: Number(shopId),
        staffAssignmentId: Number(staffAssignmentId),
        roleId: Number(roleId),
        assignedById: assignedById ?? null,
        isPrimary,
      },
      include: { role: true },
    });
  },

  async remove(staffAssignmentId, roleId, shopId) {
    return prisma.branchStaffRoleAssignment.delete({
      where: {
        staffAssignmentId_roleId: {
          staffAssignmentId: Number(staffAssignmentId),
          roleId: Number(roleId),
        },
        shopId: Number(shopId),
      },
    });
  },

  async findRoleAssignment(staffAssignmentId, roleId, shopId) {
    return prisma.branchStaffRoleAssignment.findFirst({
      where: {
        staffAssignmentId: Number(staffAssignmentId),
        roleId: Number(roleId),
        shopId: Number(shopId),
      },
    });
  },
};

export const BranchUserPermissionModel = {
  async listForAssignment(staffAssignmentId, shopId) {
    return prisma.branchUserPermission.findMany({
      where: {
        staffAssignmentId: Number(staffAssignmentId),
        shopId: Number(shopId),
      },
      include: { permission: true },
    });
  },

  async replaceForAssignment(staffAssignmentId, shopId, rows, assignedById) {
    return prisma.$transaction(async (tx) => {
      await tx.branchUserPermission.deleteMany({
        where: { staffAssignmentId: Number(staffAssignmentId), shopId: Number(shopId) },
      });
      if (rows.length) {
        await tx.branchUserPermission.createMany({
          data: rows.map((row) => ({
            shopId: Number(shopId),
            staffAssignmentId: Number(staffAssignmentId),
            permissionId: row.permissionId,
            effect: row.effect,
            assignedById: assignedById ?? null,
            expiresAt: row.expiresAt ?? null,
          })),
        });
      }
      return tx.branchUserPermission.findMany({
        where: { staffAssignmentId: Number(staffAssignmentId), shopId: Number(shopId) },
        include: { permission: true },
      });
    });
  },
};

export const BranchShiftModel = {
  async findByUuid(uuid, branchId, shopId) {
    return prisma.branchStaffShift.findFirst({
      where: { uuid, branchId: Number(branchId), shopId: Number(shopId) },
      include: {
        staffAssignment: { include: { user: { select: { fullName: true, email: true } } } },
      },
    });
  },

  async list({ branchId, shopId, where, orderBy }) {
    return prisma.branchStaffShift.findMany({
      where: {
        shopId: Number(shopId),
        ...(branchId != null ? { branchId: Number(branchId) } : {}),
        ...where,
      },
      orderBy,
      include: {
        staffAssignment: {
          include: {
            user: { select: { id: true, uuid: true, fullName: true, email: true } },
            roles: { include: { role: true } },
          },
        },
      },
    });
  },

  async create(data) {
    return prisma.branchStaffShift.create({ data });
  },

  async update(id, shopId, data) {
    return prisma.branchStaffShift.update({
      where: { id: Number(id), shopId: Number(shopId) },
      data,
    });
  },

  async remove(id, shopId) {
    return prisma.branchStaffShift.delete({
      where: { id: Number(id), shopId: Number(shopId) },
    });
  },

  async findOverlapping(staffAssignmentId, shopId, startsAt, endsAt, excludeId) {
    return prisma.branchStaffShift.findFirst({
      where: {
        staffAssignmentId: Number(staffAssignmentId),
        shopId: Number(shopId),
        status: { not: "CANCELLED" },
        startsAt: { lt: endsAt },
        endsAt: { gt: startsAt },
        ...(excludeId ? { id: { not: Number(excludeId) } } : {}),
      },
    });
  },

  async findCrossBranchOverlap(userId, shopId, startsAt, endsAt, excludeShiftId) {
    return prisma.branchStaffShift.findFirst({
      where: {
        shopId: Number(shopId),
        status: { notIn: ["CANCELLED", "ABSENT"] },
        startsAt: { lt: endsAt },
        endsAt: { gt: startsAt },
        ...(excludeShiftId ? { id: { not: Number(excludeShiftId) } } : {}),
        staffAssignment: { userId: Number(userId) },
      },
      include: { branch: { select: { name: true } } },
    });
  },

  async nextShiftForAssignment(staffAssignmentId, shopId, from = new Date()) {
    return prisma.branchStaffShift.findFirst({
      where: {
        staffAssignmentId: Number(staffAssignmentId),
        shopId: Number(shopId),
        endsAt: { gte: from },
        status: { in: ["PUBLISHED", "CONFIRMED", "DRAFT"] },
      },
      orderBy: { startsAt: "asc" },
    });
  },
};

export const BranchPerformanceModel = {
  async list({ branchId, shopId, where, orderBy }) {
    return prisma.branchStaffPerformance.findMany({
      where: { branchId: Number(branchId), shopId: Number(shopId), ...where },
      orderBy,
      include: {
        staffAssignment: {
          include: {
            user: { select: { id: true, uuid: true, fullName: true, email: true } },
            roles: { include: { role: true } },
          },
        },
      },
    });
  },

  async findForAssignment(staffAssignmentId, shopId, where) {
    return prisma.branchStaffPerformance.findMany({
      where: {
        staffAssignmentId: Number(staffAssignmentId),
        shopId: Number(shopId),
        ...where,
      },
      orderBy: { periodStart: "desc" },
    });
  },

  async upsert(data) {
    return prisma.branchStaffPerformance.upsert({
      where: {
        staffAssignmentId_periodType_periodStart_periodEnd: {
          staffAssignmentId: data.staffAssignmentId,
          periodType: data.periodType,
          periodStart: data.periodStart,
          periodEnd: data.periodEnd,
        },
      },
      create: data,
      update: data,
    });
  },
};

export const BranchSecurityRuleModel = {
  async list(branchId, shopId) {
    return prisma.branchSecurityRule.findMany({
      where: { branchId: Number(branchId), shopId: Number(shopId) },
      orderBy: { ruleKey: "asc" },
    });
  },

  async findByKey(branchId, shopId, ruleKey) {
    return prisma.branchSecurityRule.findFirst({
      where: { branchId: Number(branchId), shopId: Number(shopId), ruleKey },
    });
  },

  async upsert(branchId, shopId, ruleKey, data) {
    const existing = await this.findByKey(branchId, shopId, ruleKey);
    if (existing) {
      return prisma.branchSecurityRule.update({
        where: { id: existing.id },
        data,
      });
    }
    return prisma.branchSecurityRule.create({
      data: { branchId: Number(branchId), shopId: Number(shopId), ruleKey, ...data },
    });
  },
};

export const BranchRoleModel = {
  async list(shopId, scope = "BRANCH") {
    return prisma.role.findMany({
      where: {
        shopId: Number(shopId),
        scope,
        isActive: true,
      },
      include: {
        permissions: { include: { permission: true } },
      },
      orderBy: { name: "asc" },
    });
  },

  async findByUuid(uuid, shopId) {
    return prisma.role.findFirst({
      where: { uuid, shopId: Number(shopId) },
      include: { permissions: { include: { permission: true } } },
    });
  },

  async findByCode(code, shopId) {
    return prisma.role.findFirst({
      where: { code, shopId: Number(shopId) },
    });
  },

  async create(data, permissionIds = []) {
    return prisma.$transaction(async (tx) => {
      const role = await tx.role.create({ data });
      if (permissionIds.length) {
        await tx.rolePermission.createMany({
          data: permissionIds.map((permissionId) => ({
            roleId: role.id,
            permissionId: Number(permissionId),
          })),
        });
      }
      return tx.role.findUnique({
        where: { id: role.id },
        include: { permissions: { include: { permission: true } } },
      });
    });
  },

  async update(id, shopId, data, permissionIds) {
    return prisma.$transaction(async (tx) => {
      const role = await tx.role.update({
        where: { id: Number(id), shopId: Number(shopId) },
        data,
      });
      if (permissionIds) {
        await tx.rolePermission.deleteMany({ where: { roleId: role.id } });
        if (permissionIds.length) {
          await tx.rolePermission.createMany({
            data: permissionIds.map((permissionId) => ({
              roleId: role.id,
              permissionId: Number(permissionId),
            })),
          });
        }
      }
      return tx.role.findUnique({
        where: { id: role.id },
        include: { permissions: { include: { permission: true } } },
      });
    });
  },

  async remove(id, shopId) {
    return prisma.role.delete({
      where: { id: Number(id), shopId: Number(shopId) },
    });
  },
};
