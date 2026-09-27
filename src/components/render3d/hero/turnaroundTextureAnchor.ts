import type { Texture } from "three";

export type TurnaroundTextureAnchor = {
  /** Horizontal mass center in 0–1 (0.5 = image center). */
  centerXNorm: number;
  /** Lowest opaque scanline in 0–1 (1 = bottom of image). */
  footYNorm: number;
};

const DEFAULT_ANCHOR: TurnaroundTextureAnchor = {
  centerXNorm: 0.5,
  footYNorm: 1,
};

function isDrawableImage(
  image: Texture["image"]
): image is CanvasImageSource & { width: number; height: number } {
  return (
    image != null &&
    typeof image === "object" &&
    "width" in image &&
    typeof image.width === "number" &&
    image.width > 0 &&
    "height" in image &&
    typeof image.height === "number" &&
    image.height > 0
  );
}

/** Measure foot line + lower-body horizontal center for stable turnaround swaps. */
export function measureTurnaroundTextureAnchor(
  image: CanvasImageSource & { width: number; height: number }
): TurnaroundTextureAnchor {
  const w = image.width;
  const h = image.height;
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  if (!ctx) return DEFAULT_ANCHOR;

  ctx.drawImage(image, 0, 0);
  const data = ctx.getImageData(0, 0, w, h).data;

  let footY = 0;
  const yStart = Math.floor(h * 0.45);
  let cxSum = 0;
  let n = 0;

  for (let y = 0; y < h; y += 1) {
    for (let x = 0; x < w; x += 1) {
      const a = data[(y * w + x) * 4 + 3];
      if (a < 128) continue;
      if (y > footY) footY = y;
      if (y >= yStart) {
        cxSum += x;
        n += 1;
      }
    }
  }

  if (n === 0) return DEFAULT_ANCHOR;

  return {
    centerXNorm: cxSum / n / w,
    footYNorm: (footY + 1) / h,
  };
}

export function turnaroundAnchorsForViews(
  textures: Record<string, Texture>
): Record<string, TurnaroundTextureAnchor> {
  const out: Record<string, TurnaroundTextureAnchor> = {};
  for (const [id, tex] of Object.entries(textures)) {
    out[id] = turnaroundAnchorFromTexture(tex);
  }
  return out;
}

export function turnaroundAnchorFromTexture(tex: Texture): TurnaroundTextureAnchor {
  const image = tex.image;
  if (!isDrawableImage(image)) return DEFAULT_ANCHOR;
  return measureTurnaroundTextureAnchor(image);
}
