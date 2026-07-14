import { t, type Locale } from "../../utils/i18n";

interface CharacterMenuProps {
  locale: Locale;
}

const STATS = [
  { key: "HP", value: "500" },
  { key: "MP", value: "100" },
  { key: "ATK", value: "50" },
  { key: "DEF", value: "20" },
  { key: "SPD", value: "100" },
  { key: "CRIT", value: "10%" },
];

export function CharacterMenu({ locale }: CharacterMenuProps) {
  return (
    <div>
      <p style={{ marginBottom: 12, color: "var(--text-dim)", fontSize: "0.85rem" }}>
        {t("char.stats", locale)}
      </p>
      <div className="stat-grid">
        {STATS.map((stat) => (
          <div key={stat.key} className="stat-item">
            <span>{stat.key}</span>
            {stat.value}
          </div>
        ))}
      </div>
    </div>
  );
}
