import { EXTENDED_ICON_PATHS } from "./paths-extended";
import { ICON_PATHS, type GameIconName, type IconPathDef } from "./paths";

export function getIconDef(name: GameIconName): IconPathDef {
  const def = ICON_PATHS[name as keyof typeof ICON_PATHS] ?? EXTENDED_ICON_PATHS[name];
  if (!def) {
    throw new Error(`Unknown icon: ${name}`);
  }
  return def;
}
