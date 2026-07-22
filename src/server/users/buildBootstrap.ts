import type { DbPool } from "../db/client";
import { listPlayerEquipment } from "../db/equipment";
import { listMailboxItems } from "../db/mailbox";
import { getPlayerStats } from "../db/playerStats";
import { buildPlayerRevision } from "../db/playerRevision";
import { getPlayerSkillPath } from "../db/playerStats";
import { getPlayerLoadoutV2 } from "../db/skillLoadoutV2";
import { getPlayerUpgrades } from "../db/skillUpgrades";
import { getPlayerSkillUnlocks } from "../db/skillUnlocks";
import { getUserById } from "../db/users";
import { getWalletBalance } from "../db/wallet";
import { equipmentPayloadFromRows } from "../equipment/equipmentFromRows";
import { buildSkillProgressionPayload } from "./buildSkillProgression";

export async function buildUserBootstrap(pool: DbPool, userId: string) {
  const [
    user,
    stats,
    wallet,
    equipmentRows,
    skillPath,
    mailboxItems,
    upgrades,
    dbLoadout,
    unlockedSkillIds,
  ] = await Promise.all([
    getUserById(pool, userId),
    getPlayerStats(pool, userId),
    getWalletBalance(pool, userId),
    listPlayerEquipment(pool, userId),
    getPlayerSkillPath(pool, userId),
    listMailboxItems(pool, userId),
    getPlayerUpgrades(pool, userId),
    getPlayerLoadoutV2(pool, userId),
    getPlayerSkillUnlocks(pool, userId),
  ]);

  if (!user || !stats) {
    return null;
  }

  const equipment = equipmentPayloadFromRows(skillPath, equipmentRows);
  const revision = buildPlayerRevision(stats);
  const skillProgression = await buildSkillProgressionPayload(
    pool,
    userId,
    stats,
    { upgrades, dbLoadout, unlockedSkillIds }
  );

  return {
    user: {
      id: user.id,
      external_id: user.external_id,
      display_name: user.display_name,
      gold_balance: user.gold_balance.toString(),
      preferred_locale: user.preferred_locale,
    },
    stats: {
      stats,
      goldBalance: wallet.toString(),
      equipmentStatBonus: equipment.statBonus,
      revision,
    },
    equipment,
    skillProgression,
    mailboxCount: mailboxItems.length,
    revision,
  };
}
