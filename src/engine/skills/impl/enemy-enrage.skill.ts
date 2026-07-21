import { ATK_BUFF_MAGNITUDE, BUFF_DEBUFF_DEFAULT_TURNS } from "../../types";
import type { SkillDefinition } from "../types";

const ENEMY_DEFAULTS = {
  path: "enemy" as const,
  mpCost: 0,
  unlockLevel: 0,
  slotTier: 1 as const,
  autoPriority: 50,
};

export const ENEMY_ENRAGE: SkillDefinition = {
  ...ENEMY_DEFAULTS,
  id: "enemy_enrage",
  stringId: "skills.enemy.enrage",
  icon: "😤",
  kind: "buff",
  targetType: "self",
  cooldownTurns: 4,
  selfStatus: {
    type: "atk_buff",
    turns: BUFF_DEBUFF_DEFAULT_TURNS,
    magnitude: ATK_BUFF_MAGNITUDE,
  },
};
