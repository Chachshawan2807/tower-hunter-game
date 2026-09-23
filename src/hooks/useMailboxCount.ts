import { useCallback, useEffect, useState } from "react";
import { getHotGameDataForUser } from "../client/cache/gameDataMemory";
import {
  loadReadCache,
  panelCacheKey,
  peekReadCache,
} from "../client/cache/readCache";
import { api } from "../utils/api";

const COUNT_FRESH_MS = 8_000;

export function useMailboxCount(userId: string | null) {
  const hot = getHotGameDataForUser(userId);
  const cachedCount = userId
    ? peekReadCache<number>(panelCacheKey.mailboxCount(userId))
    : null;
  const [count, setCount] = useState(cachedCount ?? hot?.mailboxCount ?? 0);

  const refresh = useCallback(async () => {
    if (!userId) {
      setCount(0);
      return;
    }
    try {
      const next = await loadReadCache(
        panelCacheKey.mailboxCount(userId),
        () => api.getMailboxCount(userId).then((result) => result.count),
        COUNT_FRESH_MS
      );
      setCount(next);
    } catch {
      const cached = getHotGameDataForUser(userId);
      setCount(
        peekReadCache<number>(panelCacheKey.mailboxCount(userId)) ??
          cached?.mailboxCount ??
          0
      );
    }
  }, [userId]);

  useEffect(() => {
    if (!userId) {
      setCount(0);
      return;
    }

    const cached = peekReadCache<number>(panelCacheKey.mailboxCount(userId));
    const hotCount = getHotGameDataForUser(userId)?.mailboxCount;
    if (cached !== null) setCount(cached);
    else if (hotCount !== undefined) setCount(hotCount);

    const timer = window.setTimeout(() => {
      void refresh();
    }, 0);

    return () => window.clearTimeout(timer);
  }, [userId, refresh]);

  return { count, refresh };
}
