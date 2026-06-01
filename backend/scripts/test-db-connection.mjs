import dotenv from "dotenv";
import { PrismaClient } from "@prisma/client";

dotenv.config();

const prisma = new PrismaClient();

try {
  await prisma.$connect();
  const count = await prisma.shop.count();
  console.log("Database connected. shop count:", count);
} catch (err) {
  console.error("Database connection failed:", err.message);
  process.exitCode = 1;
} finally {
  await prisma.$disconnect();
}
