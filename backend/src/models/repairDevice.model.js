import { prisma } from "../config/database.js";

export const RepairDeviceModel = {
  async findByManufacturer(shopId, repairManufacturerId) {
    return prisma.repairDevice.findMany({
      where: {
        shopId: Number(shopId),
        repairManufacturerId: Number(repairManufacturerId),
      },
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    });
  },

  async findById(id) {
    return prisma.repairDevice.findUnique({
      where: { id: Number(id) },
    });
  },

  async findByManufacturerAndSlug(shopId, repairManufacturerId, slug, excludeId) {
    return prisma.repairDevice.findFirst({
      where: {
        shopId: Number(shopId),
        repairManufacturerId: Number(repairManufacturerId),
        slug,
        ...(excludeId != null ? { id: { not: Number(excludeId) } } : {}),
      },
    });
  },

  async findByManufacturerAndName(shopId, repairManufacturerId, name, excludeId) {
    return prisma.repairDevice.findFirst({
      where: {
        shopId: Number(shopId),
        repairManufacturerId: Number(repairManufacturerId),
        name: { equals: name, mode: "insensitive" },
        ...(excludeId != null ? { id: { not: Number(excludeId) } } : {}),
      },
    });
  },

  async createMany(data) {
    return prisma.repairDevice.createMany({ data, skipDuplicates: true });
  },

  async create(data) {
    return prisma.repairDevice.create({ data });
  },

  async update(id, data) {
    return prisma.repairDevice.update({
      where: { id: Number(id) },
      data,
    });
  },

  async delete(id) {
    return prisma.repairDevice.delete({
      where: { id: Number(id) },
    });
  },

  async countByManufacturer(shopId, repairManufacturerId) {
    return prisma.repairDevice.count({
      where: {
        shopId: Number(shopId),
        repairManufacturerId: Number(repairManufacturerId),
      },
    });
  },
};
