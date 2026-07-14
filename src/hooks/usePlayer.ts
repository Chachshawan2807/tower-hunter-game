import { useCallback, useEffect, useState } from "react";
import { api } from "../utils/api";

const USER_KEY = "tower_hunter_user_id";

export function usePlayer() {
  const [userId, setUserId] = useState<string | null>(
    () => localStorage.getItem(USER_KEY)
  );
  const [displayName, setDisplayName] = useState("Hero");
  const [gold, setGold] = useState("0");
  const [level] = useState(1);
  const [exp] = useState(0);
  const [loading, setLoading] = useState(true);

  const refreshWallet = useCallback(async (id: string) => {
    const wallet = await api.getWallet(id);
    setGold(wallet.goldBalance);
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
          setGold(user.gold_balance);
        } else {
          await refreshWallet(id);
        }
      } catch (err) {
        console.error("Player bootstrap failed:", err);
      } finally {
        setLoading(false);
      }
    }

    bootstrap();
  }, [userId, refreshWallet]);

  return {
    userId,
    displayName,
    gold,
    level,
    exp,
    loading,
    refreshWallet,
  };
}
