import Fastify from "fastify";
import cors from "@fastify/cors";

import { env } from "./config/env.js";
import { requireAuth } from "./middleware/requireAuth.js";

import { shioriRoutes } from "./modules/shiori/routes.js";

export function buildApp() {
  const app = Fastify({
    logger: true,
  });

  app.register(shioriRoutes, {
    prefix: "/api",
  });

  app.register(cors, {
    origin: env.corsOrigin,
    methods: ["GET", "POST", "PATCH", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  });

  app.get("/health", async () => ({
    ok: true,
    service: "shiori-api",
    timestamp: new Date().toISOString(),
  }));

  app.get("/api/auth/me", { preHandler: requireAuth }, async (request) => ({
    authenticated: true,
    userId: request.userId,
  }));

  return app;
}
