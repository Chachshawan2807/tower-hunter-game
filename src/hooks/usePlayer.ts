import { useCallback, useEffect, useState } from "react";
import { combatStatsForLevel } from "../engine/formulas/playerProgression";
import type { SkillPath } from "../engine/types";
import { api, type PlayerStatsResponse } from "../utils/api";

const USER_KEY = "tower_hunter_user_id";

function buildFallbackStats(
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

export function usePlayer() {
  const [userId, setUserId] = useState<string | null>(
    () => localStorage.getItem(USER_KEY)
  );
  const [displayName, setDisplayName] = useState("Player");
  const [gold, setGold] = useState("0");
  const [level, setLevel] = useState(1);
  const [exp, setExp] = useState(0);
  const [currentFloor, setCurrentFloor] = useState(1);
  const [skillPath, setSkillPath] = useState<SkillPath>("imperial");
  const [stats, setStats] = useState<PlayerStatsResponse["stats"] | null>(null);
  const [loading, setLoading] = useState(true);
  const [nameBusy, setNameBusy] = useState(false);

  const refreshStats = useCallback(async (id: string) => {
    try {
      const [data, pathData] = await Promise.all([
        api.getPlayerStats(id),
        api.getSkillPath(id).catch(() => ({ path: "imperial" as const, equippedSkills: [] })),
      ]);
      setStats(data.stats);
      setGold(data.goldBalance);
      setLevel(data.stats.level);
      setExp(Number(data.stats.exp));
      setCurrentFloor(data.stats.current_floor);
      setSkillPath(pathData.path ?? data.stats.active_skill_path ?? "imperial");
    } catch (err) {
      console.error("Failed to load player stats:", err);
      setStats((prev) =>
        prev ?? buildFallbackStats(id, level, currentFloor, skillPath)
      );
    }
  }, [level, currentFloor, skillPath]);

  const changeSkillPath = useCallback(
    async (path: SkillPath) => {
      if (!userId) return;
      try {
        const result = await api.setSkillPath(userId, path);
        setSkillPath(result.path);
      } catch (err) {
        console.error("Failed to set skill path:", err);
        setSkillPath(path);
      }
    },
    [userId]
  );

  const changeDisplayName = useCallback(
    async (name: string) => {
      if (!userId) return;
      setNameBusy(true);
      try {
        const user = await api.updateDisplayName(userId, name);
        setDisplayName(user.display_name);
      } finally {
        setNameBusy(false);
      }
    },
    [userId]
  );

  useEffect(() => {
    let cancelled = false;

    async function bootstrap() {
      let id = userId;

      try {
        if (!id) {
          const externalId = `guest_${crypto.randomUUID().slice(0, 8)}`;
          const user = await api.createUser(externalId, "Player");
          id = user.id;
          localStorage.setItem(USER_KEY, id);
          if (!cancelled) {
            setUserId(id);
            setDisplayName(user.display_name);
          }
        }

        if (id) {
          const user = await api.getUser(id);
          if (!cancelled) {
            setDisplayName(user.display_name);
          }
          await refreshStats(id);
        }
      } catch (err) {
        console.error("Player bootstrap failed:", err);
      } finally {
        if (!cancelled && id) {
          const fallbackId = id;
          setStats((prev) => prev ?? buildFallbackStats(fallbackId));
        }
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    bootstrap();

    return () => {
      cancelled = true;
    };
  }, [userId, refreshStats]);

  return {
    userId,
    displayName,
    gold,
    level,
    exp,
    currentFloor,
    skillPath,
    stats,
    loading,
    nameBusy,
    refreshStats,
    changeSkillPath,
    changeDisplayName,
  };
}
