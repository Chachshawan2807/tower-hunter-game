const DB_NAME = "tower_hunter";
const DB_VERSION = 2;

export const STORES = {
  playerSnapshot: "player_snapshot",
  offlineQueue: "offline_queue",
  gameData: "game_data",
} as const;

type StoreName = (typeof STORES)[keyof typeof STORES];

let dbPromise: Promise<IDBDatabase> | null = null;

function openDb(): Promise<IDBDatabase> {
  if (dbPromise) return dbPromise;

  dbPromise = new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORES.playerSnapshot)) {
        db.createObjectStore(STORES.playerSnapshot, { keyPath: "userId" });
      }
      if (!db.objectStoreNames.contains(STORES.offlineQueue)) {
        const store = db.createObjectStore(STORES.offlineQueue, {
          keyPath: "id",
        });
        store.createIndex("by_created", "createdAt", { unique: false });
      }
      if (!db.objectStoreNames.contains(STORES.gameData)) {
        db.createObjectStore(STORES.gameData, { keyPath: "userId" });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error ?? new Error("IndexedDB open failed"));
  });

  return dbPromise;
}

export async function idbGet<T>(store: StoreName, key: string): Promise<T | null> {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(store, "readonly");
    const req = tx.objectStore(store).get(key);
    req.onsuccess = () => resolve((req.result as T | undefined) ?? null);
    req.onerror = () => reject(req.error ?? new Error("IndexedDB get failed"));
  });
}

export async function idbPut<T extends { userId?: string; id?: string }>(
  store: StoreName,
  value: T
): Promise<void> {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(store, "readwrite");
    tx.objectStore(store).put(value);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error ?? new Error("IndexedDB put failed"));
  });
}

export async function idbDelete(store: StoreName, key: string): Promise<void> {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(store, "readwrite");
    tx.objectStore(store).delete(key);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error ?? new Error("IndexedDB delete failed"));
  });
}

export async function idbGetAll<T>(store: StoreName): Promise<T[]> {
  const db = await openDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(store, "readonly");
    const req = tx.objectStore(store).getAll();
    req.onsuccess = () => resolve((req.result as T[]) ?? []);
    req.onerror = () => reject(req.error ?? new Error("IndexedDB getAll failed"));
  });
}
