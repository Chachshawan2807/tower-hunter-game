import { enqueueOfflineAction } from "./offlineQueue";
import { isBrowserOnline } from "./networkStatus";
import type { OfflineActionKind } from "./types";

export function isNetworkFailure(err: unknown): boolean {
  if (!(err instanceof Error)) return false;
  if (err.name === "TypeError") return true;
  return /network|fetch|failed to fetch/i.test(err.message);
}

export async function queueMutationIfOffline(
  kind: OfflineActionKind,
  userId: string,
  idempotencyKey: string,
  payload: Record<string, string>,
  err: unknown
): Promise<boolean> {
  if (!isNetworkFailure(err) || isBrowserOnline()) {
    return false;
  }

  await enqueueOfflineAction({
    id: idempotencyKey,
    userId,
    kind,
    idempotencyKey,
    payload,
  });
  return true;
}

export type OfflineMutationResult<T> =
  | { status: "success"; data: T }
  | { status: "queued" }
  | { status: "error"; error: unknown };

export async function runWithOfflineQueue<T>(
  kind: OfflineActionKind,
  userId: string,
  idempotencyKey: string,
  payload: Record<string, string>,
  run: () => Promise<T>
): Promise<OfflineMutationResult<T>> {
  try {
    const data = await run();
    return { status: "success", data };
  } catch (err) {
    const queued = await queueMutationIfOffline(
      kind,
      userId,
      idempotencyKey,
      payload,
      err
    );
    if (queued) return { status: "queued" };
    return { status: "error", error: err };
  }
}
