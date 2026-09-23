/**
 * Crop skill icon sheet → public/icons/skills/{iconId}.svg
 *
 *   node scripts/importSkillIconSheet.mjs [sheet.jpg] [--dark-sheet]
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import sharp from "sharp";
import {
  bufferToSkillPng,
} from "./skillIconProcess.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const OUT = path.join(ROOT, "public", "icons", "skills");
const DEFAULT_SHEET = path.join(OUT, "skill-icon-sheet.jpg");
/** Upscale small sheets before crop (more source pixels → sharper icons). */
const SHEET_TARGET_WIDTH = 2048;

const ROW_COLS = [7, 7, 7, 5];

/** Labeled parchment sheets (text band at bottom of each row). */
const LABELED_LABEL_BAND = 0.3;
const LABELED_INSET_X = 0.06;
const LABELED_INSET_TOP = 0.03;

/** White-on-black sheet (1024×682): square cells, no captions. */
const DARK_LABEL_BAND = 0;
const DARK_INSET_X = 0.04;
const DARK_INSET_TOP = 0.06;

/**
 * White sheet layout — matched to prior skill semantics (23 unique cells).
 * Row2 c0–c1 empty; meteor uses knight+ sword (r1c3); shadow uses helm visor (r2c6).
 */
export const SKILL_SLOTS = {
  basic_attack: { row: 0, col: 0 },
  active_power_slash: { row: 0, col: 1 },
  active_iron_palm: { row: 0, col: 2 },
  active_arcane_bolt: { row: 0, col: 3 },
  active_inner_qi: { row: 0, col: 4 },
  active_holy_light: { row: 0, col: 5 },
  active_dragon_fist: { row: 0, col: 6 },
  active_meteor: { row: 1, col: 3 },
  passive_sturdy_frame: { row: 1, col: 2 },
  passive_blade_mastery: { row: 1, col: 4 },
  passive_arcane_mind: { row: 1, col: 5 },
  passive_swift_feet: { row: 1, col: 6 },
  passive_keen_eye: { row: 2, col: 0 },
  passive_guardian_aura: { row: 2, col: 1 },
  passive_brutal_strikes: { row: 2, col: 2 },
  cc_shield_bash: { row: 2, col: 3 },
  cc_frost_nova: { row: 2, col: 4 },
  cc_silencing_word: { row: 2, col: 5 },
  cc_hamstring: { row: 3, col: 0 },
  move_shadow_step: { row: 2, col: 6 },
  move_dodge_roll: { row: 3, col: 2 },
  move_cavalry_charge: { row: 3, col: 3 },
  move_flash_step: { row: 3, col: 4 },
};

function cellRect(row, col, width, height, darkSheet) {
  const labelBand = darkSheet ? DARK_LABEL_BAND : LABELED_LABEL_BAND;
  const insetX = darkSheet ? DARK_INSET_X : LABELED_INSET_X;
  const insetTop = darkSheet ? DARK_INSET_TOP : LABELED_INSET_TOP;
  const rows = ROW_COLS.length;
  const rowH = height / rows;
  const cols = ROW_COLS[row];
  const cellW = width / cols;
  const left0 = Math.floor(col * cellW);
  const top0 = Math.floor(row * rowH + rowH * insetTop);
  const padX = Math.floor(cellW * insetX);
  const iconH = Math.floor(rowH * (1 - labelBand - insetTop));
  const innerW = Math.max(1, Math.floor(cellW - padX * 2));
  const innerH = Math.max(1, iconH);
  const size = Math.min(innerW, innerH);
  const cx = left0 + padX + innerW / 2;
  const cy = top0 + innerH / 2;
  return {
    left: Math.max(0, Math.floor(cx - size / 2)),
    top: Math.max(0, Math.floor(cy - size / 2)),
    width: size,
    height: size,
  };
}

function assertSlots() {
  const ids = Object.keys(SKILL_SLOTS);
  if (ids.length !== 23) {
    throw new Error(`Expected 23 skill slots, got ${ids.length}`);
  }
  const seen = new Set();
  for (const [id, { row, col }] of Object.entries(SKILL_SLOTS)) {
    const key = `${row}:${col}`;
    if (seen.has(key)) throw new Error(`Duplicate slot ${key} for ${id}`);
    seen.add(key);
    if (col >= ROW_COLS[row]) {
      throw new Error(`Col ${col} out of range for row ${row} (${id})`);
    }
  }
}

async function tileToPng(inputBuffer, rect, darkSheet) {
  const crop = await sharp(inputBuffer).extract(rect).png().toBuffer();
  return bufferToSkillPng(crop, {
    inkMode: darkSheet ? "dark" : "paper",
  });
}

async function main() {
  assertSlots();
  const darkSheet = process.argv.includes("--dark-sheet");
  const sheetArg = process.argv.find(
    (a) => !a.startsWith("--") && /\.(jpg|jpeg|png)$/i.test(a)
  );
  const sheetPath = sheetArg ? path.resolve(sheetArg) : DEFAULT_SHEET;

  if (!fs.existsSync(sheetPath)) {
    console.error("Sheet not found:", sheetPath);
    process.exit(1);
  }

  fs.mkdirSync(OUT, { recursive: true });
  let sheetBuffer = await sharp(fs.readFileSync(sheetPath)).png().toBuffer();
  const meta0 = await sharp(sheetBuffer).metadata();
  if (meta0.width && meta0.width < SHEET_TARGET_WIDTH) {
    sheetBuffer = await sharp(sheetBuffer)
      .resize(SHEET_TARGET_WIDTH, null, {
        kernel: sharp.kernel.lanczos3,
      })
      .png()
      .toBuffer();
  }
  const { width, height } = await sharp(sheetBuffer).metadata();
  if (!width || !height) throw new Error("Could not read sheet dimensions");

  fs.copyFileSync(sheetPath, DEFAULT_SHEET);

  const debugDir = path.join(OUT, "_cells");
  fs.mkdirSync(debugDir, { recursive: true });

  for (const [iconId, slot] of Object.entries(SKILL_SLOTS)) {
    const rect = cellRect(slot.row, slot.col, width, height, darkSheet);
    const png = await tileToPng(sheetBuffer, rect, darkSheet);
    fs.writeFileSync(path.join(OUT, `${iconId}.png`), png);
    fs.writeFileSync(path.join(debugDir, `${iconId}.png`), png);

    const legacySvg = path.join(OUT, `${iconId}.svg`);
    if (fs.existsSync(legacySvg)) fs.unlinkSync(legacySvg);

    console.log(
      `${iconId} ← r${slot.row}c${slot.col} (${rect.width}×${rect.height})`
    );
  }

  console.log(`\nImported ${Object.keys(SKILL_SLOTS).length} icons → ${OUT}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
