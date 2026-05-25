import { prisma } from "../config/database.js";

export const RepairCategoryModel = {
  async findByShop(shopId) {
    return prisma.repairCategory.findMany({
      where: { shopId: Number(shopId) },
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    });
  },

  async findById(id) {
    return prisma.repairCategory.findUnique({
      where: { id: Number(id) },
    });
  },

  async findByShopAndSlug(shopId, slug, excludeId) {
    return prisma.repairCategory.findFirst({
      where: {
        shopId: Number(shopId),
        slug,
        ...(excludeId != null ? { id: { not: Number(excludeId) } } : {}),
      },
    });
  },

  async findByShopAndName(shopId, name, excludeId) {
    return prisma.repairCategory.findFirst({
      where: {
        shopId: Number(shopId),
        name: { equals: name, mode: "insensitive" },
        ...(excludeId != null ? { id: { not: Number(excludeId) } } : {}),
      },
    });
  },

  async createMany(data) {
    return prisma.repairCategory.createMany({ data, skipDuplicates: true });
  },

  async create(data) {
    return prisma.repairCategory.create({ data });
  },

  async update(id, data) {
    return prisma.repairCategory.update({
      where: { id: Number(id) },
      data,
    });
  },

  async delete(id) {
    return prisma.repairCategory.delete({
      where: { id: Number(id) },
    });
  },

  async countByShop(shopId) {
    return prisma.repairCategory.count({
      where: { shopId: Number(shopId) },
    });
  },
};
