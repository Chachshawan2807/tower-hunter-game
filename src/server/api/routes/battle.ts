import { Hono } from "hono";
import {
  combatAuto,
  combatGetSession,
  combatIntent,
  combatStart,
  combatStep,
} from "../../controllers/combat.controller";
import type { ServerBindings, ServerVariables } from "../types";

export const battleRoutes = new Hono<{
  Bindings: ServerBindings;
  Variables: ServerVariables;
}>();

battleRoutes.post("/start", combatStart);
battleRoutes.get("/:sessionId", combatGetSession);
battleRoutes.post("/:sessionId/step", combatStep);
battleRoutes.post("/:sessionId/auto", combatAuto);
battleRoutes.post("/:sessionId/intent", combatIntent);
