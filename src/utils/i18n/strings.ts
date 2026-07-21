import type { Locale } from "../i18n";
import { GAME_I18N_STRINGS } from "./gameStrings";
import { UI_I18N_STRINGS } from "./uiStrings";

export const I18N_STRINGS: Record<string, Record<Locale, string>> = {
  ...UI_I18N_STRINGS,
  ...GAME_I18N_STRINGS,
};
