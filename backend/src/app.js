import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import { env } from "./config/env.js";
import routes from "./routes/index.js";
import { errorHandler, notFoundHandler } from "./middleware/error.middleware.js";

/**
 * Express application setup — middleware and API routes.
 * The server entry (server.js) connects the database and listens on a port.
 */
export function createApp() {
  const app = express();

  const allowedOrigins = env.corsOrigin.split(",").map((o) => o.trim());

  /** In development, allow localhost and common LAN origins (Next.js "Network" URL). */
  function isAllowedCorsOrigin(origin) {
    if (!origin) return true;
    if (allowedOrigins.includes(origin)) return true;
    if (env.nodeEnv === "production") return false;
    try {
      const { hostname, protocol } = new URL(origin);
      if (protocol !== "http:" && protocol !== "https:") return false;
      if (hostname === "localhost" || hostname === "127.0.0.1") return true;
      if (/^192\.168\.\d{1,3}\.\d{1,3}$/.test(hostname)) return true;
      if (/^10\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(hostname)) return true;
      if (/^172\.(1[6-9]|2\d|3[01])\.\d{1,3}\.\d{1,3}$/.test(hostname)) return true;
    } catch {
      return false;
    }
    return false;
  }

  app.use(
    cors({
      origin(origin, callback) {
        if (isAllowedCorsOrigin(origin)) {
          callback(null, origin);
        } else {
          callback(new Error(`CORS blocked origin: ${origin}`));
        }
      },
      credentials: true,
    }),
  );
  app.use(express.json());
  app.use(cookieParser());

  app.get("/", (_req, res) => {
    res.json({
      success: true,
      message: "Fone Doctors POS API",
      data: { docs: { api: "/api/v1", health: "/api/v1/health" } },
    });
  });

  app.use("/api/v1", routes);
  /** Alias: POST /api/users matches POST /api/v1/users */
  app.use("/api", routes);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
