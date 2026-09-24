/**
 * Split imperial knight turnaround sheet into WebGL frames.
 * Run: npm run split:hero-turnaround
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import sharp from "sharp";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");

const REF_DIR = path.join(ROOT, "docs", "art", "characters", "reference");
const SOURCE = path.join(REF_DIR, "imperial-knight-turnaround-source.jpg");
const OUT_DIR = path.join(ROOT, "public", "assets", "characters", "hero-turnaround");

const FRAMES = [
  { name: "turn-00-three-quarter.png", slice: "hero" },
  { name: "turn-01-front.png", slice: 0 },
  { name: "turn-02-back.png", slice: 1 },
  { name: "turn-03-right.png", slice: 2 },
  { name: "turn-04-left.png", slice: 3 },
];

function isBackground(r, g, b, a) {
  if (a < 8) return true;
  if (r > 235 && g > 232 && b > 225) return true;
  const avg = (r + g + b) / 3;
  if (avg > 205 && Math.abs(r - g) < 25 && Math.abs(g - b) < 25) return true;
  return false;
}

async function stripAndTrim(inputBuffer) {
  const { data, info } = await sharp(inputBuffer).ensureAlpha().raw().toBuffer({ resolveWithObject: true });

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
    .toBuffer();
}

async function main() {
  if (!fs.existsSync(SOURCE)) {
    throw new Error(`Missing ${SOURCE} — add the turnaround JPG to docs/art/characters/reference/`);
  }

  fs.mkdirSync(OUT_DIR, { recursive: true });

  const meta = await sharp(SOURCE).metadata();
  const w = meta.width ?? 0;
  const h = meta.height ?? 0;
  if (w < 100 || h < 100) throw new Error("Invalid source dimensions");

  const heroSplit = Math.round(w * 0.38);
  const rowLeft = heroSplit;
  const rowW = w - rowLeft;
  const colW = Math.floor(rowW / 4);

  const slices = {
    hero: { left: 0, top: 0, width: heroSplit, height: h },
    0: { left: rowLeft, top: 0, width: colW, height: h },
    1: { left: rowLeft + colW, top: 0, width: colW, height: h },
    2: { left: rowLeft + colW * 2, top: 0, width: colW, height: h },
    3: { left: rowLeft + colW * 3, top: 0, width: rowW - colW * 3, height: h },
  };

  for (const frame of FRAMES) {
    const rect = slices[frame.slice];
    const raw = await sharp(SOURCE).extract(rect).toBuffer();
    const png = await stripAndTrim(raw);
    const outPath = path.join(OUT_DIR, frame.name);
    fs.writeFileSync(outPath, png);
    console.log("wrote", path.relative(ROOT, outPath));
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
