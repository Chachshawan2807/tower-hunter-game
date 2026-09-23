import type { SkillDefinition } from "../../engine/skills/types";
import { t, type Locale } from "../../utils/i18n";
import { SkillStatGrid, type PendingSkillUnlock } from "./SkillStatGrid";

interface SkillMenuOwnedSectionProps {
  locale: Locale;
  userId: string | null;
  skillPoints: number;
  ownedSkills: SkillDefinition[];
  unlockedSkillIds: string[];
  unlockingId: string | null;
  canRespec: boolean;
  onRespecRequest: () => void;
  onUnlockRequest: (unlock: PendingSkillUnlock) => void;
}

export function SkillMenuOwnedSection({
  locale,
  userId,
  skillPoints,
  ownedSkills,
  unlockedSkillIds,
  unlockingId,
  canRespec,
  onRespecRequest,
  onUnlockRequest,
}: SkillMenuOwnedSectionProps) {
  return (
    <div className="skill-menu__section ui-section">
      <div className="stat-grid stat-grid--skills skill-menu__owned-grid">
        <div className="skill-menu__reset-wrap">
          <button
            type="button"
            className="skill-menu__reset-btn"
            disabled={!canRespec}
            aria-label={t("skills.reset.aria", locale)}
            title={t("skills.reset.aria", locale)}
            onClick={onRespecRequest}
          >
            {t("skills.reset", locale)}
          </button>
        </div>

        {ownedSkills.length > 0 ? (
          <SkillStatGrid
            locale={locale}
            userId={userId}
            skills={ownedSkills}
            unlockedSkillIds={unlockedSkillIds}
            skillPoints={skillPoints}
            unlockingId={unlockingId}
            allowUnlock={false}
            onUnlockRequest={onUnlockRequest}
            embedded
          />
        ) : (
          <p className="shop-empty skill-menu__owned-empty">
            {t("skills.owned_empty", locale)}
          </p>
        )}
      </div>
    </div>
  );
}
