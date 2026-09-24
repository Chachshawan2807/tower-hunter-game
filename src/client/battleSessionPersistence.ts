const STORAGE_KEY = "tower_hunter_active_battle_v1";

export interface ActiveBattlePointer {
  userId: string;
  sessionId: string;
  floor: number;
}

export function saveActiveBattlePointer(pointer: ActiveBattlePointer): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(pointer));
  } catch {
    /* quota / private mode */
  }
}

export function loadActiveBattlePointer(
  userId: string
): Omit<ActiveBattlePointer, "userId"> | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as ActiveBattlePointer;
    if (parsed.userId !== userId || !parsed.sessionId) return null;
    return { sessionId: parsed.sessionId, floor: parsed.floor };
  } catch {
    return null;
  }
}

export function clearActiveBattlePointer(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* ignore */
  }
}
