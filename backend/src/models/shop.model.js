import { prisma } from "../config/database.js";

export const ShopModel = {
  async findById(shopId) {
    return prisma.shop.findUnique({
      where: { id: Number(shopId) },
    });
  },

  async findRoleInShop(roleId, shopId) {
    return prisma.role.findFirst({
      where: {
        id: Number(roleId),
        shopId: Number(shopId),
      },
    });
  },
};
