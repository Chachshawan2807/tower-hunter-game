/**
 * Export Imperial Knight Hero UI icons to public/icons/ui/*.svg
 * Run: node scripts/exportImperialIcons.mjs
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const OUT = path.join(ROOT, "public", "icons", "ui");

/** @type {Record<string, { viewBox: string, paths: string[], fills?: string[], strokes?: string[], strokeWidths?: number[] }>} */
/** Nav buttons (character/skills/tower/bag/shop/sword-cross) come from buildNavButtonSvgs.mjs */
const ICONS = {
  gold: {
    viewBox: "0 0 24 24",
    paths: [
      "M12 3.6a8.4 8.4 0 1 0 0 16.8 8.4 8.4 0 0 0 0-16.8Z",
      "M12 7.2a4.8 4.8 0 1 0 0 9.6 4.8 4.8 0 0 0 0-9.6Z",
      "M12 9.6v4.8M10 11.2h4",
    ],
    strokes: ["#1a1a1a", "#1a1a1a", "#1a1a1a"],
    strokeWidths: [1.85, 1.55, 1.55],
  },
  settings: {
    viewBox: "-1.5 -1.5 27 27",
    paths: [
      "M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z",
      "M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z",
    ],
    strokes: ["#1a1a1a", "#1a1a1a"],
    strokeWidths: [1.55, 1.85],
  },
  close: {
    viewBox: "0 0 24 24",
    paths: ["M5.5 5.5l13 13M18.5 5.5l-13 13"],
    strokes: ["#1a1a1a"],
    strokeWidths: [2.2],
  },
  "path-imperial": {
    viewBox: "0 0 24 24",
    paths: [
      "M12 3.2l7.2 3.6v5.6c0 4.8-3.2 9.2-7.2 10-4-0.8-7.2-5.2-7.2-10V6.8L12 3.2Z",
      "M12 8.8v6.4M9.6 12h4.8",
    ],
    strokes: ["#1a1a1a", "#1a1a1a"],
    strokeWidths: [1.85, 1.55],
  },
  "path-knight": {
    viewBox: "0 0 24 24",
    paths: [
      "M12 2.4l8.8 4.4v6.4c0 5.6-3.6 10.4-8.8 11.2-5.2-.8-8.8-5.6-8.8-11.2V6.8L12 2.4Z",
      "M12 7.2v8.8",
    ],
    strokes: ["#1a1a1a", "#1a1a1a"],
    strokeWidths: [1.85, 1.55],
  },
  "path-vanguard": {
    viewBox: "0 0 24 24",
    paths: ["M12 2.4l2.4 4.8h5.6l-4.4 3.6 1.6 5.6L12 13.6 7.2 16.4l1.6-5.6L4.4 7.2h5.6L12 2.4Z"],
    strokes: ["#1a1a1a"],
    strokeWidths: [1.85],
  },
  lock: {
    viewBox: "0 0 24 24",
    paths: [
      "M7.2 11.2V8.8a4.8 4.8 0 0 1 9.6 0v2.4",
      "M6.4 11.2h11.2v9.6H6.4v-9.6Z",
      "M12 14.4v3.2",
    ],
    strokes: ["#1a1a1a", "#1a1a1a", "#1a1a1a"],
    strokeWidths: [1.85, 1.85, 1.55],
  },
  "skill-spark": {
    viewBox: "0 0 24 24",
    paths: ["M12 2.4l2 6.4H20l-5.2 4 2 6.4L12 17.6 7.2 19.2l2-6.4L4 8.8h6L12 2.4Z"],
    strokes: ["#1a1a1a"],
    strokeWidths: [1.85],
  },
  "skill-sword": {
    viewBox: "0 0 24 24",
    paths: ["M6.4 17.6L12 12l5.6 5.6", "M12 12V3.2", "M10.4 4.8L12 3.2l1.6 1.6"],
    strokes: ["#1a1a1a", "#1a1a1a", "#1a1a1a"],
    strokeWidths: [1.9, 2, 1.7],
  },
  "skill-slash": {
    viewBox: "0 0 24 24",
    paths: ["M4.8 19.2l8-8M12.8 11.2l8-8", "M14.4 9.6l2 2"],
    strokes: ["#1a1a1a", "#1a1a1a"],
    strokeWidths: [2, 1.85],
  },
  "skill-shield": {
    viewBox: "0 0 24 24",
    paths: [
      "M12 2.4l8.8 4.4v6.4c0 5.6-3.6 10.4-8.8 11.2-5.2-.8-8.8-5.6-8.8-11.2V6.8L12 2.4Z",
      "M12 7.2v8.8",
    ],
    strokes: ["#1a1a1a", "#1a1a1a"],
    strokeWidths: [1.85, 1.55],
  },
  "skill-bash": {
    viewBox: "0 0 24 24",
    paths: ["M6.4 14.4l4-8 4 8H6.4Z", "M10.4 14.4v5.6", "M6.4 20h8"],
    strokes: ["#1a1a1a", "#1a1a1a", "#1a1a1a"],
    strokeWidths: [1.85, 1.85, 1.85],
  },
  "skill-charge": {
    viewBox: "0 0 24 24",
    paths: ["M4.8 12h11.2", "M14.4 8.8l5.6 3.2-5.6 3.2"],
    strokes: ["#1a1a1a", "#1a1a1a"],
    strokeWidths: [2, 2],
  },
  "skill-fist": {
    viewBox: "0 0 24 24",
    paths: [
      "M7.2 11.2V7.6a1.6 1.6 0 0 1 3.2 0v1.2h1.2V8a1.6 1.6 0 0 1 3.2 0v3.2h1.2a1.6 1.6 0 0 1 1.6 1.6v4.8a2.4 2.4 0 0 1-2.4 2.4H9.6a2.4 2.4 0 0 1-2.4-2.4v-4.8a1.6 1.6 0 0 1 1.6-1.6h1.2Z",
    ],
    strokes: ["#1a1a1a"],
    strokeWidths: [1.85],
  },
  "skill-wind": {
    viewBox: "0 0 24 24",
    paths: ["M4.8 10.4h11.2", "M4.8 14.4h9.6", "M6.4 6.4h12.8", "M8 18.4h11.2"],
    strokes: ["#1a1a1a", "#1a1a1a", "#1a1a1a", "#1a1a1a"],
    strokeWidths: [1.85, 1.85, 1.85, 1.85],
  },
  "skill-fire": {
    viewBox: "0 0 24 24",
    paths: ["M12 3.2c1.6 3.2 4.8 4.8 4.8 8a4.8 4.8 0 1 1-9.6 0c0-1.6 1.6-3.2 3.2-4.8 0 2.4.8 4 1.6 4.8Z"],
    strokes: ["#1a1a1a"],
    strokeWidths: [1.85],
  },
  "skill-dragon": {
    viewBox: "0 0 24 24",
    paths: [
      "M4.8 16c3.2-6.4 6.4-8 9.6-6.4 1.6.8 2.4 3.2 1.6 5.6-1.6 3.2-5.6 4-9.6 2.4-1.6-.8-2.4-1.6-2.4-1.6Z",
      "M16 6.4l2.4-1.6.8 2.4",
    ],
    strokes: ["#1a1a1a", "#1a1a1a"],
    strokeWidths: [1.85, 1.55],
  },
  "skill-arcane": {
    viewBox: "0 0 24 24",
    paths: ["M12 3.2a8 8 0 1 0 0 16 8 8 0 0 0 0-16Z", "M12 8v4.8l3.2 2.4"],
    strokes: ["#1a1a1a", "#1a1a1a"],
    strokeWidths: [1.85, 1.55],
  },
  "skill-freeze": {
    viewBox: "0 0 24 24",
    paths: ["M12 2.4v19.2", "M2.4 12h19.2", "M6.4 6.4l11.2 11.2", "M17.6 6.4L6.4 17.6"],
    strokes: ["#1a1a1a", "#1a1a1a", "#1a1a1a", "#1a1a1a"],
    strokeWidths: [1.55, 1.55, 1.55, 1.55],
  },
  "skill-heal": {
    viewBox: "0 0 24 24",
    paths: ["M12 4.8v14.4", "M4.8 12h14.4"],
    strokes: ["#1a1a1a", "#1a1a1a"],
    strokeWidths: [2.2, 2.2],
  },
  "skill-meteor": {
    viewBox: "0 0 24 24",
    paths: ["M4.8 4.8l4.8 1.6 1.6 4.8-4.8-1.6-1.6-4.8Z", "M14.4 10.4l4.8 4.8", "M16 8.8l3.2 3.2"],
    strokes: ["#1a1a1a", "#1a1a1a", "#1a1a1a"],
    strokeWidths: [1.85, 1.85, 1.85],
  },
  "upgrade-damage": {
    viewBox: "0 0 24 24",
    paths: ["M6.4 17.6L12 12l5.6 5.6", "M12 12V3.2", "M10.4 4.8L12 3.2l1.6 1.6"],
    strokes: ["#1a1a1a", "#1a1a1a", "#1a1a1a"],
    strokeWidths: [1.9, 2, 1.7],
  },
  "upgrade-cooldown": {
    viewBox: "0 0 24 24",
    paths: ["M12 6.4v6.4l3.2 2.4", "M12 2.4a9.6 9.6 0 1 0 0 19.2 9.6 9.6 0 0 0 0-19.2Z"],
    strokes: ["#1a1a1a", "#1a1a1a"],
    strokeWidths: [2, 1.6],
  },
  "upgrade-mp": {
    viewBox: "0 0 24 24",
    paths: ["M9.6 3.2h4.8v3.2H9.6V3.2Z", "M8.8 6.4h6.4l-.8 13.6H9.6L8.8 6.4Z"],
    strokes: ["#1a1a1a", "#1a1a1a"],
    strokeWidths: [1.85, 1.85],
  },
};

function toSvg(name, def) {
  const paths = def.paths
    .map((d, i) => {
      const stroke = def.strokes?.[i] ?? "#1a1a1a";
      const sw = def.strokeWidths?.[i] ?? 1.85;
      const fill = def.fills?.[i] ?? "none";
      if (fill !== "none" && fill !== undefined) {
        return `  <path d="${d}" fill="${fill}"/>`;
      }
      return `  <path d="${d}" fill="none" stroke="${stroke}" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round"/>`;
    })
    .join("\n");

  return [
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${def.viewBox}" fill="none">`,
    `  <!-- Imperial Knight Hero — ${name} -->`,
    paths,
    `</svg>`,
    "",
  ].join("\n");
}

fs.mkdirSync(OUT, { recursive: true });
for (const [name, def] of Object.entries(ICONS)) {
  fs.writeFileSync(path.join(OUT, `${name}.svg`), toSvg(name, def), "utf8");
  console.log("wrote", `public/icons/ui/${name}.svg`);
}

// Copy equipment slot SVGs into ui registry aliases
const equipDir = path.join(ROOT, "public", "icons", "equipment-slots");
for (const slot of ["slot-helm", "slot-chest", "slot-weapon", "slot-gloves", "slot-boots", "slot-cloak"]) {
  const src = path.join(equipDir, `${slot}.svg`);
  if (fs.existsSync(src)) {
    fs.copyFileSync(src, path.join(OUT, `${slot}.svg`));
    console.log("copied", slot);
  }
}

console.log(`\nExported ${Object.keys(ICONS).length} UI icons + equipment slots.`);
