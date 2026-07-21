import type { StatusEffect, StatusEffectType } from "../../types";

export interface BaseStatusDefinition {
  readonly type: StatusEffectType;
  readonly defaultTurns: number;
  readonly magnitude?: number;
}

export type StatusFactory = (
  sourceId: string,
  turns?: number,
  magnitude?: number
) => StatusEffect;

export function defineStatus(
  definition: BaseStatusDefinition,
  factory: StatusFactory
): BaseStatusDefinition & { create: StatusFactory } {
  return {
    ...definition,
    create: (sourceId, turns = definition.defaultTurns, magnitude) =>
      factory(sourceId, turns, magnitude),
  };
}
