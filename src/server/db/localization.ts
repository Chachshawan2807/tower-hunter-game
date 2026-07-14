import type { DbPool } from "./client";
import type { LocalizationRow, SupportedLocale } from "./types";

export async function getLocalizedString(
  pool: DbPool,
  stringId: string,
  locale: SupportedLocale
): Promise<string | null> {
  const result = await pool.query<LocalizationRow>(
    `SELECT string_id, locale, text_value, updated_at
     FROM localization_dictionary
     WHERE string_id = $1 AND locale = $2`,
    [stringId, locale]
  );

  return result.rows[0]?.text_value ?? null;
}

export async function getLocalizedStringWithFallback(
  pool: DbPool,
  stringId: string,
  locale: SupportedLocale,
  fallbackLocale: SupportedLocale = "en"
): Promise<string> {
  const primary = await getLocalizedString(pool, stringId, locale);
  if (primary) return primary;

  const fallback = await getLocalizedString(pool, stringId, fallbackLocale);
  if (fallback) return fallback;

  return stringId;
}

export async function upsertLocalizedString(
  pool: DbPool,
  stringId: string,
  locale: SupportedLocale,
  textValue: string
): Promise<LocalizationRow> {
  const result = await pool.query<LocalizationRow>(
    `INSERT INTO localization_dictionary (string_id, locale, text_value)
     VALUES ($1, $2, $3)
     ON CONFLICT (string_id, locale)
     DO UPDATE SET
       text_value = EXCLUDED.text_value,
       updated_at = NOW()
     RETURNING string_id, locale, text_value, updated_at`,
    [stringId, locale, textValue]
  );

  return result.rows[0];
}

export async function listLocalizedStrings(
  pool: DbPool,
  locale: SupportedLocale
): Promise<LocalizationRow[]> {
  const result = await pool.query<LocalizationRow>(
    `SELECT string_id, locale, text_value, updated_at
     FROM localization_dictionary
     WHERE locale = $1
     ORDER BY string_id ASC`,
    [locale]
  );

  return result.rows;
}
