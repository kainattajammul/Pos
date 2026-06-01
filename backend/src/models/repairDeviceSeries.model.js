import { prisma } from "../config/database.js";

export const RepairDeviceSeriesModel = {
  async findByManufacturer(shopId, repairManufacturerId) {
    return prisma.repairDeviceSeries.findMany({
      where: {
        shopId: Number(shopId),
        repairManufacturerId: Number(repairManufacturerId),
      },
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    });
  },

  async findById(id) {
    return prisma.repairDeviceSeries.findUnique({
      where: { id: Number(id) },
    });
  },

  async findByManufacturerAndSlug(shopId, repairManufacturerId, slug, excludeId) {
    return prisma.repairDeviceSeries.findFirst({
      where: {
        shopId: Number(shopId),
        repairManufacturerId: Number(repairManufacturerId),
        slug,
        ...(excludeId != null ? { id: { not: Number(excludeId) } } : {}),
      },
    });
  },

  async findByManufacturerAndName(shopId, repairManufacturerId, name, excludeId) {
    return prisma.repairDeviceSeries.findFirst({
      where: {
        shopId: Number(shopId),
        repairManufacturerId: Number(repairManufacturerId),
        name: { equals: name, mode: "insensitive" },
        ...(excludeId != null ? { id: { not: Number(excludeId) } } : {}),
      },
    });
  },

  async create(data) {
    return prisma.repairDeviceSeries.create({ data });
  },

  async update(id, data) {
    return prisma.repairDeviceSeries.update({
      where: { id: Number(id) },
      data,
    });
  },

  async delete(id) {
    return prisma.repairDeviceSeries.delete({
      where: { id: Number(id) },
    });
  },

  async countByManufacturer(shopId, repairManufacturerId) {
    return prisma.repairDeviceSeries.count({
      where: {
        shopId: Number(shopId),
        repairManufacturerId: Number(repairManufacturerId),
      },
    });
  },
};
