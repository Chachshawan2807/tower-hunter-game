import { idbGetAll, idbPut, idbDelete, STORES } from "../cache/idb";
import type { OfflineActionKind, OfflineQueueItem } from "./types";

export async function enqueueOfflineAction(
  item: Omit<OfflineQueueItem, "createdAt" | "attempts">
): Promise<void> {
  const entry: OfflineQueueItem = {
    ...item,
    createdAt: new Date().toISOString(),
    attempts: 0,
  };
  await idbPut(STORES.offlineQueue, entry);
}

export async function listOfflineQueue(): Promise<OfflineQueueItem[]> {
  const items = await idbGetAll<OfflineQueueItem>(STORES.offlineQueue);
  return items.sort((a, b) => a.createdAt.localeCompare(b.createdAt));
}

export async function removeOfflineAction(id: string): Promise<void> {
  await idbDelete(STORES.offlineQueue, id);
}

export async function bumpOfflineAttempts(item: OfflineQueueItem): Promise<void> {
  await idbPut(STORES.offlineQueue, {
    ...item,
    attempts: item.attempts + 1,
  });
}

export function createOfflineActionId(
  kind: OfflineActionKind,
  userId: string,
  targetId: string
): string {
  return `${kind}:${userId}:${targetId}:${crypto.randomUUID()}`;
}
