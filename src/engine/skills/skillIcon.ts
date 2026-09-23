import type { SkillDefinition } from "./types";

/** Default UI fallback when a skill SVG is missing. */
export const SKILL_ICON_FALLBACK_ID = "basic_attack";

export function getSkillIconId(
  skill: Pick<SkillDefinition, "iconId">
): string {
  return skill.iconId;
}

/** Public URL for a skill icon asset (mask / img). */
export function skillIconUrl(iconId: string): string {
  return `/icons/skills/${iconId}.svg`;
}

export function skillDescriptionKey(stringId: string): string {
  return `${stringId}.desc`;
}
