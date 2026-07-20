/**
 * Split 5×10 equipment reference sheet into 50 lossless PNGs.
 * Preserves ink + hatching (transparent bg only — no silhouette binarization).
 *
 * Layout (5 cols × 10 rows):
 *   helm | chest | boots | weapon-sword | weapon-sword-cross
 *   shield | gloves | cloak | weapon-axe | weapon-axe-cross
 *
 * Run: npm run split:equipment-sheet
 */
import fs from "fs";
import { homedir } from "node:os";
import path from "path";
import { fileURLToPath, pathToFileURL } from "url";
import sharp from "sharp";
import { isBackground } from "./iconSilhouette.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const REF_DIR = path.join(ROOT, "docs", "art", "equipment-items", "reference");

const SOURCE_CANDIDATES = [
  path.join(REF_DIR, "equipment-sheet.png"),
  path.join(homedir(), "Downloads", "ChatGPT Image 20 ก.ค. 2569 22_15_35.png"),
];

const COLS = 5;

/** Row labels aligned to game equipment slots (+ shield / weapon variants). */
const ROW_PREFIXES = [
  "helm",
  "chest",
  "boots",
  "weapon-sword",
  "weapon-sword-cross",
  "shield",
  "gloves",
  "cloak",
  "weapon-axe",
  "weapon-axe-cross",
];

function inkCountRow(data, width, y) {
  let count = 0;
  for (let x = 0; x < width; x++) {
    const i = (y * width + x) * 4;
    if (!isBackground(data[i], data[i + 1], data[i + 2]) && data[i + 3] > 48) {
      count++;
    }
  }
  return count;
}

/** Find horizontal white gutters between equipment rows. */
export function detectRowBands(data, width, height) {
  const gapThreshold = width * 0.008;
  const separators = [];

  for (let y = 0; y < height; y++) {
    if (inkCountRow(data, width, y) < gapThreshold) {
      const last = separators[separators.length - 1];
      if (last === undefined || y - last > 2) {
        separators.push(y);
      } else {
        separators[separators.length - 1] = y;
      }
    }
  }

  const bands = [];
  for (let i = 0; i < separators.length - 1; i++) {
    const top = separators[i] + 1;
    const bottom = separators[i + 1] - 1;
    if (bottom - top >= 80) {
      bands.push([top, bottom]);
    }
  }

  return refineRowBands(bands, data, width);
}

/** Clip merged sword row before the full-width white gutter above crossed swords. */
function refineRowBands(bands, data, width) {
  return bands.map(([top, bottom], index) => {
    const height = bottom - top + 1;
    if (ROW_PREFIXES[index] !== "weapon-sword" || height <= 190) {
      return [top, bottom];
    }

    for (let y = top + 100; y <= bottom; y++) {
      if (inkCountRow(data, width, y) === 0) {
        return [top, Math.max(top + 80, y - 1)];
      }
    }

    return [top, bottom];
  });
}

function columnBounds(col, width) {
  const left = Math.floor((col * width) / COLS);
  const right = Math.floor(((col + 1) * width) / COLS);
  return { left, width: right - left };
}

async function stripWhiteBackground(buffer) {
  const { data, info } = await sharp(buffer).ensureAlpha().raw().toBuffer({ resolveWithObject: true });

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    if (isBackground(r, g, b)) {
      data[i + 3] = 0;
    }
  }

  return sharp(Buffer.from(data), {
    raw: { width: info.width, height: info.height, channels: 4 },
  })
    .trim({ threshold: 1 })
    .png({ compressionLevel: 9, palette: false })
    .toBuffer();
}

async function splitCell(sourcePath, col, rowBand, sheetW) {
  const [top, bottom] = rowBand;
  const { left, width } = columnBounds(col, sheetW);
  const height = bottom - top + 1;

  const cropped = await sharp(sourcePath)
    .extract({ left, top, width, height })
    .png()
    .toBuffer();

  return stripWhiteBackground(cropped);
}

async function main() {
  const source = SOURCE_CANDIDATES.find((p) => fs.existsSync(p));
  if (!source) {
    throw new Error(`Missing equipment sheet. Place PNG at ${SOURCE_CANDIDATES[0]}`);
  }

  fs.mkdirSync(REF_DIR, { recursive: true });

  const { data, info } = await sharp(source).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const sheetW = info.width ?? 1024;
  const sheetH = info.height ?? 1536;
  const rowBands = detectRowBands(data, sheetW, sheetH);

  if (rowBands.length !== ROW_PREFIXES.length) {
    throw new Error(
      `Expected ${ROW_PREFIXES.length} row bands, detected ${rowBands.length}: ${rowBands
        .map(([t, b]) => `${t}-${b}`)
        .join(", ")}`
    );
  }

  let count = 0;
  for (let row = 0; row < rowBands.length; row++) {
    const prefix = ROW_PREFIXES[row];
    for (let col = 0; col < COLS; col++) {
      const name = `${prefix}-${String(col + 1).padStart(2, "0")}.png`;
      const png = await splitCell(source, col, rowBands[row], sheetW);
      const outPath = path.join(REF_DIR, name);
      fs.writeFileSync(outPath, png);
      console.log("wrote", path.relative(ROOT, outPath));
      count++;
    }
  }

  console.log(
    `\nSplit ${count} equipment icons from ${path.relative(ROOT, source)} (${sheetW}×${sheetH}).`
  );
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
