import { t, type Locale } from "../../utils/i18n";

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
  return (
    <button
      type="button"
      className={`result-action result-action--${result}`}
      onClick={onReset}
      aria-label={
        result === "win"
          ? `${t("battle.win", locale)} — ${t("battle.continue", locale)}`
          : `${t("battle.lose", locale)} — ${t("battle.continue", locale)}`
      }
    >
      <span className="result-action__title">
        {result === "win" ? t("battle.win", locale) : t("battle.lose", locale)}
      </span>
      <span className="result-action__hint">{t("battle.continue", locale)}</span>
    </button>
  );
}
