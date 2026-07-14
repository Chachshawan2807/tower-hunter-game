import { Hono } from "hono";
import {
  getAllSkills,
  getSkillById,
  getSkillsForPath,
  getUnlockedSkills,
  isSkillUnlocked,
  validateLoadout,
} from "../../../engine/skills";
import type { SkillDefinition } from "../../../engine/skills/types";
import {
  getPlayerSkillPath,
  getPlayerStats,
  setPlayerSkillPath,
} from "../../db/playerStats";
import { upsertPlayerLoadout } from "../../db/skillLoadout";
import type { SkillPath } from "../../../engine/types";
import type { ServerBindings, ServerVariables } from "../types";

function mapSkill(skill: SkillDefinition) {
  return {
    id: skill.id,
    path: skill.path,
    stringId: skill.stringId,
    icon: skill.icon,
    mpCost: skill.mpCost,
    kind: skill.kind,
    targetType: skill.targetType,
    unlockLevel: skill.unlockLevel,
    cooldownTurns: skill.cooldownTurns,
    damageMultiplier: skill.damageMultiplier,
    healPercent: skill.healPercent,
  };
}

export const skillRoutes = new Hono<{
  Bindings: ServerBindings;
  Variables: ServerVariables;
}>();

skillRoutes.get("/catalog", (c) => {
  const skills = getAllSkills()
    .filter((s) => s.path !== "basic")
    .map(mapSkill);

  return c.json({ skills });
});

skillRoutes.get("/:userId/path", async (c) => {
  const userId = c.req.param("userId");
  const [path, stats] = await Promise.all([
    getPlayerSkillPath(c.get("db"), userId),
    getPlayerStats(c.get("db"), userId),
  ]);

  const playerLevel = stats?.level ?? 1;
  const pathSkills = getSkillsForPath(path).map((skill) => ({
    ...mapSkill(skill),
    unlocked: isSkillUnlocked(skill, playerLevel),
  }));

  return c.json({
    path,
    playerLevel,
    equippedSkills: getUnlockedSkills(path, playerLevel).map((s) => s.id),
    skills: pathSkills,
  });
});

skillRoutes.patch("/:userId/path", async (c) => {
  const body = await c.req.json<{ path: SkillPath }>();
  const validPaths: SkillPath[] = ["murim", "knight", "fantasy"];

  if (!validPaths.includes(body.path)) {
    return c.json({ error: "Invalid skill path", code: "INVALID_PATH" }, 400);
  }

  const userId = c.req.param("userId");
  const path = await setPlayerSkillPath(c.get("db"), userId, body.path);
  const stats = await getPlayerStats(c.get("db"), userId);
  const playerLevel = stats?.level ?? 1;

  return c.json({
    path,
    playerLevel,
    equippedSkills: getUnlockedSkills(path, playerLevel).map((s) => s.id),
    skills: getSkillsForPath(path).map((skill) => ({
      ...mapSkill(skill),
      unlocked: isSkillUnlocked(skill, playerLevel),
    })),
  });
});

skillRoutes.patch("/:userId/loadout", async (c) => {
  const body = await c.req.json<{
    path: SkillPath;
    activeSlots: [string, string];
  }>();
  const userId = c.req.param("userId");
  const stats = await getPlayerStats(c.get("db"), userId);
  const playerLevel = stats?.level ?? 1;
  const result = validateLoadout(body.path, body.activeSlots, playerLevel);

  if (!result.valid) {
    return c.json({ error: result.error, code: result.error }, 400);
  }

  const saved = await upsertPlayerLoadout(c.get("db"), userId, {
    path: body.path,
    activeSlots: body.activeSlots,
  });

  return c.json({ loadout: saved });
});
