import type { CombatStats } from "../types";
import type { PassiveEffect, SkillDefinition, SkillUpgradeRanks } from "./types";
import { resolveEffectiveSkill } from "./effectiveSkill";

const PERCENT_STATS = new Set<PassiveEffect["stat"]>([
  "atk",
  "maxHp",
  "maxMp",
  "def",
  "critChance",
  "critDamage",
  "statusResist",
]);

function applyPassiveEffect(
  stats: CombatStats,
  effect: PassiveEffect,
  potencyMult: number
): CombatStats {
  const magnitude = effect.magnitude * potencyMult;
  const next = { ...stats };

  if (PERCENT_STATS.has(effect.stat)) {
    switch (effect.stat) {
      case "atk":
        next.atk = Math.floor(next.atk * (1 + magnitude));
        break;
      case "maxHp":
        next.maxHp = Math.floor(next.maxHp * (1 + magnitude));
        next.hp = Math.min(next.hp, next.maxHp);
        break;
      case "maxMp":
        next.maxMp = Math.floor(next.maxMp * (1 + magnitude));
        next.mp = Math.min(next.mp, next.maxMp);
        break;
      case "def":
        next.def = Math.floor(next.def * (1 + magnitude));
        break;
      case "critChance":
        next.critChance += magnitude;
        break;
      case "critDamage":
        next.critDamage += magnitude;
        break;
      case "statusResist":
        next.statusResist += magnitude;
        break;
      default:
        break;
    }
    return next;
  }

  switch (effect.stat) {
    case "speed":
      next.speed += Math.floor(magnitude);
      break;
    case "evasion":
      next.evasion += Math.floor(magnitude);
      break;
    case "accuracy":
      next.accuracy += Math.floor(magnitude);
      break;
    default:
      break;
  }

  return next;
}

export function applyEquippedPassives(
  baseStats: CombatStats,
  passiveSkills: SkillDefinition[],
  upgrades: Record<string, SkillUpgradeRanks>
): CombatStats {
  let stats = { ...baseStats };

  for (const skill of passiveSkills) {
    const effective = resolveEffectiveSkill(skill, upgrades[skill.id] ?? {
      damage: 0,
      cooldown: 0,
      mpCost: 0,
      statusPotency: 0,
      healPower: 0,
      passivePotency: 0,
    });
    const potencyMult = 1 + (upgrades[skill.id]?.passivePotency ?? 0) * 0.25;
    for (const effect of effective.passiveEffects ?? []) {
      stats = applyPassiveEffect(stats, effect, potencyMult);
    }
  }

  return stats;
}
