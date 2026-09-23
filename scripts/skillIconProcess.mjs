import sharp from "sharp";

/** Square PNG asset (UI mask scales down from this). */
export const OUTPUT_SIZE = 768;
export const FRAME_PADDING = 0.035;

/** Paper (labeled) sheets only — dark sheet uses hard threshold, no erosion. */
export const INK_ERODE_PASSES = 1;

export function isBackground(r, g, b, mode = "paper") {
  const lum = (r + g + b) / 3;
  const chroma = Math.max(r, g, b) - Math.min(r, g, b);
  if (mode === "dark") {
    return lum <= 32 && chroma <= 28;
  }
  return lum >= 192 && chroma <= 32;
}

export function isInkPixel(r, g, b, mode = "paper") {
  if (mode === "dark") {
    if (isBackground(r, g, b, mode)) return false;
    const lum = (r + g + b) / 3;
    return lum >= 52;
  }
  if (isBackground(r, g, b, mode)) return false;
  const lum = (r + g + b) / 3;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const chroma = max - min;
  if (lum < 128) return true;
  if (chroma < 48 && lum < 182) return true;
  return lum < 108;
}

export function rgbaFromTile(data, width, height, mode = "paper", erodePasses = 0) {
  const out = Buffer.alloc(width * height * 4);
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const i = (y * width + x) * 4;
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      const o = (y * width + x) * 4;
      if (!isInkPixel(r, g, b, mode)) {
        out[o + 3] = 0;
        continue;
      }
      out[o] = 255;
      out[o + 1] = 255;
      out[o + 2] = 255;
      out[o + 3] = 255;
    }
  }
  if (erodePasses <= 0) return out;
  return erodeInkAlpha(out, width, height, erodePasses);
}

function erodeInkAlpha(rgba, width, height, passes) {
  let buf = rgba;
  const neighbors = [
    [-1, 0],
    [1, 0],
    [0, -1],
    [0, 1],
  ];
  for (let pass = 0; pass < passes; pass++) {
    const src = buf;
    const next = Buffer.alloc(width * height * 4);
    src.copy(next);
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const o = (y * width + x) * 4;
        if (src[o + 3] === 0) continue;
        let core = true;
        for (const [dx, dy] of neighbors) {
          const nx = x + dx;
          const ny = y + dy;
          if (nx < 0 || ny < 0 || nx >= width || ny >= height) {
            core = false;
            break;
          }
          if (src[(ny * width + nx) * 4 + 3] === 0) {
            core = false;
            break;
          }
        }
        if (!core) next[o + 3] = 0;
      }
    }
    buf = next;
  }
  return buf;
}

/** Drops a small ink island separated from the main glyph by a tall empty band. */
export function stripFloatingTopSpecks(
  rgba,
  width,
  height,
  minGapRows = 12
) {
  function rowHasInk(y) {
    for (let x = 0; x < width; x++) {
      if (rgba[(y * width + x) * 4 + 3] > 10) return true;
    }
    return false;
  }

  let y = 0;
  while (y < height) {
    while (y < height && !rowHasInk(y)) y++;
    if (y >= height) break;
    const topStart = y;
    while (y < height && rowHasInk(y)) y++;
    const topEnd = y;
    const gapStart = y;
    while (y < height && !rowHasInk(y)) y++;
    const gap = y - gapStart;
    if (gap >= minGapRows) {
      for (let yy = topStart; yy < topEnd; yy++) {
        for (let x = 0; x < width; x++) {
          const o = (yy * width + x) * 4;
          rgba[o + 3] = 0;
        }
      }
      y = 0;
      continue;
    }
    break;
  }
  return rgba;
}

export async function preprocessRaster(inputBuffer, mode = "paper") {
  const chain = sharp(inputBuffer).rotate().greyscale();
  if (mode === "dark") {
    return chain
      .linear(1.14, -(255 * 0.07))
      .sharpen({ sigma: 0.35, m1: 0.75, m2: 0.15, x1: 2, y2: 8, y3: 16 })
      .toColourspace("srgb")
      .ensureAlpha()
      .toBuffer();
  }
  return chain
    .normalize()
    .sharpen({ sigma: 0.35, m1: 0.85, m2: 0.2, x1: 2, y2: 8, y3: 16 })
    .toColourspace("srgb")
    .ensureAlpha()
    .toBuffer();
}

export async function bufferToSkillPng(inputBuffer, options = {}) {
  const mode = options.inkMode === "dark" ? "dark" : "paper";
  const erodePasses =
    mode === "dark" ? 0 : options.erodePasses ?? INK_ERODE_PASSES;
  const prepped = await preprocessRaster(inputBuffer, mode);
  const { data, info } = await sharp(prepped)
    .raw()
    .toBuffer({ resolveWithObject: true });

  const rgba = stripFloatingTopSpecks(
    rgbaFromTile(data, info.width, info.height, mode, erodePasses),
    info.width,
    info.height
  );
  const inner = Math.max(
    1,
    Math.round(OUTPUT_SIZE * (1 - FRAME_PADDING * 2))
  );

  const resizeKernel =
    mode === "dark" ? sharp.kernel.nearest : sharp.kernel.lanczos3;

  const trimmed = await sharp(rgba, {
    raw: { width: info.width, height: info.height, channels: 4 },
  })
    .trim({ threshold: 1 })
    .resize(inner, inner, {
      fit: "contain",
      background: { r: 0, g: 0, b: 0, alpha: 0 },
      kernel: resizeKernel,
    })
    .png({ compressionLevel: 3, palette: false, effort: 10 })
    .toBuffer();

  return sharp({
    create: {
      width: OUTPUT_SIZE,
      height: OUTPUT_SIZE,
      channels: 4,
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    },
  })
    .composite([{ input: trimmed, gravity: "center" }])
    .png({ compressionLevel: 3, palette: false, effort: 10 })
    .toBuffer();
}

/** @deprecated Prefer standalone `.png` + skillIconUrl(); kept for legacy tooling. */
export function wrapSvg(pngBase64, iconId) {
  return [
    `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 24 24">`,
    `  <!-- ${iconId} -->`,
    `  <image width="24" height="24" preserveAspectRatio="xMidYMid meet" href="data:image/png;base64,${pngBase64}"/>`,
    `</svg>`,
    "",
  ].join("\n");
}

export async function stripLabelBand(inputBuffer, labelBand = 0.28) {
  const meta = await sharp(inputBuffer).metadata();
  if (!meta.width || !meta.height) throw new Error("Bad image dimensions");
  const iconH = Math.max(1, Math.floor(meta.height * (1 - labelBand)));
  return sharp(inputBuffer).extract({
    left: 0,
    top: 0,
    width: meta.width,
    height: iconH,
  });
}

export const MAX_SVG_PNG_BASE64_LEN = 280_000;
