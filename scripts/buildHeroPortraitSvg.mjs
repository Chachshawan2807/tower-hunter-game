/**
 * Build main hero portrait SVG from reference art (transparent background).
 * Run: node scripts/buildHeroPortraitSvg.mjs
 */
import fs from "fs";
import { homedir } from "node:os";
import path from "path";
import { fileURLToPath } from "url";
import sharp from "sharp";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");

const REF_DIR = path.join(ROOT, "docs", "art", "characters", "reference");
const SOURCE_CANDIDATES = [
  path.join(REF_DIR, "imperial-knight-hero-raw.png"),
  path.join(
    homedir(),
    ".cursor",
    "projects",
    "c-Projects-tower-hunter-game",
    "assets",
    "c__Users_chach_AppData_Roaming_Cursor_User_workspaceStorage_5dfea47b5f797cb8406d25a5ec294443_images_black-white-vector-drawing-medieval-knight-armor_983400-1795-3bfb0fba-769f-403b-b0e8-c22832b79f75.png"
  ),
];
const SOURCE = SOURCE_CANDIDATES.find((p) => fs.existsSync(p));
const OUT_SVG = path.join(ROOT, "public", "assets", "characters", "imperial-knight-hero.svg");

function isBackground(r, g, b, a) {
  if (a < 8) return true;
  if (r > 238 && g > 235 && b > 228) return true;
  const avg = (r + g + b) / 3;
  if (avg > 210 && Math.abs(r - g) < 22 && Math.abs(g - b) < 22) return true;
  return false;
}

async function stripBackground(inputPath) {
  const { data, info } = await sharp(inputPath).ensureAlpha().raw().toBuffer({ resolveWithObject: true });

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    const a = data[i + 3];
    if (isBackground(r, g, b, a)) {
      data[i + 3] = 0;
    }
  }

  return sharp(Buffer.from(data), {
    raw: { width: info.width, height: info.height, channels: 4 },
  })
    .trim({ threshold: 1 })
    .png({ compressionLevel: 9 })
    .toBuffer({ resolveWithObject: true });
}

async function main() {
  if (!SOURCE) {
    throw new Error(`Missing source image. Place raw PNG at ${SOURCE_CANDIDATES[0]}`);
  }

  fs.mkdirSync(REF_DIR, { recursive: true });
  fs.mkdirSync(path.dirname(OUT_SVG), { recursive: true });

  const { data: png, info } = await stripBackground(SOURCE);
  const refPng = path.join(REF_DIR, "imperial-knight-hero-source.png");
  fs.writeFileSync(refPng, png);

  const aspect = info.width / info.height;
  const viewW = 100;
  const viewH = Math.round((viewW / aspect) * 100) / 100;
  const base64 = png.toString("base64");

  const svg = [
    `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"`,
    `  viewBox="0 0 ${viewW} ${viewH}" fill="none" role="img" aria-label="Imperial Knight Hero">`,
    `  <title>Imperial Knight Hero</title>`,
    `  <image width="${viewW}" height="${viewH}" preserveAspectRatio="xMidYMid meet"`,
    `    href="data:image/png;base64,${base64}"/>`,
    `</svg>`,
    "",
  ].join("\n");

  fs.writeFileSync(OUT_SVG, svg, "utf8");
  console.log("wrote", path.relative(ROOT, OUT_SVG), `(${info.width}x${info.height}px embedded)`);
  console.log("wrote", path.relative(ROOT, refPng));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
