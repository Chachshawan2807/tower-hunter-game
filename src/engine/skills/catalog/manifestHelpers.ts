import type { SkillDefinition } from "../types";
import type { SkillType } from "../skillTypes";

const UNLOCK_BY_TIER = [1, 5, 10, 15, 20, 25, 30] as const;
const SP_BY_TIER = [1, 2, 4, 6, 8, 10, 12] as const;

export function tierDefaults(tier: number) {
  const idx = Math.min(Math.max(tier - 1, 0), 6);
  return {
    catalogTier: tier,
    unlockLevel: UNLOCK_BY_TIER[idx],
    unlockSpCost: SP_BY_TIER[idx],
    slotTier: Math.min(tier, 4) as 1 | 2 | 3 | 4,
  };
}

export function playerSkill(
  partial: Omit<SkillDefinition, "path"> & { skillType: SkillType }
): SkillDefinition {
  const { skillType, ...rest } = partial;
  return { ...rest, path: "player", skillType };
}
