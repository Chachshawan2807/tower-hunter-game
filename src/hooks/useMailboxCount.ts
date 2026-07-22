import { useCallback, useEffect, useState } from "react";
import { getHotGameDataForUser } from "../client/cache/gameDataMemory";
import { api } from "../utils/api";

export function useMailboxCount(userId: string | null) {
  const hot = getHotGameDataForUser(userId);
  const [count, setCount] = useState(hot?.mailboxCount ?? 0);

  const refresh = useCallback(async () => {
    if (!userId) {
      setCount(0);
      return;
    }
    try {
      const mail = await api.getMailbox(userId);
      setCount(mail.items.length);
    } catch {
      const cached = getHotGameDataForUser(userId);
      setCount(cached?.mailboxCount ?? 0);
    }
  }, [userId]);

  useEffect(() => {
    if (!userId) {
      setCount(0);
      return;
    }

    const cached = getHotGameDataForUser(userId);
    if (cached) {
      setCount(cached.mailboxCount);
    }

    const timer = window.setTimeout(() => {
      void refresh();
    }, 0);

    return () => window.clearTimeout(timer);
  }, [userId, refresh]);

  return { count, refresh };
}
