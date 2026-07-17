import { t, type Locale } from "../../utils/i18n";

interface SkillOverlayTitleProps {
  locale: Locale;
  skillPoints: number;
}

export function SkillOverlayTitle({
  locale,
  skillPoints,
}: SkillOverlayTitleProps) {
  return (
    <span className="skill-overlay-title">
      <span className="skill-overlay-title__label">
        {t("skills.overlay_title", locale)}
      </span>
      <span className="skill-overlay-title__value tabular-nums">
        {skillPoints}
      </span>
    </span>
  );
}

export function skillOverlayTitleLabel(
  locale: Locale,
  skillPoints: number
): string {
  return `${t("skills.overlay_title", locale)} ${skillPoints}`;
}
