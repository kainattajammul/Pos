import { prisma } from "../config/database.js";

/**
 * User model — all database access for the users table lives here.
 * Controllers call these functions instead of using Prisma directly.
 */
export const UserModel = {
  async create(data) {
    return prisma.user.create({ data });
  },

  async findByEmail(email) {
    return prisma.user.findUnique({ where: { email } });
  },

  async findById(id) {
    return prisma.user.findUnique({ where: { id: Number(id) } });
  },

  async findAll() {
    return prisma.user.findMany({ orderBy: { createdAt: "desc" } });
  },

  async update(id, data) {
    return prisma.user.update({
      where: { id: Number(id) },
      data,
    });
  },

  async remove(id) {
    return prisma.user.delete({ where: { id: Number(id) } });
  },

  async updateLastLogin(id) {
    return prisma.user.update({
      where: { id: Number(id) },
      data: { lastLogin: new Date() },
    });
  },
};
