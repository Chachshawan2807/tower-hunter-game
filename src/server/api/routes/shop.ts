import { Hono } from "hono";
import { SHOP_CATALOG } from "../../shop/catalog";
import { purchaseShopItem } from "../../shop/purchase";
import { sellShopItem, ShopSellError } from "../../shop/sell";
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
      sellPrice: item.sellPrice.toString(),
    })),
  });
});

shopRoutes.post("/:userId/sell", async (c) => {
  const body = await c.req.json<{
    inventoryId: string;
    idempotencyKey: string;
  }>();

  try {
    const result = await sellShopItem(c.get("db"), {
      userId: c.req.param("userId"),
      inventoryId: body.inventoryId,
      idempotencyKey: body.idempotencyKey,
    });

    return jsonBigInt(c, {
      ...result,
      goldReceived: result.goldReceived.toString(),
      balanceAfter: result.balanceAfter.toString(),
    });
  } catch (err) {
    if (err instanceof ShopSellError) {
      return c.json({ error: err.message, code: err.code }, 400);
    }
    throw err;
  }
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
