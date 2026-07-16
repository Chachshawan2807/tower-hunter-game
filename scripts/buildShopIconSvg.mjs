/**
 * Build SHOP nav icon from standalone reference art (transparent bg, raster-in-SVG).
 * Strips light pixels and normalizes to black silhouette for CSS mask rendering.
 * Run: node scripts/buildShopIconSvg.mjs
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
const OUT = path.join(ROOT, "public", "icons", "ui", "shop.svg");

const SOURCE_CANDIDATES = [
  path.join(REF_DIR, "shop-raw.png"),
  path.join(
    homedir(),
    ".cursor",
    "projects",
    "c-Projects-tower-hunter-game",
    "assets",
    "c__Users_chach_AppData_Roaming_Cursor_User_workspaceStorage_5dfea47b5f797cb8406d25a5ec294443_images_image-bf272ee2-3128-4729-a325-c79e9c834833.png"
  ),
];

async function main() {
  const source = SOURCE_CANDIDATES.find((p) => fs.existsSync(p));
  if (!source) {
    throw new Error(`Missing shop reference. Place PNG at ${SOURCE_CANDIDATES[0]}`);
  }

  fs.mkdirSync(REF_DIR, { recursive: true });
  fs.mkdirSync(path.dirname(OUT), { recursive: true });

  const { data, info } = await sharp(source).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  processSilhouetteBuffer(data, info.width, info.height);

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

  const refOut = path.join(REF_DIR, "shop-source.png");
  fs.writeFileSync(refOut, png);

  const base64 = png.toString("base64");
  const svg = [
    `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 24 24" fill="none">`,
    `  <title>shop</title>`,
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
