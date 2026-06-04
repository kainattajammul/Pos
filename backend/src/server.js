import { createApp } from "./app.js";
import { env } from "./config/env.js";
import { connectDatabase, disconnectDatabase } from "./config/database.js";
import {
  ensureRepairCategoryStorageBucket,
  isSupabaseStorageConfigured,
} from "./config/supabase.js";

async function start() {
  const { prisma } = await import("./config/database.js");
  if (!prisma.repairDeviceIssue || !prisma.repairDeviceSeries) {
    console.error(
      "Prisma client is out of date (missing repair models). Stop the server, run: npm run db:generate && npm run db:migrate:deploy, then npm start",
    );
    process.exit(1);
  }

  const app = createApp();
  const server = app.listen(env.port, () => {
    console.log(`POS API listening on http://localhost:${env.port}`);
    console.log(`Health: http://localhost:${env.port}/api/v1/health`);
    if (isSupabaseStorageConfigured()) {
      ensureRepairCategoryStorageBucket()
        .then((ok) => {
          if (ok) {
            console.log(
              `Supabase storage: bucket "${env.supabaseBucket}" ready (public)`,
            );
          }
        })
        .catch((err) => {
          console.warn("Supabase storage setup failed:", err.message);
        });
    } else if (env.storageDriver === "local") {
      console.log(
        `Local storage: files saved under UPLOAD_DIR, served at ${env.publicUploadUrl || "(set PUBLIC_UPLOAD_URL)"}`,
      );
    } else {
      console.warn(
        "Supabase storage: not configured — set SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, SUPABASE_BUCKET. Or use STORAGE_DRIVER=local.",
      );
    }
  });

  connectDatabase()
    .then(() => console.log("Database connected"))
    .catch((err) => {
      console.warn("Database offline:", err.message);
      if (env.devAuthBypass) {
        console.warn("ENABLE_DEV_AUTH_BYPASS=true — login works without Postgres (dev only).");
      } else {
        console.warn("Set DATABASE_URL in .env or ENABLE_DEV_AUTH_BYPASS=true for local dev.");
      }
    });

  const shutdown = async () => {
    console.log("Shutting down...");
    server.close();
    await disconnectDatabase();
    process.exit(0);
  };

  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);
}

start().catch((err) => {
  console.error("Failed to start server:", err);
  process.exit(1);
});
