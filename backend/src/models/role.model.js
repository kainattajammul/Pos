import { prisma } from "../config/database.js";

export const RoleModel = {
  async findAll() {
    return prisma.role.findMany({
      orderBy: { createdAt: "desc" },
    });
  },

  async findById(id) {
    return prisma.role.findUnique({
      where: { id: Number(id) },
    });
  },

  async findByShopAndName(shopId, name, excludeId) {
    return prisma.role.findFirst({
      where: {
        shopId: Number(shopId),
        name: { equals: name, mode: "insensitive" },
        ...(excludeId != null ? { id: { not: Number(excludeId) } } : {}),
      },
    });
  },

  async create(data) {
    return prisma.role.create({ data });
  },

  async update(id, data) {
    return prisma.role.update({
      where: { id: Number(id) },
      data,
    });
  },
};
