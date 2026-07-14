import { t, type Locale } from "../../utils/i18n";

interface TopHudProps {
  locale: Locale;
  displayName: string;
  level: number;
  exp: number;
  gold: string;
  onToggleLocale: () => void;
}

export function TopHud({
  locale,
  displayName,
  level,
  exp,
  gold,
  onToggleLocale,
}: TopHudProps) {
  return (
    <header className="top-hud">
      <div className="hud-block">
        <span className="hud-name">{displayName}</span>
        <span>
          {t("hud.level", locale)} {level}
        </span>
        <span>
          {t("hud.exp", locale)} {exp}
        </span>
      </div>

      <div className="hud-block hud-block--right">
        <span className="hud-gold">🪙 {gold}</span>
        <div className="hud-actions">
          <button
            className="icon-btn"
            onClick={onToggleLocale}
            aria-label={t("settings.lang", locale)}
          >
            {locale === "en" ? "🇹🇭" : "🇬🇧"}
          </button>
          <button className="icon-btn" aria-label="Settings">
            ⚙
          </button>
        </div>
      </div>
    </header>
  );
}
