import { MAX_EQUIP_SLOTS } from "../../engine/skills/loadout";

/** Four loadout slots for the battle command bar (includes passive skills). */
export function getBattleCommandSlotIds(equippedSlots: readonly string[]): string[] {
  const padded = [...equippedSlots];
  while (padded.length < MAX_EQUIP_SLOTS) {
    padded.push("");
  }

  return padded.slice(0, MAX_EQUIP_SLOTS);
}
