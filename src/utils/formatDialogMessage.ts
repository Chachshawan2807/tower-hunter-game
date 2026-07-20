import type { Locale } from "../utils/i18n";
import { t } from "../utils/i18n";

export function formatDialogMessage(
  templateKey: string,
  locale: Locale,
  vars: Record<string, string>
): string {
  let message = t(templateKey, locale);
  for (const [key, value] of Object.entries(vars)) {
    message = message.replace(`{${key}}`, value);
  }
  return message;
}
