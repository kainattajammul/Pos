import dotenv from "dotenv";
import { PrismaClient } from "@prisma/client";

dotenv.config();

const prisma = new PrismaClient();

try {
  const shops = await prisma.shop.findMany();
  const branches = await prisma.branch.findMany({
    select: { id: true, uuid: true, shopId: true, name: true, branchCode: true, deletedAt: true },
  });
  console.log("shops:", JSON.stringify(shops, null, 2));
  console.log("branches:", JSON.stringify(branches, null, 2));
} finally {
  await prisma.$disconnect();
}
