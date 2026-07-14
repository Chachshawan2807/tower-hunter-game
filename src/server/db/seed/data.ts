import type { SupportedLocale } from "../types";

export interface SeedLocalizationEntry {
  string_id: string;
  locale: SupportedLocale;
  text_value: string;
}

export const SEED_LOCALIZATION: SeedLocalizationEntry[] = [
  { string_id: "app.title", locale: "en", text_value: "Tower Hunter" },
  { string_id: "app.title", locale: "th", text_value: "นักล่าหอคอย" },
  { string_id: "nav.character", locale: "en", text_value: "Character" },
  { string_id: "nav.character", locale: "th", text_value: "ตัวละคร" },
  { string_id: "nav.skills", locale: "en", text_value: "Skills" },
  { string_id: "nav.skills", locale: "th", text_value: "สกิล" },
  { string_id: "nav.tower", locale: "en", text_value: "Tower" },
  { string_id: "nav.tower", locale: "th", text_value: "หอคอย" },
  { string_id: "nav.bag", locale: "en", text_value: "Bag" },
  { string_id: "nav.bag", locale: "th", text_value: "กระเป๋า" },
  { string_id: "nav.shop", locale: "en", text_value: "Shop" },
  { string_id: "nav.shop", locale: "th", text_value: "ร้าน" },
  { string_id: "skills.basic_attack", locale: "en", text_value: "Basic Attack" },
  { string_id: "skills.basic_attack", locale: "th", text_value: "โจมตีปกติ" },
  { string_id: "skills.murim.palm", locale: "en", text_value: "Iron Palm" },
  { string_id: "skills.murim.palm", locale: "th", text_value: "ฝ่ามือเหล็ก" },
  { string_id: "skills.knight.slash", locale: "en", text_value: "Knight Slash" },
  { string_id: "skills.knight.slash", locale: "th", text_value: "ฟันอัศวิน" },
  { string_id: "skills.fantasy.bolt", locale: "en", text_value: "Arcane Bolt" },
  { string_id: "skills.fantasy.bolt", locale: "th", text_value: "ลูกบอลเวท" },
  { string_id: "shop.item.hp_potion", locale: "en", text_value: "HP Potion" },
  { string_id: "shop.item.hp_potion", locale: "th", text_value: "ยาฟื้น HP" },
  { string_id: "shop.item.mp_potion", locale: "en", text_value: "MP Potion" },
  { string_id: "shop.item.mp_potion", locale: "th", text_value: "ยาฟื้น MP" },
  { string_id: "demo.welcome", locale: "en", text_value: "Welcome, Tower Hunter!" },
  { string_id: "demo.welcome", locale: "th", text_value: "ยินดีต้อนรับ นักล่าหอคอย!" },
];

export const DEMO_USER = {
  externalId: "demo_player",
  displayName: "Demo Hero",
  preferredLocale: "th" as const,
  starterGold: 500n,
};
