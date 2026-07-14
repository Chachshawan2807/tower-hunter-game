import type { DbPool } from "../db";

export type ServerBindings = {
  DATABASE_URL: string;
  PORT?: string;
};

export type ServerVariables = {
  db: DbPool;
};
