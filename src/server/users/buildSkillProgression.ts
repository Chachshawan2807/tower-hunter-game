import {
  defaultSkillLoadout,
  getPlayerCatalogSkills,
  isSkillUnlocked,
  resolveEffectiveSkill,
} from "../../engine/skills";
import { EMPTY_SKILL_UPGRADES } from "../../engine/skills/types";
import type { SkillLoadout } from "../../engine/skills/loadout";
import type { PlayerStatsRow } from "../db/playerStats";
import type { DbPool } from "../db/client";
import { getPlayerLoadoutV2 } from "../db/skillLoadoutV2";
import { getPlayerUpgrades } from "../db/skillUpgrades";
import { getPlayerSkillUnlocks } from "../db/skillUnlocks";

function mapSkill(skill: ReturnType<typeof resolveEffectiveSkill>) {
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

export interface SkillProgressionPayload {
  skillPoints: number;
  upgrades: Awaited<ReturnType<typeof getPlayerUpgrades>>;
  loadout: SkillLoadout;
  unlockedSkillIds: string[];
  skills: ReturnType<typeof mapSkill>[];
}

export async function buildSkillProgressionPayload(
  pool: DbPool,
  userId: string,
  stats: PlayerStatsRow | null,
  preloaded?: {
    upgrades: Awaited<ReturnType<typeof getPlayerUpgrades>>;
    dbLoadout: Awaited<ReturnType<typeof getPlayerLoadoutV2>>;
    unlockedSkillIds: string[];
  }
): Promise<SkillProgressionPayload> {
  const [upgrades, dbLoadout, unlockedSkillIds] = preloaded
    ? [preloaded.upgrades, preloaded.dbLoadout, preloaded.unlockedSkillIds]
    : await Promise.all([
        getPlayerUpgrades(pool, userId),
        getPlayerLoadoutV2(pool, userId),
        getPlayerSkillUnlocks(pool, userId),
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

  return { skillPoints, upgrades, loadout, unlockedSkillIds, skills };
}
