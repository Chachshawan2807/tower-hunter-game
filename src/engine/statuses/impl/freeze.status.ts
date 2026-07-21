import { CC_DEFAULT_TURNS, type StatusEffect } from "../../types";
import { defineStatus } from "../base-status.interface";

export function createFreezeEffect(
  sourceId: string,
  turns: number = CC_DEFAULT_TURNS
): StatusEffect {
  return { type: "freeze", remainingTurns: turns, sourceId };
}

export function hasFreeze(effects: StatusEffect[]): boolean {
  return effects.some((e) => e.type === "freeze" && e.remainingTurns > 0);
}

export function mergeFreeze(
  effects: StatusEffect[],
  sourceId: string,
  turns: number = CC_DEFAULT_TURNS
): StatusEffect[] {
  if (hasFreeze(effects)) return effects;
  return [...effects, createFreezeEffect(sourceId, turns)];
}

export const FREEZE_STATUS = defineStatus(
  { type: "freeze", defaultTurns: CC_DEFAULT_TURNS },
  createFreezeEffect
);
