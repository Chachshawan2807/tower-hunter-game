import { getSkillById } from "../../engine/skills/catalog";
import {
  canUpgradeBranch,
  spCostForNextRank,
  type UpgradeBranch,
} from "../../engine/skills/skillPoints";
import type { SkillUpgradeRanks } from "../../engine/skills/types";
import { EMPTY_SKILL_UPGRADES } from "../../engine/skills/types";
import { withTransaction, type DbClient, type DbPool } from "./client";
import { getPlayerStatsForUpdate } from "./playerStats";

interface UpgradeRow {
  skill_id: string;
  damage_rank: number;
  cd_rank: number;
  mp_rank: number;
  status_rank: number;
  heal_rank: number;
  passive_rank: number;
}

function toSkillUpgradeRanks(row: UpgradeRow): SkillUpgradeRanks {
  return {
    damage: row.damage_rank as SkillUpgradeRanks["damage"],
    cooldown: row.cd_rank as SkillUpgradeRanks["cooldown"],
    mpCost: row.mp_rank as SkillUpgradeRanks["mpCost"],
    statusPotency: row.status_rank as SkillUpgradeRanks["statusPotency"],
    healPower: row.heal_rank as SkillUpgradeRanks["healPower"],
    passivePotency: row.passive_rank as SkillUpgradeRanks["passivePotency"],
  };
}

async function getUpgradeRow(
  client: DbClient,
  userId: string,
  skillId: string
): Promise<SkillUpgradeRanks> {
  const result = await client.query<UpgradeRow>(
    `SELECT skill_id, damage_rank, cd_rank, mp_rank, status_rank, heal_rank, passive_rank
     FROM player_skill_upgrades
     WHERE user_id = $1 AND skill_id = $2`,
    [userId, skillId]
  );

  const row = result.rows[0];
  return row ? toSkillUpgradeRanks(row) : { ...EMPTY_SKILL_UPGRADES };
}

export async function getPlayerUpgrades(
  pool: DbPool,
  userId: string
): Promise<Record<string, SkillUpgradeRanks>> {
  const result = await pool.query<UpgradeRow>(
    `SELECT skill_id, damage_rank, cd_rank, mp_rank, status_rank, heal_rank, passive_rank
     FROM player_skill_upgrades
     WHERE user_id = $1`,
    [userId]
  );

  const upgrades: Record<string, SkillUpgradeRanks> = {};
  for (const row of result.rows) {
    upgrades[row.skill_id] = toSkillUpgradeRanks(row);
  }

  return upgrades;
}

export async function upgradeSkillBranch(
  pool: DbPool,
  userId: string,
  skillId: string,
  branch: UpgradeBranch
): Promise<{ ranks: SkillUpgradeRanks; skillPoints: number }> {
  return withTransaction(pool, async (client) => {
    const stats = await getPlayerStatsForUpdate(client, userId);
    if (!stats) {
      throw new Error(`Player stats not found for user ${userId}`);
    }

    const skill = getSkillById(skillId);
    if (skill.id !== skillId || skill.path === "basic" || skill.path === "enemy") {
      throw new Error("INVALID_SKILL");
    }

    const ranks = await getUpgradeRow(client, userId, skillId);
    const check = canUpgradeBranch(skill, branch, ranks);
    if (!check.allowed) {
      throw new Error(check.reason ?? "UPGRADE_NOT_ALLOWED");
    }

    const currentRank = ranks[branch];
    const cost = spCostForNextRank(currentRank);
    if (stats.skill_points < cost) {
      throw new Error("INSUFFICIENT_SP");
    }

    const newRanks: SkillUpgradeRanks = {
      ...ranks,
      [branch]: (currentRank + 1) as SkillUpgradeRanks[typeof branch],
    };

    await client.query(
      `INSERT INTO player_skill_upgrades (
         user_id, skill_id, damage_rank, cd_rank, mp_rank, status_rank, heal_rank, passive_rank
       )
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       ON CONFLICT (user_id, skill_id)
       DO UPDATE SET
         damage_rank = EXCLUDED.damage_rank,
         cd_rank = EXCLUDED.cd_rank,
         mp_rank = EXCLUDED.mp_rank,
         status_rank = EXCLUDED.status_rank,
         heal_rank = EXCLUDED.heal_rank,
         passive_rank = EXCLUDED.passive_rank`,
      [
        userId,
        skillId,
        newRanks.damage,
        newRanks.cooldown,
        newRanks.mpCost,
        newRanks.statusPotency,
        newRanks.healPower,
        newRanks.passivePotency,
      ]
    );

    const spResult = await client.query<{ skill_points: number }>(
      `UPDATE player_stats
       SET skill_points = skill_points - $2, updated_at = NOW()
       WHERE user_id = $1
       RETURNING skill_points`,
      [userId, cost]
    );

    return {
      ranks: newRanks,
      skillPoints: spResult.rows[0].skill_points,
    };
  });
}

export async function clearPlayerUpgrades(
  pool: DbPool,
  userId: string
): Promise<void> {
  await pool.query(`DELETE FROM player_skill_upgrades WHERE user_id = $1`, [
    userId,
  ]);
}
