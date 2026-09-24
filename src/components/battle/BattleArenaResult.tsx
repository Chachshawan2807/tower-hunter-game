import { t, type Locale } from "../../utils/i18n";
import { playUiClick } from "../../hooks/useGameAudio";

interface BattleArenaResultProps {
  locale: Locale;
  result: "win" | "lose";
  onReset: () => void;
}

export function BattleArenaResult({
  locale,
  result,
  onReset,
}: BattleArenaResultProps) {
  const title =
    result === "win" ? t("battle.win", locale) : t("battle.lose", locale);

  return (
    <div
      className={`battle-result-card battle-result-card--${result}`}
      role="dialog"
      aria-modal="true"
      aria-labelledby="battle-result-title"
    >
      <p id="battle-result-title" className="battle-result-card__title">
        {title}
      </p>
      <button
        type="button"
        className="action-btn battle-result-card__continue"
        onClick={() => {
          playUiClick();
          onReset();
        }}
      >
        {t("battle.continue", locale)}
      </button>
    </div>
  );
}
