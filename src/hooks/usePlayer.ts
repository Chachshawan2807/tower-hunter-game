import { useCallback, useEffect, useRef, useState } from "react";
import type { SkillPath } from "../engine/types";
import { getHotGameDataForUser } from "../client/cache/gameDataMemory";
import { onNetworkOnline } from "../client/offline/networkStatus";
import { flushOfflineQueue } from "../client/offline/flushOfflineQueue";
import type { PlayerStatsResponse } from "../utils/api";
import { api } from "../utils/api";
import {
  buildFallbackStats,
  persistPlayerSnapshot,
  readCachedPlayerState,
  runPlayerBootstrap,
} from "./playerBootstrap";
import { patchGameDataCache } from "../client/cache/gameDataStore";

type PlayerSetters = {
  setStats: (s: PlayerStatsResponse["stats"]) => void;
  setGold: (g: string) => void;
  setLevel: (l: number) => void;
  setExp: (e: number) => void;
  setCurrentFloor: (f: number) => void;
  setSkillPath: (p: SkillPath) => void;
  setRevision: (r: string) => void;
};

function applyStatsResponse(data: PlayerStatsResponse, setters: PlayerSetters) {
  setters.setStats(data.stats);
  setters.setGold(data.goldBalance);
  setters.setLevel(data.stats.level);
  setters.setExp(Number(data.stats.exp));
  setters.setCurrentFloor(data.stats.current_floor);
  setters.setSkillPath(data.stats.active_skill_path ?? "imperial");
  setters.setRevision(data.revision);
}

function applyCachedState(
  cached: NonNullable<Awaited<ReturnType<typeof readCachedPlayerState>>>,
  setters: PlayerSetters
) {
  setters.setStats(cached.stats);
  setters.setGold(cached.gold);
  setters.setLevel(cached.level);
  setters.setExp(cached.exp);
  setters.setCurrentFloor(cached.currentFloor);
  setters.setSkillPath(cached.skillPath);
  setters.setRevision(cached.revision);
}

function applyBootstrapToSetters(
  bootstrap: NonNullable<Awaited<ReturnType<typeof runPlayerBootstrap>>["bootstrap"]>,
  setters: PlayerSetters,
  setDisplayName: (name: string) => void
) {
  setDisplayName(bootstrap.user.display_name);
  applyStatsResponse(bootstrap.stats, setters);
}

export function usePlayer() {
  const [userId, setUserId] = useState<string | null>(null);
  const [displayName, setDisplayName] = useState("Player");
  const [gold, setGold] = useState("0");
  const [level, setLevel] = useState(1);
  const [exp, setExp] = useState(0);
  const [currentFloor, setCurrentFloor] = useState(1);
  const [skillPath, setSkillPath] = useState<SkillPath>("imperial");
  const [stats, setStats] = useState<PlayerStatsResponse["stats"] | null>(null);
  const [revision, setRevision] = useState("0");
  const [loading, setLoading] = useState(true);
  const [nameBusy, setNameBusy] = useState(false);
  const [fromCache, setFromCache] = useState(false);
  const userIdRef = useRef(userId);
  userIdRef.current = userId;

  const setters: PlayerSetters = {
    setStats,
    setGold,
    setLevel,
    setExp,
    setCurrentFloor,
    setSkillPath,
    setRevision,
  };

  const refreshStats = useCallback(
    async (id: string) => {
      try {
        const data = await api.getPlayerStats(id);
        applyStatsResponse(data, setters);
        setFromCache(false);
        patchGameDataCache(id, { stats: data });
        void persistPlayerSnapshot(id, displayName, data);
        return data;
      } catch (err) {
        console.error("Failed to load player stats:", err);
        const hot = getHotGameDataForUser(id);
        if (hot) {
          applyStatsResponse(hot.stats, setters);
          setFromCache(true);
          return hot.stats;
        }
        const cached = await readCachedPlayerState(id);
        if (cached) {
          applyCachedState(cached, setters);
          setFromCache(true);
          return null;
        }
        setStats((prev) => prev ?? buildFallbackStats(id, level, currentFloor, skillPath));
        return null;
      }
    },
    [currentFloor, displayName, level, skillPath]
  );

  useEffect(() => {
    let cancelled = false;

    async function bootstrap() {
      const storedId = localStorage.getItem("tower_hunter_user_id");
      const hot = getHotGameDataForUser(storedId);

      if (hot && !cancelled) {
        setUserId(hot.userId);
        applyBootstrapToSetters(
          {
            user: hot.user,
            stats: hot.stats,
            equipment: hot.equipment,
            skillProgression: hot.skillProgression,
            mailboxCount: hot.mailboxCount,
            revision: hot.revision,
          },
          setters,
          setDisplayName
        );
        setFromCache(true);
        setLoading(false);
      } else if (storedId && !cancelled) {
        const cached = await readCachedPlayerState(storedId);
        if (cached) {
          setUserId(storedId);
          setDisplayName(cached.displayName);
          applyCachedState(cached, setters);
          setFromCache(true);
          setLoading(false);
        }
      }

      try {
        const result = await runPlayerBootstrap();
        if (cancelled) return;

        setUserId(result.userId);
        if (result.bootstrap) {
          applyBootstrapToSetters(result.bootstrap, setters, setDisplayName);
        } else {
          setStats(buildFallbackStats(result.userId));
        }
        setFromCache(result.fromCache);
      } catch (err) {
        console.error("Player bootstrap failed:", err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void bootstrap();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    return onNetworkOnline(() => {
      const id = userIdRef.current;
      if (!id) return;
      void flushOfflineQueue().then(() => refreshStats(id));
    });
  }, [refreshStats]);

  const changeSkillPath = useCallback(async (path: SkillPath) => {
    setSkillPath(path);
  }, []);

  const changeDisplayName = useCallback(async (name: string) => {
    if (!userId) return;
    setNameBusy(true);
    try {
      const user = await api.updateDisplayName(userId, name);
      setDisplayName(user.display_name);
    } finally {
      setNameBusy(false);
    }
  }, [userId]);

  const applyGoldBalance = useCallback((balance: string) => setGold(balance), []);
  const applyPlayerStats = useCallback((next: PlayerStatsResponse["stats"]) => {
    setStats(next);
    setLevel(next.level);
    setExp(Number(next.exp));
    setCurrentFloor(next.current_floor);
  }, []);

  const refreshWallet = useCallback(async (id: string) => {
    try {
      const { goldBalance } = await api.getWallet(id);
      setGold(goldBalance);
    } catch (err) {
      console.error("Failed to load wallet:", err);
    }
  }, []);

  return {
    userId,
    displayName,
    gold,
    level,
    exp,
    currentFloor,
    skillPath,
    stats,
    revision,
    fromCache,
    loading,
    nameBusy,
    refreshStats,
    applyGoldBalance,
    applyPlayerStats,
    refreshWallet,
    changeSkillPath,
    changeDisplayName,
  };
}
