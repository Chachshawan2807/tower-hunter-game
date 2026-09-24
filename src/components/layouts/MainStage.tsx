import { t, type Locale } from "../../utils/i18n";
import type { SkillPath } from "../../engine/types";
import type { CharacterEquipmentVisual } from "../../engine/art/equipment/catalog";
import { PlayerHeroShowcase } from "../character/PlayerHeroShowcase";

interface MainStageProps {
  locale: Locale;
  displayName: string;
  skillPath: SkillPath;
  equipment: CharacterEquipmentVisual;
}

export function MainStage({
  locale,
  displayName,
  skillPath,
  equipment,
}: MainStageProps) {
  return (
    <div className="main-stage" role="main" aria-label={t("nav.character", locale)}>
      <div className="hero-showcase">
        <div className="hero-showcase__spotlight" aria-hidden="true" />
        <div className="hero-showcase__platform">
          <div className="hero-showcase__pedestal" aria-hidden="true" />
          <PlayerHeroShowcase
            size="stage"
            skillPath={skillPath}
            displayName={displayName}
            equipment={equipment}
          />
        </div>
      </div>
    </div>
  );
}
