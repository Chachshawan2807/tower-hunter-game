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
  | "path-imperial"
  | "path-knight"
  | "path-vanguard"
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

/** Core HUD icons — nav buttons use file SVGs from buildNavButtonSvgs.mjs */
export const ICON_PATHS: Partial<Record<GameIconName, IconPathDef>> = {
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
    // Imperial cog — padded viewBox so teeth stay complete; stroke weights match gold icon
    viewBox: "-1.5 -1.5 27 27",
    paths: [
      "M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z",
      "M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z",
    ],
    fills: ["none", "none"],
    strokes: ["currentColor", "currentColor"],
    strokeWidths: [1.55, 1.85],
  },
  close: {
    viewBox: "0 0 24 24",
    paths: ["M5.5 5.5l13 13M18.5 5.5l-13 13"],
    fills: ["none"],
    strokes: ["currentColor"],
    strokeWidths: [2.3],
  },
};
