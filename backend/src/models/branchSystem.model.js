import { prisma } from "../config/database.js";

export const BranchSystemModel = {
  ensureBranch(shopId, branchUuid) {
    return prisma.branch.findFirst({
      where: { uuid: branchUuid, shopId: Number(shopId), deletedAt: null },
    });
  },

  countAuditLogs(branchId, shopId) {
    return prisma.auditLog.count({
      where: { branchId: Number(branchId), shopId: Number(shopId) },
    });
  },

  listSyncConnections(branchId, shopId, { where = {}, skip, take, orderBy } = {}) {
    return prisma.branchSyncConnection.findMany({
      where: {
        branchId: Number(branchId),
        shopId: Number(shopId),
        archivedAt: null,
        ...where,
      },
      skip,
      take,
      orderBy: orderBy ?? { updatedAt: "desc" },
      include: {
        jobs: {
          orderBy: { createdAt: "desc" },
          take: 1,
        },
      },
    });
  },

  countSyncConnections(branchId, shopId, where = {}) {
    return prisma.branchSyncConnection.count({
      where: {
        branchId: Number(branchId),
        shopId: Number(shopId),
        archivedAt: null,
        ...where,
      },
    });
  },

  findSyncConnection(connectionUuid, branchId, shopId) {
    return prisma.branchSyncConnection.findFirst({
      where: {
        uuid: connectionUuid,
        branchId: Number(branchId),
        shopId: Number(shopId),
        archivedAt: null,
      },
      include: {
        jobs: { orderBy: { createdAt: "desc" }, take: 1 },
      },
    });
  },

  findSyncJob(jobUuid, branchId, shopId) {
    return prisma.branchSyncJob.findFirst({
      where: {
        uuid: jobUuid,
        branchId: Number(branchId),
        shopId: Number(shopId),
      },
      include: { connection: true },
    });
  },

  listSyncJobs(branchId, shopId, { where = {}, skip, take, orderBy } = {}) {
    return prisma.branchSyncJob.findMany({
      where: { branchId: Number(branchId), shopId: Number(shopId), ...where },
      skip,
      take,
      orderBy: orderBy ?? { createdAt: "desc" },
      include: { connection: { select: { uuid: true, name: true, syncType: true } } },
    });
  },

  countSyncJobs(branchId, shopId, where = {}) {
    return prisma.branchSyncJob.count({
      where: { branchId: Number(branchId), shopId: Number(shopId), ...where },
    });
  },

  listSettings(branchId, shopId, namespace) {
    return prisma.branchSetting.findMany({
      where: {
        branchId: Number(branchId),
        shopId: Number(shopId),
        ...(namespace ? { namespace } : {}),
      },
      orderBy: [{ namespace: "asc" }, { key: "asc" }],
    });
  },

  findSetting(branchId, shopId, namespace, key) {
    return prisma.branchSetting.findFirst({
      where: {
        branchId: Number(branchId),
        shopId: Number(shopId),
        namespace,
        key,
      },
    });
  },

  listSettingHistory(branchId, shopId, { namespace, key, skip, take } = {}) {
    return prisma.branchSettingHistory.findMany({
      where: {
        branchId: Number(branchId),
        shopId: Number(shopId),
        ...(namespace ? { namespace } : {}),
        ...(key ? { key } : {}),
      },
      skip,
      take,
      orderBy: { changedAt: "desc" },
    });
  },

  countSettingHistory(branchId, shopId, where = {}) {
    return prisma.branchSettingHistory.count({
      where: { branchId: Number(branchId), shopId: Number(shopId), ...where },
    });
  },

  listSecurityEvents(branchId, shopId, { where = {}, skip, take } = {}) {
    return prisma.branchSecurityEvent.findMany({
      where: { branchId: Number(branchId), shopId: Number(shopId), ...where },
      skip,
      take,
      orderBy: { detectedAt: "desc" },
    });
  },

  countSecurityEvents(branchId, shopId, where = {}) {
    return prisma.branchSecurityEvent.count({
      where: { branchId: Number(branchId), shopId: Number(shopId), ...where },
    });
  },

  findSecurityEvent(eventUuid, branchId, shopId) {
    return prisma.branchSecurityEvent.findFirst({
      where: { uuid: eventUuid, branchId: Number(branchId), shopId: Number(shopId) },
    });
  },

  getPrimaryOwnership(branchId, shopId) {
    const now = new Date();
    return prisma.branchOwnership.findFirst({
      where: {
        branchId: Number(branchId),
        shopId: Number(shopId),
        status: "ACTIVE",
        isPrimaryOwner: true,
        effectiveFrom: { lte: now },
        OR: [{ effectiveUntil: null }, { effectiveUntil: { gte: now } }],
      },
      include: { businessEntity: true },
      orderBy: { effectiveFrom: "desc" },
    });
  },

  listOwnerships(branchId, shopId, { where = {}, skip, take } = {}) {
    return prisma.branchOwnership.findMany({
      where: { branchId: Number(branchId), shopId: Number(shopId), ...where },
      skip,
      take,
      orderBy: { effectiveFrom: "desc" },
      include: { businessEntity: true },
    });
  },

  countOwnerships(branchId, shopId, where = {}) {
    return prisma.branchOwnership.count({
      where: { branchId: Number(branchId), shopId: Number(shopId), ...where },
    });
  },

  findOwnership(ownershipUuid, branchId, shopId) {
    return prisma.branchOwnership.findFirst({
      where: { uuid: ownershipUuid, branchId: Number(branchId), shopId: Number(shopId) },
      include: { businessEntity: true },
    });
  },
};
