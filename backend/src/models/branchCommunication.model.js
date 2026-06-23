import { prisma } from "../config/database.js";

export const BranchCommunicationModel = {
  ensureBranch(shopId, branchUuid) {
    return prisma.branch.findFirst({
      where: { uuid: branchUuid, shopId: Number(shopId), deletedAt: null },
    });
  },

  getNotificationSettings(branchId, shopId, tx = prisma) {
    return tx.branchNotificationSettings.upsert({
      where: { branchId: Number(branchId) },
      create: { branchId: Number(branchId), shopId: Number(shopId) },
      update: {},
    });
  },

  getDocumentSettings(branchId, shopId, tx = prisma) {
    return tx.branchDocumentSettings.upsert({
      where: { branchId: Number(branchId) },
      create: { branchId: Number(branchId), shopId: Number(shopId) },
      update: {},
    });
  },

  getReceiptSettings(branchId, shopId, tx = prisma) {
    return tx.branchReceiptSettings.upsert({
      where: { branchId: Number(branchId) },
      create: { branchId: Number(branchId), shopId: Number(shopId) },
      update: {},
    });
  },

  getInvoiceSettings(branchId, shopId, tx = prisma) {
    return tx.branchInvoiceSettings.upsert({
      where: { branchId: Number(branchId) },
      create: { branchId: Number(branchId), shopId: Number(shopId) },
      update: {},
    });
  },

  getEmailSenderSettings(branchId, shopId, tx = prisma) {
    return tx.branchEmailSenderSettings.upsert({
      where: { branchId: Number(branchId) },
      create: { branchId: Number(branchId), shopId: Number(shopId) },
      update: {},
    });
  },

  getSmsSenderSettings(branchId, shopId, tx = prisma) {
    return tx.branchSmsSenderSettings.upsert({
      where: { branchId: Number(branchId) },
      create: { branchId: Number(branchId), shopId: Number(shopId) },
      update: {},
    });
  },
};

export const BranchMessageTemplateModel = {
  findByUuid(uuid, branchId, shopId) {
    return prisma.branchMessageTemplate.findFirst({
      where: { uuid, branchId: Number(branchId), shopId: Number(shopId), archivedAt: null },
    });
  },

  list(where, { skip = 0, take = 50, orderBy } = {}) {
    return prisma.branchMessageTemplate.findMany({ where, skip, take, orderBy });
  },

  count(where) {
    return prisma.branchMessageTemplate.count({ where });
  },
};

export const BranchCommunicationLogModel = {
  findByUuid(uuid, branchId, shopId) {
    return prisma.branchCommunicationLog.findFirst({
      where: { uuid, branchId: Number(branchId), shopId: Number(shopId) },
      include: { customer: true, template: true },
    });
  },

  list(where, { skip = 0, take = 50, orderBy } = {}) {
    return prisma.branchCommunicationLog.findMany({
      where,
      skip,
      take,
      orderBy,
      include: { customer: true, template: true },
    });
  },

  count(where) {
    return prisma.branchCommunicationLog.count({ where });
  },
};

export const BranchDocumentModel = {
  findByUuid(uuid, branchId, shopId) {
    return prisma.branchDocument.findFirst({
      where: { uuid, branchId: Number(branchId), shopId: Number(shopId), archivedAt: null },
    });
  },

  list(where, { skip = 0, take = 50, orderBy } = {}) {
    return prisma.branchDocument.findMany({ where, skip, take, orderBy });
  },

  count(where) {
    return prisma.branchDocument.count({ where });
  },
};
