import { equipmentIconUrl } from "../../engine/art/equipment/iconAssets";

interface EquipmentItemIconProps {
  gearId: string;
  size?: number;
  className?: string;
}

export function EquipmentItemIcon({
  gearId,
  size = 26,
  className = "",
}: EquipmentItemIconProps) {
  const url = equipmentIconUrl(gearId);
  if (!url) return null;

  return (
    <span
      className={["game-icon game-icon--file", className].filter(Boolean).join(" ")}
      style={{
        width: size,
        height: size,
        ["--icon-mask" as string]: `url(${url})`,
      }}
      aria-hidden
    />
  );
}
