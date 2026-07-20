import { useCallback, useEffect, useState } from "react";
import { api } from "../utils/api";

export function useMailboxCount(userId: string | null) {
  const [count, setCount] = useState(0);

  const refresh = useCallback(async () => {
    if (!userId) {
      setCount(0);
      return;
    }
    try {
      const mail = await api.getMailbox(userId);
      setCount(mail.items.length);
    } catch {
      setCount(0);
    }
  }, [userId]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return { count, refresh };
}
