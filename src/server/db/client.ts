import pg from "pg";
import type { DbClientConfig } from "./types";

const { Pool } = pg;

let sharedPool: pg.Pool | null = null;

export type DbPool = pg.Pool;
export type DbClient = pg.PoolClient;

export function createDbPool(config: DbClientConfig): DbPool {
  if (sharedPool) {
    return sharedPool;
  }

  sharedPool = new Pool({
    connectionString: config.connectionString,
    max: config.maxConnections ?? 10,
  });

  return sharedPool;
}

export function getDbPool(): DbPool {
  if (!sharedPool) {
    throw new Error("Database pool not initialized. Call createDbPool() first.");
  }

  return sharedPool;
}

export async function closeDbPool(): Promise<void> {
  if (sharedPool) {
    await sharedPool.end();
    sharedPool = null;
  }
}

export async function withTransaction<T>(
  pool: DbPool,
  fn: (client: DbClient) => Promise<T>
): Promise<T> {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");
    const result = await fn(client);
    await client.query("COMMIT");
    return result;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}

export function parseBigInt(value: string | number | bigint): bigint {
  return typeof value === "bigint" ? value : BigInt(value);
}
