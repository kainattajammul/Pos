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

  app.use(
    cors({
      origin: allowedOrigins,
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
