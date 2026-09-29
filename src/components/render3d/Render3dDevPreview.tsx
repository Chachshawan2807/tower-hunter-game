import { lazy, Suspense } from "react";

import {
  isRender3dDevPreviewEnabled,
} from "../../utils/render3dEnv";
import { useBattle3dEnabled } from "../../hooks/useBattle3dSetting";

const Render3dDevPreviewContent = lazy(() =>
  import("./Render3dDevPreviewContent").then((m) => ({
    default: m.Render3dDevPreviewContent,
  }))
);

type Render3dDevPreviewProps = {
  /** Hide calibration PiP while tower battle 3D is active. */
  suppressed?: boolean;
};

/** Lazy-loaded so default bundles stay lean until 3D is enabled in dev. */
export function Render3dDevPreview({ suppressed = false }: Render3dDevPreviewProps) {
  const battle3d = useBattle3dEnabled();
  if (!isRender3dDevPreviewEnabled()) return null;
  if (suppressed && battle3d) return null;

  return (
    <Suspense fallback={null}>
      <Render3dDevPreviewContent />
    </Suspense>
  );
}
