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

const SHOP_ICON_MAP: Record<string, GameIconName> = {
  shop_hp_potion: "potion-hp",
  shop_mp_potion: "potion-mp",
  shop_atk_scroll: "scroll",
  shop_def_charm: "charm",
  shop_lucky_coin: "gold",
};

const PATH_ICON_MAP: Record<SkillPath, GameIconName> = {
  murim: "path-murim",
  knight: "path-knight",
  fantasy: "path-fantasy",
};

const UPGRADE_ICON_MAP = {
  damage: "upgrade-damage",
  cooldown: "upgrade-cooldown",
  mpCost: "upgrade-mp",
} as const satisfies Record<string, GameIconName>;

export function skillIconName(skillId: string): GameIconName {
  return SKILL_ICON_MAP[skillId] ?? "skill-sword";
}

export function shopIconName(itemId: string): GameIconName {
  return SHOP_ICON_MAP[itemId] ?? "shop";
}

export function pathIconName(path: SkillPath): GameIconName {
  return PATH_ICON_MAP[path];
}

export function upgradeBranchIconName(
  branch: keyof typeof UPGRADE_ICON_MAP
): GameIconName {
  return UPGRADE_ICON_MAP[branch];
}
