import { ATK_BUFF_MAGNITUDE, BUFF_DEBUFF_DEFAULT_TURNS } from "../../types";
import { SKILL_UNLOCK_LEVELS } from "../types";
import type { SkillDefinition } from "../types";

export const IMPERIAL_INNER_QI: SkillDefinition = {
  id: "murim_qi",
  path: "imperial",
  stringId: "skills.murim.qi",
  icon: "🔥",
  mpCost: 20,
  kind: "buff",
  targetType: "self",
  unlockLevel: SKILL_UNLOCK_LEVELS[2],
  slotTier: 3,
  autoPriority: 35,
  cooldownTurns: 3,
  selfStatus: {
    type: "atk_buff",
    turns: BUFF_DEBUFF_DEFAULT_TURNS,
    magnitude: ATK_BUFF_MAGNITUDE,
  },
};
