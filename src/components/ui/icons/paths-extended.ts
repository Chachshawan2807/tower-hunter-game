import type { IconPathDef } from "./paths";

/** Skill paths, shop items, upgrade branches — Art Bible §07–08 */
export const EXTENDED_ICON_PATHS: Record<string, IconPathDef> = {
  "path-imperial": {
    viewBox: "0 0 24 24",
    paths: ["M12 3l-6 4v14h12V7l-6-4Z", "M9 21V11h6v10"],
    fills: ["currentColor", "none"],
    strokes: [undefined, "currentColor"],
    strokeWidths: [0, 1.4],
  },
  "path-knight": {
    viewBox: "0 0 24 24",
    paths: [
      "M12 2l8 4v6c0 5-3.5 9.5-8 10-4.5-.5-8-5-8-10V6l8-4Z",
      "M12 8v8",
    ],
    fills: ["currentColor", "none"],
    strokes: [undefined, "currentColor"],
    strokeWidths: [0, 1.6],
  },
  "path-vanguard": {
    viewBox: "0 0 24 24",
    paths: [
      "M12 2l3 6h6l-5 4 2 6-6-4-6 4 2-6-5-4h6l3-6Z",
    ],
    fills: ["currentColor"],
  },
  lock: {
    viewBox: "0 0 24 24",
    paths: [
      "M7 11V8a5 5 0 0 1 10 0v3",
      "M6 11h12v10H6V11Z",
    ],
    fills: ["none", "currentColor"],
    strokes: ["currentColor", undefined],
    strokeWidths: [1.6, 0],
  },
  "skill-spark": {
    viewBox: "0 0 24 24",
    paths: ["M12 2l2.2 6.7H21l-5.5 4 2.1 6.6L12 17.8 6.4 19.3l2.1-6.6L3 8.7h6.8L12 2Z"],
    fills: ["currentColor"],
  },
  "skill-fist": {
    viewBox: "0 0 24 24",
    paths: ["M7 11V7a2 2 0 0 1 4 0v1h1V8a2 2 0 0 1 4 0v3h1a2 2 0 0 1 2 2v5a3 3 0 0 1-3 3H9a3 3 0 0 1-3-3v-5a2 2 0 0 1 2-2h1Z"],
    fills: ["currentColor"],
  },
  "skill-wind": {
    viewBox: "0 0 24 24",
    paths: ["M4 10h12M4 14h10M6 6h14M8 18h12"],
    fills: ["none"],
    strokes: ["currentColor"],
    strokeWidths: [2],
  },
  "skill-fire": {
    viewBox: "0 0 24 24",
    paths: ["M12 2c2 4 6 6 6 10a6 6 0 1 1-12 0c0-2 2-4 4-6 0 3 1 5 2 6Z"],
    fills: ["currentColor"],
  },
  "skill-dragon": {
    viewBox: "0 0 24 24",
    paths: [
      "M4 16c4-8 8-10 12-8 2 1 3 4 2 7-2 4-7 5-11 3-2-1-3-2-3-2Z",
      "M16 6l3-2 1 3",
    ],
    fills: ["currentColor", "currentColor"],
  },
  "skill-slash": {
    viewBox: "0 0 24 24",
    paths: ["M4 20l8-8M12 12l8-8M14 10l2 2"],
    fills: ["none"],
    strokes: ["currentColor"],
    strokeWidths: [2.2],
  },
  "skill-shield": {
    viewBox: "0 0 24 24",
    paths: ["M12 2l8 4v6c0 5-3.5 9.5-8 10-4.5-.5-8-5-8-10V6l8-4Z"],
    fills: ["currentColor"],
  },
  "skill-bash": {
    viewBox: "0 0 24 24",
    paths: ["M6 14l4-8 4 8H6Z", "M10 14v6", "M6 20h8"],
    fills: ["currentColor", "none", "none"],
    strokes: [undefined, "currentColor", "currentColor"],
    strokeWidths: [0, +2, 2],
  },
  "skill-charge": {
    viewBox: "0 0 24 24",
    paths: ["M4 12h12M14 8l6 4-6 4"],
    fills: ["none"],
    strokes: ["currentColor"],
    strokeWidths: [2.2],
  },
  "skill-arcane": {
    viewBox: "0 0 24 24",
    paths: ["M12 2a7 7 0 1 0 0 14 7 7 0 0 0 0-14Z", "M12 7v5l3 2"],
    fills: ["currentColor", "none"],
    strokes: [undefined, "#fff"],
    strokeWidths: [0, 1.4],
  },
  "skill-freeze": {
    viewBox: "0 0 24 24",
    paths: ["M12 2v20M2 12h20M6 6l12 12M18 6L6 18"],
    fills: ["none"],
    strokes: ["currentColor"],
    strokeWidths: [1.6],
  },
  "skill-heal": {
    viewBox: "0 0 24 24",
    paths: ["M12 4v16M4 12h16"],
    fills: ["none"],
    strokes: ["currentColor"],
    strokeWidths: [2.4],
  },
  "skill-meteor": {
    viewBox: "0 0 24 24",
    paths: ["M4 4l6 2 2 6-6-2-2-6Z", "M14 10l6 6M16 8l4 4"],
    fills: ["currentColor", "none"],
    strokes: [undefined, "currentColor"],
    strokeWidths: [0, 2],
  },
  "skill-sword": {
    viewBox: "0 0 24 24",
    paths: ["M6 18l8-8M14 10l2-8 2 8-2 2-2-2Z"],
    fills: ["currentColor"],
  },
  "potion-hp": {
    viewBox: "0 0 24 24",
    paths: [
      "M9 3h6v3H9V3Z",
      "M8 6h8l-1 14H9L8 6Z",
      "M12 10v6M9 13h6",
    ],
    fills: ["currentColor", "currentColor", "none"],
    strokes: [undefined, undefined, "#fff"],
    strokeWidths: [0, 0, 1.6],
  },
  "potion-mp": {
    viewBox: "0 0 24 24",
    paths: [
      "M9 3h6v3H9V3Z",
      "M8 6h8l-1 14H9L8 6Z",
      "M10 12c2-2 4-2 4 0s-2 2-4 0",
    ],
    fills: ["currentColor", "currentColor", "none"],
    strokes: [undefined, undefined, "#fff"],
    strokeWidths: [0, 0, 1.4],
  },
  scroll: {
    viewBox: "0 0 24 24",
    paths: ["M6 4h10a2 2 0 0 1 2 2v14l-4-2-4 2-4-2V6a2 2 0 0 1 2-2Z", "M10 8h6M10 12h4"],
    fills: ["currentColor", "none"],
    strokes: [undefined, "#fff"],
    strokeWidths: [0, 1.2],
  },
  charm: {
    viewBox: "0 0 24 24",
    paths: ["M12 2l2 6h6l-5 4 2 6-5-4-5 4 2-6-5-4h6l2-6Z"],
    fills: ["currentColor"],
  },
  "upgrade-damage": {
    viewBox: "0 0 24 24",
    paths: ["M6 18l8-8M14 10l2-8 2 8-2 2-2-2Z"],
    fills: ["currentColor"],
  },
  "upgrade-cooldown": {
    viewBox: "0 0 24 24",
    paths: ["M12 6v6l4 2", "M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Z"],
    fills: ["none", "none"],
    strokes: ["currentColor", "currentColor"],
    strokeWidths: [2, 1.6],
  },
  "upgrade-mp": {
    viewBox: "0 0 24 24",
    paths: [
      "M9 3h6v3H9V3Z",
      "M8 6h8l-1 14H9L8 6Z",
    ],
    fills: ["currentColor", "currentColor"],
  },
};
