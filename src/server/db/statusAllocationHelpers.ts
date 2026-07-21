import {
  mergedPlayerStatsFromAllocations,
  type StatusAllocations,
  type StatusStatKey,
} from "../../engine/formulas/statusPoints";
import type { PlayerStatsRow } from "./playerStats";

export class StatusAllocationError extends Error {
  constructor(
    message: string,
    readonly code:
      | "INVALID_STAT"
      | "INSUFFICIENT_POINTS"
      | "STATS_NOT_FOUND"
      | "NOTHING_TO_RESET"
  ) {
    super(message);
    this.name = "StatusAllocationError";
  }
}

export function readAllocations(row: PlayerStatsRow): StatusAllocations {
  return {
    hp: row.alloc_hp,
    mp: row.alloc_mp,
    atk: row.alloc_atk,
    def: row.alloc_def,
    spd: row.alloc_spd,
    crit: row.alloc_crit,
    critDmg: row.alloc_crit_dmg,
    resist: row.alloc_resist,
    eva: row.alloc_eva,
    acc: row.alloc_acc,
  };
}

export const ALLOC_COLUMNS: Record<StatusStatKey, keyof PlayerStatsRow> = {
  hp: "alloc_hp",
  mp: "alloc_mp",
  atk: "alloc_atk",
  def: "alloc_def",
  spd: "alloc_spd",
  crit: "alloc_crit",
  crit_dmg: "alloc_crit_dmg",
  resist: "alloc_resist",
  eva: "alloc_eva",
  acc: "alloc_acc",
};

export function formatMergedStats(
  merged: ReturnType<typeof mergedPlayerStatsFromAllocations>
) {
  return {
    maxHp: merged.maxHp.toString(),
    maxMp: merged.maxMp.toString(),
    atk: merged.atk.toString(),
    def: merged.def.toString(),
    speed: merged.speed.toString(),
    critChance: merged.critChance.toString(),
    critDamage: merged.critDamage.toString(),
    statusResist: merged.statusResist.toString(),
    evasion: merged.evasion.toString(),
    accuracy: merged.accuracy.toString(),
  };
}
