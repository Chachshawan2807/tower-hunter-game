import type { SkillDefinition } from "../../engine/skills/types";
import { skillDescriptionKey } from "../../engine/skills/skillIcon";
import type { Locale } from "../../utils/i18n";
import { t } from "../../utils/i18n";

function pct(value: number): string {
  return `${Math.round(value * 100)}%`;
}

export function getSkillDescription(skill: SkillDefinition, locale: Locale): string {
  const key = skillDescriptionKey(skill.stringId);
  const text = t(key, locale);
  return text === key ? "" : text;
}

export function formatSkillDetailLines(
  skill: SkillDefinition,
  locale: Locale
): string[] {
  const lines: string[] = [];

  if (skill.skillType) {
    lines.push(`${t("skills.detail.type", locale)}: ${skill.skillType}`);
  }

  if (skill.mpCost > 0) {
    lines.push(`MP ${skill.mpCost}`);
  }

  if (skill.cooldownTurns > 0) {
    lines.push(`${t("skills.cooldown", locale)} ${skill.cooldownTurns}`);
  }

  lines.push(
    `${t("skills.detail.target", locale)}: ${skill.targetType === "self" ? t("skills.detail.target_self", locale) : t("skills.detail.target_enemy", locale)}`
  );

  if (skill.damageMultiplier !== undefined) {
    lines.push(
      `${t("skills.detail.damage", locale)} ×${skill.damageMultiplier.toFixed(2)}`
    );
  }

  if (skill.healPercent !== undefined) {
    lines.push(`${t("skills.detail.heal", locale)} ${pct(skill.healPercent)}`);
  }

  if (skill.defPierce !== undefined && skill.defPierce > 0) {
    lines.push(`${t("skills.detail.def_pierce", locale)} ${pct(skill.defPierce)}`);
  }

  if (skill.guaranteedStatus) {
    lines.push(
      `${t("skills.detail.status", locale)}: ${skill.guaranteedStatus}`
    );
  }

  if (skill.selfStatus) {
    lines.push(
      `${t("skills.detail.self_status", locale)}: ${skill.selfStatus.type} (${skill.selfStatus.turns}${t("skills.detail.turns", locale)})`
    );
  }

  if (skill.passiveEffects?.length) {
    for (const effect of skill.passiveEffects) {
      const mag =
        effect.magnitude <= 1 && effect.magnitude > -1 && effect.stat !== "speed"
          ? `+${pct(effect.magnitude)}`
          : `+${effect.magnitude}`;
      lines.push(`${effect.stat} ${mag}`);
    }
  }

  if (skill.gaugeBoost) {
    lines.push(`${t("skills.detail.gauge", locale)} +${skill.gaugeBoost}`);
  }

  return lines;
}
