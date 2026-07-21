import { DOT_DEFAULT_TURNS, type StatusEffect } from "../../types";
import { defineStatus } from "../base-status.interface";

export function createPoisonEffect(
  sourceId: string,
  turns: number = DOT_DEFAULT_TURNS
): StatusEffect {
  return { type: "poison", remainingTurns: turns, sourceId };
}

export function hasPoison(effects: StatusEffect[]): boolean {
  return effects.some((e) => e.type === "poison" && e.remainingTurns > 0);
}

export function mergePoison(
  effects: StatusEffect[],
  sourceId: string,
  turns: number = DOT_DEFAULT_TURNS
): StatusEffect[] {
  if (hasPoison(effects)) {
    return effects.map((e) =>
      e.type === "poison"
        ? { ...e, remainingTurns: Math.max(e.remainingTurns, turns) }
        : e
    );
  }
  return [...effects, createPoisonEffect(sourceId, turns)];
}

export const POISON_STATUS = defineStatus(
  { type: "poison", defaultTurns: DOT_DEFAULT_TURNS },
  createPoisonEffect
);
