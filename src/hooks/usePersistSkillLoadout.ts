import { useCallback, useState } from "react";
import type { SkillLoadout } from "../engine/skills/loadout";
import { runWithOfflineQueue } from "../client/offline/queueMutation";
import { api } from "../utils/api";
import { createActionIdempotencyKey } from "../utils/idempotencyKey";
import { t, type Locale } from "../utils/i18n";

export function usePersistSkillLoadout(
  userId: string | null,
  locale: Locale,
  onLoadoutChange: (loadout: SkillLoadout) => void
) {
  const [busy, setBusy] = useState(false);
  const [offlineMessage, setOfflineMessage] = useState<string | null>(null);

  const saveLoadout = useCallback(
    async (next: SkillLoadout) => {
      onLoadoutChange(next);
      if (!userId) return;
      setBusy(true);
      setOfflineMessage(null);
      try {
        const idempotencyKey = createActionIdempotencyKey(
          "skill_loadout",
          userId,
          next.equippedSlots.join(",")
        );
        const result = await runWithOfflineQueue(
          "skill_loadout",
          userId,
          idempotencyKey,
          { loadoutJson: JSON.stringify(next) },
          () => api.patchSkillLoadout(userId, next)
        );

        if (result.status === "queued") {
          setOfflineMessage("common.offline_queued");
          return;
        }
        if (result.status === "error") {
          throw result.error;
        }

        onLoadoutChange(result.data.loadout);
      } finally {
        setBusy(false);
      }
    },
    [userId, onLoadoutChange]
  );

  const offlineNotice = offlineMessage
    ? t(offlineMessage, locale)
    : null;

  return { saveLoadout, busy, offlineMessage, offlineNotice };
}
