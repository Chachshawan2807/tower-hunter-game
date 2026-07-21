import type { SkillPath, StatusEffectType, StatValue } from "../types";
import type { SkillType } from "./skillTypes";

export type SkillKind = "attack" | "buff" | "heal";
export type SkillTargetType = "enemy" | "self";
export type SkillSlotTier = 1 | 2 | 3 | 4;
export type SkillOwner = SkillPath | "basic" | "enemy" | "player";

export type UpgradeRank = 0 | 1 | 2 | 3 | 4;

export interface SkillUpgradeRanks {
  damage: UpgradeRank;
  cooldown: UpgradeRank;
  mpCost: UpgradeRank;
  statusPotency: UpgradeRank;
  healPower: UpgradeRank;
  passivePotency: UpgradeRank;
}

export interface PassiveEffect {
  stat:
    | "atk"
    | "maxHp"
    | "maxMp"
    | "def"
    | "speed"
    | "critChance"
    | "critDamage"
    | "evasion"
    | "statusResist"
    | "accuracy";
  magnitude: number;
}

export interface SkillSelfStatus {
  type: StatusEffectType;
  turns: number;
  magnitude?: StatValue;
}

export interface SkillDefinition {
  id: string;
  path: SkillOwner;
  skillType?: SkillType;
  catalogTier?: number;
  unlockSpCost?: number;
  stringId: string;
  icon: string;
  mpCost: StatValue;
  kind: SkillKind;
  targetType: SkillTargetType;
  unlockLevel: StatValue;
  slotTier: SkillSlotTier;
  autoPriority: number;
  cooldownTurns: StatValue;
  damageMultiplier?: StatValue;
  accuracyBonus?: StatValue;
  defPierce?: StatValue;
  guaranteedStatus?: StatusEffectType;
  statusProcBonus?: StatValue;
  selfStatus?: SkillSelfStatus;
  healPercent?: StatValue;
  passiveEffects?: PassiveEffect[];
  gaugeBoost?: StatValue;
}

/** Slot unlock thresholds (legacy backfill). */
export const SKILL_UNLOCK_LEVELS = [1, 5, 10, 15] as const;

export const EMPTY_SKILL_UPGRADES: SkillUpgradeRanks = {
  damage: 0,
  cooldown: 0,
  mpCost: 0,
  statusPotency: 0,
  healPower: 0,
  passivePotency: 0,
};
