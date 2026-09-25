import type { SkillDefinition } from "../../engine/skills/types";
import type { SkillType } from "../../engine/skills/skillTypes";
import type { SkillMenuCategory } from "./SkillCategorySection";

export const DEFAULT_EXPANDED: SkillMenuCategory[] = ["all"];

/** Skill catalog grid in SkillMenu — keep in sync with CSS `repeat(4, …)`. */
export const SKILL_CATALOG_GRID_COLUMNS = 4;

export function getSkillCatalogMinRows(skillCount: number): number {
  return Math.max(1, Math.ceil(skillCount / SKILL_CATALOG_GRID_COLUMNS));
}

export const TYPE_FILTERS: Array<SkillType | "all"> = [
  "all",
  "active",
  "passive",
  "cc",
  "movement",
];

export function sortCatalogSkills(skills: SkillDefinition[]): SkillDefinition[] {
  return [...skills].sort(
    (a, b) => (a.catalogTier ?? a.slotTier) - (b.catalogTier ?? b.slotTier)
  );
}

export function isDefaultExpanded(expanded: Set<SkillMenuCategory>): boolean {
  return expanded.size === 1 && expanded.has("all");
}
