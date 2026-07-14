/**
 * Tower Hunter — Material Bible (texture attributes)
 * @see docs/art-bible/MASTER_ART_BIBLE.md §03
 */

export type MaterialId = "ancient-bricks" | "monolithic-walls" | "dark-iron-steel";

export interface MaterialSpec {
  id: MaterialId;
  /** 0–1 PBR-style roughness hint for shaders / CSS */
  roughness: number;
  /** 0–1 gloss hint */
  gloss: number;
  /** CSS filter stack placeholder until texture maps exist */
  cssFilter: string;
  description: string;
}

export const MATERIALS: Record<MaterialId, MaterialSpec> = {
  "ancient-bricks": {
    id: "ancient-bricks",
    roughness: 0.92,
    gloss: 0.05,
    cssFilter: "contrast(1.05) saturate(0.85)",
    description: "High roughness, cracked mortar, matte — pushes characters forward",
  },
  "monolithic-walls": {
    id: "monolithic-walls",
    roughness: 0.78,
    gloss: 0.12,
    cssFilter: "contrast(1.08) saturate(0.75) brightness(0.92)",
    description: "Weathered stone, soot, dried blood, moss patches",
  },
  "dark-iron-steel": {
    id: "dark-iron-steel",
    roughness: 0.45,
    gloss: 0.55,
    cssFilter: "contrast(1.12) saturate(0.7) brightness(0.88)",
    description: "Semi-gloss scratched metal — heavy, aggressive",
  },
};
