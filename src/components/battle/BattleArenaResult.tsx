import type { BattleStepResponse } from "../../utils/api";
import { t, type Locale } from "../../utils/i18n";
import { playUiClick } from "../../hooks/useGameAudio";
import { BattleResultRewards } from "./BattleResultRewards";

interface BattleArenaResultProps {
  locale: Locale;
  result: "win" | "lose";
  rewards?: BattleStepResponse["rewards"];
  onReset: () => void;
}

export function BattleArenaResult({
  locale,
  result,
  rewards,
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
      {result === "win" && rewards ? (
        <BattleResultRewards locale={locale} rewards={rewards} />
      ) : null}
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
