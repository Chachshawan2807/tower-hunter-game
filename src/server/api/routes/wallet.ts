import { Hono } from "hono";
import { walletRepository } from "../../repository/wallet.repository";
import type { WalletTransactionType } from "../../db/types";
import type { ServerBindings, ServerVariables } from "../types";
import { jsonBigInt } from "../middleware/errorHandler";

export const walletRoutes = new Hono<{
  Bindings: ServerBindings;
  Variables: ServerVariables;
}>();

walletRoutes.get("/:userId/wallet", async (c) => {
  const userId = c.req.param("userId");
  const balance = await walletRepository.getBalance(c.get("db"), userId);
  return jsonBigInt(c, { userId, goldBalance: balance });
});

walletRoutes.get("/:userId/wallet/ledger", async (c) => {
  const userId = c.req.param("userId");
  const limit = Number(c.req.query("limit") ?? 50);
  const entries = await walletRepository.listLedger(c.get("db"), userId, limit);
  return jsonBigInt(c, { entries });
});

walletRoutes.post("/:userId/wallet/transaction", async (c) => {
  const userId = c.req.param("userId");
  const body = await c.req.json<{
    idempotencyKey: string;
    amount: string;
    type: WalletTransactionType;
    metadata?: Record<string, unknown>;
  }>();

  const result = await walletRepository.processTransaction(c.get("db"), {
    idempotencyKey: body.idempotencyKey,
    userId,
    amount: BigInt(body.amount),
    type: body.type,
    metadata: body.metadata,
  });

  return jsonBigInt(c, result, 201);
});
