import type { GameDataCache } from "../../types/gameData.interface";

let hotCache: GameDataCache | null = null;

export function getHotGameData(): GameDataCache | null {
  return hotCache;
}

export function setHotGameData(cache: GameDataCache | null): void {
  hotCache = cache;
}

export function getHotGameDataForUser(userId: string | null): GameDataCache | null {
  if (!userId || !hotCache || hotCache.userId !== userId) {
    return null;
  }
  return hotCache;
}
