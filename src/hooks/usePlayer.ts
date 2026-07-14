import { useCallback, useEffect, useState } from "react";
import { api, type PlayerStatsResponse } from "../utils/api";

const USER_KEY = "tower_hunter_user_id";

export function usePlayer() {
  const [userId, setUserId] = useState<string | null>(
    () => localStorage.getItem(USER_KEY)
  );
  const [displayName, setDisplayName] = useState("Hero");
  const [gold, setGold] = useState("0");
  const [level, setLevel] = useState(1);
  const [exp, setExp] = useState(0);
  const [currentFloor, setCurrentFloor] = useState(1);
  const [stats, setStats] = useState<PlayerStatsResponse["stats"] | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshStats = useCallback(async (id: string) => {
    const data = await api.getPlayerStats(id);
    setStats(data.stats);
    setGold(data.goldBalance);
    setLevel(data.stats.level);
    setExp(Number(data.stats.exp));
    setCurrentFloor(data.stats.current_floor);
  }, []);

  useEffect(() => {
    async function bootstrap() {
      try {
        let id = userId;

        if (!id) {
          const externalId = `guest_${crypto.randomUUID().slice(0, 8)}`;
          const user = await api.createUser(externalId, "Hero");
          id = user.id;
          localStorage.setItem(USER_KEY, id);
          setUserId(id);
          setDisplayName(user.display_name);
        }

        if (id) {
          await refreshStats(id);
        }
      } catch (err) {
        console.error("Player bootstrap failed:", err);
      } finally {
        setLoading(false);
      }
    }

    bootstrap();
  }, [userId, refreshStats]);

  return {
    userId,
    displayName,
    gold,
    level,
    exp,
    currentFloor,
    stats,
    loading,
    refreshStats,
  };
}
