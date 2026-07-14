import type { SkillDefinition, SkillUpgradeRanks } from "./types";

export function resolveEffectiveSkill(
  skill: SkillDefinition,
  upgrades: SkillUpgradeRanks
): SkillDefinition {
  const damageMultiplier =
    skill.kind === "attack" && skill.damageMultiplier !== undefined
      ? skill.damageMultiplier * (1 + upgrades.damage * 0.05)
      : skill.damageMultiplier;

  return {
    ...skill,
    damageMultiplier,
    cooldownTurns: Math.max(0, skill.cooldownTurns - upgrades.cooldown),
    mpCost: Math.max(1, Math.floor(skill.mpCost * (1 - upgrades.mpCost * 0.1))),
  };
}
