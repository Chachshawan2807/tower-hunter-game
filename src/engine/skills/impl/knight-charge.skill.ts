import { CC_DEFAULT_TURNS } from "../../types";
import { SKILL_UNLOCK_LEVELS } from "../types";
import type { SkillDefinition } from "../types";

export const KNIGHT_CHARGE: SkillDefinition = {
  id: "knight_charge",
  path: "knight",
  stringId: "skills.knight.charge",
  icon: "🏇",
  mpCost: 28,
  kind: "attack",
  targetType: "enemy",
  unlockLevel: SKILL_UNLOCK_LEVELS[3],
  slotTier: 4,
  autoPriority: 90,
  cooldownTurns: 4,
  damageMultiplier: 1.75,
  guaranteedStatus: "stun",
  statusProcBonus: 0.2,
};

export const KNIGHT_STUN_TURNS = CC_DEFAULT_TURNS;
