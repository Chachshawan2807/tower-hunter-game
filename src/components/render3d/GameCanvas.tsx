import { Canvas } from "@react-three/fiber";
import type { ReactNode } from "react";

import { RENDER_3D_CANVAS_OPTS } from "./render3dConfig";

export type GameCanvasProps = {
  children: ReactNode;
  className?: string;
};

/** Single entry point for R3F `<Canvas>` — battle/tower scenes mount children here. */
export function GameCanvas({ children, className }: GameCanvasProps) {
  return (
    <Canvas className={className} {...RENDER_3D_CANVAS_OPTS}>
      {children}
    </Canvas>
  );
}
