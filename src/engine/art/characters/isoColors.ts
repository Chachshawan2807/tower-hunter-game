/**
 * Isometric chibi palette — reference style × Art Bible muted tones
 */

import { ART_PALETTE } from "../palette";
import { SKIN_TONES } from "../skinTones";

export const ISO_COLORS = {
  ink: ART_PALETTE.primaryBlackDeep,
  skinHi: SKIN_TONES.highlight,
  skin: SKIN_TONES.base,
  skinLo: SKIN_TONES.shadow,
  metalHi: "#8a8a96",
  metal: "#5a5a64",
  metalLo: "#3a3a44",
  crimson: ART_PALETTE.crimson,
  crimsonDeep: ART_PALETTE.crimsonDeep,
  gold: ART_PALETTE.antiqueGold,
  goldDim: ART_PALETTE.antiqueGoldDeep,
  murimRobe: "#1a1410",
  murimSash: ART_PALETTE.darkYellowDeep,
  knightCape: "#4a1010",
  fantasyHood: "#1a1018",
  fantasyAccent: "#5a3070",
  beastFur: "#3a2820",
  demonSkin: "#8b2020",
  demonSkinHi: "#b04040",
  demonHorn: "#2a1010",
  merchantTunic: "#1a3028",
  merchantHat: "#2a2018",
  villagerDress: "#3a2820",
  villagerApron: "#c8c0b0",
  shadow: "rgba(0,0,0,0.35)",
} as const;
