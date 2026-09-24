import { GameCanvas } from "../GameCanvas";
import { HomeHeroScene3D } from "./HomeHeroScene3D";

const HOME_CANVAS_OPTS = {
  camera: {
    position: [0, 1.18, 4] as [number, number, number],
    fov: 36,
    near: 0.01,
    far: 80,
  },
  gl: {
    alpha: true,
    premultipliedAlpha: true,
  },
  style: {
    background: "transparent",
  },
};

export function HomeHero3DLayer() {
  return (
    <GameCanvas className="hero-showcase__canvas3d-inner" options={HOME_CANVAS_OPTS}>
      <HomeHeroScene3D />
    </GameCanvas>
  );
}
