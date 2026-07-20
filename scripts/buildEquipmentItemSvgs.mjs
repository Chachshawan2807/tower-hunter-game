/**
 * Build equipment item icons from split reference PNGs.
 * Uses the same silhouette + stroke dilation pipeline as equipment slot icons.
 *
 * Run: npm run export:equip-items
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import sharp from "sharp";
import { processSilhouetteBuffer, SHOP_ITEM_STROKE_DILATE } from "./iconSilhouette.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const REF_DIR = path.join(ROOT, "docs", "art", "equipment-items", "reference");
const OUT_DIR = path.join(ROOT, "public", "icons", "equipment-items");

const SKIP_PNG = new Set(["equipment-sheet.png"]);

function listItemPngs() {
  return fs
    .readdirSync(REF_DIR)
    .filter((name) => name.endsWith(".png") && !SKIP_PNG.has(name))
    .sort((a, b) => a.localeCompare(b));
}

async function processItem(name) {
  const baseName = path.basename(name, ".png");
  const source = path.join(REF_DIR, name);

  const { data, info } = await sharp(source).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  processSilhouetteBuffer(data, info.width, info.height, SHOP_ITEM_STROKE_DILATE);

  const png = await sharp(Buffer.from(data), {
    raw: { width: info.width, height: info.height, channels: 4 },
  })
    .trim({ threshold: 1 })
    .resize(256, 256, {
      fit: "contain",
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    })
    .png({ compressionLevel: 9, palette: false })
    .toBuffer();

  const base64 = png.toString("base64");
  const svg = [
    `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 24 24" fill="none">`,
    `  <title>${baseName}</title>`,
    `  <image width="24" height="24" preserveAspectRatio="xMidYMid meet" href="data:image/png;base64,${base64}"/>`,
    `</svg>`,
    "",
  ].join("\n");

  fs.mkdirSync(OUT_DIR, { recursive: true });
  const outPath = path.join(OUT_DIR, `${baseName}.svg`);
  fs.writeFileSync(outPath, svg, "utf8");
  console.log("wrote", path.relative(ROOT, outPath));
}

async function main() {
  const items = listItemPngs();
  if (items.length === 0) {
    throw new Error(`No item PNGs found in ${REF_DIR}. Run npm run split:equipment-sheet first.`);
  }

  for (const name of items) {
    await processItem(name);
  }

  console.log(`\nBuilt ${items.length} equipment item SVGs (ink-shaded hero armor pipeline).`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
