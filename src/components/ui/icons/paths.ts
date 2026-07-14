/**
 * Art Bible §08 — UI icon paths (Aggressive Minimalism: sharp geometry, high contrast)
 * @see docs/art-bible/MASTER_ART_BIBLE.md
 */

export type GameIconName =
  | "character"
  | "skills"
  | "tower"
  | "bag"
  | "mailbox"
  | "shop"
  | "gold"
  | "settings"
  | "close"
  | "sword-cross"
  | "path-murim"
  | "path-knight"
  | "path-fantasy"
  | "lock"
  | "skill-spark"
  | "skill-fist"
  | "skill-wind"
  | "skill-fire"
  | "skill-dragon"
  | "skill-slash"
  | "skill-shield"
  | "skill-bash"
  | "skill-charge"
  | "skill-arcane"
  | "skill-freeze"
  | "skill-heal"
  | "skill-meteor"
  | "skill-sword"
  | "potion-hp"
  | "potion-mp"
  | "scroll"
  | "charm"
  | "upgrade-damage"
  | "upgrade-cooldown"
  | "upgrade-mp";

export interface IconPathDef {
  viewBox: string;
  paths: string[];
  fills?: string[];
  strokes?: string[];
  strokeWidths?: number[];
}

/** Stroke-based nav & HUD icons — ink black on readable surfaces */
export const ICON_PATHS: Record<GameIconName, IconPathDef> = {
  character: {
    viewBox: "0 0 24 24",
    paths: [
      "M12 3a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0-7Z",
      "M6 21v-2a6 6 0 0 1 12 0v2",
      "M16 8l4-2M18 12l3 1",
    ],
    strokes: ["currentColor", "currentColor", "currentColor"],
    strokeWidths: [0, 0, 1.6],
    fills: ["currentColor", "currentColor", "none"],
  },
  skills: {
    viewBox: "0 0 24 24",
    paths: [
      "M12 2l2.2 6.7H21l-5.5 4 2.1 6.6L12 17.8 6.4 19.3l2.1-6.6L3 8.7h6.8L12 2Z",
      "M12 9v4M12 15h.01",
    ],
    fills: ["currentColor", "none"],
    strokes: [undefined, "currentColor"],
    strokeWidths: [0, 1.4],
  },
  tower: {
    viewBox: "0 0 24 24",
    paths: [
      "M12 2L4 8v14h16V8L12 2Z",
      "M9 22V12h6v10",
      "M12 6v2M8 10h8",
    ],
    fills: ["currentColor", "none", "none"],
    strokes: [undefined, "currentColor", "currentColor"],
    strokeWidths: [0, 1.6, 1.2],
  },
  bag: {
    viewBox: "0 0 24 24",
    paths: [
      "M6 8h12l-1 14H7L6 8Z",
      "M9 8V6a3 3 0 0 1 6 0v2",
      "M9 13h6",
    ],
    fills: ["currentColor", "none", "none"],
    strokes: [undefined, "currentColor", "currentColor"],
    strokeWidths: [0, 1.6, 1.4],
  },
  mailbox: {
    viewBox: "0 0 24 24",
    paths: [
      "M4 6h16v12H4V6Z",
      "M4 10h16",
      "M12 10v8",
    ],
    fills: ["none", "none", "none"],
    strokes: ["currentColor", "currentColor", "currentColor"],
    strokeWidths: [1.6, 1.4, 1.4],
  },
  shop: {
    viewBox: "0 0 24 24",
    paths: [
      "M4 10h16l-1.5 10H5.5L4 10Z",
      "M4 10l2-6h12l2 6",
      "M9 14h6",
    ],
    fills: ["currentColor", "none", "none"],
    strokes: [undefined, "currentColor", "currentColor"],
    strokeWidths: [0, 1.6, 1.4],
  },
  gold: {
    viewBox: "0 0 24 24",
    paths: [
      "M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Z",
      "M12 6v12M8 10h8M8 14h8",
    ],
    fills: ["currentColor", "none"],
    strokes: [undefined, "currentColor"],
    strokeWidths: [0, 1.4],
  },
  settings: {
    viewBox: "0 0 24 24",
    paths: [
      "M12 15.5a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7Z",
      "M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1-1.5 1.7 1.7 0 0 0-1.9.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.9 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1 1.7 1.7 0 0 0-.3-1.9l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.9.3 1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.9-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.9 1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1Z",
    ],
    fills: ["none"],
    strokes: ["currentColor"],
    strokeWidths: [1.5],
  },
  close: {
    viewBox: "0 0 24 24",
    paths: ["M6 6l12 12M18 6L6 18"],
    fills: ["none"],
    strokes: ["currentColor"],
    strokeWidths: [2.2],
  },
  "sword-cross": {
    viewBox: "0 0 24 24",
    paths: [
      "M4 20l6-6M10 14l2-10 2 10-2 2-2-2Z",
      "M14 20l6-6M20 14l-2-10-2 10 2 2 2-2Z",
    ],
    fills: ["currentColor", "currentColor"],
  },
};
