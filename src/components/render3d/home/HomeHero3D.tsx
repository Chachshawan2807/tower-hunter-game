import { lazy, Suspense } from "react";

import { useBattle3dEnabled } from "../../../hooks/useBattle3dSetting";

const HomeHero3DLayer = lazy(() =>
  import("./HomeHero3DLayer").then((m) => ({ default: m.HomeHero3DLayer }))
);

export function HomeHero3D() {
  const battle3d = useBattle3dEnabled();
  if (!battle3d) return null;

  return (
    <Suspense fallback={null}>
      <HomeHero3DLayer />
    </Suspense>
  );
}
