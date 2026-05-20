import { createApp } from "./app.js";
import { env } from "./config/env.js";
import { connectDatabase, disconnectDatabase } from "./config/database.js";

async function start() {
  const app = createApp();
  const server = app.listen(env.port, () => {
    console.log(`POS API listening on http://localhost:${env.port}`);
    console.log(`Health: http://localhost:${env.port}/api/v1/health`);
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
