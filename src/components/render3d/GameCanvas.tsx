import { Canvas, type CanvasProps } from "@react-three/fiber";
import type { ReactNode } from "react";

import { RENDER_3D_CANVAS_OPTS } from "./render3dConfig";

export type GameCanvasProps = {
  children: ReactNode;
  className?: string;
  /** Shallow-merged over defaults (e.g. transparent home showcase). */
  options?: Partial<CanvasProps>;
};

/** Single entry point for R3F `<Canvas>` — battle/tower scenes mount children here. */
export function GameCanvas({ children, className, options }: GameCanvasProps) {
  const canvasProps = options
    ? {
        ...RENDER_3D_CANVAS_OPTS,
        ...options,
        gl: { ...RENDER_3D_CANVAS_OPTS.gl, ...options.gl },
        camera: options.camera ?? RENDER_3D_CANVAS_OPTS.camera,
        style: { ...RENDER_3D_CANVAS_OPTS.style, ...options.style },
      }
    : RENDER_3D_CANVAS_OPTS;

  return (
    <Canvas className={className} {...canvasProps}>
      {children}
    </Canvas>
  );
}
