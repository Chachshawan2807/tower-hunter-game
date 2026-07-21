/** Numeric stat values are unbounded (overpower scaling). */
export type StatValue = number;

export type TargetType =
  | "SINGLE_ENEMY"
  | "ALL_ENEMIES"
  | "SELF"
  | "ALLY";

/** Client intent payload for a single combat action (server-validated). */
export interface ActionIntentPayload {
  readonly characterId: string;
  readonly skillId: string;
  readonly targetId: string;
  /** Idempotency token — must match the server's current turn nonce. */
  readonly turnNonce: string;
}

/** Lightweight character view for turn resolution packets. */
export interface CharacterStats {
  readonly id: string;
  readonly name: string;
  readonly hp: StatValue;
  readonly maxHp: StatValue;
  readonly actionGauge: StatValue;
  readonly speed: StatValue;
}

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
  | "slow"
  | "silence"
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

export type SkillPath = "imperial" | "knight" | "vanguard";

export type ItemRarity = "common" | "rare" | "epic" | "legendary";

export interface ItemDefinition {
  id: string;
  rarity: ItemRarity;
  stringId: string;
}

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

export function toCharacterStats(entity: BattleEntity): CharacterStats {
  return {
    id: entity.id,
    name: entity.name,
    hp: entity.stats.hp,
    maxHp: entity.stats.maxHp,
    actionGauge: entity.actionGauge,
    speed: entity.stats.speed,
  };
}
