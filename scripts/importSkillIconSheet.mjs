/**
 * Slice Imperial Knight skill icon sheet → public/icons/skills/{iconId}.svg
 *
 * Sheet layout: 8×4 grid, 28 icons (row 4 has icons in columns 0–3 only).
 * Icon numbers in comments are 1-based (top-left = 1, index 0).
 *
 * Usage:
 *   node scripts/importSkillIconSheet.mjs [sheet.jpg]
 *   node scripts/importSkillIconSheet.mjs --debug-cells   # export public/icons/skills/_cells/
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import sharp from "sharp";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const OUT = path.join(ROOT, "public", "icons", "skills");
const DEFAULT_SHEET = path.join(OUT, "skill-icon-sheet.jpg");

const COLS = 8;
const ROWS = 4;
/** Trim neighbor bleed from 8×4 grid gutters */
const CELL_INSET = 0.22;
const OUTPUT_SIZE = 384;
/** Default scale art down inside square (overridden per skill in SKILL_ICON_CONFIG). */
const ARTWORK_SCALE = 0.78;
/** Single-pass 4-neighbor erosion thins bold sheet strokes toward art-bible weight. */
const INK_ERODE_PASSES = 1;

/**
 * Player skill iconId → sheet cell + per-icon framing.
 * Must cover exactly 23 ids (basic_attack + catalog). Each cell index unique.
 */
const SKILL_ICON_CONFIG = {
  basic_attack: { cell: 3, scale: 0.82, note: "Static sword — default strike" },
  active_power_slash: { cell: 0, scale: 0.76, note: "Diagonal slash + motion" },
  active_iron_palm: { cell: 11, scale: 0.8, note: "Armored gauntlet — palm strike" },
  active_arcane_bolt: { cell: 18, scale: 0.74, note: "Lightning orb" },
  active_inner_qi: { cell: 20, scale: 0.68, note: "Lion banner — rally ATK" },
  active_holy_light: { cell: 17, scale: 0.68, note: "Holy heart + wings — heal" },
  active_dragon_fist: { cell: 12, scale: 0.74, note: "Spiked power punch — ultimate" },
  active_meteor: { cell: 19, scale: 0.72, note: "Meteor shower" },
  passive_sturdy_frame: { cell: 8, scale: 0.72, note: "Full plate armor" },
  passive_blade_mastery: { cell: 1, scale: 0.76, note: "Horizontal blade swing" },
  passive_arcane_mind: { cell: 22, scale: 0.78, note: "Brain in helm — MP" },
  passive_swift_feet: { cell: 21, scale: 0.74, note: "Winged sword — speed" },
  passive_keen_eye: { cell: 14, scale: 0.8, note: "Helm crosshair — crit/acc" },
  passive_guardian_aura: { cell: 23, scale: 0.72, note: "Shield + aura rings" },
  passive_brutal_strikes: { cell: 5, scale: 0.76, note: "Bloody axe — crit dmg" },
  cc_shield_bash: { cell: 10, scale: 0.78, note: "Shield block impact — stun" },
  cc_frost_nova: { cell: 7, scale: 0.74, note: "Arcane burst (no ice cell) — freeze" },
  cc_silencing_word: { cell: 15, scale: 0.78, note: "Helm shout — silence" },
  cc_hamstring: { cell: 24, scale: 0.7, note: "Leg hamstring" },
  move_shadow_step: { cell: 26, scale: 0.76, note: "Sprint B — quick step" },
  move_dodge_roll: { cell: 25, scale: 0.76, note: "Sprint A — evade" },
  move_cavalry_charge: { cell: 6, scale: 0.74, note: "Hammer slam — heavy charge" },
  move_flash_step: { cell: 27, scale: 0.76, note: "Starburst — gauge flash" },
};

const EXPECTED_SKILL_ICON_IDS = [
  "basic_attack",
  ...[
    "active_power_slash",
    "active_iron_palm",
    "active_arcane_bolt",
    "active_inner_qi",
    "active_holy_light",
    "active_dragon_fist",
    "active_meteor",
  ],
  ...[
    "passive_sturdy_frame",
    "passive_blade_mastery",
    "passive_arcane_mind",
    "passive_swift_feet",
    "passive_keen_eye",
    "passive_guardian_aura",
    "passive_brutal_strikes",
  ],
  ...["cc_shield_bash", "cc_frost_nova", "cc_silencing_word", "cc_hamstring"],
  ...[
    "move_shadow_step",
    "move_dodge_roll",
    "move_cavalry_charge",
    "move_flash_step",
  ],
];

/** Reference labels for cells 0–27 (matches attached sprite sheet). */
export const CELL_LABELS = [
  "01 slash diagonal",
  "02 slash horizontal",
  "03 sword impact",
  "04 static sword",
  "05 drip dagger",
  "06 bloody axe",
  "07 hammer slam",
  "08 spinning hammer",
  "09 plate armor",
  "10 axe on shield",
  "11 shield block",
  "12 gauntlet",
  "13 power punch",
  "14 helm heal +",
  "15 helm crosshair",
  "16 helm shout",
  "17 cross wings",
  "18 heart holy",
  "19 lightning orb",
  "20 meteors",
  "21 lion banner",
  "22 winged sword",
  "23 brain helm",
  "24 shield aura",
  "25 hamstring",
  "26 sprint A",
  "27 sprint B",
  "28 starburst",
];

function assertSkillIconConfig() {
  const keys = Object.keys(SKILL_ICON_CONFIG);
  if (keys.length !== EXPECTED_SKILL_ICON_IDS.length) {
    throw new Error(
      `SKILL_ICON_CONFIG has ${keys.length} entries, expected ${EXPECTED_SKILL_ICON_IDS.length}`
    );
  }
  for (const id of EXPECTED_SKILL_ICON_IDS) {
    if (!SKILL_ICON_CONFIG[id]) {
      throw new Error(`Missing SKILL_ICON_CONFIG for ${id}`);
    }
  }
  const cells = keys.map((id) => SKILL_ICON_CONFIG[id].cell);
  if (new Set(cells).size !== cells.length) {
    throw new Error("Duplicate sheet cells in SKILL_ICON_CONFIG");
  }
}

function cellRect(index, width, height, inset = CELL_INSET) {
  const col = index % COLS;
  const row = Math.floor(index / COLS);
  const cellW = width / COLS;
  const cellH = height / ROWS;
  const left0 = Math.floor(col * cellW);
  const top0 = Math.floor(row * cellH);
  const right =
    col === COLS - 1 ? width : Math.floor((col + 1) * cellW);
  const bottom =
    row === ROWS - 1 ? height : Math.floor((row + 1) * cellH);
  const rawW = Math.max(1, right - left0);
  const rawH = Math.max(1, bottom - top0);
  const padX = Math.floor(rawW * inset);
  const padY = Math.floor(rawH * inset);
  return {
    left: left0 + padX,
    top: top0 + padY,
    width: Math.max(1, rawW - padX * 2),
    height: Math.max(1, rawH - padY * 2),
  };
}

function isChecker(r, g, b) {
  const lum = (r + g + b) / 3;
  const chroma = Math.max(r, g, b) - Math.min(r, g, b);
  return lum >= 165 && chroma <= 32;
}

function rgbaFromTile(data, width, height) {
  const out = Buffer.alloc(width * height * 4);
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const i = (y * width + x) * 4;
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      const o = (y * width + x) * 4;
      if (isChecker(r, g, b)) {
        out[o + 3] = 0;
        continue;
      }
      const lum = (r + g + b) / 3;
      const max = Math.max(r, g, b);
      const min = Math.min(r, g, b);
      const isInk =
        lum < 108 || (max - min < 38 && lum < 162 && lum > 45);
      out[o] = 26;
      out[o + 1] = 26;
      out[o + 2] = 26;
      out[o + 3] = isInk ? 255 : 0;
    }
  }
  return erodeInkAlpha(out, width, height, INK_ERODE_PASSES);
}

function erodeInkAlpha(rgba, width, height, passes) {
  let buf = rgba;
  const neighbors = [
    [-1, 0],
    [1, 0],
    [0, -1],
    [0, 1],
  ];
  for (let pass = 0; pass < passes; pass++) {
    const src = buf;
    const next = Buffer.alloc(width * height * 4);
    src.copy(next);
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const o = (y * width + x) * 4;
        if (src[o + 3] === 0) continue;
        let core = true;
        for (const [dx, dy] of neighbors) {
          const nx = x + dx;
          const ny = y + dy;
          if (nx < 0 || ny < 0 || nx >= width || ny >= height) {
            core = false;
            break;
          }
          if (src[(ny * width + nx) * 4 + 3] === 0) {
            core = false;
            break;
          }
        }
        if (!core) next[o + 3] = 0;
      }
    }
    buf = next;
  }
  return buf;
}

async function tileToPng(inputBuffer, rect, options = {}) {
  const scale =
    typeof options.scale === "number" ? options.scale : ARTWORK_SCALE;
  const { data, info } = await sharp(inputBuffer)
    .extract(rect)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const rgba = rgbaFromTile(data, info.width, info.height);

  const inner = Math.max(1, Math.round(OUTPUT_SIZE * scale));

  const trimmed = await sharp(rgba, {
    raw: { width: info.width, height: info.height, channels: 4 },
  })
    .trim({ threshold: 12 })
    .resize(inner, inner, {
      fit: "contain",
      background: { r: 0, g: 0, b: 0, alpha: 0 },
      kernel: sharp.kernel.lanczos3,
    })
    .png()
    .toBuffer();

  return sharp({
    create: {
      width: OUTPUT_SIZE,
      height: OUTPUT_SIZE,
      channels: 4,
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    },
  })
    .composite([{ input: trimmed, gravity: "center" }])
    .png()
    .toBuffer();
}

function wrapSvg(pngBase64, iconId) {
  return [
    `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 24 24">`,
    `  <!-- ${iconId} -->`,
    `  <image width="24" height="24" preserveAspectRatio="xMidYMid meet" href="data:image/png;base64,${pngBase64}"/>`,
    `</svg>`,
    "",
  ].join("\n");
}

async function exportDebugCells(sheetBuffer, width, height) {
  const dir = path.join(OUT, "_cells");
  fs.mkdirSync(dir, { recursive: true });
  for (let index = 0; index < 28; index++) {
    const rect = cellRect(index, width, height);
    const png = await tileToPng(sheetBuffer, rect);
    const label = CELL_LABELS[index]?.replace(/\s+/g, "-") ?? "cell";
    fs.writeFileSync(
      path.join(dir, `${String(index).padStart(2, "0")}-${label}.png`),
      png
    );
  }
  console.log("Debug cells → public/icons/skills/_cells/");
}

async function main() {
  assertSkillIconConfig();
  const debugOnly = process.argv.includes("--debug-cells");
  const sheetArg = process.argv.find(
    (a) => !a.startsWith("--") && a.endsWith(".jpg")
  );
  const sheetPath = sheetArg
    ? path.resolve(sheetArg)
    : DEFAULT_SHEET;

  if (!fs.existsSync(sheetPath)) {
    console.error("Sheet not found:", sheetPath);
    process.exit(1);
  }

  fs.mkdirSync(OUT, { recursive: true });
  const sheetBuffer = fs.readFileSync(sheetPath);
  const { width, height } = await sharp(sheetBuffer).metadata();
  if (!width || !height) throw new Error("Could not read sheet dimensions");

  if (path.resolve(sheetPath) !== path.resolve(DEFAULT_SHEET)) {
    fs.copyFileSync(sheetPath, DEFAULT_SHEET);
  }

  if (debugOnly) {
    await exportDebugCells(sheetBuffer, width, height);
    return;
  }

  await exportDebugCells(sheetBuffer, width, height);

  for (const [iconId, cfg] of Object.entries(SKILL_ICON_CONFIG)) {
    const cellIndex = cfg.cell;
    const rect = cellRect(cellIndex, width, height, cfg.inset ?? CELL_INSET);
    const png = await tileToPng(sheetBuffer, rect, { scale: cfg.scale });
    const b64 = png.toString("base64");
    if (!b64.startsWith("iVBORw0KGgo") || b64.length > 120_000) {
      throw new Error(
        `Bad PNG for ${iconId} (cell ${cellIndex}): len=${b64.length}`
      );
    }
    fs.writeFileSync(
      path.join(OUT, `${iconId}.svg`),
      wrapSvg(b64, iconId),
      "utf8"
    );
    const label = CELL_LABELS[cellIndex] ?? "?";
    console.log(
      `${iconId} ← cell ${cellIndex} (${label}) scale=${cfg.scale ?? ARTWORK_SCALE}`
    );
  }

  console.log(`\nImported ${Object.keys(SKILL_ICON_CONFIG).length} skill icons.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
