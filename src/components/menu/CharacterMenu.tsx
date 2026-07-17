import { formatStatBonus } from "../../engine/art/equipment";
import type { GearStatBonus } from "../../engine/art/equipment/statBonuses";
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

  const vitals = [
    { key: "HP", value: `${stats.hp}/${stats.max_hp}` },
    { key: "MP", value: `${stats.mp}/${stats.max_mp}` },
  ];

  const combat = [
    { key: "ATK", value: stats.atk },
    { key: "DEF", value: stats.def },
    { key: "SPD", value: stats.speed },
    { key: "LV", value: stats.level },
    { key: "ACC", value: stats.accuracy ?? "—" },
    { key: "EVA", value: stats.evasion ?? "—" },
    { key: "CRIT", value: stats.crit_chance ?? "—" },
    { key: "CRIT DMG", value: stats.crit_damage ?? "—" },
    { key: "STATUS", value: stats.status_chance ?? "—" },
    { key: "RESIST", value: stats.status_resist ?? "—" },
  ];

  const bonusLines = formatStatBonus(equipmentStatBonus);

  return (
    <div className="char-menu">
      <CharacterEquipmentPanel
        locale={locale}
        equipment={equipment}
        displayName={displayName}
      />

      <div className="char-menu__section ui-section">
        {bonusLines.length > 0 && (
          <p className="char-equip-bonus" aria-label={t("char.equipment_bonus", locale)}>
            {t("char.equipment_bonus", locale)}: {bonusLines.join(" · ")}
          </p>
        )}

        <div className="stat-grid stat-grid--vitals">
          {vitals.map((stat) => (
            <div key={stat.key} className="stat-item stat-item--vital">
              <span>{stat.key}</span>
              {stat.value}
            </div>
          ))}
        </div>

        <div className="stat-grid">
          {combat.map((stat) => (
            <div key={stat.key} className="stat-item">
              <span>{stat.key}</span>
              {stat.value}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
