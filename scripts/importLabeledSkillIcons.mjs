/**
 * Import per-skill PNG uploads (caption at bottom) → public/icons/skills/{iconId}.svg
 *
 *   node scripts/importLabeledSkillIcons.mjs [assetsDir]
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import sharp from "sharp";
import {
  bufferToSkillPng,
  MAX_SVG_PNG_BASE64_LEN,
  stripLabelBand,
  wrapSvg,
} from "./skillIconProcess.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const OUT = path.join(ROOT, "public", "icons", "skills");
const DEFAULT_ASSETS = path.resolve(
  ROOT,
  "..",
  "..",
  "Users",
  "chach",
  ".cursor",
  "projects",
  "c-Projects-tower-hunter-game",
  "assets"
);

/** iconId → unique fragment in uploaded filename (Sep 2026 batch). */
const LABELED_SOURCES = {
  basic_attack: "image-efce8725",
  active_iron_palm: "image-776afa09",
  active_arcane_bolt: "image-70a272f5",
  active_inner_qi: "image-db735985",
  active_holy_light: "image-3fe68f14",
  active_dragon_fist: "image-d014d1ca",
  active_meteor: "image-77ef6d3e",
  passive_sturdy_frame: "image-94a2afd4",
  passive_blade_mastery: "image-98d15fd4",
  passive_arcane_mind: "image-80a57feb",
  passive_swift_feet: "image-725f2be1",
  passive_keen_eye: "image-23c2567f",
  passive_guardian_aura: "image-544e087e",
  passive_brutal_strikes: "image-6b0dc7bf",
  cc_shield_bash: "image-6a059f87",
  cc_frost_nova: "image-c837a19c",
  cc_silencing_word: "image-292337fc",
  cc_hamstring: "image-a606b285",
  move_shadow_step: "image-74ae2b4e",
  move_dodge_roll: "image-01cc48ac",
  move_cavalry_charge: "image-ef74ffc6",
  move_flash_step: "image-22338e45",
};

const ROW_COLS = [7, 7, 7, 5];
const SHEET_LABEL_BAND = 0.32;
const CELL_INSET_X = 0.1;
const CELL_INSET_TOP = 0.04;

function resolveAsset(assetsDir, fragment) {
  const name = fs
    .readdirSync(assetsDir)
    .find((f) => f.includes(fragment) && /\.(png|jpe?g)$/i.test(f));
  if (!name) throw new Error(`Missing asset matching "${fragment}" in ${assetsDir}`);
  return path.join(assetsDir, name);
}

function sheetRect(row, col, width, height) {
  const rows = ROW_COLS.length;
  const rowH = height / rows;
  const cols = ROW_COLS[row];
  const cellW = width / cols;
  const left0 = Math.floor(col * cellW);
  const top0 = Math.floor(row * rowH + rowH * CELL_INSET_TOP);
  const padX = Math.floor(cellW * CELL_INSET_X);
  const iconH = Math.floor(rowH * (1 - SHEET_LABEL_BAND - CELL_INSET_TOP));
  return {
    left: left0 + padX,
    top: top0,
    width: Math.max(1, Math.floor(cellW - padX * 2)),
    height: Math.max(1, iconH),
  };
}

async function loadFromSheet(sheetPath, row, col) {
  const sheetBuffer = fs.readFileSync(sheetPath);
  const { width, height } = await sharp(sheetBuffer).metadata();
  const rect = sheetRect(row, col, width, height);
  return sharp(sheetBuffer).extract(rect).png().toBuffer();
}

async function importOne(iconId, sourceBuffer, labelBand = 0.28) {
  const cropped = await stripLabelBand(sourceBuffer, labelBand);
  const png = await bufferToSkillPng(await cropped.png().toBuffer());
  const b64 = png.toString("base64");
  fs.writeFileSync(path.join(OUT, `${iconId}.svg`), wrapSvg(b64, iconId), "utf8");
  fs.writeFileSync(path.join(OUT, "_cells", `${iconId}.png`), png);
  console.log(`✓ ${iconId}`);
}

async function main() {
  const assetsDir = process.argv[2]
    ? path.resolve(process.argv[2])
    : DEFAULT_ASSETS;
  if (!fs.existsSync(assetsDir)) {
    console.error("Assets dir not found:", assetsDir);
    process.exit(1);
  }

  fs.mkdirSync(path.join(OUT, "_cells"), { recursive: true });

  const sheetPath = resolveAsset(
    assetsDir,
    "ChatGPT_Image_23"
  );

  for (const [iconId, fragment] of Object.entries(LABELED_SOURCES)) {
    const file = resolveAsset(assetsDir, fragment);
    const band = iconId === "active_inner_qi" ? 0.34 : 0.28;
    await importOne(iconId, fs.readFileSync(file), band);
  }

  const powerSlash = await loadFromSheet(sheetPath, 0, 1);
  await importOne("active_power_slash", powerSlash, 0);

  console.log(`\nImported ${Object.keys(LABELED_SOURCES).length + 1} icons → ${OUT}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
