/**
 * Opt-in 3D — battle scenes and dev calibration preview.
 */

function render3dQueryFlag(): boolean {
  if (typeof window === "undefined") return false;
  return new URLSearchParams(window.location.search).get("render3d") === "1";
}

function render3dDevEnvFlag(): boolean {
  return import.meta.env.DEV && import.meta.env.VITE_RENDER_3D_DEV === "1";
}

/** Production-safe: set VITE_BATTLE_3D=1 at build time to ship battle WebGL. */
export function isBattle3dEnabled(): boolean {
  if (import.meta.env.VITE_BATTLE_3D === "1") return true;
  if (render3dDevEnvFlag()) return true;
  if (import.meta.env.DEV && render3dQueryFlag()) return true;
  return false;
}

export function isRender3dDevPreviewEnabled(): boolean {
  if (!import.meta.env.DEV) return false;
  if (render3dDevEnvFlag()) return true;
  return render3dQueryFlag();
}
