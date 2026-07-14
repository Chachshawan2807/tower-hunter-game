import { Hono } from "hono";
import {
  createUser,
  getUserById,
  getWalletBalance,
  listInventoryItems,
  listMailboxItems,
} from "../../db";
import type { ServerBindings, ServerVariables } from "../types";
import { jsonBigInt } from "../middleware/errorHandler";

export const userRoutes = new Hono<{
  Bindings: ServerBindings;
  Variables: ServerVariables;
}>();

userRoutes.post("/", async (c) => {
  const body = await c.req.json<{
    externalId: string;
    displayName: string;
    preferredLocale?: "th" | "en";
  }>();

  const user = await createUser(c.get("db"), {
    externalId: body.externalId,
    displayName: body.displayName,
    preferredLocale: body.preferredLocale,
  });

  return jsonBigInt(c, user, 201);
});

userRoutes.get("/:userId", async (c) => {
  const user = await getUserById(c.get("db"), c.req.param("userId"));
  if (!user) {
    return c.json({ error: "User not found", code: "USER_NOT_FOUND" }, 404);
  }

  return jsonBigInt(c, user);
});

userRoutes.get("/:userId/wallet", async (c) => {
  const balance = await getWalletBalance(c.get("db"), c.req.param("userId"));
  return jsonBigInt(c, { userId: c.req.param("userId"), goldBalance: balance });
});

userRoutes.get("/:userId/inventory", async (c) => {
  const items = await listInventoryItems(c.get("db"), c.req.param("userId"));
  return c.json({ items });
});

userRoutes.get("/:userId/mailbox", async (c) => {
  const items = await listMailboxItems(c.get("db"), c.req.param("userId"));
  return c.json({ items });
});
