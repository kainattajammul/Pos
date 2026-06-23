import { prisma } from "../config/database.js";

export const BranchReportingModel = {
  ensureBranch(shopId, branchUuid) {
    return prisma.branch.findFirst({
      where: { uuid: branchUuid, shopId: Number(shopId), deletedAt: null },
    });
  },

  getReportingSettings(branchId, shopId, tx = prisma) {
    return tx.branchReportingSettings.upsert({
      where: { branchId: Number(branchId) },
      create: { branchId: Number(branchId), shopId: Number(shopId) },
      update: {},
    });
  },
};
