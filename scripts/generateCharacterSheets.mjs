/**
 * Generates heroic character sprite sheets (Art Bible §06 — 7.5–8 heads)
 * Run: npm run generate:sprites
 * Modular templates: scripts/character-sprites/
 */

import { writeFileSync, mkdirSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";
import { BODIES } from "./character-sprites/bodies/index.mjs";
import { defs } from "./character-sprites/defs.mjs";
import { ROW_ANIMS } from "./character-sprites/poses.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT = join(__dirname, "../public/assets/characters");
const SPRITE_SCALE = 2;
const SHEET_W = 480 * SPRITE_SCALE;
const SHEET_H = 800 * SPRITE_SCALE;

const SHEETS = [
  ["murim-sheet", "murim"],
  ["knight-sheet", "knight"],
  ["fantasy-sheet", "fantasy"],
  ["beast-sheet", "beast"],
  ["demon-sheet", "demon"],
  ["merchant-sheet", "merchant"],
  ["villager-sheet", "villager"],
];

function buildSheet(fileName, bodyKey) {
  const id = bodyKey.slice(0, 2);
  const bodyFn = BODIES[bodyKey];
  if (!bodyFn) throw new Error(`Unknown body: ${bodyKey}`);

  let frames = "";
  for (let row = 0; row < 4; row++) {
    for (let col = 0; col < 4; col++) {
      const a = ROW_ANIMS[row][col];
      const tx = col * 120 + (a.dx ?? 0);
      const ty = row * 200 + (a.dy ?? 0);
      const rot = a.rot ? ` rotate(${a.rot} 60 100)` : "";
      const op = a.op !== undefined ? ` opacity="${a.op}"` : "";
      frames += `  <g transform="translate(${tx},${ty})${rot}"${op}>\n${bodyFn(id)}\n  </g>\n`;
    }
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 480 800" width="480" height="800">
${defs(id)}
${frames}</svg>`;
}

mkdirSync(OUT, { recursive: true });

for (const [file, body] of SHEETS) {
  const svgPath = join(OUT, `${file}.svg`);
  writeFileSync(svgPath, buildSheet(file, body), "utf8");
  console.log(`Wrote ${file}.svg`);

  const pngPath = join(OUT, `${file}.png`);
  await sharp(readFileSync(svgPath), { density: 72 * SPRITE_SCALE })
    .resize(SHEET_W, SHEET_H, { fit: "fill" })
    .png({ compressionLevel: 9 })
    .toFile(pngPath);
  console.log(`Wrote ${file}.png (${SHEET_W}×${SHEET_H})`);
}

console.log(`Done — ${SHEETS.length} heroic sheets at ${SPRITE_SCALE}× PNG.`);
