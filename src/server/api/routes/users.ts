import { Hono } from "hono";
import { validateDisplayName } from "../../../engine/player/displayName";
import {
  createUser,
  getUserById,
  getUserByExternalId,
  updateDisplayName,
  getPlayerStats,
  getWalletBalance,
  allocateStatusPoint,
  resetStatusAllocations,
  StatusAllocationError,
} from "../../db";
import { listPlayerEquipment } from "../../db/equipment";
import { buildPlayerRevision } from "../../db/playerRevision";
import { getPlayerSkillPath } from "../../db/playerStats";
import { equipmentPayloadFromRows } from "../../equipment/equipmentFromRows";
import { getPlayerEquipmentBonuses } from "../../equipment/playerCombatStats";
import type { ServerBindings, ServerVariables } from "../types";
import { buildUserBootstrap } from "../../users/buildBootstrap";
import { jsonBigInt } from "../middleware/errorHandler";
import { userInventoryRoutes } from "./userInventoryRoutes";

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

userRoutes.get("/:userId/bootstrap", async (c) => {
  const userId = c.req.param("userId");
  const payload = await buildUserBootstrap(c.get("db"), userId);
  if (!payload) {
    return c.json({ error: "User not found", code: "USER_NOT_FOUND" }, 404);
  }
  return jsonBigInt(c, payload);
});

userRoutes.get("/:userId/stats", async (c) => {
  const userId = c.req.param("userId");
  const pool = c.get("db");
  const [stats, wallet, equipmentRows, skillPath] = await Promise.all([
    getPlayerStats(pool, userId),
    getWalletBalance(pool, userId),
    listPlayerEquipment(pool, userId),
    getPlayerSkillPath(pool, userId),
  ]);

  if (!stats) {
    return c.json({ error: "Player stats not found", code: "STATS_NOT_FOUND" }, 404);
  }

  const statBonus = equipmentPayloadFromRows(skillPath, equipmentRows).statBonus;
  const revision = buildPlayerRevision(stats);
  return jsonBigInt(c, {
    stats,
    goldBalance: wallet,
    equipmentStatBonus: statBonus,
    revision,
  });
});

userRoutes.post("/:userId/stats/allocate", async (c) => {
  const userId = c.req.param("userId");
  const body = await c.req.json<{ stat?: string }>();

  if (!body.stat || typeof body.stat !== "string") {
    return c.json({ error: "stat required", code: "INVALID_BODY" }, 400);
  }

  try {
    const stats = await allocateStatusPoint(c.get("db"), userId, body.stat);
    const wallet = await getWalletBalance(c.get("db"), userId);
    const statBonus = await getPlayerEquipmentBonuses(c.get("db"), userId);
    const revision = buildPlayerRevision(stats);
    return jsonBigInt(c, {
      stats,
      goldBalance: wallet,
      equipmentStatBonus: statBonus,
      revision,
    });
  } catch (err) {
    if (err instanceof StatusAllocationError) {
      return c.json({ error: err.message, code: err.code }, 400);
    }
    throw err;
  }
});

userRoutes.post("/:userId/stats/reset-status", async (c) => {
  const userId = c.req.param("userId");

  try {
    const stats = await resetStatusAllocations(c.get("db"), userId);
    const wallet = await getWalletBalance(c.get("db"), userId);
    const statBonus = await getPlayerEquipmentBonuses(c.get("db"), userId);
    const revision = buildPlayerRevision(stats);
    return jsonBigInt(c, {
      stats,
      goldBalance: wallet,
      equipmentStatBonus: statBonus,
      revision,
    });
  } catch (err) {
    if (err instanceof StatusAllocationError) {
      return c.json({ error: err.message, code: err.code }, 400);
    }
    throw err;
  }
});

userRoutes.route("/", userInventoryRoutes);
