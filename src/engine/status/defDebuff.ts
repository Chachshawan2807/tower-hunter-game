import {
  BUFF_DEBUFF_DEFAULT_TURNS,
  DEF_DEBUFF_MAGNITUDE,
  type StatusEffect,
} from "../types";

export function createDefDebuffEffect(
  sourceId: string,
  turns: number = BUFF_DEBUFF_DEFAULT_TURNS,
  magnitude: number = DEF_DEBUFF_MAGNITUDE
): StatusEffect {
  return { type: "def_debuff", remainingTurns: turns, magnitude, sourceId };
}

export function hasDefDebuff(effects: StatusEffect[]): boolean {
  return effects.some((e) => e.type === "def_debuff" && e.remainingTurns > 0);
}

export function mergeDefDebuff(
  effects: StatusEffect[],
  sourceId: string,
  turns: number = BUFF_DEBUFF_DEFAULT_TURNS,
  magnitude: number = DEF_DEBUFF_MAGNITUDE
): StatusEffect[] {
  if (hasDefDebuff(effects)) {
    return effects.map((e) =>
      e.type === "def_debuff"
        ? { ...e, remainingTurns: Math.max(e.remainingTurns, turns), magnitude }
        : e
    );
  }
  return [...effects, createDefDebuffEffect(sourceId, turns, magnitude)];
}
