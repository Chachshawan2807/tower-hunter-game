import { useEffect, useState } from "react";
import { OverlayModal } from "./OverlayModal";
import { BagMenu } from "../menu/BagMenu";
import { CharacterMenu } from "../menu/CharacterMenu";
import {
  CharacterOverlayTitle,
  characterOverlayTitleLabel,
} from "../menu/CharacterOverlayTitle";
import {
  SkillOverlayTitle,
  skillOverlayTitleLabel,
} from "../menu/SkillOverlayTitle";
import { ShopMenu, type ShopPurchaseResult } from "../menu/ShopMenu";
import {
  ShopOverlayTitle,
  shopOverlayTitleLabel,
} from "../menu/ShopOverlayTitle";
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
  unequipSlot?: (slot: EquipmentSlot) => Promise<boolean>;
  equipBusy?: boolean;
  equipMessage?: string | null;
  clearEquipMessage?: () => void;
  onClose: () => void;
  onPathChange: (path: SkillPath) => void;
  onGoldChange: (balance: string) => void;
  onPurchase: (result: ShopPurchaseResult) => void;
  onPurchaseError?: () => void;
  onSellComplete?: (balanceAfter: string) => void;
  onStatsChange?: (stats: PlayerStatsResponse["stats"]) => void;
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
  unequipSlot,
  equipBusy,
  equipMessage,
  clearEquipMessage,
  onClose,
  onPathChange,
  onGoldChange,
  onPurchase,
  onPurchaseError,
  onSellComplete,
  onStatsChange,
}: MenuOverlayProps) {
  const [displaySkillPoints, setDisplaySkillPoints] = useState(
    stats?.skill_points ?? 0
  );

  useEffect(() => {
    setDisplaySkillPoints(stats?.skill_points ?? 0);
  }, [stats?.skill_points, menu]);

  useEffect(() => {
    clearEquipMessage?.();
  }, [menu, clearEquipMessage]);

  const title =
    menu === "character" ? (
      <CharacterOverlayTitle
        locale={locale}
        level={playerLevel}
        exp={playerExp}
        displayName={displayName}
      />
    ) : menu === "skills" ? (
      <SkillOverlayTitle locale={locale} skillPoints={displaySkillPoints} />
    ) : menu === "shop" ? (
      <ShopOverlayTitle locale={locale} gold={gold} />
    ) : (
      t(OVERLAY_TITLES[menu], locale)
    );

  const titleLabel =
    menu === "character"
      ? characterOverlayTitleLabel(locale, playerLevel, playerExp, displayName)
      : menu === "skills"
        ? skillOverlayTitleLabel(locale, displaySkillPoints)
        : menu === "shop"
          ? shopOverlayTitleLabel(locale, gold)
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
          userId={userId}
          skillPath={skillPath}
          stats={stats}
          displayName={displayName}
          equipment={equipment}
          equipmentStatBonus={equipmentStatBonus}
          equipBusy={equipBusy}
          unequipBusy={equipBusy}
          onEquipFromBag={equipFromBag}
          onUnequip={unequipSlot}
          onStatsChange={onStatsChange}
        />
      )}
      {menu === "skills" && (
        <SkillMenu
          locale={locale}
          userId={userId}
          activePath={skillPath}
          skillPoints={displaySkillPoints}
          onSkillPointsChange={setDisplaySkillPoints}
        />
      )}
      {menu === "bag" && (
        <BagMenu
          locale={locale}
          userId={userId}
          skillPath={skillPath}
          equipment={equipment}
          onEquip={equipFromBag}
          onSellComplete={onSellComplete}
          equipBusy={equipBusy}
          equipMessage={equipMessage}
        />
      )}
      {menu === "shop" && (
        <ShopMenu
          locale={locale}
          userId={userId}
          gold={gold}
          onGoldChange={onGoldChange}
          onPurchase={onPurchase}
          onPurchaseError={onPurchaseError}
        />
      )}
    </OverlayModal>
  );
}
