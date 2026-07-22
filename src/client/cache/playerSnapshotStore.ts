import type { PlayerSnapshot } from "../../types/playerSnapshot.interface";
import { idbDelete, idbGet, idbPut, STORES } from "./idb";

export async function readPlayerSnapshot(
  userId: string
): Promise<PlayerSnapshot | null> {
  try {
    return await idbGet<PlayerSnapshot>(STORES.playerSnapshot, userId);
  } catch (err) {
    console.warn("[cache] Failed to read player snapshot:", err);
    return null;
  }
}

export async function writePlayerSnapshot(
  snapshot: PlayerSnapshot
): Promise<void> {
  try {
    await idbPut(STORES.playerSnapshot, snapshot);
  } catch (err) {
    console.warn("[cache] Failed to write player snapshot:", err);
  }
}

export async function clearPlayerSnapshot(userId: string): Promise<void> {
  try {
    await idbDelete(STORES.playerSnapshot, userId);
  } catch (err) {
    console.warn("[cache] Failed to clear player snapshot:", err);
  }
}

export function applySnapshotToState(snapshot: PlayerSnapshot) {
  return {
    displayName: snapshot.displayName,
    gold: snapshot.stats.goldBalance,
    level: snapshot.stats.stats.level,
    exp: Number(snapshot.stats.stats.exp),
    currentFloor: snapshot.stats.stats.current_floor,
    skillPath: snapshot.stats.stats.active_skill_path ?? ("imperial" as const),
    stats: snapshot.stats.stats,
    revision: snapshot.revision,
  };
}
