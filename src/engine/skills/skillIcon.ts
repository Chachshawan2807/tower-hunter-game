import type { SkillDefinition } from "./types";

/** Default UI fallback when a skill SVG is missing. */
export const SKILL_ICON_FALLBACK_ID = "basic_attack";

/** Set true when `public/icons/skills/{iconId}.png` assets are ready. */
export const SKILL_ICON_ASSETS_ENABLED = true;

export function getSkillIconId(
  skill: Pick<SkillDefinition, "iconId">
): string {
  return skill.iconId;
}

/** Public URL for skill icon PNG (CSS mask). */
export function skillIconUrl(iconId: string): string {
  return `/icons/skills/${iconId}.png`;
}

export function skillDescriptionKey(stringId: string): string {
  return `${stringId}.desc`;
}
