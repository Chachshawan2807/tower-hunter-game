import type { EquipmentSlot } from "../art/equipment/slots";
import type { GearStatBonus } from "../art/equipment/statBonuses";
import { getShopRowStats, resolveSlotFromAssetPrefix } from "./equipmentShopStats";

export interface EquipmentShopItemDef {
  id: string;
  stringId: string;
  assetKey: string;
  slot: EquipmentSlot;
  cost: bigint;
  stats: GearStatBonus;
  label: { en: string; th: string };
}

const VARIANT_COST_MULT = [1, 1.2, 2, 3.5, 6] as const;

const ROWS: Array<{
  prefix: string;
  baseCost: number;
  names: { en: string[]; th: string[] };
}> = [
  {
    prefix: "helm",
    baseCost: 60,
    names: {
      en: [
        "Iron Hood",
        "Sun Visor",
        "Rune Crest",
        "Royal Crown",
        "Ether Helm",
      ],
      th: [
        "ไอรอนฮูด",
        "ซันวิซอร์",
        "รูนเครสต์",
        "รอยัลคราวน์",
        "เอเทอร์เฮล์ม",
      ],
    },
  },
  {
    prefix: "chest",
    baseCost: 90,
    names: {
      en: [
        "Iron Plate",
        "Solar Guard",
        "Rune Mail",
        "Royal Cuirass",
        "Ether Aegis",
      ],
      th: [
        "ไอรอนเพลต",
        "โซลาร์การ์ด",
        "รูนเมลด",
        "รอยัลคูแรส",
        "เอเทอร์อีจิส",
      ],
    },
  },
  {
    prefix: "boots",
    baseCost: 50,
    names: {
      en: [
        "Iron Stride",
        "Solar Spur",
        "Rune Tread",
        "Royal Sabaton",
        "Ether Pass",
      ],
      th: [
        "ไอรอนสไตรด์",
        "โซลาร์สเปอร์",
        "รูนเทรด",
        "รอยัลซาบาตอน",
        "เอเทอร์พาส",
      ],
    },
  },
  {
    prefix: "weapon-sword",
    baseCost: 70,
    names: {
      en: [
        "Corvus Grand",
        "Sunsplice",
        "Runeheart",
        "Aurelius",
        "Ethernus",
      ],
      th: [
        "คอร์วุสแกรนด์",
        "ซันพลายส์",
        "รูนฮาร์ท",
        "ออเรเลียส",
        "เอเทอร์นัส",
      ],
    },
  },
  {
    prefix: "weapon-sword-cross",
    baseCost: 75,
    names: {
      en: [
        "Ignis & Nox",
        "Sol & Luna",
        "Veris & Volt",
        "Crisis & Doom",
        "Ether & Abyss",
      ],
      th: [
        "อิกนิส และ น็อกซ์",
        "โซล และ ลูนา",
        "แวริส และ โวลต์",
        "ไครซิส และ ดูม",
        "เอเทอร์ และ เอบิส",
      ],
    },
  },
  {
    prefix: "shield",
    baseCost: 65,
    names: {
      en: [
        "Iron Bulwark",
        "Zenith Aegis",
        "Raptor Ward",
        "Fang Bastion",
        "Rex Ultima",
      ],
      th: [
        "ไอรอนบูลวาร์ค",
        "ซีนิธอีจิส",
        "แรพเตอร์วาร์ด",
        "แฟงก์บาสเตียน",
        "เร็กซ์อัลติมา",
      ],
    },
  },
  {
    prefix: "gloves",
    baseCost: 45,
    names: {
      en: [
        "Iron Grip",
        "Solar Claw",
        "Rune Fist",
        "Royal Gauntlet",
        "Ether Spark",
      ],
      th: [
        "ไอรอนกริป",
        "โซลาร์คลอว์",
        "รูนฟิสต์",
        "รอยัลกอนต์เล็ต",
        "เอเทอร์สปาร์ก",
      ],
    },
  },
  {
    prefix: "cloak",
    baseCost: 55,
    names: {
      en: [
        "Iron Shroud",
        "Solar Veil",
        "Rune Wave",
        "Royal Mantle",
        "Ether Cape",
      ],
      th: [
        "ไอรอนชราวด์",
        "โซลาร์เวล",
        "รูนเวฟ",
        "รอยัลแมนเทิล",
        "เอเทอร์เคป",
      ],
    },
  },
  {
    prefix: "weapon-axe",
    baseCost: 72,
    names: {
      en: [
        "Ironhorn",
        "Steel Smash",
        "Solfront",
        "Sunraptor",
        "Rune Split",
      ],
      th: [
        "ไอฮอร์น",
        "สตีลสแมช",
        "โซลฟรอนต์",
        "ซันแรพเตอร์",
        "รูนสปลิต",
      ],
    },
  },
  {
    prefix: "weapon-axe-cross",
    baseCost: 78,
    names: {
      en: [
        "Gryphon Heart",
        "Aura Thorn",
        "Royal Slayer",
        "Eclipse Ripper",
        "Expression",
      ],
      th: [
        "ไกรฟอนฮาร์ท",
        "ออร่าซอร์น",
        "รอยัลสเลเยอร์",
        "อีคลิปส์ริปเปอร์",
        "เอ็กซ์เพรสชั่น",
      ],
    },
  },
];

function shopId(prefix: string, variant: number): string {
  const suffix = String(variant).padStart(2, "0");
  return `shop_equip_${prefix.replace(/-/g, "_")}_${suffix}`;
}

export const EQUIPMENT_SHOP_ITEMS: EquipmentShopItemDef[] = ROWS.flatMap((row) =>
  row.names.en.map((enName, index) => {
    const variant = index + 1;
    const assetKey = `${row.prefix}-${String(variant).padStart(2, "0")}`;
    const cost = BigInt(Math.round(row.baseCost * VARIANT_COST_MULT[index]));
    return {
      id: shopId(row.prefix, variant),
      stringId: `shop.item.equip.${row.prefix.replace(/-/g, "_")}_${String(variant).padStart(2, "0")}`,
      assetKey,
      slot: resolveSlotFromAssetPrefix(row.prefix),
      cost,
      stats: getShopRowStats(row.prefix, index),
      label: { en: enName, th: row.names.th[index] },
    };
  })
);

const LABEL_BY_ID = new Map(EQUIPMENT_SHOP_ITEMS.map((item) => [item.id, item.label]));

export function getEquipmentShopLabel(itemId: string, locale: "en" | "th"): string | null {
  const label = LABEL_BY_ID.get(itemId);
  return label ? label[locale] : null;
}

export function getEquipmentShopAssetKey(itemId: string): string | null {
  return EQUIPMENT_SHOP_ITEMS.find((item) => item.id === itemId)?.assetKey ?? null;
}

export function findEquipmentShopItem(itemId: string): EquipmentShopItemDef | undefined {
  return EQUIPMENT_SHOP_ITEMS.find((item) => item.id === itemId);
}
