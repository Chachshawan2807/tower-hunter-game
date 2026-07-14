import { DOT_DEFAULT_TURNS, type StatusEffect } from "../types";

export function createBleedEffect(
  sourceId: string,
  turns: number = DOT_DEFAULT_TURNS
): StatusEffect {
  return { type: "bleed", remainingTurns: turns, sourceId };
}

export function hasBleed(effects: StatusEffect[]): boolean {
  return effects.some((e) => e.type === "bleed" && e.remainingTurns > 0);
}

export function mergeBleed(
  effects: StatusEffect[],
  sourceId: string,
  turns: number = DOT_DEFAULT_TURNS
): StatusEffect[] {
  if (hasBleed(effects)) {
    return effects.map((e) =>
      e.type === "bleed"
        ? { ...e, remainingTurns: Math.max(e.remainingTurns, turns) }
        : e
    );
  }
  return [...effects, createBleedEffect(sourceId, turns)];
}
