import { registerSW } from "virtual:pwa-register";

export function registerPwa() {
  if (import.meta.env.DEV) return;

  registerSW({
    immediate: true,
    onOfflineReady() {
      console.info("[pwa] Tower Hunter is ready for offline play.");
    },
    onNeedRefresh() {
      console.info("[pwa] New version available — refresh to update.");
    },
  });
}
