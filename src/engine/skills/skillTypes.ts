export type SkillType = "active" | "passive" | "cc" | "movement";

export function isBattleSkillType(skillType: SkillType): boolean {
  return skillType === "active" || skillType === "cc" || skillType === "movement";
}

export function isPassiveSkillType(skillType: SkillType): boolean {
  return skillType === "passive";
}
