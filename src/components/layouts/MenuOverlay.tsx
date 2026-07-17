import { OverlayModal } from "./OverlayModal";
import { BagMenu } from "../menu/BagMenu";
import { CharacterMenu } from "../menu/CharacterMenu";
import {
  CharacterOverlayTitle,
  characterOverlayTitleLabel,
} from "../menu/CharacterOverlayTitle";
import { ShopMenu } from "../menu/ShopMenu";
import { SkillMenu } from "../menu/SkillMenu";
import type { NavTab } from "./BottomNav";
import { t, type Locale } from "../../utils/i18n";
import type { CharacterEquipmentVisual } from "../../engine/art/equipment/catalog";
import type { GearStatBonus } from "../../engine/art/equipment/statBonuses";
import type { EquipmentSlot } from "../../engine/art/equipment/slots";
import type { PlayerStatsResponse } from "../../utils/api";
import type { SkillPath } from "../../engine/types";

type OverlayMenu = Exclude<NavTab, "tower">;

const OVERLAY_TITLES: Record<OverlayMenu, string> = {
  character: "nav.character",
  skills: "nav.skills",
  bag: "nav.bag",
  shop: "nav.shop",
};

interface MenuOverlayProps {
  menu: OverlayMenu;
  locale: Locale;
  userId: string | null;
  playerLevel: number;
  playerExp: number;
  skillPath: SkillPath;
  gold: string;
  stats: PlayerStatsResponse["stats"] | null;
  displayName: string;
  equipment: CharacterEquipmentVisual;
  equipmentStatBonus?: GearStatBonus;
  equipFromBag: (slot: EquipmentSlot, inventoryId: string) => Promise<boolean>;
  equipBusy?: boolean;
  equipMessage?: string | null;
  onClose: () => void;
  onPathChange: (path: SkillPath) => void;
  onPurchase: () => void;
}

export function MenuOverlay({
  menu,
  locale,
  userId,
  playerLevel,
  playerExp,
  skillPath,
  gold,
  stats,
  displayName,
  equipment,
  equipmentStatBonus,
  equipFromBag,
  equipBusy,
  equipMessage,
  onClose,
  onPathChange,
  onPurchase,
}: MenuOverlayProps) {
  const title =
    menu === "character" ? (
      <CharacterOverlayTitle
        locale={locale}
        level={playerLevel}
        exp={playerExp}
      />
    ) : (
      t(OVERLAY_TITLES[menu], locale)
    );

  const titleLabel =
    menu === "character"
      ? characterOverlayTitleLabel(locale, playerLevel, playerExp)
      : t(OVERLAY_TITLES[menu], locale);

  return (
    <OverlayModal
      title={title}
      titleLabel={titleLabel}
      locale={locale}
      onClose={onClose}
    >
      {menu === "character" && (
        <CharacterMenu
          locale={locale}
          stats={stats}
          displayName={displayName}
          equipment={equipment}
          equipmentStatBonus={equipmentStatBonus}
        />
      )}
      {menu === "skills" && (
        <SkillMenu
          locale={locale}
          userId={userId}
          playerLevel={playerLevel}
          activePath={skillPath}
          onPathChange={onPathChange}
        />
      )}
      {menu === "bag" && (
        <BagMenu
          locale={locale}
          userId={userId}
          skillPath={skillPath}
          onEquip={equipFromBag}
          equipBusy={equipBusy}
          equipMessage={equipMessage}
        />
      )}
      {menu === "shop" && (
        <ShopMenu
          locale={locale}
          userId={userId}
          gold={gold}
          onPurchase={onPurchase}
        />
      )}
    </OverlayModal>
  );
}
