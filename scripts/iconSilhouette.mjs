/**
 * Shared raster silhouette helpers for nav / UI mask icons.
 * Binarizes line art and optionally dilates strokes for CSS mask rendering.
 */

/** Extra pixels added to each side of line strokes (256×256 canvas). */
export const NAV_STROKE_DILATE = 2;

export function isBackground(r, g, b) {
  if (r > 235 && g > 235 && b > 235) return true;
  const avg = (r + g + b) / 3;
  if (avg > 175 && Math.abs(r - g) < 18 && Math.abs(g - b) < 18) return true;
  return false;
}

/** Force opaque ink pixels for mask-image rendering. */
export function toMaskSilhouette(data, alphaThreshold = 48) {
  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    const a = data[i + 3];
    if (a < alphaThreshold || isBackground(r, g, b)) {
      data[i + 3] = 0;
      continue;
    }
    data[i] = 0;
    data[i + 1] = 0;
    data[i + 2] = 0;
    data[i + 3] = 255;
  }
}

/** Morphological dilation on alpha — thickens hairline strokes. */
export function dilateSilhouette(data, width, height, radius = NAV_STROKE_DILATE) {
  if (radius <= 0) return;

  const alpha = new Uint8Array(width * height);
  for (let i = 0; i < width * height; i++) {
    alpha[i] = data[i * 4 + 3] > 0 ? 255 : 0;
  }

  const out = new Uint8Array(width * height);
  const r2 = radius * radius;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      let max = 0;
      for (let dy = -radius; dy <= radius; dy++) {
        for (let dx = -radius; dx <= radius; dx++) {
          if (dx * dx + dy * dy > r2) continue;
          const nx = x + dx;
          const ny = y + dy;
          if (nx < 0 || ny < 0 || nx >= width || ny >= height) continue;
          max = Math.max(max, alpha[ny * width + nx]);
          if (max === 255) break;
        }
        if (max === 255) break;
      }
      out[y * width + x] = max;
    }
  }

  for (let i = 0; i < width * height; i++) {
    const o = i * 4;
    if (out[i] > 0) {
      data[o] = 0;
      data[o + 1] = 0;
      data[o + 2] = 0;
      data[o + 3] = 255;
    } else {
      data[o + 3] = 0;
    }
  }
}

export function processSilhouetteBuffer(data, width, height, dilateRadius = NAV_STROKE_DILATE) {
  toMaskSilhouette(data);
  dilateSilhouette(data, width, height, dilateRadius);
}
