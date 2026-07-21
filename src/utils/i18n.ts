import { I18N_STRINGS } from "./i18n/strings";

export type Locale = "th" | "en";

export function t(
  stringId: string,
  locale: Locale,
  params?: Record<string, string | number>
): string {
  let text = I18N_STRINGS[stringId]?.[locale] ?? stringId;
  if (!params) return text;

  for (const [key, value] of Object.entries(params)) {
    text = text.replaceAll(`{${key}}`, String(value));
  }
  return text;
}
