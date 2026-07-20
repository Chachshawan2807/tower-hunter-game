import { Hono } from "hono";
import { validateDisplayName } from "../../../engine/player/displayName";
import {
  createUser,
  getUserById,
  getUserByExternalId,
  updateDisplayName,
  getPlayerStats,
  getWalletBalance,
  listInventoryItems,
  listMailboxItems,
  claimMailboxItem,
  addItemToInventory,
  getPlayerSkillPath,
} from "../../db";
import {
  listPlayerEquipment,
  rowsToEquipmentDto,
  seedDefaultEquipment,
} from "../../db/equipment";
import {
  EquipValidationError,
  equipFromInventory,
} from "../../equipment/equipFromInventory";
import {
  getPlayerEquipmentBonuses,
} from "../../equipment/playerCombatStats";
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

userRoutes.get("/external/:externalId", async (c) => {
  const user = await getUserByExternalId(
    c.get("db"),
    c.req.param("externalId")
  );
  if (!user) {
    return c.json({ error: "User not found", code: "USER_NOT_FOUND" }, 404);
  }

  return jsonBigInt(c, user);
});

userRoutes.get("/:userId", async (c) => {
  const user = await getUserById(c.get("db"), c.req.param("userId"));
  if (!user) {
    return c.json({ error: "User not found", code: "USER_NOT_FOUND" }, 404);
  }

  return jsonBigInt(c, user);
});

userRoutes.patch("/:userId", async (c) => {
  const userId = c.req.param("userId");
  const body = await c.req.json<{ displayName?: string }>();

  if (typeof body.displayName !== "string") {
    return c.json({ error: "displayName required", code: "INVALID_BODY" }, 400);
  }

  const validation = validateDisplayName(body.displayName);
  if (!validation.ok) {
    return c.json(
      { error: "Invalid display name", code: `NAME_${validation.code}` },
      400
    );
  }

  try {
    const user = await updateDisplayName(
      c.get("db"),
      userId,
      validation.normalized
    );
    return jsonBigInt(c, user);
  } catch {
    return c.json({ error: "User not found", code: "USER_NOT_FOUND" }, 404);
  }
});

userRoutes.get("/:userId/stats", async (c) => {
  const userId = c.req.param("userId");
  const stats = await getPlayerStats(c.get("db"), userId);
  if (!stats) {
    return c.json({ error: "Player stats not found", code: "STATS_NOT_FOUND" }, 404);
  }

  const wallet = await getWalletBalance(c.get("db"), userId);
  const statBonus = await getPlayerEquipmentBonuses(c.get("db"), userId);
  return jsonBigInt(c, { stats, goldBalance: wallet, equipmentStatBonus: statBonus });
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

userRoutes.post("/:userId/mailbox/:mailboxItemId/claim", async (c) => {
  const userId = c.req.param("userId");
  const mailboxItemId = c.req.param("mailboxItemId");

  const claimed = await claimMailboxItem(c.get("db"), userId, mailboxItemId);

  if (!claimed) {
    return c.json({ error: "Mailbox item not found or expired", code: "MAILBOX_NOT_FOUND" }, 404);
  }

  const result = await addItemToInventory(c.get("db"), userId, {
    itemId: claimed.item_id,
    quantity: claimed.quantity,
    rarity: claimed.rarity,
    sourceFloor: claimed.source_floor ?? undefined,
  });

  return c.json({ item: claimed, inventoryResult: result });
});

userRoutes.get("/:userId/equipment", async (c) => {
  const pool = c.get("db");
  const userId = c.req.param("userId");
  const path = await getPlayerSkillPath(pool, userId);

  let rows = await listPlayerEquipment(pool, userId);
  if (rows.length === 0) {
    await seedDefaultEquipment(pool, userId, path);
    rows = await listPlayerEquipment(pool, userId);
  }

  return c.json({
    path,
    slots: rowsToEquipmentDto(rows),
    statBonus: await getPlayerEquipmentBonuses(pool, userId),
  });
});

userRoutes.patch("/:userId/equipment", async (c) => {
  const userId = c.req.param("userId");
  const body = await c.req.json<{
    slot: "weapon" | "helm" | "chest" | "gloves" | "boots" | "cloak";
    inventoryId: string;
  }>();

  if (!body.slot || !body.inventoryId) {
    return c.json({ error: "slot and inventoryId required", code: "INVALID_BODY" }, 400);
  }

  try {
    const result = await equipFromInventory(c.get("db"), {
      userId,
      slot: body.slot,
      inventoryId: body.inventoryId,
    });
    return c.json(result);
  } catch (err) {
    if (err instanceof EquipValidationError) {
      return c.json({ error: err.message, code: err.code }, 400);
    }
    throw err;
  }
});

