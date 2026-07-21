import type { SkillPath } from "../../types";
import { BASIC_ATTACK } from "../basicAttack";
import { ENEMY_SKILLS } from "../enemy";
import {
  LEGACY_SKILL_ID_MAP,
  normalizeSkillId,
  PLAYER_SKILL_MANIFEST,
} from "./manifest";
import type { SkillDefinition } from "../types";
import type { SkillType } from "../skillTypes";

const SKILL_REGISTRY = new Map<string, SkillDefinition>();

function register(skill: SkillDefinition): void {
  SKILL_REGISTRY.set(skill.id, skill);
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

register(BASIC_ATTACK);
for (const skill of PLAYER_SKILL_MANIFEST) {
  register(skill);
}
for (const skill of ENEMY_SKILLS) {
  register(skill);
}

for (const [legacyId, newId] of Object.entries(LEGACY_SKILL_ID_MAP)) {
  const skill = SKILL_REGISTRY.get(newId);
  if (skill) {
    SKILL_REGISTRY.set(legacyId, { ...skill, id: legacyId });
  }
}

export function getSkillById(skillId: string): SkillDefinition {
  const normalized = normalizeSkillId(skillId);
  return SKILL_REGISTRY.get(normalized) ?? SKILL_REGISTRY.get(skillId) ?? BASIC_ATTACK;
}

export function getPlayerCatalogSkills(): SkillDefinition[] {
  return PLAYER_SKILL_MANIFEST;
}

export function getSkillsByType(skillType: SkillType): SkillDefinition[] {
  return PLAYER_SKILL_MANIFEST.filter((s) => s.skillType === skillType);
}

export function getAllSkills(): SkillDefinition[] {
  return Array.from(
    new Map(
      [...PLAYER_SKILL_MANIFEST, BASIC_ATTACK, ...ENEMY_SKILLS].map((s) => [s.id, s])
    ).values()
  );
}

export { CATALOG_VERSION, LEGACY_SKILL_ID_MAP, normalizeSkillId } from "./manifest";
