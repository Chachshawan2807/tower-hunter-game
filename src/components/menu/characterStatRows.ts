import {
  formatFlatBonusSuffix,
  formatFlatPercentBonusSuffix,
  formatPercentBonusSuffix,
  formatPercentPoints,
  formatStatNumber,
  formatStoredPercent,
  type GearStatBonus,
} from "../../engine/art/equipment";
import type { StatusStatKey } from "../../engine/formulas/statusPoints";
import type { PlayerStatsResponse } from "../../utils/api";

export interface StatRow {
  key: string;
  baseValue: string;
  gearBonus?: string;
  vital?: boolean;
  allocStat?: StatusStatKey;
}

export function totalAllocatedFromStats(
  stats: PlayerStatsResponse["stats"]
): number {
  return (
    (stats.alloc_hp ?? 0) +
    (stats.alloc_mp ?? 0) +
    (stats.alloc_atk ?? 0) +
    (stats.alloc_def ?? 0) +
    (stats.alloc_spd ?? 0) +
    (stats.alloc_crit ?? 0) +
    (stats.alloc_crit_dmg ?? 0) +
    (stats.alloc_resist ?? 0) +
    (stats.alloc_eva ?? 0) +
    (stats.alloc_acc ?? 0)
  );
}

export function buildCharacterStatRows(
  stats: NonNullable<PlayerStatsResponse["stats"]>,
  bonus: GearStatBonus
): StatRow[] {
  return [
    {
      key: "HP",
      vital: true,
      allocStat: "hp",
      baseValue: formatStatNumber(stats.max_hp),
      gearBonus: formatFlatBonusSuffix(bonus.maxHp),
    },
    {
      key: "MP",
      vital: true,
      allocStat: "mp",
      baseValue: formatStatNumber(stats.max_mp),
      gearBonus: formatFlatBonusSuffix(bonus.maxMp),
    },
    {
      key: "ATK",
      allocStat: "atk",
      baseValue: formatStatNumber(stats.atk),
      gearBonus: formatFlatBonusSuffix(bonus.atk),
    },
    {
      key: "DEF",
      allocStat: "def",
      baseValue: formatStatNumber(stats.def),
      gearBonus: formatFlatBonusSuffix(bonus.def),
    },
    {
      key: "SPD",
      allocStat: "spd",
      baseValue: formatStatNumber(stats.speed),
      gearBonus: formatFlatBonusSuffix(bonus.speed),
    },
    {
      key: "CRIT",
      allocStat: "crit",
      baseValue: formatStoredPercent(stats.crit_chance),
      gearBonus: formatPercentBonusSuffix(bonus.critChance),
    },
    {
      key: "CRIDMG",
      allocStat: "crit_dmg",
      baseValue: formatStoredPercent(stats.crit_damage),
      gearBonus: formatPercentBonusSuffix(bonus.critDamage),
    },
    {
      key: "RESIST",
      allocStat: "resist",
      baseValue: formatStoredPercent(stats.status_resist),
      gearBonus: formatPercentBonusSuffix(bonus.statusResist),
    },
    {
      key: "EVA",
      allocStat: "eva",
      baseValue: formatPercentPoints(stats.evasion),
      gearBonus: formatFlatPercentBonusSuffix(bonus.evasion),
    },
    {
      key: "ACC",
      allocStat: "acc",
      baseValue: formatPercentPoints(stats.accuracy),
      gearBonus: formatFlatPercentBonusSuffix(bonus.accuracy),
    },
  ];
}
