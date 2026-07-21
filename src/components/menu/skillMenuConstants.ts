import type { SkillDefinition } from "../../engine/skills/types";
import type { SkillType } from "../../engine/skills/skillTypes";
import type { SkillMenuCategory } from "./SkillCategorySection";

export const DEFAULT_EXPANDED: SkillMenuCategory[] = ["all"];

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
