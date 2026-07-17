import type { SkillPath } from "../types";
import { BASIC_ATTACK } from "./basicAttack";
import { ENEMY_SKILLS } from "./enemy";
import { FANTASY_SKILLS } from "./fantasy";
import { KNIGHT_SKILLS } from "./knight";
import { MURIM_SKILLS } from "./murim";
import type { SkillDefinition } from "./types";

const SKILL_REGISTRY = new Map<string, SkillDefinition>();

function register(skill: SkillDefinition): void {
  SKILL_REGISTRY.set(skill.id, skill);
}

register(BASIC_ATTACK);
for (const skill of [
  ...MURIM_SKILLS,
  ...KNIGHT_SKILLS,
  ...FANTASY_SKILLS,
  ...ENEMY_SKILLS,
]) {
  register(skill);
}

const PATH_SKILLS: Record<SkillPath, SkillDefinition[]> = {
  imperial: MURIM_SKILLS,
  knight: KNIGHT_SKILLS,
  vanguard: FANTASY_SKILLS,
};

export function getSkillById(skillId: string): SkillDefinition {
  return SKILL_REGISTRY.get(skillId) ?? BASIC_ATTACK;
}

const LEGACY_PATH_ALIASES: Record<string, SkillPath> = {
  murim: "imperial",
  fantasy: "vanguard",
};

export function normalizeSkillPath(path: string): SkillPath {
  if (path === "imperial" || path === "knight" || path === "vanguard") {
    return path;
  }
  return LEGACY_PATH_ALIASES[path] ?? "imperial";
}

export function getSkillsForPath(path: SkillPath | string): SkillDefinition[] {
  return PATH_SKILLS[normalizeSkillPath(path)] ?? [];
}

export function getAllSkills(): SkillDefinition[] {
  return Array.from(SKILL_REGISTRY.values());
}

export function isValidSkillForPath(skillId: string, path: SkillPath): boolean {
  if (skillId === BASIC_ATTACK.id) return true;
  return PATH_SKILLS[path].some((skill) => skill.id === skillId);
}
