export interface EquipmentShopCatalogRow {
  prefix: string;
  /** When set, variant SVGs use `{assetPrefix}-{vv}` instead of `{prefix}-{vv}`. */
  assetPrefix?: string;
  baseCost: number;
  names: { en: string[]; th: string[] };
}
