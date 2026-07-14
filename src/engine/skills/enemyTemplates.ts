import { isBossFloor, type EnemyBaseStats } from "../types";

export interface EnemyTemplate {
  id: string;
  nameKey: string;
  tier: "normal" | "boss";
  baseStats: EnemyBaseStats;
  skillIds: string[];
  aiProfile: { skillBias: number; skillPriority: string[] };
}

const DEFAULT_ENEMY_BASE: EnemyBaseStats = {
  hp: 200,
  atk: 30,
  def: 15,
  speed: 80,
  accuracy: 90,
  evasion: 5,
};

export const GUARDIAN_LOW: EnemyTemplate = {
  id: "guardian_low",
  nameKey: "enemies.guardian_low",
  tier: "normal",
  baseStats: DEFAULT_ENEMY_BASE,
  skillIds: ["enemy_heavy_blow"],
  aiProfile: {
    skillBias: 0.7,
    skillPriority: ["enemy_heavy_blow"],
  },
};

export const GUARDIAN_MID: EnemyTemplate = {
  id: "guardian_mid",
  nameKey: "enemies.guardian_mid",
  tier: "normal",
  baseStats: DEFAULT_ENEMY_BASE,
  skillIds: ["enemy_poison_stab"],
  aiProfile: {
    skillBias: 0.7,
    skillPriority: ["enemy_poison_stab"],
  },
};

export const GUARDIAN_HIGH: EnemyTemplate = {
  id: "guardian_high",
  nameKey: "enemies.guardian_high",
  tier: "normal",
  baseStats: DEFAULT_ENEMY_BASE,
  skillIds: ["enemy_armor_break"],
  aiProfile: {
    skillBias: 0.7,
    skillPriority: ["enemy_armor_break"],
  },
};

export const BOSS_EARLY: EnemyTemplate = {
  id: "boss_early",
  nameKey: "enemies.boss_early",
  tier: "boss",
  baseStats: DEFAULT_ENEMY_BASE,
  skillIds: ["enemy_slam", "enemy_enrage"],
  aiProfile: {
    skillBias: 0.8,
    skillPriority: ["enemy_slam", "enemy_enrage"],
  },
};

export const BOSS_MID: EnemyTemplate = {
  id: "boss_mid",
  nameKey: "enemies.boss_mid",
  tier: "boss",
  baseStats: DEFAULT_ENEMY_BASE,
  skillIds: ["enemy_stun_smash", "enemy_slam", "enemy_enrage"],
  aiProfile: {
    skillBias: 0.85,
    skillPriority: ["enemy_stun_smash", "enemy_slam", "enemy_enrage"],
  },
};

export const BOSS_LATE: EnemyTemplate = {
  id: "boss_late",
  nameKey: "enemies.boss_late",
  tier: "boss",
  baseStats: DEFAULT_ENEMY_BASE,
  skillIds: ["enemy_stun_smash", "enemy_slam", "enemy_regenerate"],
  aiProfile: {
    skillBias: 0.9,
    skillPriority: ["enemy_stun_smash", "enemy_slam", "enemy_regenerate"],
  },
};

export const ENEMY_TEMPLATES: EnemyTemplate[] = [
  GUARDIAN_LOW,
  GUARDIAN_MID,
  GUARDIAN_HIGH,
  BOSS_EARLY,
  BOSS_MID,
  BOSS_LATE,
];

const TEMPLATE_BY_ID = new Map(ENEMY_TEMPLATES.map((t) => [t.id, t]));

export function getEnemyTemplateById(id: string): EnemyTemplate | undefined {
  return TEMPLATE_BY_ID.get(id);
}

export function resolveEnemyTemplate(floor: number): EnemyTemplate {
  if (isBossFloor(floor)) {
    if (floor <= 30) return BOSS_EARLY;
    if (floor <= 60) return BOSS_MID;
    return BOSS_LATE;
  }
  if (floor <= 30) return GUARDIAN_LOW;
  if (floor <= 60) return GUARDIAN_MID;
  return GUARDIAN_HIGH;
}
