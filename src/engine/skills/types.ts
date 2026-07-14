import type { SkillPath, StatusEffectType, StatValue } from "../types";

export type SkillKind = "attack" | "buff" | "heal";
export type SkillTargetType = "enemy" | "self";
export type SkillSlotTier = 1 | 2 | 3 | 4;

export interface SkillUpgradeRanks {
  damage: 0 | 1 | 2 | 3;
  cooldown: 0 | 1 | 2 | 3;
  mpCost: 0 | 1 | 2 | 3;
}

export interface SkillSelfStatus {
  type: StatusEffectType;
  turns: number;
  magnitude?: StatValue;
}

export interface SkillDefinition {
  id: string;
  path: SkillPath | "basic" | "enemy";
  stringId: string;
  icon: string;
  mpCost: StatValue;
  kind: SkillKind;
  targetType: SkillTargetType;
  /** Minimum player level required to use this skill. */
  unlockLevel: StatValue;
  /** Which unlock tier (1–4) this skill occupies. */
  slotTier: SkillSlotTier;
  /** Higher values are preferred by auto-battle AI when choosing skills. */
  autoPriority: number;
  /** Turns before the skill can be used again after casting. */
  cooldownTurns: StatValue;
  damageMultiplier?: StatValue;
  accuracyBonus?: StatValue;
  defPierce?: StatValue;
  guaranteedStatus?: StatusEffectType;
  statusProcBonus?: StatValue;
  selfStatus?: SkillSelfStatus;
  healPercent?: StatValue;
}

/** Slot 1 / 2 / 3 / 4 unlock thresholds shared across all paths. */
export const SKILL_UNLOCK_LEVELS = [1, 5, 10, 15] as const;
