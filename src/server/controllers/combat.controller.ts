import { randomUUID } from "node:crypto";
import type { PlayerIntent } from "../../types";
import {
  getBattleSession,
  runAutoBattle,
  runBattleStep,
  startBattle,
  submitBattleIntent,
} from "../battle";
import type { BattleSession, BattleStepResponse, StartBattleInput } from "../battle/types";
import { jsonBigInt } from "../api/middleware/errorHandler";
import type { Context } from "hono";
import type { ServerBindings, ServerVariables } from "../api/types";

type BattleContext = Context<{
  Bindings: ServerBindings;
  Variables: ServerVariables;
}>;

function requireSessionId(c: BattleContext): string {
  const sessionId = c.req.param("sessionId");
  if (!sessionId) {
    throw new Error("sessionId is required");
  }
  return sessionId;
}

export async function combatStart(c: BattleContext) {
  const body = await c.req.json<{
    userId: string;
    floor: number;
    autoBattle?: boolean;
  }>();

  const session = await startBattle(c.get("db"), {
    userId: body.userId,
    floor: body.floor,
    autoBattle: body.autoBattle,
  } satisfies StartBattleInput);

  return jsonBigInt(c, session, 201);
}

export function combatGetSession(c: BattleContext) {
  const session = getBattleSession(requireSessionId(c));
  return jsonBigInt(c, session);
}

export async function combatStep(c: BattleContext) {
  const body: { maxSteps?: number } = await c.req
    .json<{ maxSteps?: number }>()
    .catch(() => ({}));

  const result = await runBattleStep(
    c.get("db"),
    requireSessionId(c),
    body.maxSteps ?? 1
  );

  return jsonBigInt(c, result);
}

export async function combatAuto(c: BattleContext) {
  const result = await runAutoBattle(c.get("db"), requireSessionId(c));
  return jsonBigInt(c, result);
}

export async function combatIntent(c: BattleContext) {
  const body = await c.req.json<{ intent: PlayerIntent }>();
  const result = await submitBattleIntent(
    c.get("db"),
    requireSessionId(c),
    body.intent
  );

  return jsonBigInt(c, result);
}

export function createTurnNonce(): string {
  return randomUUID();
}

export type { BattleSession, BattleStepResponse };
