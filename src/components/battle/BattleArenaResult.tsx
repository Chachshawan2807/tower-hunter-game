import type { BattleStepResponse } from "../../utils/api";
import { t, type Locale } from "../../utils/i18n";
import { playUiClick } from "../../hooks/useGameAudio";
import { BattleResultRewards } from "./BattleResultRewards";

interface BattleArenaResultProps {
  locale: Locale;
  result: "win" | "lose";
  rewards?: BattleStepResponse["rewards"];
  onReset: () => void;
  onNextFloor?: () => void;
  nextFloorDisabled?: boolean;
}

export function BattleArenaResult({
  locale,
  result,
  rewards,
  onReset,
  onNextFloor,
  nextFloorDisabled = false,
}: BattleArenaResultProps) {
  const title =
    result === "win" ? t("battle.win", locale) : t("battle.lose", locale);

  const showResultActions = Boolean(onNextFloor);

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
      {showResultActions ? (
        <div className="battle-result-card__actions">
          <button
            type="button"
            className="action-btn action-btn--secondary battle-result-card__action"
            onClick={() => {
              playUiClick();
              onReset();
            }}
          >
            {t("battle.back", locale)}
          </button>
          <button
            type="button"
            className="action-btn battle-result-card__action battle-result-card__action--primary"
            disabled={nextFloorDisabled}
            aria-disabled={nextFloorDisabled}
            onClick={() => {
              if (nextFloorDisabled) return;
              playUiClick();
              onNextFloor?.();
            }}
          >
            {t("battle.next_floor", locale)}
          </button>
        </div>
      ) : (
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
      )}
    </div>
  );
}
