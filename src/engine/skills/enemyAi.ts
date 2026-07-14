import type { BattleEntity } from "../types";
import { getSkillById } from "./catalog";
import type { EnemyTemplate } from "./enemyTemplates";
import { isSkillOnCooldown } from "./availability";
import type { SkillDefinition } from "./types";

const LOW_HP_HEAL_THRESHOLD = 0.3;
const REGENERATE_SKILL_ID = "enemy_regenerate";

export function pickEnemySkill(
  actor: BattleEntity,
  template: EnemyTemplate,
  rng: () => number
): SkillDefinition {
  const hpRatio = actor.stats.hp / actor.stats.maxHp;
  if (
    hpRatio < LOW_HP_HEAL_THRESHOLD &&
    template.skillIds.includes(REGENERATE_SKILL_ID) &&
    !isSkillOnCooldown(actor, REGENERATE_SKILL_ID)
  ) {
    return getSkillById(REGENERATE_SKILL_ID);
  }

  const usable = template.skillIds
    .map(getSkillById)
    .filter((skill) => !isSkillOnCooldown(actor, skill.id));

  if (usable.length === 0) {
    return getSkillById("enemy_strike");
  }

  if (rng() > template.aiProfile.skillBias) {
    return getSkillById("enemy_strike");
  }

  for (const id of template.aiProfile.skillPriority) {
    const skill = usable.find((s) => s.id === id);
    if (skill) return skill;
  }

  return usable[0];
}
