import { Hono } from "hono";
import {
  getAllSkills,
  getDefaultLoadout,
  getSkillById,
  getSkillsForPath,
  getUnlockedSkills,
  isSkillUnlocked,
  resolveEffectiveSkill,
  validateLoadout,
} from "../../../engine/skills";
import type { SkillDefinition, SkillUpgradeRanks } from "../../../engine/skills/types";
import type { UpgradeBranch } from "../../../engine/skills/skillPoints";
import {
  getPlayerSkillPath,
  getPlayerStats,
  setPlayerSkillPath,
} from "../../db/playerStats";
import { getPlayerLoadout, upsertPlayerLoadout } from "../../db/skillLoadout";
import { getPlayerUpgrades, upgradeSkillBranch } from "../../db/skillUpgrades";
import {
  getPlayerSkillUnlocks,
  isSkillUnlockError,
  unlockPlayerSkill,
} from "../../db/skillUnlocks";
import type { SkillPath } from "../../../engine/types";
import type { ServerBindings, ServerVariables } from "../types";

const EMPTY_RANKS: SkillUpgradeRanks = { damage: 0, cooldown: 0, mpCost: 0 };

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

const UPGRADE_ERROR_CODES = new Set([
  "INVALID_SKILL",
  "INSUFFICIENT_SP",
  "MAX_RANK",
  "NOT_ATTACK",
  "UPGRADE_NOT_ALLOWED",
]);

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
  const [path, stats, unlockedSkillIds] = await Promise.all([
    getPlayerSkillPath(c.get("db"), userId),
    getPlayerStats(c.get("db"), userId),
    getPlayerSkillUnlocks(c.get("db"), userId),
  ]);

  const playerLevel = stats?.level ?? 1;
  const pathSkills = getSkillsForPath(path).map((skill) => ({
    ...mapSkill(skill),
    unlocked: isSkillUnlocked(skill, unlockedSkillIds),
  }));

  return c.json({
    path,
    playerLevel,
    equippedSkills: getUnlockedSkills(path, unlockedSkillIds).map((s) => s.id),
    skills: pathSkills,
  });
});

skillRoutes.patch("/:userId/path", async (c) => {
  const body = await c.req.json<{ path: SkillPath }>();
  const validPaths: SkillPath[] = ["imperial", "knight", "vanguard"];

  if (!validPaths.includes(body.path)) {
    return c.json({ error: "Invalid skill path", code: "INVALID_PATH" }, 400);
  }

  const userId = c.req.param("userId");
  const path = await setPlayerSkillPath(c.get("db"), userId, body.path);
  const [stats, unlockedSkillIds] = await Promise.all([
    getPlayerStats(c.get("db"), userId),
    getPlayerSkillUnlocks(c.get("db"), userId),
  ]);
  const playerLevel = stats?.level ?? 1;

  return c.json({
    path,
    playerLevel,
    equippedSkills: getUnlockedSkills(path, unlockedSkillIds).map((s) => s.id),
    skills: getSkillsForPath(path).map((skill) => ({
      ...mapSkill(skill),
      unlocked: isSkillUnlocked(skill, unlockedSkillIds),
    })),
  });
});

skillRoutes.get("/:userId/progression", async (c) => {
  const userId = c.req.param("userId");
  const path = await getPlayerSkillPath(c.get("db"), userId);
  const [stats, upgrades, dbLoadout, unlockedSkillIds] = await Promise.all([
    getPlayerStats(c.get("db"), userId),
    getPlayerUpgrades(c.get("db"), userId),
    getPlayerLoadout(c.get("db"), userId, path),
    getPlayerSkillUnlocks(c.get("db"), userId),
  ]);

  const skillPoints = stats?.skill_points ?? 0;
  const loadout =
    dbLoadout ?? getDefaultLoadout(path, unlockedSkillIds);

  const skills = getSkillsForPath(path).map((skill) => {
    const skillUpgrades = upgrades[skill.id] ?? EMPTY_RANKS;
    const effective = resolveEffectiveSkill(skill, skillUpgrades);

    return {
      ...mapSkill(effective),
      unlocked: isSkillUnlocked(skill, unlockedSkillIds),
      upgrades: skillUpgrades,
    };
  });

  return c.json({
    skillPoints,
    upgrades,
    path,
    skills,
    loadout,
    unlockedSkillIds,
  });
});

skillRoutes.post("/:userId/unlock", async (c) => {
  const body = await c.req.json<{ skillId: string }>();
  if (!body.skillId) {
    return c.json({ error: "Invalid request", code: "INVALID_REQUEST" }, 400);
  }

  try {
    const result = await unlockPlayerSkill(
      c.get("db"),
      c.req.param("userId"),
      body.skillId
    );
    return c.json(result);
  } catch (err) {
    if (isSkillUnlockError(err)) {
      return c.json({ error: err.message, code: err.message }, 400);
    }
    throw err;
  }
});

skillRoutes.post("/:userId/upgrade", async (c) => {
  const body = await c.req.json<{ skillId: string; branch: UpgradeBranch }>();
  const validBranches: UpgradeBranch[] = ["damage", "cooldown", "mpCost"];

  if (!body.skillId || !validBranches.includes(body.branch)) {
    return c.json({ error: "Invalid request", code: "INVALID_REQUEST" }, 400);
  }

  const skill = getSkillById(body.skillId);
  if (skill.path === "basic" || (skill.path as string) === "enemy") {
    return c.json({ error: "Invalid skill", code: "INVALID_SKILL" }, 400);
  }

  try {
    const result = await upgradeSkillBranch(
      c.get("db"),
      c.req.param("userId"),
      body.skillId,
      body.branch
    );
    return c.json(result);
  } catch (err) {
    if (err instanceof Error && UPGRADE_ERROR_CODES.has(err.message)) {
      return c.json({ error: err.message, code: err.message }, 400);
    }
    throw err;
  }
});

skillRoutes.patch("/:userId/loadout", async (c) => {
  const body = await c.req.json<{
    path: SkillPath;
    activeSlots: [string, string];
  }>();
  const userId = c.req.param("userId");
  const unlockedSkillIds = await getPlayerSkillUnlocks(c.get("db"), userId);
  const result = validateLoadout(body.path, body.activeSlots, unlockedSkillIds);

  if (!result.valid) {
    return c.json({ error: result.error, code: result.error }, 400);
  }

  const saved = await upsertPlayerLoadout(c.get("db"), userId, {
    path: body.path,
    activeSlots: body.activeSlots,
  });

  return c.json({ loadout: saved });
});
