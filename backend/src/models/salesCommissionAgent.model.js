import { prisma } from "../config/database.js";

export const SalesCommissionAgentModel = {
  async findAll() {
    return prisma.salesCommissionAgent.findMany({
      orderBy: { createdAt: "desc" },
    });
  },

  async findById(id) {
    return prisma.salesCommissionAgent.findUnique({
      where: { id: Number(id) },
    });
  },

  async create(data) {
    return prisma.salesCommissionAgent.create({ data });
  },

  async update(id, data) {
    return prisma.salesCommissionAgent.update({
      where: { id: Number(id) },
      data,
    });
  },

  async delete(id) {
    return prisma.salesCommissionAgent.delete({
      where: { id: Number(id) },
    });
  },
};
