import { Hono } from "hono";
import { SHOP_CATALOG } from "../../shop/catalog";
import { purchaseShopItem } from "../../shop/purchase";
import type { ServerBindings, ServerVariables } from "../types";
import { jsonBigInt } from "../middleware/errorHandler";

export const shopRoutes = new Hono<{
  Bindings: ServerBindings;
  Variables: ServerVariables;
}>();

shopRoutes.get("/catalog", (c) => {
  return jsonBigInt(c, {
    items: SHOP_CATALOG.map((item) => ({
      ...item,
      cost: item.cost.toString(),
    })),
  });
});

shopRoutes.post("/:userId/purchase", async (c) => {
  const body = await c.req.json<{
    itemId: string;
    idempotencyKey: string;
    quantity?: number;
  }>();

  const result = await purchaseShopItem(c.get("db"), {
    userId: c.req.param("userId"),
    itemId: body.itemId,
    idempotencyKey: body.idempotencyKey,
    quantity: body.quantity,
  });

  return jsonBigInt(c, {
    ...result,
    goldSpent: result.goldSpent.toString(),
    balanceAfter: result.balanceAfter.toString(),
  }, 201);
});
