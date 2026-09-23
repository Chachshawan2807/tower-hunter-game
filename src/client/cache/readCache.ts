interface CacheEntry<T> {
  data: T;
  at: number;
}

const memory = new Map<string, CacheEntry<unknown>>();
const inflight = new Map<string, Promise<unknown>>();

export const panelCacheKey = {
  inventory: (userId: string) => `inventory:${userId}`,
  mailbox: (userId: string) => `mailbox:${userId}`,
  mailboxCount: (userId: string) => `mailbox-count:${userId}`,
  shopCatalog: "shop:catalog",
} as const;

export function peekReadCache<T>(key: string): T | null {
  const hit = memory.get(key);
  return hit ? (hit.data as T) : null;
}

export function putReadCache<T>(key: string, data: T): void {
  memory.set(key, { data, at: Date.now() });
}

export function invalidateReadCache(key: string): void {
  memory.delete(key);
}

export function invalidatePlayerPanels(
  userId: string,
  panels: Array<"inventory" | "mailbox">
): void {
  for (const panel of panels) {
    if (panel === "inventory") invalidateReadCache(panelCacheKey.inventory(userId));
    if (panel === "mailbox") {
      invalidateReadCache(panelCacheKey.mailbox(userId));
      invalidateReadCache(panelCacheKey.mailboxCount(userId));
    }
  }
}

export async function loadReadCache<T>(
  key: string,
  fetcher: () => Promise<T>,
  freshMs: number
): Promise<T> {
  const hit = memory.get(key);
  if (hit && Date.now() - hit.at < freshMs) {
    return hit.data as T;
  }

  const pending = inflight.get(key);
  if (pending) return pending as Promise<T>;

  const request = fetcher()
    .then((data) => {
      putReadCache(key, data);
      return data;
    })
    .finally(() => {
      inflight.delete(key);
    });

  inflight.set(key, request);
  return request;
}
