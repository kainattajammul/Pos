import { PrismaClient } from "@prisma/client";

// Single Prisma instance for the whole app (connection pooling via Supabase)
const prisma = new PrismaClient({
  log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
});

let connected = false;

export function isDatabaseConnected() {
  return connected;
}

export async function connectDatabase() {
  await prisma.$connect();
  connected = true;
  return prisma;
}

export async function disconnectDatabase() {
  await prisma.$disconnect();
}

export { prisma };
