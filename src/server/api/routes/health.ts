import { Hono } from "hono";
import { getTableSizeEstimates, type TableSizeRow } from "../../db/retention";
import type { ServerBindings, ServerVariables } from "../types";

export const healthRoutes = new Hono<{
  Bindings: ServerBindings;
  Variables: ServerVariables;
}>();

healthRoutes.get("/health", (c) => {
  return c.json({ status: "ok", service: "tower-hunter-game" });
});

healthRoutes.get("/health/db-stats", async (c) => {
  const rows = await getTableSizeEstimates(c.get("db"));
  const totalBytes = rows.reduce(
    (sum: number, row: TableSizeRow) => sum + row.totalBytes,
    0
  );

  return c.json({
    status: "ok",
    totalBytes,
    tables: rows.map((row: TableSizeRow) => ({
      table: row.table,
      rowEstimate: row.rowEstimate,
      totalBytes: row.totalBytes,
      totalMb: Number((row.totalBytes / (1024 * 1024)).toFixed(2)),
    })),
  });
});
