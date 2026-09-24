/// <reference types="vite/client" />
/// <reference types="vite-plugin-pwa/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL: string;
  /** Set to "1" in dev to show the R3F calibration preview (see docs/RENDER_3D.md). */
  readonly VITE_RENDER_3D_DEV?: string;
  /** Set to "1" to enable battle WebGL (works in production builds). */
  readonly VITE_BATTLE_3D?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
