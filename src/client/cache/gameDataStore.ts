import type { GameDataCache, UserBootstrapResponse } from "../../types/gameData.interface";
import { idbGet, idbPut, STORES } from "./idb";
import { snapshotFromStats } from "../../types/playerSnapshot.interface";
import { writePlayerSnapshot } from "./playerSnapshotStore";

export async function readGameDataCache(
  userId: string
): Promise<GameDataCache | null> {
  try {
    return await idbGet<GameDataCache>(STORES.gameData, userId);
  } catch (err) {
    console.warn("[cache] Failed to read game data:", err);
    return null;
  }
}

export function writeGameDataCacheDeferred(cache: GameDataCache): void {
  void idbPut(STORES.gameData, cache).catch((err) => {
    console.warn("[cache] Failed to write game data:", err);
  });
}

export function bootstrapToGameDataCache(
  bootstrap: UserBootstrapResponse
): GameDataCache {
  return {
    userId: bootstrap.user.id,
    revision: bootstrap.revision,
    cachedAt: new Date().toISOString(),
    user: bootstrap.user,
    stats: bootstrap.stats,
    equipment: bootstrap.equipment,
    skillProgression: bootstrap.skillProgression,
    mailboxCount: bootstrap.mailboxCount,
  };
}

export function persistBootstrapCache(bootstrap: UserBootstrapResponse): void {
  const cache = bootstrapToGameDataCache(bootstrap);
  writeGameDataCacheDeferred(cache);
  void writePlayerSnapshot(
    snapshotFromStats(
      bootstrap.user,
      bootstrap.stats,
      bootstrap.revision
    )
  );
}

export function patchGameDataCache(
  userId: string,
  patch: Partial<Pick<GameDataCache, "equipment" | "skillProgression" | "stats" | "mailboxCount">>
): void {
  void readGameDataCache(userId).then((existing) => {
    if (!existing) return;
    writeGameDataCacheDeferred({ ...existing, ...patch, cachedAt: new Date().toISOString() });
  });
}
