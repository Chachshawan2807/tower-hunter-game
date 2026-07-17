import { useEffect, useRef, useState } from "react";
import type { CharacterEquipmentVisual } from "../../engine/art/equipment";
import type { EquipmentSlot } from "../../engine/art/equipment/slots";
import { t, type Locale } from "../../utils/i18n";
import { CharacterFigure } from "./CharacterFigure";
import { EquipSlot } from "./EquipSlot";

const LEFT_SLOTS: EquipmentSlot[] = ["helm", "chest", "boots"];
const RIGHT_SLOTS: EquipmentSlot[] = ["weapon", "gloves", "cloak"];

function SlotRail({
  locale,
  slots,
  equipment,
  side,
  activeSlot,
  onSlotActivate,
}: {
  locale: Locale;
  slots: EquipmentSlot[];
  equipment: CharacterEquipmentVisual;
  side: "left" | "right";
  activeSlot: EquipmentSlot | null;
  onSlotActivate: (slot: EquipmentSlot) => void;
}) {
  return (
    <div className={`char-equip-rail char-equip-rail--${side}`}>
      {slots.map((slot) => (
        <EquipSlot
          key={slot}
          locale={locale}
          slot={slot}
          equipment={equipment}
          side={side}
          isActive={activeSlot === slot}
          hasPinnedTooltip={activeSlot !== null}
          onActivate={() => onSlotActivate(slot)}
        />
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
  const [activeSlot, setActiveSlot] = useState<EquipmentSlot | null>(null);
  const dollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!activeSlot) return;

    const closeOnOutside = (event: MouseEvent) => {
      if (!dollRef.current?.contains(event.target as Node)) {
        setActiveSlot(null);
      }
    };

    document.addEventListener("click", closeOnOutside);
    return () => document.removeEventListener("click", closeOnOutside);
  }, [activeSlot]);

  const handleSlotActivate = (slot: EquipmentSlot) => {
    setActiveSlot((current) => (current === slot ? null : slot));
  };

  return (
    <div
      ref={dollRef}
      className="char-equip-doll"
      aria-label={t("char.equipment", locale)}
    >
      <SlotRail
        locale={locale}
        slots={LEFT_SLOTS}
        equipment={equipment}
        side="left"
        activeSlot={activeSlot}
        onSlotActivate={handleSlotActivate}
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
        activeSlot={activeSlot}
        onSlotActivate={handleSlotActivate}
      />
    </div>
  );
}
