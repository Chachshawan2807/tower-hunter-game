import { lazy, Suspense } from "react";

import { isRender3dDevPreviewEnabled } from "../../utils/render3dEnv";

const Render3dDevPreviewContent = lazy(() =>
  import("./Render3dDevPreviewContent").then((m) => ({
    default: m.Render3dDevPreviewContent,
  }))
);

/** Lazy-loaded so default bundles stay lean until 3D is enabled in dev. */
export function Render3dDevPreview() {
  if (!isRender3dDevPreviewEnabled()) return null;

  return (
    <Suspense fallback={null}>
      <Render3dDevPreviewContent />
    </Suspense>
  );
}
