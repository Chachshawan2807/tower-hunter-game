import { lazy, Suspense } from "react";

import {
  isBattle3dEnabled,
  isRender3dDevPreviewEnabled,
} from "../../utils/render3dEnv";

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
  if (!isRender3dDevPreviewEnabled()) return null;
  if (suppressed && isBattle3dEnabled()) return null;

  return (
    <Suspense fallback={null}>
      <Render3dDevPreviewContent />
    </Suspense>
  );
}
