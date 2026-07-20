import { expTowardNextLevel } from "../../engine/formulas/playerProgression";
import { t, type Locale } from "../../utils/i18n";

interface CharacterOverlayTitleProps {
  locale: Locale;
  level: number;
  exp: number;
  displayName: string;
}

function formatExpProgress(level: number, exp: number): string {
  const { current, needed } = expTowardNextLevel(level, exp);
  return `${current.toLocaleString()}/${needed.toLocaleString()}`;
}

export function CharacterOverlayTitle({
  locale,
  level,
  exp,
  displayName,
}: CharacterOverlayTitleProps) {
  return (
    <span className="char-overlay-title">
      <span className="char-overlay-title__level tabular-nums">
        LV {level}
      </span>
      <span className="char-overlay-title__sep" aria-hidden="true">
        ·
      </span>
      <span className="char-overlay-title__name" title={displayName}>
        {displayName}
      </span>
      <span className="char-overlay-title__sep" aria-hidden="true">
        ·
      </span>
      <span className="char-overlay-title__exp tabular-nums">
        {t("hud.exp", locale)} {formatExpProgress(level, exp)}
      </span>
    </span>
  );
}

export function characterOverlayTitleLabel(
  locale: Locale,
  level: number,
  exp: number,
  displayName: string
): string {
  return `LV ${level} ${displayName} ${t("hud.exp", locale)} ${formatExpProgress(level, exp)}`;
}
