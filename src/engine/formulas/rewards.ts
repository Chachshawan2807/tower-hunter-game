import type { ItemRarity, StatValue } from "../types";
import { BOSS_DROP_CHANCE, isBossFloor, NORMAL_DROP_CHANCE } from "../types";

/**
 * Drop chance: 20% on normal floors, 100% guaranteed on boss floors (ends in 0).
 */
export function getDropChance(floor: StatValue): StatValue {
  return isBossFloor(floor) ? BOSS_DROP_CHANCE : NORMAL_DROP_CHANCE;
}

export function rollItemDrop(
  floor: StatValue,
  rng: () => number = Math.random
): boolean {
  return rng() < getDropChance(floor);
}

/**
 * Boss floors only drop Rare or higher rarity items.
 */
export function isValidBossDropRarity(rarity: ItemRarity): boolean {
  return rarity !== "common";
}

export function filterBossDropRarity(rarity: ItemRarity, floor: StatValue): boolean {
  if (!isBossFloor(floor)) return true;
  return isValidBossDropRarity(rarity);
}

/**
 * Reward scaling increases with tower floor (linear baseline).
 */
export function calculateFloorExpReward(
  floor: StatValue,
  baseExp: StatValue = 10
): StatValue {
  return baseExp * floor;
}

export function calculateFloorGoldReward(
  floor: StatValue,
  baseGold: bigint = 5n
): bigint {
  return baseGold * BigInt(Math.max(1, Math.floor(floor)));
}
