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
  | "upgrade-mp"
  | "slot-helm"
  | "slot-chest"
  | "slot-gloves"
  | "slot-boots"
  | "slot-cloak"
  | "slot-weapon";

export interface IconPathDef {
  viewBox: string;
  paths: string[];
  fills?: string[];
  strokes?: string[];
  strokeWidths?: number[];
}

/** Core HUD/nav stroke icons — skills/slots/shop live in companion path modules */
export const ICON_PATHS: Partial<Record<GameIconName, IconPathDef>> = {
  character: {
    // Hunter silhouette: topknot + angular cloak shoulders
    viewBox: "0 0 24 24",
    paths: [
      "M12 2.2l1.1 2.2H10.9L12 2.2Z",
      "M12 8.6a3.1 3.1 0 1 0 0-6.2 3.1 3.1 0 0 0 0 6.2Z",
      "M4.8 21.2l1.6-5.4L12 12.6l5.6 3.2 1.6 5.4",
      "M8.2 16.4h7.6",
    ],
    fills: ["none", "none", "none", "none"],
    strokes: ["currentColor", "currentColor", "currentColor", "currentColor"],
    strokeWidths: [1.9, 1.9, 1.9, 1.7],
  },
  skills: {
    // Ki burst: diamond core + crossed combat slash
    viewBox: "0 0 24 24",
    paths: [
      "M12 3.2L14.8 12 12 20.8 9.2 12 12 3.2Z",
      "M4.2 7.2l15.6 9.6",
      "M19.8 7.2L4.2 16.8",
    ],
    fills: ["none", "none", "none"],
    strokes: ["currentColor", "currentColor", "currentColor"],
    strokeWidths: [2, 1.85, 1.85],
  },
  tower: {
    // 100-floor pagoda — stepped tiers + spire
    viewBox: "0 0 24 24",
    paths: [
      "M12 1.8l1.4 2.4H10.6L12 1.8Z",
      "M8.2 5.4h7.6L14.4 8.2H9.6L8.2 5.4Z",
      "M7 9.4h10l-1.3 3H8.3L7 9.4Z",
      "M6 13.6h12l-1.2 3.2H7.2L6 13.6Z",
      "M7.8 16.8h8.4V22H7.8V16.8Z",
      "M10.2 18.8h3.6M10.2 20.6h3.6",
    ],
    fills: ["none", "none", "none", "none", "none", "none"],
    strokes: [
      "currentColor",
      "currentColor",
      "currentColor",
      "currentColor",
      "currentColor",
      "currentColor",
    ],
    strokeWidths: [1.8, 1.85, 1.85, 1.85, 1.9, 1.55],
  },
  bag: {
    // Adventurer satchel with flap + buckle
    viewBox: "0 0 24 24",
    paths: [
      "M5 9.2h14l-1.2 11.4H6.2L5 9.2Z",
      "M8.2 9.2V7.1A3.8 3.8 0 0 1 12 3.3a3.8 3.8 0 0 1 3.8 3.8v2.1",
      "M5.4 12.4h13.2",
      "M11.1 14.6h1.8v2.4h-1.8z",
    ],
    fills: ["none", "none", "none", "none"],
    strokes: ["currentColor", "currentColor", "currentColor", "currentColor"],
    strokeWidths: [1.9, 1.9, 1.7, 1.7],
  },
  mailbox: {
    viewBox: "0 0 24 24",
    paths: [
      "M3.8 7.2h16.4v11.2H3.8V7.2Z",
      "M3.8 11h16.4",
      "M12 11v7.4",
      "M12 7.2V4.6",
    ],
    fills: ["none", "none", "none", "none"],
    strokes: ["currentColor", "currentColor", "currentColor", "currentColor"],
    strokeWidths: [1.9, 1.7, 1.7, 1.7],
  },
  shop: {
    // Merchant stall with pitched awning (market of the tower)
    viewBox: "0 0 24 24",
    paths: [
      "M3.6 10.2L12 4.4l8.4 5.8",
      "M4.4 10.2h15.2v2.2H4.4z",
      "M6 12.4v8.2h12v-8.2",
      "M10.2 16.2h3.6v4.4h-3.6z",
    ],
    fills: ["none", "none", "none", "none"],
    strokes: ["currentColor", "currentColor", "currentColor", "currentColor"],
    strokeWidths: [2, 1.85, 1.9, 1.75],
  },
  gold: {
    // Antique coin — ring + angular seal (not soft currency pills)
    viewBox: "0 0 24 24",
    paths: [
      "M12 3.2A8.8 8.8 0 1 0 12 20.8 8.8 8.8 0 0 0 12 3.2Z",
      "M12 6.4A5.6 5.6 0 1 0 12 17.6 5.6 5.6 0 0 0 12 6.4Z",
      "M12 8.6v6.8M9.4 10.4h3.4c1.2 0 2 .7 2 1.8s-.8 1.8-2 1.8H9.4",
    ],
    fills: ["none", "none", "none"],
    strokes: ["currentColor", "currentColor", "currentColor"],
    strokeWidths: [1.95, 1.55, 1.7],
  },
  settings: {
    // Lucide settings cog — padded so stroke knobs stay complete
    viewBox: "-1.5 -1.5 27 27",
    paths: [
      "M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z",
      "M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z",
    ],
    fills: ["none", "none"],
    strokes: ["currentColor", "currentColor"],
    strokeWidths: [1.9, 1.75],
  },
  close: {
    viewBox: "0 0 24 24",
    paths: ["M5.5 5.5l13 13M18.5 5.5l-13 13"],
    fills: ["none"],
    strokes: ["currentColor"],
    strokeWidths: [2.3],
  },
  "sword-cross": {
    viewBox: "0 0 24 24",
    paths: [
      "M5 20.5L11.2 14.3",
      "M11.2 14.3L13.4 3.6l1.9 9.4-2 2-2.1-0.7Z",
      "M19 20.5L12.8 14.3",
      "M12.8 14.3L10.6 3.6 8.7 13l2 2 2.1-.7Z",
    ],
    fills: ["none", "none", "none", "none"],
    strokes: ["currentColor", "currentColor", "currentColor", "currentColor"],
    strokeWidths: [1.9, 1.9, 1.9, 1.9],
  },
};
