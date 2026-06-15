import { prisma } from "../config/database.js";
import { BranchModel } from "../models/branch.model.js";

export const BranchOperationsModel = {
  ensureBranch(shopId, branchUuid) {
    return BranchModel.findByUuid(branchUuid, shopId);
  },

  getOperationSettings(branchId, shopId, tx = prisma) {
    return tx.branchOperationSettings.upsert({
      where: { branchId: Number(branchId) },
      create: { branchId: Number(branchId), shopId: Number(shopId) },
      update: {},
    });
  },

  getOperationOptions(branchId, shopId, tx = prisma) {
    return tx.branchOperationOption.upsert({
      where: { branchId: Number(branchId) },
      create: { branchId: Number(branchId), shopId: Number(shopId) },
      update: {},
    });
  },

  getVisibilityRule(branchId, shopId, tx = prisma) {
    return tx.branchCustomerVisibilityRule.upsert({
      where: { branchId: Number(branchId) },
      create: { branchId: Number(branchId), shopId: Number(shopId) },
      update: {},
    });
  },
};

export const CustomerModel = {
  findByUuid(uuid, shopId) {
    return prisma.customer.findFirst({
      where: { uuid, shopId: Number(shopId), archivedAt: null },
    });
  },
};

export const BranchSaleModel = {
  findByUuid(uuid, branchId, shopId) {
    return prisma.branchSale.findFirst({
      where: { uuid, branchId: Number(branchId), shopId: Number(shopId) },
      include: { lineItems: true, payments: true, customer: true },
    });
  },
};

export const BranchRepairModel = {
  findByUuid(uuid, branchId, shopId) {
    return prisma.branchRepairTicket.findFirst({
      where: { uuid, branchId: Number(branchId), shopId: Number(shopId), archivedAt: null },
      include: { customer: true, parts: true, history: { orderBy: { createdAt: "desc" }, take: 50 } },
    });
  },
};

export const BranchAppointmentModel = {
  findByUuid(uuid, branchId, shopId) {
    return prisma.branchAppointment.findFirst({
      where: { uuid, branchId: Number(branchId), shopId: Number(shopId) },
      include: { customer: true },
    });
  },
};
