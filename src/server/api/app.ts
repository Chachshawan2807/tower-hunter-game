import { Hono } from "hono";
import { createDbPool } from "../db";
import { errorHandler } from "./middleware/errorHandler";
import { battleRoutes } from "./routes/battle";
import { healthRoutes } from "./routes/health";
import { userRoutes } from "./routes/users";
import type { ServerBindings, ServerVariables } from "./types";

export function createApp(): Hono<{
  Bindings: ServerBindings;
  Variables: ServerVariables;
}> {
  const app = new Hono<{
    Bindings: ServerBindings;
    Variables: ServerVariables;
  }>();

  app.use("*", async (c, next) => {
    const connectionString =
      c.env?.DATABASE_URL ?? process.env.DATABASE_URL;

    if (!connectionString) {
      return c.json(
        { error: "DATABASE_URL is not configured", code: "CONFIG_ERROR" },
        500
      );
    }

    c.set("db", createDbPool({ connectionString }));
    await next();
  });

  app.onError(errorHandler);

  app.route("/", healthRoutes);
  app.route("/api/users", userRoutes);
  app.route("/api/battle", battleRoutes);

  return app;
}

export const app = createApp();
