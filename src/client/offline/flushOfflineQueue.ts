import {
  bumpOfflineAttempts,
  listOfflineQueue,
  removeOfflineAction,
} from "./offlineQueue";
import {
  executeOfflineAction,
  isBattleOfflineKind,
  isNonRetryableOfflineError,
} from "./executeOfflineAction";
import { isBrowserOnline } from "./networkStatus";
import {
  OFFLINE_FLUSH_EVENT,
  type OfflineFlushDetail,
} from "./types";

const MAX_ATTEMPTS = 5;

function notifyFlush(detail: OfflineFlushDetail): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(
    new CustomEvent<OfflineFlushDetail>(OFFLINE_FLUSH_EVENT, { detail })
  );
}

export async function flushOfflineQueue(): Promise<OfflineFlushDetail> {
  if (!isBrowserOnline()) {
    return { flushed: 0, hadBattleActions: false };
  }

  const items = await listOfflineQueue();
  let flushed = 0;
  let hadBattleActions = false;

  for (const item of items) {
    if (item.attempts >= MAX_ATTEMPTS) continue;

    try {
      await executeOfflineAction(item);
      await removeOfflineAction(item.id);
      flushed += 1;
      if (isBattleOfflineKind(item.kind)) {
        hadBattleActions = true;
      }
    } catch (err) {
      console.warn("[offline] Failed to flush action:", item.id, err);
      if (isNonRetryableOfflineError(err)) {
        await removeOfflineAction(item.id);
        continue;
      }
      await bumpOfflineAttempts(item);
    }
  }

  const detail = { flushed, hadBattleActions };
  if (flushed > 0) {
    notifyFlush(detail);
  }
  return detail;
}
