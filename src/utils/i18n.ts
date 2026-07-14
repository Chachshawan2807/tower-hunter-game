export type Locale = "th" | "en";

const STRINGS: Record<string, Record<Locale, string>> = {
  "app.title": { en: "Tower Hunter", th: "นักล่าหอคอย" },
  "hud.level": { en: "Lv", th: "เลเวล" },
  "hud.exp": { en: "EXP", th: "EXP" },
  "nav.character": { en: "Character", th: "ตัวละคร" },
  "nav.skills": { en: "Skills", th: "สกิล" },
  "nav.tower": { en: "Tower", th: "หอคอย" },
  "nav.bag": { en: "Bag", th: "กระเป๋า" },
  "nav.shop": { en: "Shop", th: "ร้าน" },
  "tower.floor": { en: "Floor", th: "ชั้น" },
  "tower.climb": { en: "Climb", th: "ไต่" },
  "tower.auto": { en: "Auto", th: "ออโต้" },
  "battle.attack": { en: "Attack", th: "โจมตี" },
  "battle.win": { en: "Victory!", th: "ชนะ!" },
  "battle.lose": { en: "Defeated", th: "แพ้" },
  "battle.waiting": { en: "Your turn", th: "ถึงตาคุณ" },
  "settings.lang": { en: "Language", th: "ภาษา" },
  "menu.close": { en: "Close", th: "ปิด" },
  "char.stats": { en: "Stats", th: "ค่าสถานะ" },
  "skills.paths": { en: "Skill Paths", th: "แนวสกิล" },
  "bag.empty": { en: "Bag is empty", th: "กระเป๋าว่าง" },
  "shop.soon": { en: "Coming soon", th: "เร็วๆ นี้" },
  "side.log": { en: "Battle Log", th: "บันทึกสู้" },
  "side.chat": { en: "Chat", th: "แชต" },
};

export function t(stringId: string, locale: Locale): string {
  return STRINGS[stringId]?.[locale] ?? stringId;
}
