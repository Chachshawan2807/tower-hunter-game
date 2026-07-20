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

/** Remove isolated blobs below minArea (e.g. decorative dots inside a coin rim). */
export function removeSmallSilhouetteBlobs(data, width, height, minArea) {
  const labels = new Int32Array(width * height);
  let nextLabel = 1;

  function flood(x, y, label) {
    const stack = [[x, y]];
    let area = 0;
    const pixels = [];

    while (stack.length > 0) {
      const [cx, cy] = stack.pop();
      if (cx < 0 || cy < 0 || cx >= width || cy >= height) continue;

      const idx = cy * width + cx;
      if (labels[idx] !== 0) continue;
      if (data[idx * 4 + 3] === 0) continue;

      labels[idx] = label;
      area++;
      pixels.push(idx);
      stack.push([cx + 1, cy], [cx - 1, cy], [cx, cy + 1], [cx, cy - 1]);
    }

    return { area, pixels };
  }

  const components = [];
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = y * width + x;
      if (labels[idx] === 0 && data[idx * 4 + 3] > 0) {
        components.push(flood(x, y, nextLabel++));
      }
    }
  }

  for (const { area, pixels } of components) {
    if (area >= minArea) continue;
    for (const idx of pixels) {
      data[idx * 4 + 3] = 0;
    }
  }
}

/**
 * Imperial ink hatch — maps reference gray tones to opaque black ink (hero armor style).
 * Uses grayscale RGB so shading reads clearly on light slot backgrounds.
 */
export function toInkShadedSilhouette(data, alphaThreshold = 48) {
  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    const a = data[i + 3];
    if (a < alphaThreshold || isBackground(r, g, b)) {
      data[i + 3] = 0;
      continue;
    }
    const lum = 0.299 * r + 0.587 * g + 0.114 * b;
    const ink = Math.round(Math.min(255, Math.max(0, (255 - lum) * 1.35 + 24)));
    data[i] = ink;
    data[i + 1] = ink;
    data[i + 2] = ink;
    data[i + 3] = 255;
  }
}

/** Extra pixels for equipment slot strokes — bolder ink to match hero armor weight. */
export const EQUIP_STROKE_DILATE = 3;

/** Shop item icons — source art is already ink-weighted; dilation blobs out detail. */
export const SHOP_ITEM_STROKE_DILATE = 0;

export function processInkShadedBuffer(data, width, height, dilateRadius = EQUIP_STROKE_DILATE) {
  toInkShadedSilhouette(data);
  if (dilateRadius > 0) {
    dilateSilhouette(data, width, height, dilateRadius);
  }
}
