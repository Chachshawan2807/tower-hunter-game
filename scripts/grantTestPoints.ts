import "dotenv/config";
import { closeDbPool, createDbPool } from "../src/server/db";

const STATUS_GRANT = 50;
const SKILL_GRANT = 10;

async function main(): Promise<void> {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    console.error("DATABASE_URL is required");
    process.exit(1);
  }

  const targetUserId = process.argv[2];
  const pool = createDbPool({ connectionString });

  const result = targetUserId
    ? await pool.query<{
        user_id: string;
        status_points: number;
        skill_points: number;
      }>(
        `UPDATE player_stats
         SET status_points = status_points + $2,
             skill_points = skill_points + $3,
             updated_at = NOW()
         WHERE user_id = $1
         RETURNING user_id, status_points, skill_points`,
        [targetUserId, STATUS_GRANT, SKILL_GRANT]
      )
    : await pool.query<{
        user_id: string;
        status_points: number;
        skill_points: number;
      }>(
        `UPDATE player_stats
         SET status_points = status_points + $1,
             skill_points = skill_points + $2,
             updated_at = NOW()
         RETURNING user_id, status_points, skill_points`
      , [STATUS_GRANT, SKILL_GRANT]);

  if (!result.rowCount) {
    console.error("No player stats updated");
    process.exit(1);
  }

  console.log(
    `Granted +${STATUS_GRANT} STATUS POINT and +${SKILL_GRANT} SKILL POINT to ${result.rowCount} player(s):`
  );
  console.table(result.rows);

  await closeDbPool();
}

main().catch((err) => {
  console.error("Grant failed:", err);
  process.exit(1);
});
