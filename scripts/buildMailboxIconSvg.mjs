/**
 * Build MAILBOX icon from standalone reference art (transparent bg, raster-in-SVG).
 * Strips light pixels and normalizes to black silhouette for CSS mask rendering.
 * Run: node scripts/buildMailboxIconSvg.mjs
 */
import fs from "fs";
import { homedir } from "node:os";
import path from "path";
import { fileURLToPath } from "url";
import sharp from "sharp";
import { processSilhouetteBuffer } from "./iconSilhouette.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const REF_DIR = path.join(ROOT, "docs", "art", "ui-icons", "reference");
const OUT = path.join(ROOT, "public", "icons", "ui", "mailbox.svg");

const CANVAS = 256;
const SOURCE_UPSCALE = 8;
const MAILBOX_DILATE = 1;
/** Transparent pad after trim (at upscale resolution) — keeps flag tip & arched edges. */
const TRIM_PAD = 12;
const SAFE_MARGIN = 4;

const SOURCE_CANDIDATES = [
  path.join(REF_DIR, "mailbox-raw.png"),
  path.join(
    homedir(),
    ".cursor",
    "projects",
    "c-Projects-tower-hunter-game",
    "assets",
    "c__Users_chach_AppData_Roaming_Cursor_User_workspaceStorage_5dfea47b5f797cb8406d25a5ec294443_images_ChatGPT_Image_20__._._2569_01_35_29_-_Copy-e8e15779-66c0-4ac6-af24-7e5b7f459cea.png"
  ),
];

async function toNavCanvas(pngBuffer) {
  const meta = await sharp(pngBuffer).metadata();
  const width = meta.width ?? CANVAS;
  const height = meta.height ?? CANVAS;

  // Fit full art in canvas — never crop (mailbox flag + dome must stay intact).
  const scale = Math.min(
    (CANVAS - SAFE_MARGIN * 2) / width,
    (CANVAS - SAFE_MARGIN * 2) / height
  );
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

async function main() {
  const source = SOURCE_CANDIDATES.find((p) => fs.existsSync(p));
  if (!source) {
    throw new Error(`Missing mailbox reference. Place PNG at ${SOURCE_CANDIDATES[0]}`);
  }

  fs.mkdirSync(REF_DIR, { recursive: true });
  fs.mkdirSync(path.dirname(OUT), { recursive: true });

  const srcMeta = await sharp(source).metadata();
  const srcW = srcMeta.width ?? 95;
  const srcH = srcMeta.height ?? 72;

  const { data, info } = await sharp(source)
    .resize(Math.round(srcW * SOURCE_UPSCALE), Math.round(srcH * SOURCE_UPSCALE), {
      kernel: sharp.kernel.lanczos3,
    })
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  processSilhouetteBuffer(data, info.width, info.height, MAILBOX_DILATE);

  const trimmed = await sharp(Buffer.from(data), {
    raw: { width: info.width, height: info.height, channels: 4 },
  })
    .trim({ threshold: 1 })
    .extend({
      top: TRIM_PAD,
      bottom: TRIM_PAD,
      left: TRIM_PAD,
      right: TRIM_PAD,
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    })
    .png()
    .toBuffer();

  const png = await toNavCanvas(trimmed);

  const rawOut = path.join(REF_DIR, "mailbox-raw.png");
  const refOut = path.join(REF_DIR, "mailbox-source.png");
  fs.copyFileSync(source, rawOut);
  fs.writeFileSync(refOut, png);

  const base64 = png.toString("base64");
  const svg = [
    `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 24 24" fill="none">`,
    `  <title>mailbox</title>`,
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
