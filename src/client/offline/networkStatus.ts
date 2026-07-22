type Listener = (online: boolean) => void;

const listeners = new Set<Listener>();

function notify(): void {
  const online = navigator.onLine;
  for (const listener of listeners) {
    listener(online);
  }
}

if (typeof window !== "undefined") {
  window.addEventListener("online", notify);
  window.addEventListener("offline", notify);
}

export function isBrowserOnline(): boolean {
  return typeof navigator === "undefined" ? true : navigator.onLine;
}

export function subscribeNetworkStatus(listener: Listener): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function onNetworkOnline(callback: () => void): () => void {
  return subscribeNetworkStatus((online) => {
    if (online) callback();
  });
}
