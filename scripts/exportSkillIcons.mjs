/**
 * Export per-skill Imperial Knight placeholder SVGs to public/icons/skills/{id}.svg
 * Run: node scripts/exportSkillIcons.mjs
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "..");
const OUT = path.join(ROOT, "public", "icons", "skills");

/** Player catalog + basic attack — each id gets a distinct placeholder silhouette. */
const SKILL_IDS = [
  "basic_attack",
  "active_power_slash",
  "active_iron_palm",
  "active_arcane_bolt",
  "active_inner_qi",
  "active_holy_light",
  "active_dragon_fist",
  "active_meteor",
  "passive_sturdy_frame",
  "passive_blade_mastery",
  "passive_arcane_mind",
  "passive_swift_feet",
  "passive_keen_eye",
  "passive_guardian_aura",
  "passive_brutal_strikes",
  "cc_shield_bash",
  "cc_frost_nova",
  "cc_silencing_word",
  "cc_hamstring",
  "move_shadow_step",
  "move_dodge_roll",
  "move_cavalry_charge",
  "move_flash_step",
];

/** Varied imperial line-art motifs (24×24, stroke #1a1a1a). */
const MOTIFS = [
  ["M4 18L12 4l8 14H4Z", "M12 9v5"],
  ["M6 6h12v12H6V6Z", "M9 12h6"],
  ["M12 3.2l7.2 3.6v5.6c0 4.8-3.2 9.2-7.2 10-4-.8-7.2-5.2-7.2-10V6.8L12 3.2Z"],
  ["M5 12h14", "M12 5v14", "M8 8l8 8"],
  ["M12 2.4l2 6.4H20l-5.2 4 2 6.4L12 17.6 7.2 19.2l2-6.4L4 8.8h6L12 2.4Z"],
  ["M7.2 11.2V8.8a4.8 4.8 0 0 1 9.6 0v2.4", "M6.4 11.2h11.2v9.6H6.4v-9.6Z"],
  ["M4 20L12 4l8 16", "M8 16h8"],
  ["M12 4.8a7.2 7.2 0 1 0 0 14.4 7.2 7.2 0 0 0 0-14.4Z", "M12 8v8M8 12h8"],
  ["M6 18V6h5l1 4h5v8H6Z"],
  ["M5 19l7-14 7 14H5Z", "M9 15h6"],
  ["M8 4h8v6H8V4Z", "M6 10h12v10H6V10Z"],
  ["M4 12c4-8 12-8 16 0", "M6 12h12", "M12 12v8"],
  ["M12 3.2v17.6", "M6 8h12", "M6 16h12"],
  ["M12 6.4v6.4l3.2 2.4", "M12 2.4a9.6 9.6 0 1 0 0 19.2 9.6 9.6 0 0 0 0-19.2Z"],
  ["M9.6 3.2h4.8v3.2H9.6V3.2Z", "M8.8 6.4h6.4l-.8 13.6H9.6L8.8 6.4Z"],
  ["M5.5 5.5l13 13M18.5 5.5l-13 13"],
  ["M3.8 7.2h16.4v11.2H3.8V7.2Z", "M12 7.2V4.6", "M12 11v7.4"],
  ["M6 8c2-4 10-4 12 0", "M8 14c2 4 6 4 8 0"],
  ["M4 16l4-12h8l4 12H4Z", "M10 10h4"],
  ["M7 19V9l5-4 5 4v10H7Z", "M12 13v6"],
  ["M4 12h16", "M12 4v16", "M6 6l12 12"],
  ["M6 18l6-14 6 14H6Z", "M9 14h6"],
  ["M8 6h8l-2 12H10L8 6Z", "M12 6V4"],
];

function motifForIndex(index) {
  return MOTIFS[index % MOTIFS.length];
}

function toSvg(id, paths) {
  const body = paths
    .map(
      (d) =>
        `  <path d="${d}" fill="none" stroke="#1a1a1a" stroke-width="1.85" stroke-linecap="round" stroke-linejoin="round"/>`
    )
    .join("\n");

  return [
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none">`,
    `  <!-- Imperial Knight skill icon — ${id} (placeholder) -->`,
    body,
    `</svg>`,
    "",
  ].join("\n");
}

fs.mkdirSync(OUT, { recursive: true });
SKILL_IDS.forEach((id, index) => {
  const paths = motifForIndex(index);
  fs.writeFileSync(path.join(OUT, `${id}.svg`), toSvg(id, paths), "utf8");
  console.log("wrote", `public/icons/skills/${id}.svg`);
});

console.log(`\nExported ${SKILL_IDS.length} skill icons.`);
