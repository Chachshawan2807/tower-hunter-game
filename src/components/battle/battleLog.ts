import { getSkillById } from "../../engine/skills";
import type { AnimationEvent, BattleEntity } from "../../engine/types";
import { t, type Locale } from "../../utils/i18n";

function fillTemplate(
  template: string,
  values: Record<string, string>
): string {
  return Object.entries(values).reduce(
    (text, [key, value]) => text.replace(`{${key}}`, value),
    template
  );
}

function formatAttackEvent(
  event: AnimationEvent,
  locale: Locale,
  entities?: BattleEntity[]
): string {
  const skillId = String(event.metadata?.skillId ?? "basic_attack");
  const skillName = t(getSkillById(skillId).stringId, locale);
  const actor = entities?.find((entity) => entity.id === event.actorId);

  if (actor?.side === "player") {
    return fillTemplate(t("battle.used_player", locale), { skill: skillName });
  }

  const name = actor ? t(actor.name, locale) : t("battle.enemy", locale);
  return fillTemplate(t("battle.used_enemy", locale), {
    name,
    skill: skillName,
  });
}

export function formatBattleEvent(
  event: AnimationEvent,
  locale: Locale,
  entities?: BattleEntity[]
): string {
  switch (event.type) {
    case "attack":
      return formatAttackEvent(event, locale, entities);
    case "damage":
      return `−${event.value ?? 0}`;
    case "miss":
      return "Miss";
    case "critical":
      return `Crit ${event.value ?? ""}`;
    case "dot_damage":
      return `DoT ${event.value ?? 0}`;
    case "cc_skip":
      return "Stunned";
    case "debuff_apply":
      return String(event.metadata?.effectType ?? "Debuff");
    case "buff_apply":
      return String(event.metadata?.effectType ?? "Buff");
    case "heal":
      return `+${event.value ?? 0}`;
    case "battle_win":
      return "Victory";
    case "battle_lose":
      return "Defeat";
    default:
      return "•";
  }
}

export function getBattleEventClass(event: AnimationEvent): string {
  switch (event.type) {
    case "attack":
      return "battle-log__entry--attack";
    case "damage":
    case "dot_damage":
      return "battle-log__entry--damage";
    case "critical":
      return "battle-log__entry--critical";
    case "miss":
      return "battle-log__entry--miss";
    case "heal":
    case "buff_apply":
      return "battle-log__entry--heal";
    case "debuff_apply":
    case "cc_skip":
      return "battle-log__entry--debuff";
    case "battle_win":
      return "battle-log__entry--win";
    case "battle_lose":
      return "battle-log__entry--lose";
    default:
      return "";
  }
}
