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

export function skillIconName(skillId: string): GameIconName {
  return SKILL_ICON_MAP[skillId] ?? "skill-sword";
}

export function shopIconName(_itemId: string): GameIconName {
  return "shop";
}
