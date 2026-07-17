import type { BattleEntity } from "../types";
import type { SkillPath } from "../types";
import { getSkillById } from "./catalog";
import {
  canUseSkill,
  getAvailableSkills,
  resolveSkillId,
} from "./availability";
import { resolveEffectiveSkill } from "./effectiveSkill";
import type { SkillDefinition, SkillUpgradeRanks } from "./types";

export {
  isSkillUnlocked,
  getSkillCooldownRemaining,
  isSkillOnCooldown,
  canAffordSkill,
  canUseSkill,
  getAvailableSkills,
  getUnlockedSkills,
  applySkillCooldown,
  tickSkillCooldowns,
  resolveSkillId,
} from "./availability";

const EMPTY_UPGRADES: SkillUpgradeRanks = {
  damage: 0,
  cooldown: 0,
  mpCost: 0,
};

export function pickAutoSkill(
  actor: BattleEntity,
  _path: SkillPath,
  skillPool: string[],
  upgrades: Record<string, SkillUpgradeRanks>,
  unlockedSkillIds: readonly string[],
  rng: () => number = Math.random
): SkillDefinition {
  const usable = skillPool
    .map((id) => getSkillById(id))
    .filter((skill) => {
      const effective = resolveEffectiveSkill(
        skill,
        upgrades[skill.id] ?? EMPTY_UPGRADES
      );
      return canUseSkill(actor, effective, unlockedSkillIds);
    });

  if (usable.length === 0) {
    return getSkillById("basic_attack");
  }

  const lowHpRatio = actor.stats.hp / actor.stats.maxHp;

  if (lowHpRatio < 0.35) {
    const heal = usable.find((s) => s.kind === "heal");
    if (heal) return heal;
  }

  const buff = usable.find((s) => s.kind === "buff");
  if (buff && rng() < 0.25) {
    return buff;
  }

  const attacks = usable.filter((s) => s.kind === "attack");
  if (attacks.length === 0) {
    return usable[0];
  }

  return attacks.reduce((best, current) =>
    current.autoPriority > best.autoPriority ? current : best
  );
}
