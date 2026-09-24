/// <reference types="vite/client" />
/// <reference types="vite-plugin-pwa/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL: string;
  /** Set to "1" in dev to show the R3F calibration preview (see docs/RENDER_3D.md). */
  readonly VITE_RENDER_3D_DEV?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
