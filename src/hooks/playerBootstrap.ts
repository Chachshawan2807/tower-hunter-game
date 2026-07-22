import { combatStatsForLevel } from "../engine/formulas/playerProgression";
import type { SkillPath } from "../engine/types";
import {
  applySnapshotToState,
  readPlayerSnapshot,
  writePlayerSnapshot,
} from "../client/cache/playerSnapshotStore";
import {
  bootstrapToGameDataCache,
  persistBootstrapCache,
  readGameDataCache,
} from "../client/cache/gameDataStore";
import { setHotGameData } from "../client/cache/gameDataMemory";
import { flushOfflineQueue } from "../client/offline/flushOfflineQueue";
import { snapshotFromStats } from "../types/playerSnapshot.interface";
import type { UserBootstrapResponse } from "../types/gameData.interface";
import { api, type PlayerStatsResponse } from "../utils/api";

export const USER_STORAGE_KEY = "tower_hunter_user_id";

export function buildFallbackStats(
  userId: string,
  level = 1,
  floor = 1,
  path: SkillPath = "imperial"
): PlayerStatsResponse["stats"] {
  const base = combatStatsForLevel(level);
  return {
    user_id: userId,
    level: base.level,
    exp: "0",
    hp: String(base.maxHp),
    max_hp: String(base.maxHp),
    mp: String(base.maxMp),
    max_mp: String(base.maxMp),
    atk: String(base.atk),
    def: String(base.def),
    speed: String(base.speed),
    current_floor: floor,
    active_skill_path: path,
  };
}

export async function persistPlayerSnapshot(
  userId: string,
  displayName: string,
  data: PlayerStatsResponse
): Promise<void> {
  await writePlayerSnapshot(
    snapshotFromStats({ id: userId, display_name: displayName }, data, data.revision)
  );
}

export async function readCachedPlayerState(userId: string) {
  const cached = await readPlayerSnapshot(userId);
  if (!cached) return null;
  return applySnapshotToState(cached);
}

async function ensureUserAccount(
  cachedUserId: string | null,
  cachedDisplayName?: string
): Promise<{ userId: string; displayName: string }> {
  const storedId = localStorage.getItem(USER_STORAGE_KEY);

  if (storedId && cachedUserId === storedId && cachedDisplayName) {
    return { userId: storedId, displayName: cachedDisplayName };
  }

  if (storedId) {
    try {
      const user = await api.getUser(storedId);
      return { userId: user.id, displayName: user.display_name };
    } catch {
      localStorage.removeItem(USER_STORAGE_KEY);
    }
  }

  const externalId = `guest_${crypto.randomUUID().slice(0, 8)}`;
  const user = await api.createUser(externalId, "Player");
  localStorage.setItem(USER_STORAGE_KEY, user.id);
  return { userId: user.id, displayName: user.display_name };
}

export interface PlayerBootstrapResult {
  userId: string;
  displayName: string;
  bootstrap: UserBootstrapResponse | null;
  fromCache: boolean;
}

function resultFromBootstrap(
  bootstrap: UserBootstrapResponse,
  fromCache: boolean
): PlayerBootstrapResult {
  const cache = bootstrapToGameDataCache(bootstrap);
  setHotGameData(cache);
  persistBootstrapCache(bootstrap);
  return {
    userId: bootstrap.user.id,
    displayName: bootstrap.user.display_name,
    bootstrap,
    fromCache,
  };
}

export async function runPlayerBootstrap(): Promise<PlayerBootstrapResult> {
  const storedId = localStorage.getItem(USER_STORAGE_KEY);
  const cached = storedId ? await readGameDataCache(storedId) : null;

  if (cached) {
    setHotGameData(cached);
  }

  const account = await ensureUserAccount(
    cached?.userId ?? null,
    cached?.user.display_name
  );

  try {
    const bootstrap = await api.getBootstrap(account.userId);
    const result = resultFromBootstrap(bootstrap, false);
    queueMicrotask(() => {
      void flushOfflineQueue();
    });
    return result;
  } catch (err) {
    console.error("Bootstrap sync failed:", err);
    if (cached && cached.userId === account.userId) {
      return {
        userId: account.userId,
        displayName: cached.user.display_name,
        bootstrap: {
          user: cached.user,
          stats: cached.stats,
          equipment: cached.equipment,
          skillProgression: cached.skillProgression,
          mailboxCount: cached.mailboxCount,
          revision: cached.revision,
        },
        fromCache: true,
      };
    }
    return {
      userId: account.userId,
      displayName: account.displayName,
      bootstrap: null,
      fromCache: false,
    };
  }
}
