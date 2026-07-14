import { rollStatusProc } from "../formulas/statusRoll";
import type { SkillDefinition } from "../skills/types";
import type { AnimationEvent, BattleEntity, StatusEffect, StatusEffectType } from "../types";
import { mergeBleed } from "./bleed";
import { mergeDefDebuff } from "./defDebuff";
import { mergeFreeze } from "./freeze";
import { mergePoison } from "./poison";
import { mergeStun } from "./stun";

export interface StatusApplyResult {
  statusEffects: StatusEffect[];
  events: AnimationEvent[];
}

function applyStatusType(
  effects: StatusEffect[],
  type: StatusEffectType,
  sourceId: string
): StatusEffect[] {
  switch (type) {
    case "poison":
      return mergePoison(effects, sourceId);
    case "bleed":
      return mergeBleed(effects, sourceId);
    case "stun":
      return mergeStun(effects, sourceId);
    case "freeze":
      return mergeFreeze(effects, sourceId);
    case "def_debuff":
      return mergeDefDebuff(effects, sourceId);
    default:
      return effects;
  }
}

function pushStatusEvent(
  events: AnimationEvent[],
  attacker: BattleEntity,
  target: BattleEntity,
  effectType: StatusEffectType
): void {
  events.push({
    type: "debuff_apply",
    actorId: attacker.id,
    targetId: target.id,
    metadata: { effectType },
  });
}

/**
 * Applies skill-defined or rolled poison/bleed/stun/freeze/def_debuff after a successful hit.
 */
export function applyStatusOnHit(
  attacker: BattleEntity,
  target: BattleEntity,
  rng: () => number = Math.random,
  skill?: SkillDefinition
): StatusApplyResult {
  const events: AnimationEvent[] = [];
  let statusEffects = target.statusEffects;

  if (skill?.guaranteedStatus) {
    statusEffects = applyStatusType(
      statusEffects,
      skill.guaranteedStatus,
      attacker.id
    );
    pushStatusEvent(events, attacker, target, skill.guaranteedStatus);
    return { statusEffects, events };
  }

  const procChance =
    attacker.stats.statusChance + (skill?.statusProcBonus ?? 0);

  if (!rollStatusProc(procChance, target.stats.statusResist, rng)) {
    return { statusEffects, events };
  }

  const pool: StatusEffectType[] =
    attacker.side === "player"
      ? ["poison", "bleed"]
      : ["stun", "freeze"];
  const kind = pool[Math.floor(rng() * pool.length)];

  statusEffects = applyStatusType(statusEffects, kind, attacker.id);
  pushStatusEvent(events, attacker, target, kind);

  return { statusEffects, events };
}
