/** Numeric stat values are unbounded (overpower scaling). */
export type StatValue = number;

export interface CombatStats {
  level: StatValue;
  exp: StatValue;
  hp: StatValue;
  maxHp: StatValue;
  mp: StatValue;
  maxMp: StatValue;
  atk: StatValue;
  def: StatValue;
  speed: StatValue;
  critChance: StatValue;
  critDamage: StatValue;
  critResist: StatValue;
  accuracy: StatValue;
  evasion: StatValue;
  statusChance: StatValue;
  statusResist: StatValue;
}

export type EntitySide = "player" | "enemy";

export interface BattleEntity {
  id: string;
  side: EntitySide;
  name: string;
  stats: CombatStats;
  actionGauge: StatValue;
  statusEffects: StatusEffect[];
  /** Remaining cooldown turns per skill id. */
  skillCooldowns: Record<string, number>;
  /** Floor-tier enemy template id (enemy side only). */
  enemyTemplateId?: string;
}

export type StatusEffectType =
  | "poison"
  | "bleed"
  | "stun"
  | "freeze"
  | "atk_buff"
  | "def_buff"
  | "atk_debuff"
  | "def_debuff";

export interface StatusEffect {
  type: StatusEffectType;
  remainingTurns: number;
  /** Percent modifier for buff/debuff (e.g. 0.2 = +20%, -0.25 = -25%) */
  magnitude?: StatValue;
  sourceId: string;
}

export type TurnPhase =
  | "start_of_turn"
  | "action_choice"
  | "execution"
  | "end_of_turn";

export interface TurnContext {
  phase: TurnPhase;
  activeEntityId: string;
  floor: number;
  turnNumber: number;
  autoBattle: boolean;
}

export type SkillPath = "imperial" | "knight" | "vanguard";

export type ItemRarity = "common" | "rare" | "epic" | "legendary";

export interface ItemDefinition {
  id: string;
  rarity: ItemRarity;
  stringId: string;
}

export type AnimationEventType =
  | "turn_start"
  | "dot_damage"
  | "cc_skip"
  | "attack"
  | "miss"
  | "critical"
  | "damage"
  | "heal"
  | "buff_apply"
  | "debuff_apply"
  | "buff_expire"
  | "debuff_expire"
  | "turn_end"
  | "battle_win"
  | "battle_lose";

export interface AnimationEvent {
  type: AnimationEventType;
  actorId: string;
  targetId?: string;
  value?: StatValue;
  metadata?: Record<string, unknown>;
}

export interface AnimationQueuePayload {
  events: AnimationEvent[];
  finalState: BattleSnapshot;
}

export interface BattleSnapshot {
  entities: BattleEntity[];
  floor: number;
  turnNumber: number;
  isComplete: boolean;
  result?: "win" | "lose";
}

export type PlayerIntent =
  | { type: "request_action"; skillId: string; targetId: string }
  | { type: "toggle_auto_battle"; enabled: boolean }
  | { type: "toggle_auto_climb"; enabled: boolean }
  | { type: "skip_animation" };

export interface RewardPayload {
  exp: StatValue;
  gold: bigint;
  items: ItemDefinition[];
}

export interface EnemyBaseStats {
  hp: StatValue;
  atk: StatValue;
  def: StatValue;
  speed: StatValue;
  accuracy: StatValue;
  evasion: StatValue;
}

export const ACTION_GAUGE_MAX = 100;
export const DOT_HP_PERCENT = 0.05;
export const DOT_DEFAULT_TURNS = 3;
export const CC_DEFAULT_TURNS = 1;
export const ATK_BUFF_MAGNITUDE = 0.2;
export const DEF_BUFF_MAGNITUDE = 0.2;
export const ATK_DEBUFF_MAGNITUDE = -0.25;
export const DEF_DEBUFF_MAGNITUDE = -0.25;
export const BUFF_DEBUFF_DEFAULT_TURNS = 2;
export const ENEMY_EXPONENT_BASE = 1.08;
export const BOSS_STAT_MULTIPLIER = 1.5;
export const BOSS_FLOOR_INTERVAL = 10;
export const INVENTORY_MAX_CAPACITY = 100;
export const MAILBOX_TTL_DAYS = 14;

export function isBossFloor(floor: number): boolean {
  return floor > 0 && floor % BOSS_FLOOR_INTERVAL === 0;
}

export function isCrowdControl(type: StatusEffectType): boolean {
  return type === "stun" || type === "freeze";
}

export function isDot(type: StatusEffectType): boolean {
  return type === "poison" || type === "bleed";
}

export function isStatModifier(type: StatusEffectType): boolean {
  return (
    type === "atk_buff" ||
    type === "def_buff" ||
    type === "atk_debuff" ||
    type === "def_debuff"
  );
}
