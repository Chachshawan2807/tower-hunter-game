import type { PlayerStatsResponse, UserProfile } from "../api/types";

/** Client-side cache of authoritative server state (not a source of truth). */
export interface PlayerSnapshot {
  userId: string;
  revision: string;
  cachedAt: string;
  displayName: string;
  stats: PlayerStatsResponse;
}

export function buildRevisionFromTimestamp(updatedAt: Date | string): string {
  const ms =
    updatedAt instanceof Date
      ? updatedAt.getTime()
      : new Date(updatedAt).getTime();
  return String(ms);
}

export function snapshotFromStats(
  user: Pick<UserProfile, "id" | "display_name">,
  stats: PlayerStatsResponse,
  revision: string
): PlayerSnapshot {
  return {
    userId: user.id,
    revision,
    cachedAt: new Date().toISOString(),
    displayName: user.display_name,
    stats,
  };
}
