import type { BattleEntity, StatValue } from "../types";
import type { SkillPath } from "../types";
import { getSkillById, getSkillsForPath } from "./catalog";
import type { SkillDefinition } from "./types";

export function isSkillUnlocked(
  skill: SkillDefinition,
  playerLevel: StatValue
): boolean {
  return playerLevel >= skill.unlockLevel;
}

export function getSkillCooldownRemaining(
  entity: BattleEntity,
  skillId: string
): number {
  return entity.skillCooldowns[skillId] ?? 0;
}

export function isSkillOnCooldown(
  entity: BattleEntity,
  skillId: string
): boolean {
  return getSkillCooldownRemaining(entity, skillId) > 0;
}

export function canAffordSkill(
  entity: BattleEntity,
  skill: SkillDefinition
): boolean {
  return entity.stats.mp >= skill.mpCost;
}

export function canUseSkill(
  entity: BattleEntity,
  skill: SkillDefinition,
  playerLevel: StatValue
): boolean {
  if (skill.id === "basic_attack") return true;
  if (entity.side === "enemy") {
    return !isSkillOnCooldown(entity, skill.id);
  }
  if (!isSkillUnlocked(skill, playerLevel)) return false;
  if (isSkillOnCooldown(entity, skill.id)) return false;
  return canAffordSkill(entity, skill);
}

export function getAvailableSkills(
  path: SkillPath,
  entity: BattleEntity,
  playerLevel: StatValue
): SkillDefinition[] {
  return getSkillsForPath(path).filter((skill) =>
    canUseSkill(entity, skill, playerLevel)
  );
}

export function getUnlockedSkills(
  path: SkillPath,
  playerLevel: StatValue
): SkillDefinition[] {
  return getSkillsForPath(path).filter((skill) =>
    isSkillUnlocked(skill, playerLevel)
  );
}

export function applySkillCooldown(
  cooldowns: Record<string, number>,
  skill: SkillDefinition
): Record<string, number> {
  if (skill.id === "basic_attack" || skill.cooldownTurns <= 0) {
    return cooldowns;
  }
  return { ...cooldowns, [skill.id]: skill.cooldownTurns };
}

export function tickSkillCooldowns(
  cooldowns: Record<string, number>
): Record<string, number> {
  const next: Record<string, number> = {};
  for (const [skillId, turns] of Object.entries(cooldowns)) {
    if (turns > 1) {
      next[skillId] = turns - 1;
    }
  }
  return next;
}

export function resolveSkillId(
  skillId: string | undefined,
  path: SkillPath
): string {
  if (!skillId) return "basic_attack";
  const skill = getSkillById(skillId);
  if (skill.path !== "basic" && skill.path !== path) return "basic_attack";
  return skill.id;
}
