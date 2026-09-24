import { lazy, Suspense } from "react";

import { isBattle3dEnabled } from "../../../utils/render3dEnv";

const HomeHero3DLayer = lazy(() =>
  import("./HomeHero3DLayer").then((m) => ({ default: m.HomeHero3DLayer }))
);

export function HomeHero3D() {
  if (!isBattle3dEnabled()) return null;

  return (
    <Suspense fallback={null}>
      <HomeHero3DLayer />
    </Suspense>
  );
}
