import type { BattleEntity } from "../types";
import { getSkillById } from "./catalog";
import { canUseSkill } from "./availability";
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

export { pickSkillForTurn, pickAutoSkill } from "./skillPicker";

const EMPTY_UPGRADES: SkillUpgradeRanks = {
  damage: 0,
  cooldown: 0,
  mpCost: 0,
  statusPotency: 0,
  healPower: 0,
  passivePotency: 0,
};

export function pickAutoSkillLegacy(
  actor: BattleEntity,
  skillPool: string[],
  upgrades: Record<string, SkillUpgradeRanks>,
  unlockedSkillIds: readonly string[]
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

  const attacks = usable.filter((s) => s.kind === "attack");
  if (attacks.length === 0) return usable[0];

  return attacks.reduce((best, current) =>
    current.autoPriority > best.autoPriority ? current : best
  );
}
