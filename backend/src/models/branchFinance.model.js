import { prisma } from "../config/database.js";

export const BranchFinanceModel = {
  ensureBranch(shopId, branchUuid) {
    return prisma.branch.findFirst({
      where: {
        uuid: branchUuid,
        shopId: Number(shopId),
        deletedAt: null,
      },
    });
  },

  getFinanceSettings(branchId, shopId, tx = prisma) {
    return tx.branchFinanceSettings.upsert({
      where: { branchId: Number(branchId) },
      create: {
        branchId: Number(branchId),
        shopId: Number(shopId),
      },
      update: {},
      include: { defaultRegister: true },
    });
  },

  getPaymentSettings(branchId, shopId, tx = prisma) {
    return tx.branchPaymentSettings.upsert({
      where: { branchId: Number(branchId) },
      create: { branchId: Number(branchId), shopId: Number(shopId) },
      update: {},
    });
  },

  getTaxProfile(branchId, shopId, tx = prisma) {
    return tx.branchTaxProfile.upsert({
      where: { branchId: Number(branchId) },
      create: { branchId: Number(branchId), shopId: Number(shopId) },
      update: {},
    });
  },
};

export const BranchRegisterModel = {
  findByUuid(uuid, branchId, shopId) {
    return prisma.branchRegister.findFirst({
      where: {
        uuid,
        branchId: Number(branchId),
        shopId: Number(shopId),
        archivedAt: null,
      },
      include: {
        cashDrawers: { where: { archivedAt: null } },
        sessions: {
          where: { status: { in: ["OPEN", "SUSPENDED", "PENDING_CLOSE"] } },
          take: 1,
        },
      },
    });
  },

  list(where, { skip = 0, take = 50, orderBy } = {}) {
    return prisma.branchRegister.findMany({
      where,
      skip,
      take,
      orderBy,
      include: {
        cashDrawers: { where: { archivedAt: null } },
        sessions: {
          where: { status: { in: ["OPEN", "SUSPENDED", "PENDING_CLOSE"] } },
          take: 1,
        },
      },
    });
  },

  count(where) {
    return prisma.branchRegister.count({ where });
  },

  create(data, tx = prisma) {
    return tx.branchRegister.create({ data });
  },

  update(id, data, tx = prisma) {
    return tx.branchRegister.update({ where: { id: Number(id) }, data });
  },
};

export const BranchRegisterSessionModel = {
  findByUuid(uuid, branchId, shopId) {
    return prisma.branchRegisterSession.findFirst({
      where: { uuid, branchId: Number(branchId), shopId: Number(shopId) },
      include: {
        register: true,
        cashDrawer: true,
        movements: { orderBy: { createdAt: "desc" }, take: 50 },
      },
    });
  },

  findOpenForRegister(registerId, tx = prisma) {
    return tx.branchRegisterSession.findFirst({
      where: {
        registerId: Number(registerId),
        status: { in: ["OPEN", "SUSPENDED", "PENDING_CLOSE"] },
      },
    });
  },

  list(where, { skip = 0, take = 50, orderBy } = {}) {
    return prisma.branchRegisterSession.findMany({
      where,
      skip,
      take,
      orderBy,
      include: { register: true, cashDrawer: true },
    });
  },

  count(where) {
    return prisma.branchRegisterSession.count({ where });
  },
};

export const BranchPaymentModel = {
  findByUuid(uuid, branchId, shopId) {
    return prisma.branchPayment.findFirst({
      where: { uuid, branchId: Number(branchId), shopId: Number(shopId) },
      include: { sale: true, invoice: true, customer: true, refunds: true },
    });
  },

  list(where, { skip = 0, take = 50, orderBy } = {}) {
    return prisma.branchPayment.findMany({
      where,
      skip,
      take,
      orderBy,
      include: { customer: true, sale: true, invoice: true },
    });
  },

  count(where) {
    return prisma.branchPayment.count({ where });
  },
};

export const BranchRefundModel = {
  findByUuid(uuid, branchId, shopId) {
    return prisma.branchRefund.findFirst({
      where: { uuid, branchId: Number(branchId), shopId: Number(shopId) },
      include: { payment: true, sale: true, invoice: true, customer: true },
    });
  },

  list(where, { skip = 0, take = 50, orderBy } = {}) {
    return prisma.branchRefund.findMany({
      where,
      skip,
      take,
      orderBy,
      include: { payment: true, customer: true },
    });
  },

  count(where) {
    return prisma.branchRefund.count({ where });
  },
};

export const BranchInvoiceModel = {
  findByUuid(uuid, branchId, shopId) {
    return prisma.branchInvoice.findFirst({
      where: { uuid, branchId: Number(branchId), shopId: Number(shopId) },
      include: { lineItems: true, customer: true, sale: true },
    });
  },

  list(where, { skip = 0, take = 50, orderBy } = {}) {
    return prisma.branchInvoice.findMany({
      where,
      skip,
      take,
      orderBy,
      include: { customer: true, lineItems: true },
    });
  },

  count(where) {
    return prisma.branchInvoice.count({ where });
  },
};

export const BranchExpenseModel = {
  findByUuid(uuid, branchId, shopId) {
    return prisma.branchExpense.findFirst({
      where: { uuid, branchId: Number(branchId), shopId: Number(shopId) },
    });
  },

  list(where, { skip = 0, take = 50, orderBy } = {}) {
    return prisma.branchExpense.findMany({ where, skip, take, orderBy });
  },

  count(where) {
    return prisma.branchExpense.count({ where });
  },
};

export const BranchTargetModel = {
  findByUuid(uuid, branchId, shopId) {
    return prisma.branchTarget.findFirst({
      where: { uuid, branchId: Number(branchId), shopId: Number(shopId) },
    });
  },

  list(where, { skip = 0, take = 50, orderBy } = {}) {
    return prisma.branchTarget.findMany({ where, skip, take, orderBy });
  },

  count(where) {
    return prisma.branchTarget.count({ where });
  },
};

export const BranchCommissionRuleModel = {
  findByUuid(uuid, branchId, shopId) {
    return prisma.branchCommissionRule.findFirst({
      where: { uuid, branchId: Number(branchId), shopId: Number(shopId) },
    });
  },

  list(where, { skip = 0, take = 50, orderBy } = {}) {
    return prisma.branchCommissionRule.findMany({ where, skip, take, orderBy });
  },

  count(where) {
    return prisma.branchCommissionRule.count({ where });
  },
};
