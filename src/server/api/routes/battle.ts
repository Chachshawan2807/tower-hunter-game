import { Hono } from "hono";
import type { PlayerIntent } from "../../../engine/types";
import {
  getBattleSession,
  runAutoBattle,
  runBattleStep,
  startBattle,
  submitBattleIntent,
} from "../../battle";
import type { ServerBindings, ServerVariables } from "../types";
import { jsonBigInt } from "../middleware/errorHandler";

export const battleRoutes = new Hono<{
  Bindings: ServerBindings;
  Variables: ServerVariables;
}>();

battleRoutes.post("/start", async (c) => {
  const body = await c.req.json<{
    userId: string;
    floor: number;
    autoBattle?: boolean;
  }>();

  const session = await startBattle(c.get("db"), {
    userId: body.userId,
    floor: body.floor,
    autoBattle: body.autoBattle,
  });

  return jsonBigInt(c, session, 201);
});

battleRoutes.get("/:sessionId", (c) => {
  const session = getBattleSession(c.req.param("sessionId"));
  return jsonBigInt(c, session);
});

battleRoutes.post("/:sessionId/step", async (c) => {
  const body: { maxSteps?: number } = await c.req
    .json<{ maxSteps?: number }>()
    .catch(() => ({}));
  const result = await runBattleStep(
    c.get("db"),
    c.req.param("sessionId"),
    body.maxSteps ?? 1
  );

  return jsonBigInt(c, result);
});

battleRoutes.post("/:sessionId/auto", async (c) => {
  const result = await runAutoBattle(c.get("db"), c.req.param("sessionId"));
  return jsonBigInt(c, result);
});

battleRoutes.post("/:sessionId/intent", async (c) => {
  const body = await c.req.json<{ intent: PlayerIntent }>();
  const result = await submitBattleIntent(
    c.get("db"),
    c.req.param("sessionId"),
    body.intent
  );

  return jsonBigInt(c, result);
});
