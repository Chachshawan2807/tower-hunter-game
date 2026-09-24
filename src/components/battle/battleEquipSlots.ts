import { getSkillById } from "../../engine/skills";
import { isPassiveSkillType } from "../../engine/skills/skillTypes";
import { MAX_EQUIP_SLOTS } from "../../engine/skills/loadout";

/** Four loadout slots for the battle command bar (passive / empty → ""). */
export function getBattleCommandSlotIds(equippedSlots: readonly string[]): string[] {
  const padded = [...equippedSlots];
  while (padded.length < MAX_EQUIP_SLOTS) {
    padded.push("");
  }

  return padded.slice(0, MAX_EQUIP_SLOTS).map((id) => {
    if (!id) return "";
    const skill = getSkillById(id);
    if (!skill.skillType || isPassiveSkillType(skill.skillType)) {
      return "";
    }
    return id;
  });
}
