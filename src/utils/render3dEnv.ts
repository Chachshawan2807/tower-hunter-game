/**
 * Opt-in 3D dev preview — production builds stay 2D-only unless a scene is wired in.
 */

export function isRender3dDevPreviewEnabled(): boolean {
  if (!import.meta.env.DEV) return false;
  if (import.meta.env.VITE_RENDER_3D_DEV === "1") return true;
  if (typeof window === "undefined") return false;
  return new URLSearchParams(window.location.search).get("render3d") === "1";
}
