import { getPlayerStats, type PlayerStatsRow } from "../db/playerStats";
import type { DbPool } from "../db";

export class BattleValidationError extends Error {
  constructor(
    message: string,
    public readonly code: string
  ) {
    super(message);
    this.name = "BattleValidationError";
  }
}

export async function validateBattleStart(
  pool: DbPool,
  userId: string,
  floor: number
): Promise<PlayerStatsRow> {
  if (!Number.isInteger(floor) || floor < 1 || floor > 100) {
    throw new BattleValidationError(
      "Floor must be an integer between 1 and 100",
      "INVALID_FLOOR"
    );
  }

  const stats = await getPlayerStats(pool, userId);
  if (!stats) {
    throw new BattleValidationError("Player stats not found", "STATS_NOT_FOUND");
  }

  if (toNumber(stats.hp) <= 0) {
    throw new BattleValidationError("Player HP is zero", "PLAYER_DEFEATED");
  }

  if (floor > stats.current_floor) {
    throw new BattleValidationError(
      `Floor ${floor} is locked. Current progress: floor ${stats.current_floor}`,
      "FLOOR_LOCKED"
    );
  }

  return stats;
}

function toNumber(value: string | number): number {
  return typeof value === "number" ? value : Number(value);
}

export function validateTargetEntity(
  entityIds: string[],
  targetId: string
): void {
  if (!entityIds.includes(targetId)) {
    throw new BattleValidationError(
      `Invalid target entity: ${targetId}`,
      "INVALID_TARGET"
    );
  }
}
