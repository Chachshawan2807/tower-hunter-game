/**
 * Split nav-button reference sheet into individual transparent SVGs.
 * Style matches equipment-slots (raster-in-SVG, viewBox 24×24).
 *
 * Layout (3×2 grid, bottom-right cell empty):
 *   character | skills | tower
 *   bag       | shop   |
 *
 * Run: node scripts/buildNavButtonSvgs.mjs
 */
import fs from "fs";
import { homedir } from "node:os";
import path from "path";
import { fileURLToPath } from "url";
import sharp from "sharp";
import { isBackground, processSilhouetteBuffer } from "./iconSilhouette.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const REF_DIR = path.join(ROOT, "docs", "art", "ui-icons", "reference");
const OUT = path.join(ROOT, "public", "icons", "ui");

const SOURCE_CANDIDATES = [
  path.join(REF_DIR, "nav-buttons-sheet.png"),
  path.join(
    homedir(),
    ".cursor",
    "projects",
    "c-Projects-tower-hunter-game",
    "assets",
    "c__Users_chach_AppData_Roaming_Cursor_User_workspaceStorage_5dfea47b5f797cb8406d25a5ec294443_images_ChatGPT_Image_16__._._2569_22_40_16-df1e531a-589d-409d-8787-683380a23143.png"
  ),
];

/** @type {Array<{ name: string, col: number, row: number }>} */
/** Sheet cells — bag/shop use standalone art via buildBagIconSvg / buildShopIconSvg */
const CELLS = [
  { name: "character", col: 0, row: 0 },
  { name: "skills", col: 1, row: 0 },
  { name: "tower", col: 2, row: 0 },
];

const MARGIN_X = 0.04;
const MARGIN_Y = 0.05;
const COLS = 3;
const ROWS = 2;

async function stripBackground(buffer) {
  const { data, info } = await sharp(buffer).ensureAlpha().raw().toBuffer({ resolveWithObject: true });

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    if (isBackground(r, g, b)) {
      data[i + 3] = 0;
    }
  }

  processSilhouetteBuffer(data, info.width, info.height);

  return sharp(Buffer.from(data), {
    raw: { width: info.width, height: info.height, channels: 4 },
  })
    .trim({ threshold: 1 })
    .resize(256, 256, {
      fit: "contain",
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    })
    .png({ compressionLevel: 9, palette: true })
    .toBuffer();
}

async function cropCell(sourcePath, col, row, width, height) {
  const usableW = width * (1 - MARGIN_X * 2);
  const usableH = height * (1 - MARGIN_Y * 2);
  const cellW = usableW / COLS;
  const cellH = usableH / ROWS;
  const left = Math.round(width * MARGIN_X + col * cellW);
  const top = Math.round(height * MARGIN_Y + row * cellH);
  const cropW = Math.round(cellW);
  const cropH = Math.round(cellH);

  return sharp(sourcePath)
    .extract({ left, top, width: cropW, height: cropH })
    .png()
    .toBuffer();
}

async function toSvg(name, pngBuffer, outputPath) {
  const base64 = pngBuffer.toString("base64");
  const svg = [
    `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 24 24" fill="none">`,
    `  <title>${name}</title>`,
    `  <image width="24" height="24" preserveAspectRatio="xMidYMid meet" href="data:image/png;base64,${base64}"/>`,
    `</svg>`,
    "",
  ].join("\n");
  fs.writeFileSync(outputPath, svg, "utf8");
}

async function main() {
  const source = SOURCE_CANDIDATES.find((p) => fs.existsSync(p));
  if (!source) {
    throw new Error(`Missing reference sheet. Place PNG at ${SOURCE_CANDIDATES[0]}`);
  }

  fs.mkdirSync(REF_DIR, { recursive: true });
  fs.mkdirSync(OUT, { recursive: true });

  const meta = await sharp(source).metadata();
  const width = meta.width ?? 1024;
  const height = meta.height ?? 682;

  for (const cell of CELLS) {
    const cropped = await cropCell(source, cell.col, cell.row, width, height);
    const png = await stripBackground(cropped);
    const refPng = path.join(REF_DIR, `${cell.name}.png`);
    fs.writeFileSync(refPng, png);
    await toSvg(cell.name, png, path.join(OUT, `${cell.name}.svg`));
    console.log("wrote", path.relative(ROOT, path.join(OUT, `${cell.name}.svg`)));
  }

  const skillsSvg = fs.readFileSync(path.join(OUT, "skills.svg"), "utf8");
  fs.writeFileSync(
    path.join(OUT, "sword-cross.svg"),
    skillsSvg.replace("<title>skills</title>", "<title>sword-cross</title>"),
    "utf8"
  );
  console.log("wrote", "public/icons/ui/sword-cross.svg");

  console.log(`\nBuilt ${CELLS.length} nav button SVGs + sword-cross from reference sheet.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
