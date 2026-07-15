/**
 * Assemble AI Murim masters into runtime 4×4 sheet (960×1600).
 * Run: npm run assemble:murim
 * Masters: docs/art/murim-masters/murim-master-{idle,attack,hit,defeat}.png
 */

import { mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const MASTER_DIR = join(ROOT, "docs/art/murim-masters");
const OUT_PNG = join(ROOT, "public/assets/characters/murim-sheet.png");

const FRAME_W = 240;
const FRAME_H = 400;
const COLS = 4;
const ROWS = 4;
const SHEET_W = FRAME_W * COLS;
const SHEET_H = FRAME_H * ROWS;
/** Target character height inside frame (leaves headroom + foot pad) */
const FIT_H = 372;
const FIT_W = 220;

const MASTERS = {
  idle: join(MASTER_DIR, "murim-master-idle.png"),
  attack: join(MASTER_DIR, "murim-master-attack.png"),
  hit: join(MASTER_DIR, "murim-master-hit.png"),
  defeat: join(MASTER_DIR, "murim-master-defeat.png"),
};

/** Idle bob (dy), attack lean (dx), hit knockback (dx), defeat fade */
const ROW_OFFSETS = [
  [{ dy: 0 }, { dy: -3 }, { dy: -1 }, { dy: -4 }],
  [{ dx: -4 }, { dx: 2 }, { dx: 8 }, { dx: 12 }],
  [{ dx: 0 }, { dx: 4 }, { dx: 8 }, { dx: 10 }],
  [{ dy: 2, op: 1 }, { dy: 8, op: 0.85 }, { dy: 16, op: 0.65 }, { dy: 28, op: 0.4 }],
];

async function fitMaster(path) {
  const { data, info } = await sharp(path)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  // Punch solid studio backdrop only (keep dark cloth by requiring near-pure black)
  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    if (r <= 8 && g <= 8 && b <= 8) data[i + 3] = 0;
  }

  const cleared = await sharp(data, {
    raw: { width: info.width, height: info.height, channels: 4 },
  })
    .png()
    .toBuffer();

  const trimmed = await sharp(cleared)
    .trim({ threshold: 8 })
    .ensureAlpha()
    .toBuffer({ resolveWithObject: true });

  return sharp(trimmed.data)
    .resize(FIT_W, FIT_H, {
      fit: "inside",
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    })
    .ensureAlpha()
    .toBuffer({ resolveWithObject: true });
}

async function placeInFrame(fitted, { dx = 0, dy = 0, op = 1 } = {}) {
  let img = fitted.data;
  if (op < 1) {
    img = await sharp(fitted.data)
      .ensureAlpha()
      .linear([1, 1, 1, op], [0, 0, 0, 0])
      .toBuffer();
  }

  const meta = await sharp(img).metadata();
  const w = meta.width ?? fitted.info.width;
  const h = meta.height ?? fitted.info.height;
  const left = Math.round((FRAME_W - w) / 2 + dx);
  const top = Math.round(FRAME_H - h - 8 + dy);

  return sharp({
    create: {
      width: FRAME_W,
      height: FRAME_H,
      channels: 4,
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    },
  })
    .composite([
      {
        input: img,
        left: Math.max(-20, Math.min(FRAME_W - 20, left)),
        top: Math.max(-20, Math.min(FRAME_H - 20, top)),
      },
    ])
    .png()
    .toBuffer();
}

async function main() {
  mkdirSync(dirname(OUT_PNG), { recursive: true });

  const fitted = {
    idle: await fitMaster(MASTERS.idle),
    attack: await fitMaster(MASTERS.attack),
    hit: await fitMaster(MASTERS.hit),
    defeat: await fitMaster(MASTERS.defeat),
  };
  const rowKeys = ["idle", "attack", "hit", "defeat"];

  const composites = [];
  for (let row = 0; row < ROWS; row++) {
    for (let col = 0; col < COLS; col++) {
      const frame = await placeInFrame(fitted[rowKeys[row]], ROW_OFFSETS[row][col]);
      composites.push({
        input: frame,
        left: col * FRAME_W,
        top: row * FRAME_H,
      });
    }
  }

  await sharp({
    create: {
      width: SHEET_W,
      height: SHEET_H,
      channels: 4,
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    },
  })
    .composite(composites)
    .png({ compressionLevel: 9 })
    .toFile(OUT_PNG);

  console.log(`Wrote ${OUT_PNG} (${SHEET_W}×${SHEET_H})`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
