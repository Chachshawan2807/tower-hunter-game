/**
 * Character archetype registry — Art Bible §06 + isometric chibi reference
 * @see docs/art-bible/MASTER_ART_BIBLE.md
 */

import type { SkillPath } from "../../types";

/** Playable skill-path heroes */
export type PlayerArchetype = SkillPath;

/** Combat enemies (tower guardians + bosses) */
export type EnemyArchetype = "beast" | "demon" | "guardian";

/** Non-combat NPCs */
export type NpcArchetype = "merchant" | "villager";

export type CharacterArchetype = PlayerArchetype | EnemyArchetype | NpcArchetype;

export type CharacterRole = "player" | "enemy" | "npc";

export interface CharacterArchetypeSpec {
  id: CharacterArchetype;
  role: CharacterRole;
  sheetId: CharacterSheetId;
  /** Display scale relative to frame (bosses / ogres read larger) */
  scale: number;
  nameKey: string;
}

export type CharacterSheetId =
  | "murim"
  | "knight"
  | "fantasy"
  | "beast"
  | "demon"
  | "merchant"
  | "villager";

export const CHARACTER_ARCHETYPES: Record<CharacterArchetype, CharacterArchetypeSpec> = {
  murim: {
    id: "murim",
    role: "player",
    sheetId: "murim",
    scale: 1,
    nameKey: "skills.murim",
  },
  knight: {
    id: "knight",
    role: "player",
    sheetId: "knight",
    scale: 1,
    nameKey: "skills.knight",
  },
  fantasy: {
    id: "fantasy",
    role: "player",
    sheetId: "fantasy",
    scale: 1,
    nameKey: "skills.fantasy",
  },
  beast: {
    id: "beast",
    role: "enemy",
    sheetId: "beast",
    scale: 1.08,
    nameKey: "enemies.guardian_low",
  },
  demon: {
    id: "demon",
    role: "enemy",
    sheetId: "demon",
    scale: 1.18,
    nameKey: "enemies.boss_early",
  },
  guardian: {
    id: "guardian",
    role: "enemy",
    sheetId: "beast",
    scale: 1.12,
    nameKey: "enemies.guardian_mid",
  },
  merchant: {
    id: "merchant",
    role: "npc",
    sheetId: "merchant",
    scale: 1,
    nameKey: "shop.title",
  },
  villager: {
    id: "villager",
    role: "npc",
    sheetId: "villager",
    scale: 1,
    nameKey: "npc.villager",
  },
};

/** Map tower floor to enemy visual archetype */
export function enemyArchetypeForFloor(floor: number, isBoss: boolean): EnemyArchetype {
  if (isBoss) return "demon";
  if (floor <= 30) return "beast";
  if (floor <= 60) return "guardian";
  return "demon";
}

export function archetypeForPlayer(path: SkillPath): PlayerArchetype {
  return path;
}
