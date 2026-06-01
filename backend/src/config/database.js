import "./env.js";
import { Prisma, PrismaClient } from "@prisma/client";

const isDev = process.env.NODE_ENV === "development";

const RETRYABLE_PRISMA_CODES = new Set(["P1001", "P1002", "P1017"]);

const basePrisma = new PrismaClient({
  log: isDev ? ["error", "warn"] : ["error"],
});

function isRetryableConnectionError(error) {
  if (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    RETRYABLE_PRISMA_CODES.has(error.code)
  ) {
    return true;
  }

  const message = String(error?.message ?? "");
  return /connection reset|forcibly closed|can't reach database|econnreset|etimedout|broken pipe/i.test(
    message,
  );
}

/** Retry once after reconnect when Supabase pooler drops idle connections. */
const prisma = basePrisma.$extends({
  query: {
    $allModels: {
      async $allOperations({ args, query }) {
        try {
          return await query(args);
        } catch (error) {
          if (isRetryableConnectionError(error)) {
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
let keepaliveTimer = null;

const KEEPALIVE_MS = Number(process.env.DATABASE_KEEPALIVE_MS ?? 4 * 60 * 1000);

function startConnectionKeepalive() {
  if (keepaliveTimer || KEEPALIVE_MS <= 0) return;

  keepaliveTimer = setInterval(() => {
    void basePrisma
      .$queryRaw`SELECT 1`
      .catch(async () => {
        try {
          await reconnectDatabase();
        } catch {
          connected = false;
        }
      });
  }, KEEPALIVE_MS);

  if (typeof keepaliveTimer.unref === "function") {
    keepaliveTimer.unref();
  }
}

function stopConnectionKeepalive() {
  if (keepaliveTimer) {
    clearInterval(keepaliveTimer);
    keepaliveTimer = null;
  }
}

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
      startConnectionKeepalive();
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
  stopConnectionKeepalive();
  await basePrisma.$disconnect();
  connected = false;
}

export { prisma };
