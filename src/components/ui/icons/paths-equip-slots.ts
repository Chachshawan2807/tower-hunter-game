import type { IconPathDef } from "./paths";

/** Equipment slot silhouettes — Aggressive Minimalism stroke icons */
export const EQUIP_SLOT_ICON_PATHS: Record<string, IconPathDef> = {
  "slot-helm": {
    viewBox: "0 0 24 24",
    paths: [
      "M6.2 12.2C6.2 7.6 8.8 4 12 4s5.8 3.6 5.8 8.2",
      "M4.8 12.2h14.4v2.6H4.8z",
      "M8 14.8v4.4h8v-4.4",
      "M9.4 10.2h5.2",
    ],
    fills: ["none", "none", "none", "none"],
    strokes: ["currentColor", "currentColor", "currentColor", "currentColor"],
    strokeWidths: [1.9, 1.85, 1.85, 1.6],
  },
  "slot-chest": {
    viewBox: "0 0 24 24",
    paths: [
      "M7.2 5.4L12 8.2l4.8-2.8 2.4 3.2v9.8H4.8V8.6L7.2 5.4Z",
      "M9.2 12.4h5.6M9.2 15.6h5.6",
    ],
    fills: ["none", "none"],
    strokes: ["currentColor", "currentColor"],
    strokeWidths: [1.9, 1.55],
  },
  "slot-gloves": {
    viewBox: "0 0 24 24",
    paths: [
      "M8.2 4.6v6.2M11 3.8v7M13.8 4.6v6.2M16.6 6v5.4",
      "M7.4 11.2h10.2v6.6a2.4 2.4 0 0 1-2.4 2.4H9.8a2.4 2.4 0 0 1-2.4-2.4v-6.6Z",
    ],
    fills: ["none", "none"],
    strokes: ["currentColor", "currentColor"],
    strokeWidths: [1.75, 1.9],
  },
  "slot-boots": {
    viewBox: "0 0 24 24",
    paths: [
      "M8.2 3.6h4.4v10.2H8.2V3.6Z",
      "M8.2 13.8h7.8l2.6 4.8H8.2v-4.8Z",
      "M8.2 20.8h10",
    ],
    fills: ["none", "none", "none"],
    strokes: ["currentColor", "currentColor", "currentColor"],
    strokeWidths: [1.85, 1.9, 1.7],
  },
  "slot-cloak": {
    viewBox: "0 0 24 24",
    paths: [
      "M7.4 5.2h9.2",
      "M6.2 5.2C5.4 10.4 5 15.2 6.6 20.4h10.8c1.6-5.2 1.2-10 0.4-15.2",
      "M9.4 9.2h5.2",
    ],
    fills: ["none", "none", "none"],
    strokes: ["currentColor", "currentColor", "currentColor"],
    strokeWidths: [1.8, 1.9, 1.55],
  },
  "slot-weapon": {
    viewBox: "0 0 24 24",
    paths: [
      "M12 2.4v12.2",
      "M9.6 14.6h4.8",
      "M12 14.6v7",
      "M10.2 4.8L12 2.4l1.8 2.4",
    ],
    fills: ["none", "none", "none", "none"],
    strokes: ["currentColor", "currentColor", "currentColor", "currentColor"],
    strokeWidths: [2, 1.85, 1.85, 1.7],
  },
};
