import { getSkillById } from "../../engine/skills";
import type { SkillDefinition } from "../../engine/skills/types";
import { t, type Locale } from "../../utils/i18n";
import { SkillIconTile } from "./SkillIconTile";

interface SkillPassiveRowProps {
  locale: Locale;
  skillIds: string[];
  onSkillPress: (skill: SkillDefinition) => void;
}

export function SkillPassiveRow({
  locale,
  skillIds,
  onSkillPress,
}: SkillPassiveRowProps) {
  if (skillIds.length === 0) return null;

  return (
    <div
      className="battle-passive-row"
      aria-label={t("skills.detail.passive_row", locale)}
    >
      <span className="battle-passive-row__label">
        {t("skills.detail.passive_label", locale)}
      </span>
      <div className="battle-passive-row__icons">
        {skillIds.map((id) => {
          const skill = getSkillById(id);
          const name = t(skill.stringId, locale);
          return (
            <SkillIconTile
              key={id}
              skill={skill}
              label={name}
              showName={false}
              className="battle-passive-row__tile"
              onClick={() => onSkillPress(skill)}
            />
          );
        })}
      </div>
    </div>
  );
}
