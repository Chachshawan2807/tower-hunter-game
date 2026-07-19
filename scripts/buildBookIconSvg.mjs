/**
 * Build BOOK nav icon — bold imperial line art rasterized to mask silhouette.
 * Run: node scripts/buildBookIconSvg.mjs
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import sharp from "sharp";
import { processSilhouetteBuffer } from "./iconSilhouette.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const REF_DIR = path.join(ROOT, "docs", "art", "ui-icons", "reference");
const OUT = path.join(ROOT, "public", "icons", "ui", "book.svg");

const BOOK_ART = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256">
  <rect width="256" height="256" fill="white"/>
  <path
    d="M52 46v168"
    fill="none"
    stroke="#1a1a1a"
    stroke-width="6"
    stroke-linecap="round"
  />
  <path
    d="M68 42 198 34 212 210 68 218Z"
    fill="none"
    stroke="#1a1a1a"
    stroke-width="6"
    stroke-linecap="round"
    stroke-linejoin="round"
  />
  <path
    d="M86 64v152"
    fill="none"
    stroke="#1a1a1a"
    stroke-width="5"
    stroke-linecap="round"
  />
  <path
    d="M96 66 176 58 184 186 102 192Z"
    fill="none"
    stroke="#1a1a1a"
    stroke-width="4.5"
    stroke-linecap="round"
    stroke-linejoin="round"
  />
  <path
    d="M52 86h18M52 128h18M52 170h18"
    fill="none"
    stroke="#1a1a1a"
    stroke-width="4.5"
    stroke-linecap="round"
  />
  <path
    d="M204 70 222 67M206 108 224 105M208 146 226 143M210 184 228 181"
    fill="none"
    stroke="#1a1a1a"
    stroke-width="4"
    stroke-linecap="round"
  />
  <path
    d="M100 70v20h18M158 64v20h18"
    fill="none"
    stroke="#1a1a1a"
    stroke-width="4"
    stroke-linecap="round"
    stroke-linejoin="round"
  />
  <path
    d="M128 88v72M112 122h32"
    fill="none"
    stroke="#1a1a1a"
    stroke-width="4.5"
    stroke-linecap="round"
  />
  <path
    d="M128 88 128 76"
    fill="none"
    stroke="#1a1a1a"
    stroke-width="4"
    stroke-linecap="round"
  />
  <path
    d="M170 48 178 53M98 206 105 211"
    fill="none"
    stroke="#1a1a1a"
    stroke-width="3.5"
    stroke-linecap="round"
  />
</svg>`;

async function main() {
  fs.mkdirSync(REF_DIR, { recursive: true });
  fs.mkdirSync(path.dirname(OUT), { recursive: true });

  const { data, info } = await sharp(Buffer.from(BOOK_ART))
    .png()
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  processSilhouetteBuffer(data, info.width, info.height, 2);

  const png = await sharp(Buffer.from(data), {
    raw: { width: info.width, height: info.height, channels: 4 },
  })
    .trim({ threshold: 1 })
    .resize(256, 256, {
      fit: "contain",
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    })
    .png({ compressionLevel: 9, palette: true })
    .toBuffer();

  const refOut = path.join(REF_DIR, "book-source.png");
  fs.writeFileSync(refOut, png);

  const base64 = png.toString("base64");
  const svg = [
    `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 24 24" fill="none">`,
    `  <title>book</title>`,
    `  <image width="24" height="24" preserveAspectRatio="xMidYMid meet" href="data:image/png;base64,${base64}"/>`,
    `</svg>`,
    "",
  ].join("\n");

  fs.writeFileSync(OUT, svg, "utf8");
  console.log("wrote", path.relative(ROOT, OUT));
  console.log("wrote", path.relative(ROOT, refOut));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
