import { scaleEnemyStatsForFloor } from "../../engine/formulas";
import { getDefaultLoadout, type SkillLoadout } from "../../engine/skills/loadout";
import type { SkillUpgradeRanks } from "../../engine/skills/types";
import type { BattleState } from "../../engine/states";
import type { BattleEntity, CombatStats, SkillPath } from "../../engine/types";

export const DEFAULT_PLAYER_STATS: CombatStats = {
  level: 1,
  exp: 0,
  hp: 500,
  maxHp: 500,
  mp: 100,
  maxMp: 100,
  atk: 50,
  def: 20,
  speed: 100,
  critChance: 0.1,
  critDamage: 1.5,
  critResist: 0,
  accuracy: 100,
  evasion: 10,
  statusChance: 0.05,
  statusResist: 0.05,
};

const ENEMY_BASE = {
  hp: 200,
  atk: 30,
  def: 15,
  speed: 80,
  accuracy: 90,
  evasion: 5,
};

function buildPlayerEntity(stats: CombatStats, name: string): BattleEntity {
  return {
    id: "player",
    side: "player",
    name,
    stats: { ...stats, hp: Math.min(stats.hp, stats.maxHp) },
    actionGauge: 0,
    statusEffects: [],
    skillCooldowns: {},
  };
}

function buildEnemyEntity(floor: number): BattleEntity {
  const scaled = scaleEnemyStatsForFloor(ENEMY_BASE, floor);
  const boss = floor > 0 && floor % 10 === 0;

  return {
    id: `enemy_floor_${floor}`,
    side: "enemy",
    name: boss ? `Floor ${floor} Boss` : `Floor ${floor} Guardian`,
    stats: {
      level: floor,
      exp: 0,
      hp: scaled.hp,
      maxHp: scaled.hp,
      mp: 0,
      maxMp: 0,
      atk: scaled.atk,
      def: scaled.def,
      speed: scaled.speed,
      critChance: 0.05,
      critDamage: 1.5,
      critResist: 0,
      accuracy: scaled.accuracy,
      evasion: scaled.evasion,
      statusChance: 0.05,
      statusResist: 0.05,
    },
    actionGauge: 0,
    statusEffects: [],
    skillCooldowns: {},
  };
}

export function createBattleState(
  floor: number,
  options?: {
    autoBattle?: boolean;
    playerStats?: CombatStats;
    playerName?: string;
    playerSkillPath?: SkillPath;
    playerLoadout?: SkillLoadout;
    playerSkillUpgrades?: Record<string, SkillUpgradeRanks>;
  }
): BattleState {
  const playerStats = options?.playerStats ?? DEFAULT_PLAYER_STATS;
  const playerName = options?.playerName ?? "Hero";
  const path = options?.playerSkillPath ?? "murim";
  const loadout =
    options?.playerLoadout ?? getDefaultLoadout(path, playerStats.level);

  return {
    entities: [
      buildPlayerEntity(playerStats, playerName),
      buildEnemyEntity(floor),
    ],
    floor,
    turnNumber: 1,
    autoBattle: options?.autoBattle ?? true,
    playerSkillPath: path,
    playerLoadout: loadout,
    playerSkillUpgrades: options?.playerSkillUpgrades ?? {},
    isComplete: false,
  };
}
