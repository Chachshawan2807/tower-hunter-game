import { expProgressRatio } from "../../engine/formulas/playerProgression";
import { GameIcon } from "../ui/icons";
import { playUiClick } from "../../hooks/useGameAudio";
import { t, type Locale } from "../../utils/i18n";

interface TopHudProps {
  locale: Locale;
  displayName: string;
  level: number;
  exp: number;
  gold: string;
  onOpenSettings: () => void;
  /** Home view: stats-only bar (name shown on hero showcase) */
  compact?: boolean;
}

export function TopHud({
  locale,
  displayName,
  level,
  exp,
  gold,
  onOpenSettings,
  compact = false,
}: TopHudProps) {
  const expRatio = expProgressRatio(level, exp);
  const expPct = Math.round(expRatio * 100);

  return (
    <header
      className={`top-hud ${compact ? "top-hud--compact" : ""}`}
      aria-label="Player status"
    >
      <div className="top-hud__dock hud-chrome">
        <div className="hud-chrome__identity">
          {!compact && <span className="hud-name">{displayName}</span>}
          <div className="hud-level-row">
            <span className="hud-level-badge tabular-nums">
              {t("hud.level", locale)} {level}
            </span>
            {compact ? (
              <span className="hud-name--inline">{displayName}</span>
            ) : (
              <div className="hud-exp-gauge" aria-label={`EXP ${expPct}%`}>
                <span className="hud-exp-gauge__label tabular-nums">
                  {t("hud.exp", locale)} {exp.toLocaleString()}
                </span>
                <div
                  className="hud-exp-gauge__track"
                  role="progressbar"
                  aria-valuenow={expPct}
                  aria-valuemin={0}
                  aria-valuemax={100}
                >
                  <div
                    className="hud-exp-gauge__fill"
                    style={{ width: `${expPct}%` }}
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="hud-chrome__wallet">
          <span className="hud-gold tabular-nums" aria-label={`Gold: ${gold}`}>
            <span className="hud-gold__icon" aria-hidden="true">
              <GameIcon name="gold" size={32} />
            </span>
            <span className="hud-gold__amount">{gold}</span>
          </span>
          <button
            type="button"
            className="hud-action-btn"
            onClick={() => {
              playUiClick();
              onOpenSettings();
            }}
            aria-label={t("settings.title", locale)}
          >
            <span className="hud-action-btn__icon" aria-hidden="true">
              <GameIcon name="settings" size={28} />
            </span>
          </button>
        </div>
      </div>
    </header>
  );
}
