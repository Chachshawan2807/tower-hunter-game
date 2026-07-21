import { CC_DEFAULT_TURNS, type StatusEffect } from "../../types";
import { defineStatus } from "../base-status.interface";

export function createStunEffect(
  sourceId: string,
  turns: number = CC_DEFAULT_TURNS
): StatusEffect {
  return { type: "stun", remainingTurns: turns, sourceId };
}

export function hasStun(effects: StatusEffect[]): boolean {
  return effects.some((e) => e.type === "stun" && e.remainingTurns > 0);
}

export function mergeStun(
  effects: StatusEffect[],
  sourceId: string,
  turns: number = CC_DEFAULT_TURNS
): StatusEffect[] {
  if (hasStun(effects)) return effects;
  return [...effects, createStunEffect(sourceId, turns)];
}

export const STUN_STATUS = defineStatus(
  { type: "stun", defaultTurns: CC_DEFAULT_TURNS },
  createStunEffect
);
