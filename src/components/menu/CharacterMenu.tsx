import {
  formatFlatBonusSuffix,
  formatFlatPercentBonusSuffix,
  formatPercentBonusSuffix,
  formatPercentPoints,
  formatStatNumber,
  formatStoredPercent,
  type GearStatBonus,
} from "../../engine/art/equipment";
import { t, type Locale } from "../../utils/i18n";
import type { CharacterEquipmentVisual } from "../../engine/art/equipment/catalog";
import type { PlayerStatsResponse } from "../../utils/api";
import { CharacterEquipmentPanel } from "../character/CharacterEquipmentPanel";

interface CharacterMenuProps {
  locale: Locale;
  stats: PlayerStatsResponse["stats"] | null;
  displayName: string;
  equipment: CharacterEquipmentVisual;
  equipmentStatBonus?: GearStatBonus;
}

interface StatRow {
  key: string;
  value: string;
  bonus?: string;
  vital?: boolean;
}

function StatValue({ value, bonus }: { value: string; bonus?: string }) {
  return (
    <span className="stat-item__value">
      {value}
      {bonus && <span className="stat-item__bonus">{bonus}</span>}
    </span>
  );
}

export function CharacterMenu({
  locale,
  stats,
  displayName,
  equipment,
  equipmentStatBonus = {},
}: CharacterMenuProps) {
  if (!stats) {
    return <p className="menu-empty">{t("char.stats", locale)}...</p>;
  }

  const bonus = equipmentStatBonus;
  const statusPoints = stats.skill_points ?? 0;

  const statRows: StatRow[] = [
    {
      key: "HP",
      vital: true,
      value: `${formatStatNumber(stats.hp)}/${formatStatNumber(stats.max_hp)}`,
      bonus: formatFlatBonusSuffix(bonus.maxHp),
    },
    {
      key: "MP",
      vital: true,
      value: `${formatStatNumber(stats.mp)}/${formatStatNumber(stats.max_mp)}`,
      bonus: formatFlatBonusSuffix(bonus.maxMp),
    },
    {
      key: "ATK",
      value: formatStatNumber(stats.atk),
      bonus: formatFlatBonusSuffix(bonus.atk),
    },
    {
      key: "DEF",
      value: formatStatNumber(stats.def),
      bonus: formatFlatBonusSuffix(bonus.def),
    },
    {
      key: "SPD",
      value: formatStatNumber(stats.speed),
      bonus: formatFlatBonusSuffix(bonus.speed),
    },
    {
      key: "CRIT",
      value: formatStoredPercent(stats.crit_chance),
      bonus: formatPercentBonusSuffix(bonus.critChance),
    },
    {
      key: "CRIT DMG",
      value: formatStoredPercent(stats.crit_damage),
      bonus: formatPercentBonusSuffix(bonus.critDamage),
    },
    {
      key: "RESIST",
      value: formatStoredPercent(stats.status_resist),
      bonus: formatPercentBonusSuffix(bonus.statusResist),
    },
    {
      key: "EVA",
      value: formatPercentPoints(stats.evasion),
      bonus: formatFlatPercentBonusSuffix(bonus.evasion),
    },
    {
      key: "ACC",
      value: formatPercentPoints(stats.accuracy),
      bonus: formatFlatPercentBonusSuffix(bonus.accuracy),
    },
  ];

  return (
    <div className="char-menu">
      <CharacterEquipmentPanel
        locale={locale}
        equipment={equipment}
        displayName={displayName}
      />

      <div className="char-menu__section ui-section">
        <div className="stat-grid stat-grid--character">
          {Array.from({ length: 3 }, (_, index) => (
            <div
              key={`status-spacer-${index}`}
              className="stat-grid__spacer"
              aria-hidden="true"
            />
          ))}
          <div
            className="stat-item stat-item--status-point"
            aria-label={`${t("char.status_point", locale)} ${statusPoints}`}
          >
            <span className="stat-item__status-row">
              <span className="stat-item__status-label">
                {t("char.status_point", locale)}
              </span>
              <span className="stat-item__status-value tabular-nums">
                {statusPoints}
              </span>
            </span>
          </div>

          {statRows.slice(0, 5).map((stat) => (
            <div
              key={stat.key}
              className={`stat-item${stat.vital ? " stat-item--vital" : ""}`}
            >
              <span>{stat.key}</span>
              <StatValue value={stat.value} bonus={stat.bonus} />
            </div>
          ))}

          {statRows.slice(5).map((stat) => (
            <div key={stat.key} className="stat-item">
              <span>{stat.key}</span>
              <StatValue value={stat.value} bonus={stat.bonus} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
