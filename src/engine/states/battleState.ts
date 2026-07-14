import type { SkillLoadout } from "../skills/loadout";
import type { SkillUpgradeRanks } from "../skills/types";
import type {
  AnimationEvent,
  BattleEntity,
  BattleSnapshot,
  EntitySide,
  SkillPath,
} from "../types";

export interface BattleAction {
  type: "basic_attack";
  targetId: string;
  skillId?: string;
}

export interface BattleState {
  entities: BattleEntity[];
  floor: number;
  turnNumber: number;
  autoBattle: boolean;
  playerSkillPath: SkillPath;
  playerLoadout: SkillLoadout;
  playerSkillUpgrades: Record<string, SkillUpgradeRanks>;
  isComplete: boolean;
  result?: "win" | "lose";
}

export interface TurnProcessResult {
  state: BattleState;
  events: AnimationEvent[];
  snapshot: BattleSnapshot;
  actionRequired: boolean;
  waitingActorId?: string;
}

export function cloneBattleState(state: BattleState): BattleState {
  return {
    ...state,
    playerSkillUpgrades: { ...state.playerSkillUpgrades },
    entities: state.entities.map((e) => ({
      ...e,
      stats: { ...e.stats },
      statusEffects: [...e.statusEffects],
      skillCooldowns: { ...e.skillCooldowns },
    })),
  };
}

export function findEntity(
  state: BattleState,
  entityId: string
): BattleEntity | undefined {
  return state.entities.find((e) => e.id === entityId);
}

export function updateEntity(
  state: BattleState,
  entityId: string,
  updater: (entity: BattleEntity) => BattleEntity
): BattleState {
  return {
    ...state,
    entities: state.entities.map((e) =>
      e.id === entityId ? updater(e) : e
    ),
  };
}

export function getEntitiesBySide(
  state: BattleState,
  side: EntitySide
): BattleEntity[] {
  return state.entities.filter((e) => e.side === side);
}

export function getOpponents(
  state: BattleState,
  entity: BattleEntity
): BattleEntity[] {
  const opponentSide: EntitySide =
    entity.side === "player" ? "enemy" : "player";
  return getEntitiesBySide(state, opponentSide).filter((e) => e.stats.hp > 0);
}

export function toBattleSnapshot(state: BattleState): BattleSnapshot {
  return {
    entities: cloneBattleState(state).entities,
    floor: state.floor,
    turnNumber: state.turnNumber,
    isComplete: state.isComplete,
    result: state.result,
  };
}

export function checkBattleOutcome(state: BattleState): BattleState {
  const players = getEntitiesBySide(state, "player");
  const enemies = getEntitiesBySide(state, "enemy");

  const allPlayersDead = players.every((e) => e.stats.hp <= 0);
  const allEnemiesDead = enemies.every((e) => e.stats.hp <= 0);

  if (allEnemiesDead && enemies.length > 0) {
    return { ...state, isComplete: true, result: "win" };
  }

  if (allPlayersDead && players.length > 0) {
    return { ...state, isComplete: true, result: "lose" };
  }

  return state;
}
