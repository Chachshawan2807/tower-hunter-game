import type { CanvasProps } from "@react-three/fiber";

import { RENDER_3D_ART } from "../../engine/art/render3d";

/** Cap GPU cost on high-DPI phones */
export const RENDER_3D_MAX_DPR = 2;

export const RENDER_3D_CANVAS_OPTS: CanvasProps = {
  dpr: [1, RENDER_3D_MAX_DPR],
  gl: {
    antialias: true,
    alpha: true,
    powerPreference: "high-performance",
  },
  shadows: false,
  camera: {
    position: [0, 1.35, 4.25],
    fov: 42,
    near: 0.1,
    far: 120,
  },
  style: {
    background: RENDER_3D_ART.backgroundHex,
    width: "100%",
    height: "100%",
    display: "block",
  },
};
