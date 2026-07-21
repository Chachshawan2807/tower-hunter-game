import type { SkillLoadout } from "../engine/skills/loadout";
import type { SkillUpgradeRanks } from "../engine/skills/types";
import type { BattleStepResponse } from "../api/combat.api";

export interface BattleLoadoutContext {
  autoBattle: boolean;
  playerLoadout: SkillLoadout;
  playerSkillUpgrades: Record<string, SkillUpgradeRanks>;
  playerUnlockedSkillIds: string[];
}

export function extractLoadoutContext(
  state: BattleStepResponse["state"]
): BattleLoadoutContext | null {
  const full = state as BattleStepResponse["state"] & {
    playerLoadout?: SkillLoadout;
    playerSkillUpgrades?: Record<string, SkillUpgradeRanks>;
    playerUnlockedSkillIds?: string[];
  };
  if (!full.playerLoadout) return null;
  return {
    autoBattle: full.autoBattle,
    playerLoadout: full.playerLoadout,
    playerSkillUpgrades: full.playerSkillUpgrades ?? {},
    playerUnlockedSkillIds: full.playerUnlockedSkillIds ?? [],
  };
}
