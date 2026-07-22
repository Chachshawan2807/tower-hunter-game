import type { PlayerStatsRow } from "./playerStats";

export function buildPlayerRevision(row: PlayerStatsRow): string {
  const updatedAt =
    row.updated_at instanceof Date
      ? row.updated_at.getTime()
      : new Date(row.updated_at).getTime();
  return `${updatedAt}`;
}

export function serializeStatsRevision(updatedAt: Date | string): string {
  const ms =
    updatedAt instanceof Date
      ? updatedAt.getTime()
      : new Date(updatedAt).getTime();
  return String(ms);
}
