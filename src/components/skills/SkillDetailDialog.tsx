import { useEffect, useId, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import type { SkillDefinition } from "../../engine/skills/types";
import { t, type Locale } from "../../utils/i18n";
import {
  formatSkillDetailLines,
  getSkillDescription,
} from "./skillDetailStats";
import { SkillIcon } from "./SkillIcon";

export interface SkillDetailDialogProps {
  locale: Locale;
  skill: SkillDefinition;
  unlocked: boolean;
  unlockCost?: number;
  canUnlock?: boolean;
  equipActionLabel?: string;
  onEquip?: () => void;
  unequipActionLabel?: string;
  onUnequip?: () => void;
  pickSkillActionLabel?: string;
  onPickSkill?: () => void;
  onUnlockRequest?: () => void;
  onClose: () => void;
  busy?: boolean;
}

export function SkillDetailDialog({
  locale,
  skill,
  unlocked,
  unlockCost,
  canUnlock = false,
  equipActionLabel,
  onEquip,
  unequipActionLabel,
  onUnequip,
  pickSkillActionLabel,
  onPickSkill,
  onUnlockRequest,
  onClose,
  busy = false,
}: SkillDetailDialogProps) {
  const titleId = useId();
  const closeRef = useRef<HTMLButtonElement>(null);
  const [portalRoot, setPortalRoot] = useState<HTMLElement | null>(null);
  const [usePanelLayer, setUsePanelLayer] = useState(true);

  const name = t(skill.stringId, locale);
  const description = getSkillDescription(skill, locale);
  const statLines = formatSkillDetailLines(skill, locale);
  const unequipOnly =
    Boolean(onUnequip) && !onEquip && !onPickSkill && !onUnlockRequest;

  useLayoutEffect(() => {
    const panel = document.querySelector(".overlay__panel");
    if (panel instanceof HTMLElement) {
      setPortalRoot(panel);
      setUsePanelLayer(true);
      return;
    }
    setPortalRoot(document.body);
    setUsePanelLayer(false);
  }, []);

  useEffect(() => {
    closeRef.current?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !busy) {
        event.preventDefault();
        onClose();
      }
    };

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [busy, onClose]);

  const layerClass = usePanelLayer
    ? "confirm-dialog-layer confirm-dialog-layer--overlay-panel skill-detail-layer"
    : "confirm-dialog-layer skill-detail-layer skill-detail-layer--viewport";

  const layer = (
    <div
      className={layerClass}
      role="presentation"
      onPointerDown={(e) => {
        if (busy || e.target !== e.currentTarget) return;
        onClose();
      }}
    >
      <div
        className="confirm-dialog skill-detail-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        onPointerDown={(e) => e.stopPropagation()}
      >
        <div className="skill-detail-dialog__hero">
          <SkillIcon skill={skill} size={48} />
          <h3
            className="confirm-dialog__title skill-detail-dialog__title"
            id={titleId}
          >
            {name}
          </h3>
        </div>

        {description ? (
          <p className="skill-detail-dialog__desc">{description}</p>
        ) : null}

        <ul className="skill-detail-dialog__stats">
          {statLines.map((line) => (
            <li key={line}>{line}</li>
          ))}
        </ul>

        {!unlocked && unlockCost !== undefined ? (
          <p className="skill-detail-dialog__unlock-cost tabular-nums">
            {t("skills.unlock_sp", locale)} {unlockCost}
          </p>
        ) : null}

        <div className="confirm-dialog__actions skill-detail-dialog__actions">
          {unequipOnly ? (
            <button
              ref={closeRef}
              type="button"
              className="confirm-dialog__btn confirm-dialog__btn--confirm"
              disabled={busy}
              onClick={onUnequip}
            >
              {unequipActionLabel ?? t("bag.unequip", locale)}
            </button>
          ) : (
            <>
          <button
            ref={closeRef}
            type="button"
            className="confirm-dialog__btn confirm-dialog__btn--cancel"
            disabled={busy}
            onClick={onClose}
          >
            {t("dialog.cancel", locale)}
          </button>
          {onPickSkill ? (
            <button
              type="button"
              className="confirm-dialog__btn confirm-dialog__btn--confirm"
              disabled={busy}
              onClick={onPickSkill}
            >
              {pickSkillActionLabel ?? t("skills.equip_pick_skill", locale)}
            </button>
          ) : null}
          {onEquip ? (
            <button
              type="button"
              className="confirm-dialog__btn confirm-dialog__btn--confirm"
              disabled={busy}
              onClick={onEquip}
            >
              {equipActionLabel ?? t("skills.equip_add", locale)}
            </button>
          ) : null}
          {!unlocked && canUnlock && onUnlockRequest ? (
            <button
              type="button"
              className="confirm-dialog__btn confirm-dialog__btn--confirm"
              disabled={busy}
              onClick={onUnlockRequest}
            >
              {t("skills.unlock_confirm_action", locale)}
            </button>
          ) : null}
          {onUnequip && !unequipOnly ? (
            <button
              type="button"
              className="confirm-dialog__btn confirm-dialog__btn--confirm"
              disabled={busy}
              onClick={onUnequip}
            >
              {unequipActionLabel ?? t("bag.unequip", locale)}
            </button>
          ) : null}
            </>
          )}
        </div>
      </div>
    </div>
  );

  if (!portalRoot) return null;
  return createPortal(layer, portalRoot);
}
