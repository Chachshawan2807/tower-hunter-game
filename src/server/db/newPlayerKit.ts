import type { SkillPath } from "../../engine/types";
import { seedDefaultEquipment } from "./equipment";
import type { DbClient } from "./client";
import type { ItemRarity } from "./types";

const STARTER_ITEMS: Record<
  SkillPath,
  { itemId: string; quantity: number; rarity: ItemRarity }[]
> = {
  murim: [
    { itemId: "gear.murim.weapon.katana", quantity: 1, rarity: "rare" },
    { itemId: "gear.murim.chest.robe", quantity: 1, rarity: "epic" },
    { itemId: "drop_f13_rare", quantity: 1, rarity: "rare" },
  ],
  knight: [
    { itemId: "gear.knight.weapon.greatsword", quantity: 1, rarity: "rare" },
    { itemId: "gear.knight.chest.plate", quantity: 1, rarity: "epic" },
    { itemId: "drop_f7_rare", quantity: 1, rarity: "rare" },
  ],
  fantasy: [
    { itemId: "gear.fantasy.weapon.wand", quantity: 1, rarity: "rare" },
    { itemId: "gear.fantasy.chest.leathers", quantity: 1, rarity: "epic" },
    { itemId: "drop_f19_rare", quantity: 1, rarity: "rare" },
  ],
};

async function upsertStarterItem(
  client: DbClient,
  userId: string,
  itemId: string,
  quantity: number,
  rarity: ItemRarity
): Promise<void> {
  await client.query(
    `INSERT INTO inventory_items (user_id, item_id, quantity, rarity)
     VALUES ($1, $2, $3, $4)
     ON CONFLICT (user_id, item_id) DO NOTHING`,
    [userId, itemId, quantity, rarity]
  );
}

/** Default equipment + bag items for a newly created player. */
export async function seedNewPlayerKit(
  client: DbClient,
  userId: string,
  path: SkillPath = "murim"
): Promise<void> {
  await seedDefaultEquipment(client, userId, path);

  for (const item of STARTER_ITEMS[path]) {
    await upsertStarterItem(
      client,
      userId,
      item.itemId,
      item.quantity,
      item.rarity
    );
  }
}
