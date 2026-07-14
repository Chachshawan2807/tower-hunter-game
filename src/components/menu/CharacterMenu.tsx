import { t, type Locale } from "../../utils/i18n";
import type { PlayerStatsResponse } from "../../utils/api";

interface CharacterMenuProps {
  locale: Locale;
  stats: PlayerStatsResponse["stats"] | null;
}

export function CharacterMenu({ locale, stats }: CharacterMenuProps) {
  if (!stats) {
    return <p className="menu-empty">{t("char.stats", locale)}...</p>;
  }

  const rows = [
    { key: "HP", value: `${stats.hp}/${stats.max_hp}` },
    { key: "MP", value: `${stats.mp}/${stats.max_mp}` },
    { key: "ATK", value: stats.atk },
    { key: "DEF", value: stats.def },
    { key: "SPD", value: stats.speed },
    { key: "LV", value: stats.level },
  ];

  return (
    <div>
      <p className="menu-subtitle">{t("char.stats", locale)}</p>
      <div className="stat-grid">
        {rows.map((stat) => (
          <div key={stat.key} className="stat-item">
            <span>{stat.key}</span>
            {stat.value}
          </div>
        ))}
      </div>
    </div>
  );
}
