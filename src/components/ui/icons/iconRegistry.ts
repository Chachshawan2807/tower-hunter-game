import { EQUIP_SLOT_ICON_PATHS } from "./paths-equip-slots";
import { EXTENDED_ICON_PATHS } from "./paths-extended";
import { ICON_PATHS, type GameIconName, type IconPathDef } from "./paths";

/** Icons exported to public/icons/ui/*.svg — rendered via CSS mask in GameIcon */
export const FILE_ICON_NAMES = new Set<GameIconName>([
  "character",
  "skills",
  "book",
  "tower",
  "bag",
  "mailbox",
  "shop",
  "gold",
  "settings",
  "close",
  "sword-cross",
  "path-imperial",
  "path-knight",
  "path-vanguard",
  "lock",
  "chains-cross",
  "skill-spark",
  "skill-sword",
  "skill-slash",
  "skill-shield",
  "skill-bash",
  "skill-charge",
  "skill-fist",
  "skill-wind",
  "skill-fire",
  "skill-dragon",
  "skill-arcane",
  "skill-freeze",
  "skill-heal",
  "skill-meteor",
  "upgrade-damage",
  "upgrade-cooldown",
  "upgrade-mp",
  "slot-helm",
  "slot-chest",
  "slot-gloves",
  "slot-boots",
  "slot-cloak",
  "slot-weapon",
  "reset-undo",
]);

/** Raster masks (alpha PNG) — default file icons use embedded SVG. */
export const FILE_ICON_PNG_NAMES = new Set<GameIconName>(["mailbox"]);

export function hasFileIcon(name: GameIconName): boolean {
  return FILE_ICON_NAMES.has(name);
}

export function fileIconMaskUrl(name: GameIconName): string {
  const ext = FILE_ICON_PNG_NAMES.has(name) ? "png" : "svg";
  return `/icons/ui/${name}.${ext}`;
}

export function getIconDef(name: GameIconName): IconPathDef {
  const def =
    ICON_PATHS[name] ?? EQUIP_SLOT_ICON_PATHS[name] ?? EXTENDED_ICON_PATHS[name];
  if (!def) {
    throw new Error(`Unknown icon: ${name}`);
  }
  return def;
}
