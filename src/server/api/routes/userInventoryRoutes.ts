import { Hono } from "hono";
import {
  getWalletBalance,
  listInventoryItems,
  listMailboxItems,
  claimMailboxItem,
  addItemToInventory,
  getPlayerSkillPath,
} from "../../db";
import {
  listPlayerEquipment,
} from "../../db/equipment";
import { equipmentPayloadFromRows } from "../../equipment/equipmentFromRows";
import {
  EquipValidationError,
  equipFromInventory,
} from "../../equipment/equipFromInventory";
import {
  unequipSlot,
  UnequipValidationError,
} from "../../equipment/unequipSlot";
import { getPlayerEquipmentBonuses } from "../../equipment/playerCombatStats";
import type { ServerBindings, ServerVariables } from "../types";
import { jsonBigInt } from "../middleware/errorHandler";

export const userInventoryRoutes = new Hono<{
  Bindings: ServerBindings;
  Variables: ServerVariables;
}>();

userInventoryRoutes.get("/:userId/wallet", async (c) => {
  const balance = await getWalletBalance(c.get("db"), c.req.param("userId"));
  return jsonBigInt(c, { userId: c.req.param("userId"), goldBalance: balance });
});

userInventoryRoutes.get("/:userId/inventory", async (c) => {
  const items = await listInventoryItems(c.get("db"), c.req.param("userId"));
  return c.json({ items });
});

userInventoryRoutes.get("/:userId/mailbox", async (c) => {
  const items = await listMailboxItems(c.get("db"), c.req.param("userId"));
  return c.json({ items });
});

userInventoryRoutes.post("/:userId/mailbox/:mailboxItemId/claim", async (c) => {
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

userInventoryRoutes.get("/:userId/equipment", async (c) => {
  const pool = c.get("db");
  const userId = c.req.param("userId");

  const [path, rows] = await Promise.all([
    getPlayerSkillPath(pool, userId),
    listPlayerEquipment(pool, userId),
  ]);

  return c.json(equipmentPayloadFromRows(path, rows));
});

userInventoryRoutes.patch("/:userId/equipment", async (c) => {
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

const EQUIPMENT_SLOT_IDS = [
  "weapon",
  "helm",
  "chest",
  "gloves",
  "boots",
  "cloak",
] as const;

userInventoryRoutes.delete("/:userId/equipment/:slot", async (c) => {
  const userId = c.req.param("userId");
  const slot = c.req.param("slot");

  if (!EQUIPMENT_SLOT_IDS.includes(slot as (typeof EQUIPMENT_SLOT_IDS)[number])) {
    return c.json({ error: "Invalid equipment slot", code: "INVALID_SLOT" }, 400);
  }

  try {
    const result = await unequipSlot(c.get("db"), {
      userId,
      slot: slot as (typeof EQUIPMENT_SLOT_IDS)[number],
    });
    return c.json({
      ...result,
      statBonus: await getPlayerEquipmentBonuses(c.get("db"), userId),
    });
  } catch (err) {
    if (err instanceof UnequipValidationError) {
      return c.json({ error: err.message, code: err.code }, 400);
    }
    throw err;
  }
});
