/**
 * Build GOLD nav/HUD icon from standalone reference art (transparent bg, raster-in-SVG).
 * Strips light pixels and normalizes to black silhouette for CSS mask rendering.
 * Run: node scripts/buildGoldIconSvg.mjs
 */
import fs from "fs";
import { homedir } from "node:os";
import path from "path";
import { fileURLToPath } from "url";
import sharp from "sharp";
import {
  dilateSilhouette,
  isBackground,
  removeSmallSilhouetteBlobs,
  toMaskSilhouette,
} from "./iconSilhouette.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const REF_DIR = path.join(ROOT, "docs", "art", "ui-icons", "reference");
const OUT = path.join(ROOT, "public", "icons", "ui", "gold.svg");

const CANVAS = 256;
const SOURCE_UPSCALE = 8;
const GOLD_DILATE = 1;
/** At 8× upscale, inner star dots are ~370–780 px; crown/rings are much larger. */
const GOLD_MIN_BLOB_AREA = 800;
const NAV_TARGET_WIDTH = 212;

const SOURCE_CANDIDATES = [
  path.join(REF_DIR, "gold-raw.png"),
  path.join(
    homedir(),
    ".cursor",
    "projects",
    "c-Projects-tower-hunter-game",
    "assets",
    "c__Users_chach_AppData_Roaming_Cursor_User_workspaceStorage_5dfea47b5f797cb8406d25a5ec294443_images_ChatGPT_Image_20__._._2569_01_35_29_-_Copy-b015a6d0-ed90-48ef-890e-f671581ce0db.png"
  ),
];

async function toNavCanvas(pngBuffer) {
  const meta = await sharp(pngBuffer).metadata();
  const width = meta.width ?? CANVAS;
  const height = meta.height ?? CANVAS;

  const scale = Math.min(NAV_TARGET_WIDTH / width, CANVAS / height);
  const fittedW = Math.round(width * scale);
  const fittedH = Math.round(height * scale);
  const padTop = Math.floor((CANVAS - fittedH) / 2);
  const padLeft = Math.floor((CANVAS - fittedW) / 2);

  return sharp(pngBuffer)
    .resize(fittedW, fittedH, {
      fit: "fill",
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    })
    .extend({
      top: padTop,
      bottom: CANVAS - fittedH - padTop,
      left: padLeft,
      right: CANVAS - fittedW - padLeft,
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    })
    .png({ compressionLevel: 9, palette: true })
    .toBuffer();
}

/** Crop icon art from wide banner sheets (light panel on dark bg). */
async function extractIconArt(source) {
  const { data, info } = await sharp(source).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const isWideBanner = info.width / info.height > 2.5;

  let minX = info.width;
  let minY = info.height;
  let maxX = 0;
  let maxY = 0;
  let found = false;

  for (let y = 0; y < info.height; y++) {
    for (let x = 0; x < info.width; x++) {
      const i = (y * info.width + x) * 4;
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      const a = data[i + 3];
      if (a < 48) continue;

      const isLightPanel = r > 180 && g > 180 && b > 180;
      const isInk = !isBackground(r, g, b) && !(r < 20 && g < 20 && b < 20);
      const match = isWideBanner ? isLightPanel : isInk;
      if (!match) continue;

      found = true;
      minX = Math.min(minX, x);
      minY = Math.min(minY, y);
      maxX = Math.max(maxX, x);
      maxY = Math.max(maxY, y);
    }
  }

  if (!found) {
    throw new Error("No icon art found in gold reference image");
  }

  const bw = maxX - minX + 1;
  const bh = maxY - minY + 1;
  const coversMostOfCanvas = bw > info.width * 0.75 && bh > info.height * 0.75;
  if (!isWideBanner && coversMostOfCanvas) {
    return sharp(source).png().toBuffer();
  }

  const pad = 2;
  const left = Math.max(0, minX - pad);
  const top = Math.max(0, minY - pad);
  const width = Math.min(info.width - left, bw + pad * 2);
  const height = Math.min(info.height - top, bh + pad * 2);

  return sharp(source).extract({ left, top, width, height }).png().toBuffer();
}

async function main() {
  const source = SOURCE_CANDIDATES.find((p) => fs.existsSync(p));
  if (!source) {
    throw new Error(`Missing gold reference. Place PNG at ${SOURCE_CANDIDATES[0]}`);
  }

  fs.mkdirSync(REF_DIR, { recursive: true });
  fs.mkdirSync(path.dirname(OUT), { recursive: true });

  const cropped = await extractIconArt(source);
  const cropMeta = await sharp(cropped).metadata();
  const srcW = cropMeta.width ?? 64;
  const srcH = cropMeta.height ?? 64;

  const { data, info } = await sharp(cropped)
    .resize(Math.round(srcW * SOURCE_UPSCALE), Math.round(srcH * SOURCE_UPSCALE), {
      kernel: sharp.kernel.lanczos3,
    })
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  toMaskSilhouette(data);
  removeSmallSilhouetteBlobs(data, info.width, info.height, GOLD_MIN_BLOB_AREA);
  dilateSilhouette(data, info.width, info.height, GOLD_DILATE);

  const trimmed = await sharp(Buffer.from(data), {
    raw: { width: info.width, height: info.height, channels: 4 },
  })
    .trim({ threshold: 1 })
    .png()
    .toBuffer();

  const png = await toNavCanvas(trimmed);

  const rawOut = path.join(REF_DIR, "gold-raw.png");
  const refOut = path.join(REF_DIR, "gold-source.png");
  fs.writeFileSync(rawOut, cropped);
  fs.writeFileSync(refOut, png);

  const base64 = png.toString("base64");
  const svg = [
    `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 24 24" fill="none">`,
    `  <title>gold</title>`,
    `  <image width="24" height="24" preserveAspectRatio="xMidYMid meet" href="data:image/png;base64,${base64}"/>`,
    `</svg>`,
    "",
  ].join("\n");

  fs.writeFileSync(OUT, svg, "utf8");
  console.log("wrote", path.relative(ROOT, OUT));
  console.log("wrote", path.relative(ROOT, rawOut));
  console.log("wrote", path.relative(ROOT, refOut));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
