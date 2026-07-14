import { Hono } from "hono";
import type { ServerBindings, ServerVariables } from "../types";

export const healthRoutes = new Hono<{
  Bindings: ServerBindings;
  Variables: ServerVariables;
}>();

healthRoutes.get("/health", (c) => {
  return c.json({ status: "ok", service: "tower-hunter-game" });
});
