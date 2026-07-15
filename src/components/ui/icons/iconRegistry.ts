import { EQUIP_SLOT_ICON_PATHS } from "./paths-equip-slots";
import { EXTENDED_ICON_PATHS } from "./paths-extended";
import { ICON_PATHS, type GameIconName, type IconPathDef } from "./paths";

export function getIconDef(name: GameIconName): IconPathDef {
  const def =
    ICON_PATHS[name] ?? EQUIP_SLOT_ICON_PATHS[name] ?? EXTENDED_ICON_PATHS[name];
  if (!def) {
    throw new Error(`Unknown icon: ${name}`);
  }
  return def;
}
