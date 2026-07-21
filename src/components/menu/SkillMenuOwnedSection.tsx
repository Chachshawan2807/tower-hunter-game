import type { SkillDefinition } from "../../engine/skills/types";
import { t, type Locale } from "../../utils/i18n";
import { ConfirmDialog } from "../ui/ConfirmDialog";
import { SkillStatGrid, type PendingSkillUnlock } from "./SkillStatGrid";

interface SkillMenuOwnedSectionProps {
  locale: Locale;
  userId: string | null;
  skillPoints: number;
  ownedSkills: SkillDefinition[];
  unlockedSkillIds: string[];
  unlockingId: string | null;
  canRespec: boolean;
  pendingRespec: boolean;
  respecBusy: boolean;
  onRespecRequest: () => void;
  onRespecConfirm: () => void;
  onRespecCancel: () => void;
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
  pendingRespec,
  respecBusy,
  onRespecRequest,
  onRespecConfirm,
  onRespecCancel,
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

      {pendingRespec ? (
        <ConfirmDialog
          locale={locale}
          title={t("skills.reset_confirm_title", locale)}
          message={t("skills.reset_confirm_message", locale)}
          confirmLabel={t("skills.reset", locale)}
          confirmTone="crimson"
          busy={respecBusy}
          onConfirm={onRespecConfirm}
          onCancel={onRespecCancel}
        />
      ) : null}
    </div>
  );
}
