import "dotenv/config";
import { serve } from "@hono/node-server";
import { app } from "./api/app";
import { createDbPool, purgeExpiredMailboxItems } from "./db";
import { runRetentionPurge } from "./db/retention";

const port = Number(process.env.PORT ?? 3000);

async function bootstrap(): Promise<void> {
  const connectionString = process.env.DATABASE_URL;

  if (connectionString) {
    const pool = createDbPool({ connectionString });
    const purged = await purgeExpiredMailboxItems(pool);
    if (purged > 0) {
      console.log(`Purged ${purged} expired mailbox item(s)`);
    }

    const retention = await runRetentionPurge(pool);
    if (retention.idempotencyKeys > 0 || retention.walletLedger > 0) {
      console.log(
        `Retention purge: ${retention.idempotencyKeys} idempotency key(s), ${retention.walletLedger} ledger row(s)`
      );
    }
  } else {
    console.warn("DATABASE_URL not set — mailbox purge skipped");
  }

  serve(
    {
      fetch: app.fetch,
      port,
    },
    (info) => {
      console.log(`Tower Hunter server listening on http://localhost:${info.port}`);
    }
  );
}

bootstrap().catch((err) => {
  console.error("Server bootstrap failed:", err);
  process.exit(1);
});
