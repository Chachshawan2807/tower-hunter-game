/**
 * Tower Hunter — Item Bible (weapon catalog per skill path)
 * @see docs/art-bible/MASTER_ART_BIBLE.md §07
 */

import type { SkillPath } from "../types";

export type WeaponCategoryId =
  | "katana"
  | "dual_swords"
  | "staff"
  | "greatsword"
  | "greataxe"
  | "spear"
  | "wand"
  | "bow"
  | "dual_daggers";

export interface WeaponTypeSpec {
  id: WeaponCategoryId;
  path: SkillPath;
  nameKey: string;
  /** Base tier uses raw iron; Rare+ adds gold runes / red gems / dark aura */
  baseMaterial: "raw_iron";
}

export const WEAPONS_BY_PATH: Record<SkillPath, readonly WeaponTypeSpec[]> = {
  murim: [
    { id: "katana", path: "murim", nameKey: "weapon.katana", baseMaterial: "raw_iron" },
    { id: "dual_swords", path: "murim", nameKey: "weapon.dual_swords", baseMaterial: "raw_iron" },
    { id: "staff", path: "murim", nameKey: "weapon.staff", baseMaterial: "raw_iron" },
  ],
  knight: [
    { id: "greatsword", path: "knight", nameKey: "weapon.greatsword", baseMaterial: "raw_iron" },
    { id: "greataxe", path: "knight", nameKey: "weapon.greataxe", baseMaterial: "raw_iron" },
    { id: "spear", path: "knight", nameKey: "weapon.spear", baseMaterial: "raw_iron" },
  ],
  fantasy: [
    { id: "wand", path: "fantasy", nameKey: "weapon.wand", baseMaterial: "raw_iron" },
    { id: "bow", path: "fantasy", nameKey: "weapon.bow", baseMaterial: "raw_iron" },
    { id: "dual_daggers", path: "fantasy", nameKey: "weapon.dual_daggers", baseMaterial: "raw_iron" },
  ],
};

export type ItemRarityVisual = "common" | "rare" | "epic" | "legendary";

/** Visual upgrade rules for Rare+ boss drops */
export const RARITY_VISUAL: Record<
  ItemRarityVisual,
  { goldRunes: boolean; redGems: boolean; darkAura: boolean }
> = {
  common: { goldRunes: false, redGems: false, darkAura: false },
  rare: { goldRunes: true, redGems: false, darkAura: false },
  epic: { goldRunes: true, redGems: true, darkAura: false },
  legendary: { goldRunes: true, redGems: true, darkAura: true },
};
