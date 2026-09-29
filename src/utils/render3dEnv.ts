/**
 * Opt-in 3D — battle scenes and dev calibration preview.
 * Default presentation is 2D; players enable WebGL in Settings (persisted).
 */

const BATTLE_3D_PREF_KEY = "tower-hunter-battle-3d";

/** Fired when the user toggles battle 3D in Settings. */
export const BATTLE_3D_PREF_CHANGED = "tower-hunter-battle-3d-changed";

function render3dQueryFlag(): boolean {
  if (typeof window === "undefined") return false;
  return new URLSearchParams(window.location.search).get("render3d") === "1";
}

function render3dDevEnvFlag(): boolean {
  return import.meta.env.DEV && import.meta.env.VITE_RENDER_3D_DEV === "1";
}

/** `null` = no explicit user choice (follow env / URL opt-in). */
export function readBattle3dUserPreference(): boolean | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(BATTLE_3D_PREF_KEY);
    if (raw === "1") return true;
    if (raw === "0") return false;
    return null;
  } catch {
    return null;
  }
}

export function writeBattle3dUserPreference(enabled: boolean): void {
  localStorage.setItem(BATTLE_3D_PREF_KEY, enabled ? "1" : "0");
  window.dispatchEvent(new Event(BATTLE_3D_PREF_CHANGED));
}

/**
 * Whether battle / hero showcase uses the WebGL pipeline.
 * User Settings override env when set; otherwise 2D unless build or dev opt-in flags apply.
 */
export function isBattle3dEnabled(): boolean {
  const user = readBattle3dUserPreference();
  if (user === true) return true;
  if (user === false) return false;

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
