import { prisma } from "../config/database.js";

export const RepairDevicePartModel = {
  async findByDevice(shopId, repairDeviceId) {
    return prisma.repairDevicePart.findMany({
      where: {
        shopId: Number(shopId),
        repairDeviceId: Number(repairDeviceId),
      },
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    });
  },

  async findById(id) {
    return prisma.repairDevicePart.findUnique({
      where: { id: Number(id) },
    });
  },

  async findByDeviceAndSlug(shopId, repairDeviceId, slug, excludeId) {
    return prisma.repairDevicePart.findFirst({
      where: {
        shopId: Number(shopId),
        repairDeviceId: Number(repairDeviceId),
        slug,
        ...(excludeId != null ? { id: { not: Number(excludeId) } } : {}),
      },
    });
  },

  async findByDeviceAndName(shopId, repairDeviceId, name, excludeId) {
    return prisma.repairDevicePart.findFirst({
      where: {
        shopId: Number(shopId),
        repairDeviceId: Number(repairDeviceId),
        name: { equals: name, mode: "insensitive" },
        ...(excludeId != null ? { id: { not: Number(excludeId) } } : {}),
      },
    });
  },

  async createMany(data) {
    return prisma.repairDevicePart.createMany({ data, skipDuplicates: true });
  },

  async create(data) {
    return prisma.repairDevicePart.create({ data });
  },

  async update(id, data) {
    return prisma.repairDevicePart.update({
      where: { id: Number(id) },
      data,
    });
  },

  async delete(id) {
    return prisma.repairDevicePart.delete({
      where: { id: Number(id) },
    });
  },

  async countByDevice(shopId, repairDeviceId) {
    return prisma.repairDevicePart.count({
      where: {
        shopId: Number(shopId),
        repairDeviceId: Number(repairDeviceId),
      },
    });
  },
};
