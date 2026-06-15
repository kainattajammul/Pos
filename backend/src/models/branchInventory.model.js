import { prisma } from "../config/database.js";

const inventoryInclude = {
  product: { include: { category: true } },
  productVariant: true,
  reorderRule: true,
  branch: { select: { id: true, uuid: true, name: true } },
};

export const BranchInventoryModel = {
  findByUuid(uuid, branchId, shopId) {
    return prisma.branchInventory.findFirst({
      where: { uuid, branchId: Number(branchId), shopId: Number(shopId), archivedAt: null },
      include: inventoryInclude,
    });
  },

  findById(id, branchId, shopId) {
    return prisma.branchInventory.findFirst({
      where: { id: Number(id), branchId: Number(branchId), shopId: Number(shopId) },
      include: inventoryInclude,
    });
  },

  findAllocation(branchId, productId, productVariantId) {
    return prisma.branchInventory.findFirst({
      where: {
        branchId: Number(branchId),
        productId: Number(productId),
        productVariantId: productVariantId != null ? Number(productVariantId) : null,
        archivedAt: null,
      },
    });
  },

  list(where, { skip = 0, take = 50, orderBy } = {}) {
    return prisma.branchInventory.findMany({
      where,
      skip,
      take,
      orderBy,
      include: inventoryInclude,
    });
  },

  count(where) {
    return prisma.branchInventory.count({ where });
  },

  create(data, tx = prisma) {
    return tx.branchInventory.create({ data, include: inventoryInclude });
  },

  update(id, data, expectedVersion, tx = prisma) {
    return tx.branchInventory.updateMany({
      where: { id: Number(id), version: expectedVersion },
      data: { ...data, version: { increment: 1 } },
    });
  },

  archive(id, tx = prisma) {
    return tx.branchInventory.update({
      where: { id: Number(id) },
      data: { archivedAt: new Date(), isAllocated: false },
      include: inventoryInclude,
    });
  },
};

export const BranchInventorySettingsModel = {
  getOrCreate(branchId, shopId, tx = prisma) {
    return tx.branchInventorySettings.upsert({
      where: { branchId: Number(branchId) },
      create: { branchId: Number(branchId), shopId: Number(shopId) },
      update: {},
    });
  },

  update(branchId, data) {
    return prisma.branchInventorySettings.update({
      where: { branchId: Number(branchId) },
      data,
    });
  },
};

export const BranchStockMovementModel = {
  create(data, tx = prisma) {
    return tx.branchStockMovement.create({ data });
  },

  listByInventory(branchInventoryId, { skip = 0, take = 50 } = {}) {
    return prisma.branchStockMovement.findMany({
      where: { branchInventoryId: Number(branchInventoryId) },
      orderBy: { createdAt: "desc" },
      skip,
      take,
    });
  },

  countByInventory(branchInventoryId) {
    return prisma.branchStockMovement.count({
      where: { branchInventoryId: Number(branchInventoryId) },
    });
  },
};

export const BranchStockTransferModel = {
  findByUuid(uuid, shopId) {
    return prisma.branchStockTransfer.findFirst({
      where: { uuid, shopId: Number(shopId) },
      include: {
        items: {
          include: {
            product: true,
            productVariant: true,
            sourceInventory: true,
            destinationInventory: true,
          },
        },
        sourceBranch: { select: { id: true, uuid: true, name: true } },
        destinationBranch: { select: { id: true, uuid: true, name: true } },
        history: { orderBy: { createdAt: "asc" } },
      },
    });
  },

  list(where, { skip = 0, take = 50, orderBy = { requestedAt: "desc" } } = {}) {
    return prisma.branchStockTransfer.findMany({
      where,
      skip,
      take,
      orderBy,
      include: {
        items: true,
        sourceBranch: { select: { id: true, uuid: true, name: true } },
        destinationBranch: { select: { id: true, uuid: true, name: true } },
      },
    });
  },

  count(where) {
    return prisma.branchStockTransfer.count({ where });
  },
};

export const ProductModel = {
  findByUuid(uuid, shopId) {
    return prisma.product.findFirst({
      where: { uuid, shopId: Number(shopId), archivedAt: null },
      include: { variants: { where: { archivedAt: null } } },
    });
  },

  findVariantByUuid(uuid, shopId) {
    return prisma.productVariant.findFirst({
      where: { uuid, shopId: Number(shopId), archivedAt: null },
      include: { product: true },
    });
  },
};

export const ServiceModel = {
  findByUuid(uuid, shopId) {
    return prisma.service.findFirst({
      where: { uuid, shopId: Number(shopId), archivedAt: null },
    });
  },
};
