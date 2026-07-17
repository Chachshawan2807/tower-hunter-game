import {
  GEAR_CATALOG,
  getGearEntry,
  type CharacterEquipmentVisual,
} from "../../engine/art/equipment";
import type { EquipmentSlot } from "../../engine/art/equipment/slots";
import { t, type Locale } from "../../utils/i18n";
import { CharacterFigure } from "./CharacterFigure";

const LEFT_SLOTS: EquipmentSlot[] = ["helm", "chest", "boots"];
const RIGHT_SLOTS: EquipmentSlot[] = ["weapon", "gloves", "cloak"];

const SLOT_LABEL: Record<EquipmentSlot, string> = {
  weapon: "char.slot.weapon",
  helm: "char.slot.helm",
  chest: "char.slot.chest",
  gloves: "char.slot.gloves",
  boots: "char.slot.boots",
  cloak: "char.slot.cloak",
};

const SLOT_ICON: Record<EquipmentSlot, "slot-helm" | "slot-chest" | "slot-gloves" | "slot-boots" | "slot-cloak" | "slot-weapon"> = {
  weapon: "slot-weapon",
  helm: "slot-helm",
  chest: "slot-chest",
  gloves: "slot-gloves",
  boots: "slot-boots",
  cloak: "slot-cloak",
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

interface SlotButtonProps {
  locale: Locale;
  slot: EquipmentSlot;
  equipment: CharacterEquipmentVisual;
}

function EquipSlot({ locale, slot, equipment }: SlotButtonProps) {
  const gearId = resolveSlotGearId(equipment, slot);
  const entry = getGearEntry(gearId);
  const rarity = equipment.pieceRarity[slot] ?? "common";
  const slotName = t(SLOT_LABEL[slot], locale);
  const gearName = t(entry?.nameKey ?? gearId, locale);
  const label = `${slotName}: ${gearName}`;

  return (
    <div
      className={[
        "char-equip-slot",
        `char-equip-slot__rarity--${rarity}`,
      ].join(" ")}
      role="img"
      aria-label={label}
      title={label}
    >
      <span className="char-equip-slot__icon-stack" aria-hidden>
        <img
          className="char-equip-slot__icon char-equip-slot__icon--shade"
          src={`/icons/ui/${SLOT_ICON[slot]}.svg`}
          width={26}
          height={26}
          alt=""
          draggable={false}
        />
        <img
          className="char-equip-slot__icon"
          src={`/icons/ui/${SLOT_ICON[slot]}.svg`}
          width={26}
          height={26}
          alt=""
          draggable={false}
        />
      </span>
    </div>
  );
}

function SlotRail({
  locale,
  slots,
  equipment,
  side,
}: {
  locale: Locale;
  slots: EquipmentSlot[];
  equipment: CharacterEquipmentVisual;
  side: "left" | "right";
}) {
  return (
    <div className={`char-equip-rail char-equip-rail--${side}`}>
      {slots.map((slot) => (
        <EquipSlot key={slot} locale={locale} slot={slot} equipment={equipment} />
      ))}
    </div>
  );
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
    <div className="char-equip-doll" aria-label={t("char.equipment", locale)}>
      <SlotRail
        locale={locale}
        slots={LEFT_SLOTS}
        equipment={equipment}
        side="left"
      />

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

      <SlotRail
        locale={locale}
        slots={RIGHT_SLOTS}
        equipment={equipment}
        side="right"
      />
    </div>
  );
}
