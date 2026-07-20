import type { SkillPath } from "../../../engine/types";
import type { GameIconName } from "./paths";

const SKILL_ICON_MAP: Record<string, GameIconName> = {
  basic_attack: "skill-sword",
  murim_palm: "skill-fist",
  murim_dash: "skill-wind",
  murim_qi: "skill-fire",
  murim_dragon: "skill-dragon",
  knight_slash: "skill-slash",
  knight_guard: "skill-shield",
  knight_bash: "skill-bash",
  knight_charge: "skill-charge",
  fantasy_bolt: "skill-arcane",
  fantasy_freeze: "skill-freeze",
  fantasy_heal: "skill-heal",
  fantasy_meteor: "skill-meteor",
};

const PATH_ICON_MAP: Record<SkillPath, GameIconName> = {
  imperial: "path-imperial",
  knight: "path-knight",
  vanguard: "path-vanguard",
};

const UPGRADE_ICON_MAP = {
  damage: "upgrade-damage",
  cooldown: "upgrade-cooldown",
  mpCost: "upgrade-mp",
} as const satisfies Record<string, GameIconName>;

export function skillIconName(skillId: string): GameIconName {
  return SKILL_ICON_MAP[skillId] ?? "skill-sword";
}

export function shopIconName(_itemId: string): GameIconName {
  return "shop";
}

export function pathIconName(path: SkillPath): GameIconName {
  return PATH_ICON_MAP[path];
}

export function upgradeBranchIconName(
  branch: keyof typeof UPGRADE_ICON_MAP
): GameIconName {
  return UPGRADE_ICON_MAP[branch];
}
