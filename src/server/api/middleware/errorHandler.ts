import type { ContentfulStatusCode } from "hono/utils/http-status";
import type { Context } from "hono";
import { DbError } from "../../db";
import { BattleServiceError } from "../../battle";
import { BattleValidationError } from "../../battle/validation";
import { serializeJson } from "../serialize";

export function errorHandler(err: Error, c: Context): Response {
  if (err instanceof BattleServiceError || err instanceof BattleValidationError) {
    const status = err instanceof BattleServiceError ? err.status : 400;
    return c.json(
      { error: err.message, code: err.code },
      status as ContentfulStatusCode
    );
  }

  if (err instanceof DbError) {
    const status: ContentfulStatusCode =
      err.code === "IDEMPOTENCY_CONFLICT" ? 409 : 400;
    return c.json({ error: err.message, code: err.code }, status);
  }

  console.error(err);
  return c.json({ error: "Internal server error", code: "INTERNAL_ERROR" }, 500);
}

export function jsonBigInt(_c: Context, data: unknown, status: number = 200): Response {
  return new Response(serializeJson(data), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}
