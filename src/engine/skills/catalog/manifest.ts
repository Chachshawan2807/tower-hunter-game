import type { SkillDefinition } from "../types";
import { ACTIVE_SKILLS } from "./manifestActiveSkills";
import { CC_SKILLS } from "./manifestCcSkills";
import { MOVEMENT_SKILLS } from "./manifestMovementSkills";
import { PASSIVE_SKILLS } from "./manifestPassiveSkills";

export const CATALOG_VERSION = 3;

export const PLAYER_SKILL_MANIFEST: SkillDefinition[] = [
  ...ACTIVE_SKILLS,
  ...PASSIVE_SKILLS,
  ...CC_SKILLS,
  ...MOVEMENT_SKILLS,
];

export const LEGACY_SKILL_ID_MAP: Record<string, string> = {
  murim_palm: "active_iron_palm",
  murim_dash: "move_shadow_step",
  murim_qi: "active_inner_qi",
  murim_dragon: "active_dragon_fist",
  knight_slash: "active_power_slash",
  knight_guard: "passive_guardian_aura",
  knight_bash: "cc_shield_bash",
  knight_charge: "move_cavalry_charge",
  fantasy_bolt: "active_arcane_bolt",
  fantasy_freeze: "cc_frost_nova",
  fantasy_heal: "active_holy_light",
  fantasy_meteor: "active_meteor",
};

export function normalizeSkillId(skillId: string): string {
  return LEGACY_SKILL_ID_MAP[skillId] ?? skillId;
}
