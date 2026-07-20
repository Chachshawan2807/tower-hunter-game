import { GameIcon } from "../ui/icons";
import { shopIconName } from "../ui/icons/resolveIcons";
import { getEquipmentShopAssetKey } from "../../engine/shop/equipmentShopItems";

interface ShopItemIconProps {
  itemId: string;
  icon: string;
  size?: number;
}

export function ShopItemIcon({ itemId, icon, size = 36 }: ShopItemIconProps) {
  const assetKey = getEquipmentShopAssetKey(itemId);

  if (assetKey) {
    return (
      <span
        className="game-icon game-icon--file shop-item__icon shop-item__icon--equip"
        style={{
          width: size,
          height: size,
          ["--icon-mask" as string]: `url(/icons/equipment-items/${assetKey}.svg)`,
        }}
        aria-hidden
      />
    );
  }

  if (icon.startsWith("equip:")) {
    const key = icon.slice("equip:".length);
    return (
      <span
        className="game-icon game-icon--file shop-item__icon shop-item__icon--equip"
        style={{
          width: size,
          height: size,
          ["--icon-mask" as string]: `url(/icons/equipment-items/${key}.svg)`,
        }}
        aria-hidden
      />
    );
  }

  if (/^[\p{Emoji}\p{Extended_Pictographic}]/u.test(icon)) {
    return (
      <span className="shop-item__icon shop-item__icon--emoji" style={{ fontSize: size * 0.72 }} aria-hidden>
        {icon}
      </span>
    );
  }

  return <GameIcon name={shopIconName(itemId)} size={size} className="shop-item__icon" />;
}
