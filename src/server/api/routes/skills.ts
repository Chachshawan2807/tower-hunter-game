import { Hono } from "hono";
import {
  CATALOG_VERSION,
  defaultSkillLoadout,
  getPlayerCatalogSkills,
  getSkillById,
  getSkillsByType,
  isSkillUnlocked,
  resolveEffectiveSkill,
  validateEquipLoadout,
} from "../../../engine/skills";
import type { SkillDefinition } from "../../../engine/skills/types";
import { EMPTY_SKILL_UPGRADES } from "../../../engine/skills/types";
import type { UpgradeBranch } from "../../../engine/skills/skillPoints";
import type { SkillType } from "../../../engine/skills/skillTypes";
import { getPlayerStats } from "../../db/playerStats";
import {
  getPlayerLoadoutV2,
  upsertPlayerLoadoutV2,
} from "../../db/skillLoadoutV2";
import { getPlayerUpgrades, upgradeSkillBranch } from "../../db/skillUpgrades";
import {
  getPlayerSkillUnlocks,
  isSkillUnlockError,
  unlockPlayerSkill,
} from "../../db/skillUnlocks";
import { respecPlayerSkills } from "../../db/skillRespec";
import type { ServerBindings, ServerVariables } from "../types";

function mapSkill(skill: SkillDefinition) {
  return {
    id: skill.id,
    skillType: skill.skillType,
    catalogTier: skill.catalogTier,
    stringId: skill.stringId,
    icon: skill.icon,
    mpCost: skill.mpCost,
    kind: skill.kind,
    targetType: skill.targetType,
    unlockLevel: skill.unlockLevel,
    unlockSpCost: skill.unlockSpCost,
    cooldownTurns: skill.cooldownTurns,
    damageMultiplier: skill.damageMultiplier,
    healPercent: skill.healPercent,
    defPierce: skill.defPierce,
    passiveEffects: skill.passiveEffects,
  };
}

const UPGRADE_BRANCHES: UpgradeBranch[] = [
  "damage",
  "cooldown",
  "mpCost",
  "statusPotency",
  "healPower",
  "passivePotency",
];

const UPGRADE_ERROR_CODES = new Set([
  "INVALID_SKILL",
  "INSUFFICIENT_SP",
  "MAX_RANK",
  "NOT_ATTACK",
  "NOT_HEAL",
  "NOT_PASSIVE",
  "NOT_STATUS",
  "UPGRADE_NOT_ALLOWED",
]);

export const skillRoutes = new Hono<{
  Bindings: ServerBindings;
  Variables: ServerVariables;
}>();

skillRoutes.get("/catalog", (c) => {
  const typeFilter = c.req.query("type") as SkillType | undefined;
  const skills = (typeFilter
    ? getSkillsByType(typeFilter)
    : getPlayerCatalogSkills()
  ).map(mapSkill);

  return c.json({ version: CATALOG_VERSION, skills });
});

skillRoutes.get("/:userId/progression", async (c) => {
  const userId = c.req.param("userId");
  const [stats, upgrades, dbLoadout, unlockedSkillIds] = await Promise.all([
    getPlayerStats(c.get("db"), userId),
    getPlayerUpgrades(c.get("db"), userId),
    getPlayerLoadoutV2(c.get("db"), userId),
    getPlayerSkillUnlocks(c.get("db"), userId),
  ]);

  const skillPoints = stats?.skill_points ?? 0;
  const loadout = dbLoadout ?? defaultSkillLoadout(unlockedSkillIds);

  const skills = getPlayerCatalogSkills().map((skill) => {
    const skillUpgrades = upgrades[skill.id] ?? EMPTY_SKILL_UPGRADES;
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

  if (!body.skillId || !UPGRADE_BRANCHES.includes(body.branch)) {
    return c.json({ error: "Invalid request", code: "INVALID_REQUEST" }, 400);
  }

  const skill = getSkillById(body.skillId);
  if (skill.path !== "player") {
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
    equippedSlots: string[];
    healOverride?: boolean;
    healThreshold?: number;
  }>();
  const userId = c.req.param("userId");
  const unlockedSkillIds = await getPlayerSkillUnlocks(c.get("db"), userId);
  const result = validateEquipLoadout(body.equippedSlots ?? [], unlockedSkillIds);

  if (!result.valid) {
    return c.json({ error: result.error, code: result.error }, 400);
  }

  const existing = await getPlayerLoadoutV2(c.get("db"), userId);
  const saved = await upsertPlayerLoadoutV2(c.get("db"), userId, {
    equippedSlots: body.equippedSlots,
    battlePrefs: {
      healOverrideEnabled:
        body.healOverride ?? existing?.battlePrefs.healOverrideEnabled ?? true,
      healThreshold:
        body.healThreshold ?? existing?.battlePrefs.healThreshold ?? 0.35,
    },
  });

  return c.json({ loadout: saved });
});

skillRoutes.post("/:userId/respec", async (c) => {
  const result = await respecPlayerSkills(c.get("db"), c.req.param("userId"));
  return c.json(result);
});
