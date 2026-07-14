import { t, type Locale } from "../../utils/i18n";
import type { SkillPath } from "../../engine/types";
import type { CharacterEquipmentVisual } from "../../engine/art/equipment/catalog";
import { CharacterFigure } from "../character/CharacterFigure";

interface MainStageProps {
  locale: Locale;
  displayName: string;
  skillPath: SkillPath;
  level: number;
  equipment: CharacterEquipmentVisual;
}

export function MainStage({
  locale,
  displayName,
  skillPath,
  level,
  equipment,
}: MainStageProps) {
  return (
    <div className="main-stage" role="main" aria-label={t("nav.character", locale)}>
      <div className="hero-showcase">
        <div className="hero-showcase__spotlight" aria-hidden="true" />
        <div className="hero-showcase__platform">
          <div className="hero-showcase__pedestal" aria-hidden="true" />
          <CharacterFigure
            equipment={equipment}
            path={skillPath}
            side="player"
            animState="idle"
            size="stage"
            label={displayName}
          />
        </div>
        <div className="hero-showcase__nameplate">
          <h1 className="hero-showcase__name">{displayName}</h1>
          <div className="hero-showcase__meta">
            <span className={`hero-showcase__path hero-showcase__path--${skillPath}`}>
              {t(`skills.${skillPath}`, locale)}
            </span>
            <span className="hero-showcase__level">
              {t("hud.level", locale)} {level}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
