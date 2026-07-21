import type { SkillDefinition, SkillUpgradeRanks } from "./types";
import { isPassiveSkillType } from "./skillTypes";

export function resolveEffectiveSkill(
  skill: SkillDefinition,
  upgrades: SkillUpgradeRanks
): SkillDefinition {
  const damageMultiplier =
    skill.kind === "attack" && skill.damageMultiplier !== undefined
      ? skill.damageMultiplier * (1 + upgrades.damage * 0.05)
      : skill.damageMultiplier;

  const healPercent =
    skill.kind === "heal" && skill.healPercent !== undefined
      ? skill.healPercent * (1 + upgrades.healPower * 0.08)
      : skill.healPercent;

  const statusProcBonus =
    skill.statusProcBonus !== undefined
      ? skill.statusProcBonus * (1 + upgrades.statusPotency * 0.1)
      : skill.statusProcBonus;

  return {
    ...skill,
    damageMultiplier,
    healPercent,
    statusProcBonus,
    cooldownTurns: Math.max(0, skill.cooldownTurns - upgrades.cooldown),
    mpCost: Math.max(1, Math.floor(skill.mpCost * (1 - upgrades.mpCost * 0.08))),
    passiveEffects:
      skill.skillType && isPassiveSkillType(skill.skillType)
        ? skill.passiveEffects?.map((e) => ({
            ...e,
            magnitude: e.magnitude * (1 + upgrades.passivePotency * 0.25),
          }))
        : skill.passiveEffects,
  };
}
