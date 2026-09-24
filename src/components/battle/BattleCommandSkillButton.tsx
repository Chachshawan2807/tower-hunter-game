import { useRef } from "react";
import {
  canUseSkill,
  getSkillById,
  getSkillCooldownRemaining,
  isPassiveSkillType,
  isSkillUnlocked,
  resolveEffectiveSkill,
} from "../../engine/skills";
import { EMPTY_SKILL_UPGRADES } from "../../engine/skills/types";
import type { SkillUpgradeRanks } from "../../engine/skills/types";
import type { BattleEntity } from "../../engine/types";
import { t, type Locale } from "../../utils/i18n";
import { playUiClick } from "../../hooks/useGameAudio";
import { PassiveSkillSpinFrame } from "../skills/PassiveSkillSpinFrame";
import { SkillIcon } from "../skills/SkillIcon";

const LONG_PRESS_MS = 450;

interface BattleCommandSkillButtonProps {
  locale: Locale;
  skillId: string;
  busy: boolean;
  manualTurn: boolean;
  playerEntity?: BattleEntity;
  enemyTargetId?: string;
  playerSkillUpgrades: Record<string, SkillUpgradeRanks>;
  unlockedSkillIds: string[];
  onShowDetail: (skillId: string) => void;
  onSkill?: (skillId: string, targetId: string) => void;
}

export function BattleCommandSkillButton({
  locale,
  skillId,
  busy,
  manualTurn,
  playerEntity,
  enemyTargetId,
  playerSkillUpgrades,
  unlockedSkillIds,
  onShowDetail,
  onSkill,
}: BattleCommandSkillButtonProps) {
  const longPressFiredRef = useRef(false);
  const pressTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const base = getSkillById(skillId);
  const unlocked = isSkillUnlocked(base, unlockedSkillIds);
  const isPassive =
    Boolean(base.skillType) && isPassiveSkillType(base.skillType!);

  const clearPressTimer = () => {
    if (pressTimerRef.current) {
      clearTimeout(pressTimerRef.current);
      pressTimerRef.current = null;
    }
  };

  if (!unlocked) {
    return (
      <div
        className="battle-command-skill battle-command-skill--empty"
        aria-hidden="true"
      />
    );
  }

  const upgrades = playerSkillUpgrades[skillId] ?? EMPTY_SKILL_UPGRADES;
  const effective = resolveEffectiveSkill(base, upgrades);
  const cd = playerEntity ? getSkillCooldownRemaining(playerEntity, skillId) : 0;
  const onCooldown = cd > 0;
  const canAfford = playerEntity && playerEntity.stats.mp >= effective.mpCost;
  const usable =
    playerEntity && canUseSkill(playerEntity, effective, unlockedSkillIds);
  const targetId =
    effective.targetType === "self" ? playerEntity?.id : enemyTargetId;
  const name = t(base.stringId, locale);
  const canFire =
    !isPassive &&
    manualTurn &&
    !busy &&
    usable &&
    targetId &&
    onSkill &&
    !onCooldown;

  return (
    <button
      type="button"
      className={[
        "battle-command-skill",
        isPassive ? "battle-command-skill--passive" : "",
        onCooldown ? "battle-command-skill--cd" : "",
        !canAfford && !isPassive ? "battle-command-skill--mp" : "",
        canFire ? "battle-command-skill--ready" : "",
      ]
        .filter(Boolean)
        .join(" ")}
      disabled={!isPassive && !canFire}
      aria-label={
        isPassive
          ? `${name} (${t("skills.detail.passive_label", locale)})`
          : name
      }
      onPointerDown={(e) => {
        if (e.button !== 0) return;
        longPressFiredRef.current = false;
        clearPressTimer();
        pressTimerRef.current = setTimeout(() => {
          longPressFiredRef.current = true;
          onShowDetail(skillId);
        }, LONG_PRESS_MS);
      }}
      onPointerUp={clearPressTimer}
      onPointerCancel={clearPressTimer}
      onPointerLeave={clearPressTimer}
      onClick={() => {
        if (longPressFiredRef.current) {
          longPressFiredRef.current = false;
          return;
        }
        if (isPassive) return;
        if (!canFire || !onSkill || !targetId) return;
        playUiClick();
        onSkill(skillId, targetId);
      }}
      onContextMenu={(e) => {
        e.preventDefault();
        onShowDetail(skillId);
      }}
    >
      {isPassive ? <PassiveSkillSpinFrame /> : null}
      <SkillIcon skill={base} size={28} />
      {onCooldown ? (
        <span className="battle-command-skill__cd" aria-hidden="true">
          {cd}
        </span>
      ) : null}
    </button>
  );
}
