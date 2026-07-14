import {
  EQUIPMENT_SLOTS,
  GEAR_CATALOG,
  getGearEntry,
  type CharacterEquipmentVisual,
} from "../../engine/art/equipment";
import type { EquipmentSlot } from "../../engine/art/equipment/slots";
import type { GameIconName } from "../ui/icons";
import { GameIcon } from "../ui/icons";
import { t, type Locale } from "../../utils/i18n";
import { CharacterFigure } from "./CharacterFigure";

const SLOT_LABEL: Record<EquipmentSlot, string> = {
  weapon: "char.slot.weapon",
  helm: "char.slot.helm",
  chest: "char.slot.chest",
  gloves: "char.slot.gloves",
  boots: "char.slot.boots",
  cloak: "char.slot.cloak",
};

const SLOT_ICON: Record<EquipmentSlot, GameIconName> = {
  weapon: "skill-sword",
  helm: "character",
  chest: "skill-shield",
  gloves: "skill-fist",
  boots: "skill-charge",
  cloak: "skill-wind",
};

function resolveSlotGearId(visual: CharacterEquipmentVisual, slot: EquipmentSlot): string {
  if (slot === "weapon") {
    const match = Object.values(GEAR_CATALOG).find(
      (e) => e.slot === "weapon" && e.path === visual.path && e.weaponId === visual.weapon
    );
    return match?.id ?? `gear.${visual.path}.weapon.${visual.weapon}`;
  }
  return visual[slot];
}

interface CharacterEquipmentPanelProps {
  locale: Locale;
  equipment: CharacterEquipmentVisual;
  displayName: string;
}

export function CharacterEquipmentPanel({
  locale,
  equipment,
  displayName,
}: CharacterEquipmentPanelProps) {
  return (
    <div className="char-equip-doll">
      <div className="char-equip-stage">
        <div className="char-equip-stage__ring" aria-hidden="true" />
        <CharacterFigure
          equipment={equipment}
          path={equipment.path}
          side="player"
          animState="idle"
          size="menu"
          label={displayName}
        />
      </div>

      <div className="char-equip-slots" aria-label={t("char.equipment", locale)}>
        {EQUIPMENT_SLOTS.map((slot) => {
          const gearId = resolveSlotGearId(equipment, slot);
          const entry = getGearEntry(gearId);
          const rarity = equipment.pieceRarity[slot] ?? "common";
          const nameKey = entry?.nameKey ?? gearId;

          return (
            <div
              key={slot}
              className={[
                "char-equip-slot",
                `char-equip-slot__rarity--${rarity}`,
              ].join(" ")}
            >
              <span className="char-equip-slot__badge" aria-hidden="true">
                <GameIcon name={SLOT_ICON[slot]} size={16} />
              </span>
              <div className="char-equip-slot__copy">
                <span className="char-equip-slot__type">
                  {t(SLOT_LABEL[slot], locale)}
                </span>
                <span className="char-equip-slot__name">{t(nameKey, locale)}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
