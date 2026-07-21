import { EQUIPMENT_SHOP_WEAPON_CATALOG_ROWS } from "./equipmentShopWeaponCatalogRows";
import type { EquipmentShopCatalogRow } from "./equipmentShopCatalogTypes";

export type { EquipmentShopCatalogRow } from "./equipmentShopCatalogTypes";

const ARMOR_ROWS: EquipmentShopCatalogRow[] = [
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
];

export const EQUIPMENT_SHOP_CATALOG_ROWS: EquipmentShopCatalogRow[] = [
  ARMOR_ROWS[0],
  ARMOR_ROWS[1],
  ARMOR_ROWS[2],
  EQUIPMENT_SHOP_WEAPON_CATALOG_ROWS[0],
  EQUIPMENT_SHOP_WEAPON_CATALOG_ROWS[1],
  ARMOR_ROWS[3],
  ARMOR_ROWS[4],
  ARMOR_ROWS[5],
  EQUIPMENT_SHOP_WEAPON_CATALOG_ROWS[2],
  EQUIPMENT_SHOP_WEAPON_CATALOG_ROWS[3],
];
