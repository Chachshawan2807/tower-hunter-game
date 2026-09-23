import type { GameDataCache, UserBootstrapResponse } from "../../types/gameData.interface";
import { getHotGameDataForUser, setHotGameData } from "./gameDataMemory";
import { idbGet, idbPut, STORES } from "./idb";
import { snapshotFromStats } from "../../types/playerSnapshot.interface";
import { writePlayerSnapshot } from "./playerSnapshotStore";
import { panelCacheKey, putReadCache } from "./readCache";

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

let persistTimer: ReturnType<typeof setTimeout> | null = null;
let pendingPersist: GameDataCache | null = null;

function schedulePersist(cache: GameDataCache): void {
  pendingPersist = cache;
  if (persistTimer) return;
  persistTimer = setTimeout(() => {
    persistTimer = null;
    const value = pendingPersist;
    pendingPersist = null;
    if (value) writeGameDataCacheDeferred(value);
  }, 32);
}

export function patchGameDataCache(
  userId: string,
  patch: Partial<Pick<GameDataCache, "equipment" | "skillProgression" | "stats" | "mailboxCount">>
): void {
  const hot = getHotGameDataForUser(userId);
  if (hot) {
    const next: GameDataCache = {
      ...hot,
      ...patch,
      cachedAt: new Date().toISOString(),
    };
    setHotGameData(next);
    if (patch.mailboxCount !== undefined) {
      putReadCache(panelCacheKey.mailboxCount(userId), patch.mailboxCount);
    }
    schedulePersist(next);
    return;
  }

  void readGameDataCache(userId).then((existing) => {
    if (!existing) return;
    const next: GameDataCache = {
      ...existing,
      ...patch,
      cachedAt: new Date().toISOString(),
    };
    setHotGameData(next);
    schedulePersist(next);
  });
}
