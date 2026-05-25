import { prisma } from "../config/database.js";

export const RepairManufacturerModel = {
  async findByCategory(shopId, repairCategoryId) {
    return prisma.repairManufacturer.findMany({
      where: {
        shopId: Number(shopId),
        repairCategoryId: Number(repairCategoryId),
      },
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    });
  },

  async findById(id) {
    return prisma.repairManufacturer.findUnique({
      where: { id: Number(id) },
    });
  },

  async findByCategoryAndSlug(shopId, repairCategoryId, slug, excludeId) {
    return prisma.repairManufacturer.findFirst({
      where: {
        shopId: Number(shopId),
        repairCategoryId: Number(repairCategoryId),
        slug,
        ...(excludeId != null ? { id: { not: Number(excludeId) } } : {}),
      },
    });
  },

  async findByCategoryAndName(shopId, repairCategoryId, name, excludeId) {
    return prisma.repairManufacturer.findFirst({
      where: {
        shopId: Number(shopId),
        repairCategoryId: Number(repairCategoryId),
        name: { equals: name, mode: "insensitive" },
        ...(excludeId != null ? { id: { not: Number(excludeId) } } : {}),
      },
    });
  },

  async createMany(data) {
    return prisma.repairManufacturer.createMany({ data, skipDuplicates: true });
  },

  async create(data) {
    return prisma.repairManufacturer.create({ data });
  },

  async update(id, data) {
    return prisma.repairManufacturer.update({
      where: { id: Number(id) },
      data,
    });
  },

  async delete(id) {
    return prisma.repairManufacturer.delete({
      where: { id: Number(id) },
    });
  },

  async countByCategory(shopId, repairCategoryId) {
    return prisma.repairManufacturer.count({
      where: {
        shopId: Number(shopId),
        repairCategoryId: Number(repairCategoryId),
      },
    });
  },
};
