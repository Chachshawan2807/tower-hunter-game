import { BUFF_DEBUFF_DEFAULT_TURNS, DEF_BUFF_MAGNITUDE } from "../../types";
import { SKILL_UNLOCK_LEVELS } from "../types";
import type { SkillDefinition } from "../types";

export const KNIGHT_GUARD: SkillDefinition = {
  id: "knight_guard",
  path: "knight",
  stringId: "skills.knight.guard",
  icon: "🛡",
  mpCost: 15,
  kind: "buff",
  targetType: "self",
  unlockLevel: SKILL_UNLOCK_LEVELS[1],
  slotTier: 2,
  autoPriority: 30,
  cooldownTurns: 2,
  selfStatus: {
    type: "def_buff",
    turns: BUFF_DEBUFF_DEFAULT_TURNS,
    magnitude: DEF_BUFF_MAGNITUDE,
  },
};
