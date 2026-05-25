import { prisma } from "../config/database.js";

export const RepairDeviceIssueModel = {
  async findByDevice(shopId, repairDeviceId) {
    return prisma.repairDeviceIssue.findMany({
      where: {
        shopId: Number(shopId),
        repairDeviceId: Number(repairDeviceId),
      },
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    });
  },

  async findById(id) {
    return prisma.repairDeviceIssue.findUnique({
      where: { id: Number(id) },
    });
  },

  async findByDeviceAndSlug(shopId, repairDeviceId, slug, excludeId) {
    return prisma.repairDeviceIssue.findFirst({
      where: {
        shopId: Number(shopId),
        repairDeviceId: Number(repairDeviceId),
        slug,
        ...(excludeId != null ? { id: { not: Number(excludeId) } } : {}),
      },
    });
  },

  async findByDeviceAndName(shopId, repairDeviceId, name, excludeId) {
    return prisma.repairDeviceIssue.findFirst({
      where: {
        shopId: Number(shopId),
        repairDeviceId: Number(repairDeviceId),
        name: { equals: name, mode: "insensitive" },
        ...(excludeId != null ? { id: { not: Number(excludeId) } } : {}),
      },
    });
  },

  async createMany(data) {
    return prisma.repairDeviceIssue.createMany({ data, skipDuplicates: true });
  },

  async create(data) {
    return prisma.repairDeviceIssue.create({ data });
  },

  async update(id, data) {
    return prisma.repairDeviceIssue.update({
      where: { id: Number(id) },
      data,
    });
  },

  async delete(id) {
    return prisma.repairDeviceIssue.delete({
      where: { id: Number(id) },
    });
  },

  async countByDevice(shopId, repairDeviceId) {
    return prisma.repairDeviceIssue.count({
      where: {
        shopId: Number(shopId),
        repairDeviceId: Number(repairDeviceId),
      },
    });
  },
};
