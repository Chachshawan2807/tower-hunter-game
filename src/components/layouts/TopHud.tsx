import { expProgressRatio } from "../../engine/formulas/playerProgression";
import { GameIcon } from "../ui/icons";
import { CharacterNameEditor } from "../character/CharacterNameEditor";
import { playUiClick } from "../../hooks/useGameAudio";
import { t, type Locale } from "../../utils/i18n";

interface TopHudProps {
  locale: Locale;
  displayName: string;
  level: number;
  exp: number;
  gold: string;
  mailboxCount?: number;
  onOpenMailbox: () => void;
  onOpenSettings: () => void;
  /** Home view: stats-only bar (name shown inline, editable) */
  compact?: boolean;
  nameEditable?: boolean;
  nameBusy?: boolean;
  onRename?: (name: string) => Promise<void>;
}

export function TopHud({
  locale,
  displayName,
  level,
  exp,
  gold,
  mailboxCount = 0,
  onOpenMailbox,
  onOpenSettings,
  compact = false,
  nameEditable = false,
  nameBusy = false,
  onRename,
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
            {compact && nameEditable && onRename ? (
              <CharacterNameEditor
                locale={locale}
                displayName={displayName}
                busy={nameBusy}
                variant="hud"
                onSave={onRename}
              />
            ) : compact ? (
              <span className="hud-name--inline">{displayName}</span>
            ) : null}
            {!compact ? (
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
            ) : null}
          </div>
        </div>

        <div className="hud-chrome__wallet">
          <span className="hud-gold tabular-nums" aria-label={`Gold: ${gold}`}>
            <span className="hud-gold__icon" aria-hidden="true">
              <GameIcon name="gold" size={32} />
            </span>
            <span className="hud-gold__amount">{gold}</span>
          </span>
          <div className="hud-actions">
            <button
              type="button"
              className="hud-action-btn hud-action-btn--mailbox"
              onClick={() => {
                playUiClick();
                onOpenMailbox();
              }}
              aria-label={
                mailboxCount > 0
                  ? `${t("bag.mailbox", locale)} (${mailboxCount})`
                  : t("bag.mailbox", locale)
              }
            >
              <span className="hud-action-btn__icon" aria-hidden="true">
                <GameIcon name="mailbox" size={28} />
                {mailboxCount > 0 ? (
                  <span className="hud-action-btn__badge tabular-nums">
                    {mailboxCount > 99 ? "99+" : mailboxCount}
                  </span>
                ) : null}
              </span>
            </button>
            <button
              type="button"
              className="hud-action-btn hud-action-btn--settings"
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
      </div>
    </header>
  );
}
