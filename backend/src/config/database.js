import "./env.js";
import { Prisma, PrismaClient } from "@prisma/client";

const isDev = process.env.NODE_ENV === "development";

const basePrisma = new PrismaClient({
  log: isDev ? ["error", "warn"] : ["error"],
});

/** Retry once after reconnect when Supabase pooler drops idle connections (P1001). */
const prisma = basePrisma.$extends({
  query: {
    $allModels: {
      async $allOperations({ args, query }) {
        try {
          return await query(args);
        } catch (error) {
          if (
            error instanceof Prisma.PrismaClientKnownRequestError &&
            error.code === "P1001"
          ) {
            await reconnectDatabase();
            return await query(args);
          }
          throw error;
        }
      },
    },
  },
});

let connected = false;

export function isDatabaseConnected() {
  return connected;
}

export async function reconnectDatabase() {
  try {
    await basePrisma.$disconnect();
  } catch {
    // ignore
  }
  connected = false;
  await basePrisma.$connect();
  connected = true;
}

export async function connectDatabase(maxAttempts = 5) {
  let lastError;

  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    try {
      await basePrisma.$connect();
      connected = true;
      return prisma;
    } catch (err) {
      lastError = err;
      connected = false;
      if (attempt < maxAttempts) {
        const delayMs = Math.min(1000 * attempt, 5000);
        await new Promise((resolve) => setTimeout(resolve, delayMs));
      }
    }
  }

  throw lastError;
}

export async function disconnectDatabase() {
  await basePrisma.$disconnect();
  connected = false;
}

export { prisma };
