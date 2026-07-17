/**
 * Build equipment slot icons from reference PNGs.
 * Uses the same silhouette + stroke dilation pipeline as nav buttons (iconSilhouette.mjs).
 *
 * Run: node scripts/buildEquipmentSlotSvgs.mjs
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import sharp from "sharp";
import { processSilhouetteBuffer, EQUIP_STROKE_DILATE } from "./iconSilhouette.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const REF_DIR = path.join(ROOT, "docs", "art", "equipment-slots", "reference");
const EQUIP_OUT = path.join(ROOT, "public", "icons", "equipment-slots");
const UI_OUT = path.join(ROOT, "public", "icons", "ui");

const SLOTS = ["slot-helm", "slot-chest", "slot-weapon", "slot-gloves", "slot-boots", "slot-cloak"];

async function processSlot(name) {
  const source = path.join(REF_DIR, `${name}.png`);
  if (!fs.existsSync(source)) {
    throw new Error(`Missing reference PNG: ${source}`);
  }

  const { data, info } = await sharp(source).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  processSilhouetteBuffer(data, info.width, info.height, EQUIP_STROKE_DILATE);

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
    `  <title>${name}</title>`,
    `  <image width="24" height="24" preserveAspectRatio="xMidYMid meet" href="data:image/png;base64,${base64}"/>`,
    `</svg>`,
    "",
  ].join("\n");

  for (const dir of [EQUIP_OUT, UI_OUT]) {
    fs.mkdirSync(dir, { recursive: true });
    const outPath = path.join(dir, `${name}.svg`);
    fs.writeFileSync(outPath, svg, "utf8");
    console.log("wrote", path.relative(ROOT, outPath));
  }
}

async function main() {
  for (const slot of SLOTS) {
    await processSlot(slot);
  }
  console.log(`\nBuilt ${SLOTS.length} equipment slot SVGs (ink-shaded hero armor pipeline).`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
