import {
  calculateFloorExpReward,
  calculateFloorGoldReward,
  filterBossDropRarity,
  rollItemDrop,
} from "../../engine/formulas";
import type { ItemDefinition, ItemRarity, RewardPayload } from "../../engine/types";
import {
  addItemToInventory,
  applyBattleWinProgress,
  processWalletTransaction,
  type DbPool,
} from "../db";

const RARITY_WEIGHTS: Array<{ rarity: ItemRarity; weight: number }> = [
  { rarity: "common", weight: 60 },
  { rarity: "rare", weight: 25 },
  { rarity: "epic", weight: 12 },
  { rarity: "legendary", weight: 3 },
];

function rollRarity(rng: () => number): ItemRarity {
  const total = RARITY_WEIGHTS.reduce((sum, entry) => sum + entry.weight, 0);
  let roll = rng() * total;

  for (const entry of RARITY_WEIGHTS) {
    roll -= entry.weight;
    if (roll <= 0) return entry.rarity;
  }

  return "common";
}

function rollDropItem(
  floor: number,
  rng: () => number
): ItemDefinition | null {
  if (!rollItemDrop(floor, rng)) return null;

  let rarity = rollRarity(rng);
  if (!filterBossDropRarity(rarity, floor)) {
    rarity = "rare";
  }

  return {
    id: `drop_f${floor}_${rarity}`,
    rarity,
    stringId: `item.drop.floor_${floor}.${rarity}`,
  };
}

export function buildBattleRewards(
  floor: number,
  rng: () => number = Math.random
): RewardPayload {
  const exp = calculateFloorExpReward(floor);
  const gold = calculateFloorGoldReward(floor);
  const drop = rollDropItem(floor, rng);

  return {
    exp,
    gold,
    items: drop ? [drop] : [],
  };
}

export async function grantBattleRewards(
  pool: DbPool,
  userId: string,
  sessionId: string,
  floor: number,
  rng: () => number = Math.random
): Promise<RewardPayload> {
  const rewards = buildBattleRewards(floor, rng);

  await processWalletTransaction(pool, {
    idempotencyKey: `battle_reward:${sessionId}`,
    userId,
    amount: rewards.gold,
    type: "reward",
    metadata: { floor, sessionId },
  });

  for (const item of rewards.items) {
    await addItemToInventory(
      pool,
      userId,
      {
        itemId: item.id,
        quantity: 1,
        rarity: item.rarity,
        sourceFloor: floor,
      },
      { idempotencyKey: `battle_drop:${sessionId}:${item.id}` }
    );
  }

  await applyBattleWinProgress(pool, userId, floor, rewards.exp);

  return rewards;
}
